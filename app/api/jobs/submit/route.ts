import { getBackendUrl } from "@/lib/server/runtime";
import { NextRequest, NextResponse } from "next/server";

// Production-grade limits for sequencing data
const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50GB per file (typical for large FAST5/FASTQ)
const MAX_TOTAL_SIZE = 500 * 1024 * 1024 * 1024; // 500GB total per submission
const MAX_FILES = 1000; // Allow large batch uploads
const ALLOWED_EXTENSIONS = [".fast5", ".pod5", ".fastq", ".fq", ".fastq.gz", ".fq.gz", ".tar", ".tar.gz"];

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

/**
 * Determines if an error is retryable (network errors or 5xx server errors)
 */
function isRetryableError(error: unknown, response?: Response): boolean {
    // Network errors (fetch failures)
    if (error instanceof TypeError && error.message.includes("fetch")) {
        return true;
    }
    // Server errors (5xx)
    if (response && response.status >= 500 && response.status < 600) {
        return true;
    }
    // Connection errors
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (
            message.includes("network") ||
            message.includes("timeout") ||
            message.includes("econnreset") ||
            message.includes("econnrefused") ||
            message.includes("socket")
        ) {
            return true;
        }
    }
    return false;
}

/**
 * Delays execution for exponential backoff
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Uploads a chunk to the presigned URL with retry logic and exponential backoff
 */
async function uploadPartWithRetry(
    url: string,
    chunk: Blob,
    contentType: string,
    maxRetries: number = MAX_RETRIES
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                method: "PUT",
                body: chunk,
                headers: {
                    "Content-Type": contentType,
                },
            });

            // Success
            if (response.ok) {
                return response;
            }

            // Check if we should retry
            if (isRetryableError(null, response)) {
                lastError = new Error(`Upload failed with status ${response.status}`);

                if (attempt < maxRetries) {
                    const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
                    console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms delay`);
                    await delay(delayMs);
                    continue;
                }
            }

            // Non-retryable error, throw immediately
            throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            if (isRetryableError(error)) {
                if (attempt < maxRetries) {
                    const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
                    console.log(`Network error, retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms delay`);
                    await delay(delayMs);
                    continue;
                }
            } else {
                // Non-retryable error, throw immediately
                throw error;
            }
        }
    }

    // All retries exhausted
    throw new Error(`Upload failed after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`);
}

const DEFAULT_PART_SIZE = 8 * 1024 * 1024; // 8MB fallback if backend does not provide part_size

type UploadInitFile = {
    filename: string;
    object_name: string;
    upload_id: string;
    size: number;
    part_size?: number;
};

type UploadPart = {
    part_number: number;
    etag: string;
};

type CompleteFilePayload = {
    object_name: string;
    upload_id: string;
    parts: UploadPart[];
};

const getExtension = (name: string) => name.toLowerCase().substring(name.toLowerCase().lastIndexOf("."));

const isPod5File = (name: string) => name.toLowerCase().endsWith(".pod5");

async function getPartUploadUrl(payload: {
    session_id: string;
    object_name: string;
    upload_id: string;
    part_number: number;
}) {
    const response = await fetch(`${getBackendUrl()}/upload/part-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Failed to get part URL" }));
        throw new Error(errorData.detail || "Failed to get part URL");
    }

    return response.json();
}

async function uploadFileMultipart(
    file: File,
    sessionId: string,
    initMeta: UploadInitFile,
    partSize: number,
): Promise<UploadPart[]> {
    const parts: UploadPart[] = [];

    // Always upload at least one part for zero-length files
    const totalParts = Math.max(1, Math.ceil(file.size / partSize));
    const contentType = file.type || "application/octet-stream";

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, file.size);
        const chunk = file.slice(start, end);

        const { upload_url } = await getPartUploadUrl({
            session_id: sessionId,
            object_name: initMeta.object_name,
            upload_id: initMeta.upload_id,
            part_number: partNumber,
        });

        // Use retry logic for the actual upload
        const uploadResponse = await uploadPartWithRetry(upload_url, chunk, contentType);

        const etag = uploadResponse.headers.get("etag") || uploadResponse.headers.get("ETag");
        if (!etag) {
            throw new Error(`Missing ETag for part ${partNumber} of ${file.name}`);
        }

        const cleanEtag = etag.replace(/^"+|"+$/g, "");
        parts.push({ part_number: partNumber, etag: cleanEtag });
    }

    return parts;
}

