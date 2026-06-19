"use client"

import { useCallback, useRef, useState } from "react"

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "cancelled"

export interface UploadProgress {
    status: UploadStatus
    currentFileIndex: number
    totalFiles: number
    currentFileName: string
    bytesUploaded: number
    totalBytes: number
    percentComplete: number
    error: string | null
}

export interface UseUploadProgressReturn {
    progress: UploadProgress
    startUpload: (files: File[], models: string[], referenceFasta: string) => Promise<{ jobId?: string; success: boolean }>
    cancelUpload: () => void
    reset: () => void
}

const initialProgress: UploadProgress = {
    status: "idle",
    currentFileIndex: 0,
    totalFiles: 0,
    currentFileName: "",
    bytesUploaded: 0,
    totalBytes: 0,
    percentComplete: 0,
    error: null,
}

/**
 * Custom hook for managing file upload progress with cancellation support.
 * Since the actual multipart upload happens server-side in the API route,
 * this hook tracks file-level progress and provides cancellation capability.
 */
export function useUploadProgress(): UseUploadProgressReturn {
    const [progress, setProgress] = useState<UploadProgress>(initialProgress)
    const abortControllerRef = useRef<AbortController | null>(null)
    const cancelledRef = useRef(false)

    const reset = useCallback(() => {
        setProgress(initialProgress)
        cancelledRef.current = false
    }, [])

    const cancelUpload = useCallback(() => {
        cancelledRef.current = true
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }
        setProgress(prev => ({
            ...prev,
            status: "cancelled",
            error: "Upload cancelled by user",
        }))
    }, [])

    const startUpload = useCallback(async (
        files: File[],
        models: string[],
        referenceFasta: string
    ): Promise<{ jobId?: string; success: boolean }> => {
        if (files.length === 0) {
            return { success: false }
        }

        // Reset state
        cancelledRef.current = false
        abortControllerRef.current = new AbortController()

        const totalBytes = files.reduce((sum, f) => sum + f.size, 0)

        setProgress({
            status: "uploading",
            currentFileIndex: 0,
            totalFiles: files.length,
            currentFileName: files[0]?.name || "",
            bytesUploaded: 0,
            totalBytes,
            percentComplete: 0,
            error: null,
        })

        try {
            // Build FormData
            const form = new FormData()

            let uploadedBytes = 0

            // Add files and track simulated progress per file
            for (let i = 0; i < files.length; i++) {
                if (cancelledRef.current) {
                    throw new Error("Upload cancelled")
                }

                const file = files[i]
                form.append("files", file)

                // Update progress for each file added
                setProgress(prev => ({
                    ...prev,
                    currentFileIndex: i,
                    currentFileName: file.name,
                    bytesUploaded: uploadedBytes,
                    percentComplete: Math.round((uploadedBytes / totalBytes) * 100),
                }))

                uploadedBytes += file.size
            }

            form.append("models", JSON.stringify(models))
            form.append("reference_fasta", referenceFasta)

            // Show that we're starting the upload to server
            setProgress(prev => ({
                ...prev,
                currentFileIndex: files.length - 1,
                currentFileName: "Uploading to server...",
                bytesUploaded: totalBytes,
                percentComplete: 50, // Show 50% while server processes
            }))

            // Submit to API route
            const response = await fetch("/api/jobs/submit", {
                method: "POST",
                body: form,
                signal: abortControllerRef.current.signal,
            })

            if (cancelledRef.current) {
                throw new Error("Upload cancelled")
            }

            const payload = await response.json().catch(() => undefined)

            if (!response.ok) {
                const errorMessage = payload?.detail ?? "Upload failed"
                setProgress(prev => ({
                    ...prev,
                    status: "error",
                    error: errorMessage,
                    percentComplete: 0,
                }))
                return { success: false }
            }

            // Success!
            setProgress({
                status: "success",
                currentFileIndex: files.length,
                totalFiles: files.length,
                currentFileName: "",
                bytesUploaded: totalBytes,
                totalBytes,
                percentComplete: 100,
                error: null,
            })

            return {
                jobId: payload?.job_id,
                success: true
            }
        } catch (error) {
            if (cancelledRef.current) {
                return { success: false }
            }

            const errorMessage = error instanceof Error ? error.message : "Upload failed"
            setProgress(prev => ({
                ...prev,
                status: "error",
                error: errorMessage,
            }))
            return { success: false }
        } finally {
            abortControllerRef.current = null
        }
    }, [])

    return {
        progress,
        startUpload,
        cancelUpload,
        reset,
    }
}

export default useUploadProgress
