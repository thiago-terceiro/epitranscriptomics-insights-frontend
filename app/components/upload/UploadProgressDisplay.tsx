"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Ban, CheckCircle2, Loader2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { UploadProgress, UploadStatus } from "./useUploadProgress"

interface UploadProgressDisplayProps {
    progress: UploadProgress
    onCancel?: () => void
    className?: string
}

const statusConfig: Record<UploadStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
    idle: {
        icon: null,
        color: "text-muted-foreground",
        bgColor: "bg-muted/30",
    },
    uploading: {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-500/10",
    },
    success: {
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-500/10",
    },
    error: {
        icon: <XCircle className="h-4 w-4" />,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-500/10",
    },
    cancelled: {
        icon: <Ban className="h-4 w-4" />,
        color: "text-amber-600 dark:text-amber-400",
        bgColor: "bg-amber-500/10",
    },
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function UploadProgressDisplay({ progress, onCancel, className }: UploadProgressDisplayProps) {
    const { status, currentFileIndex, totalFiles, currentFileName, bytesUploaded, totalBytes, percentComplete, error } = progress
    const config = statusConfig[status]

    // Don't render if idle
    if (status === "idle") {
        return null
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "rounded-lg border p-4",
                    config.bgColor,
                    "border-border/50",
                    className
                )}
            >
                {/* Header with status */}
                <div className="flex items-center justify-between mb-3">
                    <div className={cn("flex items-center gap-2", config.color)}>
                        {config.icon}
                        <span className="text-sm font-medium">
                            {status === "uploading" && "Uploading files..."}
                            {status === "success" && "Upload complete!"}
                            {status === "error" && "Upload failed"}
                            {status === "cancelled" && "Upload cancelled"}
                        </span>
                    </div>

                    {/* Cancel button - only show during upload */}
                    {status === "uploading" && onCancel && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                    )}
                </div>

                {/* Progress bar */}
                {status === "uploading" && (
                    <div className="space-y-2">
                        <Progress value={percentComplete} className="h-2" />

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                {currentFileName ? (
                                    <>File {currentFileIndex + 1} of {totalFiles}: <span className="font-mono">{currentFileName}</span></>
                                ) : (
                                    <>Processing {totalFiles} file{totalFiles !== 1 ? "s" : ""}...</>
                                )}
                            </span>
                            <span>
                                {formatBytes(bytesUploaded)} / {formatBytes(totalBytes)} ({percentComplete}%)
                            </span>
                        </div>
                    </div>
                )}

                {/* Success state */}
                {status === "success" && (
                    <p className="text-sm text-muted-foreground">
                        Successfully uploaded {totalFiles} file{totalFiles !== 1 ? "s" : ""} ({formatBytes(totalBytes)})
                    </p>
                )}

                {/* Error state */}
                {status === "error" && error && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                )}

                {/* Cancelled state */}
                {status === "cancelled" && (
                    <p className="text-sm text-muted-foreground">
                        Upload was cancelled. You can try again.
                    </p>
                )}
            </motion.div>
        </AnimatePresence>
    )
}

export default UploadProgressDisplay