export async function POST(request: NextRequest) {
    try {
        const backendUrl = getBackendUrl();

        // Parse multipart form data
        const formData = await request.formData();
        const rawFiles = formData.getAll("files");
        const files: File[] = [];

        for (const item of rawFiles) {
            if (item instanceof File) {
                files.push(item);
            }
        }
        const models = formData.get("models");
        const referenceFasta = formData.get("reference_fasta");

        if (!files || files.length === 0) {
            return NextResponse.json(
                { detail: "At least one file is required" },
                { status: 400 }
            );
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { detail: `Maximum ${MAX_FILES} files allowed per submission` },
                { status: 400 }
            );
        }

        const pod5Files = files.filter(file => isPod5File(file.name));
        const isPod5OnlySubmission = files.length === 1 && pod5Files.length === 1;

        if (!isPod5OnlySubmission && !referenceFasta) {
            return NextResponse.json(
                { detail: "reference_fasta is required" },
                { status: 400 }
            );
        }

        if (!models) {
            return NextResponse.json(
                { detail: "models array is required" },
                { status: 400 }
            );
        }

        let parsedModels: string[];
        try {
            parsedModels = JSON.parse(models as string);
            if (!Array.isArray(parsedModels) || parsedModels.length === 0) {
                throw new Error("Invalid models format");
            }
        } catch (error) {
            return NextResponse.json(
                { detail: "Invalid models format. Must be JSON array of strings." },
                { status: 400 }
            );
        }

        let totalSize = 0;
        for (const file of files) {
            if (file.size === 0) {
                return NextResponse.json(
                    { detail: `File ${file.name} is empty` },
                    { status: 400 }
                );
            }

            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    {
                        detail: `File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
                    },
                    { status: 413 }
                );
            }

            totalSize += file.size;

            const lowerName = file.name.toLowerCase();
            const extension = getExtension(lowerName);
            const isGzipped = lowerName.endsWith(".gz");
            let baseExtension = extension;

            if (isGzipped) {
                const withoutGz = lowerName.slice(0, lowerName.lastIndexOf(".gz"));
                const lastDot = withoutGz.lastIndexOf(".");
                baseExtension = lastDot >= 0 ? withoutGz.slice(lastDot) : "";
            }

            if (!ALLOWED_EXTENSIONS.includes(extension) && !ALLOWED_EXTENSIONS.includes(baseExtension)) {
                return NextResponse.json(
                    {
                        detail: `File ${file.name} has unsupported extension. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
                    },
                    { status: 400 }
                );
            }
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            return NextResponse.json(
                {
                    detail: `Total upload size exceeds maximum of ${MAX_TOTAL_SIZE / (1024 * 1024 * 1024)}GB`,
                },
                { status: 413 }
            );
        }

        // Initialize multipart uploads
        const uploadInitResponse = await fetch(`${backendUrl}/upload/init`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                files: files.map(f => ({ filename: f.name, size: f.size }))
            }),
        });

        if (!uploadInitResponse.ok) {
            const errorData = await uploadInitResponse.json().catch(() => ({
                detail: "Failed to initialize upload",
            }));
            return NextResponse.json(
                { detail: errorData.detail || "Upload initialization failed" },
                { status: uploadInitResponse.status }
            );
        }

        const uploadSession = await uploadInitResponse.json();
        const sessionId: string = uploadSession.session_id;
        const basePartSize: number = uploadSession.part_size || uploadSession.files?.[0]?.part_size || DEFAULT_PART_SIZE;
        const normalizedPartSize = basePartSize > 0 ? basePartSize : DEFAULT_PART_SIZE;
        const filesMeta = (uploadSession.files || []) as UploadInitFile[];

        if (filesMeta.length !== files.length) {
            return NextResponse.json(
                { detail: "Upload session did not return metadata for all files" },
                { status: 500 }
            );
        }

        // Support duplicate filenames by consuming metadata entries in order per name
        const metaByName = new Map<string, UploadInitFile[]>();
        for (const entry of filesMeta) {
            const list = metaByName.get(entry.filename) || [];
            list.push(entry);
            metaByName.set(entry.filename, list);
        }

        const completionPayload: CompleteFilePayload[] = [];

        for (const file of files) {
            const candidates = metaByName.get(file.name) || [];
            const meta = candidates.shift();

            if (!meta) {
                return NextResponse.json(
                    { detail: `Missing upload metadata for file ${file.name}` },
                    { status: 500 }
                );
            }

            metaByName.set(file.name, candidates);

            const effectivePartSize = meta.part_size && meta.part_size > 0 ? meta.part_size : normalizedPartSize;
            const parts = await uploadFileMultipart(file, sessionId, meta, effectivePartSize);
            completionPayload.push({
                object_name: meta.object_name,
                upload_id: meta.upload_id,
                parts,
            });
        }

        // Complete uploads
        const completeResponse = await fetch(`${backendUrl}/upload/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                files: completionPayload,
            }),
        });

        if (!completeResponse.ok) {
            const errorData = await completeResponse.json().catch(() => ({
                detail: "Failed to verify upload",
            }));
            return NextResponse.json(
                { detail: errorData.detail || "Upload verification failed" },
                { status: completeResponse.status }
            );
        }

        const verificationResult = await completeResponse.json();

        if (verificationResult.status !== "completed") {
            return NextResponse.json(
                {
                    detail: "Some files failed verification",
                    verified: verificationResult.verified_files.length,
                    failed: verificationResult.failed_files,
                },
                { status: 500 }
            );
        }

        let backendResponse: Response;

        if (isPod5OnlySubmission) {
            backendResponse = await fetch(`${backendUrl}/jobs/pod5`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    upload_session_id: sessionId,
                    pod5_object_name: completionPayload[0]?.object_name,
                }),
            });
        } else {
            const jobPayload = {
                accession: `upload:${sessionId}`,
                reference_fasta: referenceFasta as string,
                reference_gtf: null,
                models: parsedModels,
                analysis: {
                    mock: false,
                    xpore_differential: false,
                },
                upload_session_id: sessionId,
            };

            backendResponse = await fetch(`${backendUrl}/jobs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(jobPayload),
            });
        }

        if (!backendResponse.ok) {
            const errorData = await backendResponse.json().catch(() => ({
                detail: "Backend submission failed",
            }));
            return NextResponse.json(
                { detail: errorData.detail || "Failed to submit job to backend" },
                { status: backendResponse.status }
            );
        }

        const result = await backendResponse.json();

        return NextResponse.json(
            {
                job_id: result.job_id,
                status: result.status,
                message: "Job submitted successfully",
                files_uploaded: files.length,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Job submission error:", error);
        return NextResponse.json(
            { detail: "Internal server error during job submission" },
            { status: 500 }
        );
    }
}
