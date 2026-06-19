"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, Archive, CheckCircle2, Circle } from "lucide-react"
import { useMemo } from "react"

// File type detection helpers
const SIGNAL_EXTENSIONS = [".fast5", ".pod5"]
const READS_EXTENSIONS = [".fastq", ".fq", ".fastq.gz", ".fq.gz"]
const ARCHIVE_EXTENSIONS = [".tar", ".tar.gz", ".tgz"]

function getFileExtension(filename: string): string {
    const lower = filename.toLowerCase()
    // Handle double extensions like .tar.gz, .fastq.gz
    if (lower.endsWith(".tar.gz")) return ".tar.gz"
    if (lower.endsWith(".fastq.gz")) return ".fastq.gz"
    if (lower.endsWith(".fq.gz")) return ".fq.gz"
    const lastDot = lower.lastIndexOf(".")
    return lastDot >= 0 ? lower.slice(lastDot) : ""
}

function isSignalFile(filename: string): boolean {
    const ext = getFileExtension(filename)
    return SIGNAL_EXTENSIONS.includes(ext)
}

function isReadsFile(filename: string): boolean {
    const ext = getFileExtension(filename)
    return READS_EXTENSIONS.includes(ext)
}

function isArchiveFile(filename: string): boolean {
    const ext = getFileExtension(filename)
    return ARCHIVE_EXTENSIONS.includes(ext)
}

export interface FileValidationResult {
    hasSignalFile: boolean
    hasReadsFile: boolean
    hasArchive: boolean
    pod5Only: boolean
    isValid: boolean
    signalFiles: string[]
    readsFiles: string[]
    archiveFiles: string[]
    message: string
}

export function validateFiles(files: File[]): FileValidationResult {
    const signalFiles: string[] = []
    const readsFiles: string[] = []
    const archiveFiles: string[] = []

    for (const file of files) {
        if (isSignalFile(file.name)) {
            signalFiles.push(file.name)
        } else if (isReadsFile(file.name)) {
            readsFiles.push(file.name)
        } else if (isArchiveFile(file.name)) {
            archiveFiles.push(file.name)
        }
    }

    const hasSignalFile = signalFiles.length > 0
    const hasReadsFile = readsFiles.length > 0
    const hasArchive = archiveFiles.length > 0
    const pod5Only = signalFiles.length === 1 && signalFiles[0].toLowerCase().endsWith(".pod5") && !hasReadsFile && !hasArchive

    // Valid if: (signal + reads) OR archive OR a single POD5 for Dorado basecalling
    const isValid = (hasSignalFile && hasReadsFile) || hasArchive || pod5Only

    let message = ""
    if (files.length === 0) {
        message = "Upload your sequencing data to begin"
    } else if (pod5Only) {
        message = "POD5-only upload detected - this will run Dorado basecalling"
    } else if (isValid) {
        if (hasArchive) {
            message = "Archive detected — ensure it contains both signal and reads files"
        } else {
            message = "All required files detected"
        }
    } else if (hasSignalFile && !hasReadsFile) {
        message = "Missing sequencing reads (FASTQ)"
    } else if (!hasSignalFile && hasReadsFile) {
        message = "Missing raw signal file (FAST5/POD5)"
    } else {
        message = "Upload signal + reads files, or an archive containing both"
    }

    return {
        hasSignalFile,
        hasReadsFile,
        hasArchive,
        pod5Only,
        isValid,
        signalFiles,
        readsFiles,
        archiveFiles,
        message,
    }
}

interface ChecklistItemProps {
    label: string
    description: string
    status: "pending" | "complete" | "warning"
    files?: string[]
}

function ChecklistItem({ label, description, status, files }: ChecklistItemProps) {
    return (
        <div className="flex items-start gap-3 py-2">
            <div className="mt-0.5">
                {status === "complete" && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {status === "pending" && (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                )}
                {status === "warning" && (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm font-medium",
                    status === "complete" && "text-green-700 dark:text-green-400",
                    status === "pending" && "text-muted-foreground",
                    status === "warning" && "text-amber-700 dark:text-amber-400"
                )}>
                    {label}
                </p>
                <p className="text-xs text-muted-foreground">{description}</p>
                {files && files.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {files.slice(0, 3).map((f, i) => (
                            <span key={i} className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                {f.length > 20 ? f.slice(0, 17) + "..." : f}
                            </span>
                        ))}
                        {files.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{files.length - 3} more</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

interface FileRequirementsChecklistProps {
    files: File[]
}

export default function FileRequirementsChecklist({ files }: FileRequirementsChecklistProps) {
    const validation = useMemo(() => validateFiles(files), [files])

    return (
        <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
            <div className="mb-3">
                <h4 className="text-sm font-semibold">Required Files</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Upload FAST5 + FASTQ for model analysis, a single POD5 for Dorado basecalling, or an archive containing both signal and reads
                </p>
            </div>

            <div className="space-y-1 divide-y divide-border/30">
                {/* Option A: Separate files */}
                {!validation.hasArchive && (
                    <>
                        <ChecklistItem
                            label="Raw signal file"
                            description="FAST5 for model analysis, or a single POD5 for Dorado basecalling"
                            status={validation.hasSignalFile ? "complete" : "pending"}
                            files={validation.signalFiles}
                        />
                        <ChecklistItem
                            label="Sequencing reads"
                            description="FASTQ or FQ (can be gzipped)"
                            status={validation.hasReadsFile ? "complete" : "pending"}
                            files={validation.readsFiles}
                        />
                    </>
                )}

                {/* Option B: Archive */}
                {validation.hasArchive && (
                    <ChecklistItem
                        label="Archive file"
                        description="TAR/TAR.GZ containing signal + reads"
                        status="warning"
                        files={validation.archiveFiles}
                    />
                )}

                {/* Show archive hint when no files uploaded */}
                {files.length === 0 && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Archive className="h-4 w-4" />
                        <span>Or upload a single .tar.gz archive containing both file types</span>
                    </div>
                )}
            </div>

            {/* Status message */}
            {files.length > 0 && (
                <div className={cn(
                    "mt-3 rounded-md px-3 py-2 text-sm",
                    validation.isValid
                        ? "bg-green-500/10 text-green-700 dark:text-green-400"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                )}>
                    {validation.message}
                </div>
            )}
        </div>
    )
}
