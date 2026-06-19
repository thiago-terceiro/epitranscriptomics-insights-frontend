"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import AnimatedSubmit from "./AnimatedSubmit"
import DevModeToggle from "./DevModeToggle"
import FileDropzone from "./FileDropzone"
import FileRequirementsChecklist, { validateFiles } from "./FileRequirementsChecklist"
import ModelSelector from "./ModelSelector"
import ReferenceSelector from "./ReferenceSelector"
import { UploadProgressDisplay } from "./UploadProgressDisplay"
import { useUploadProgress } from "./useUploadProgress"

const MOCK_REFERENCE_URL = "https://example.com/mock-reference.fasta"

type UploadFormProps = {
  allowMockMode?: boolean
}

const UploadForm = ({ allowMockMode = false }: UploadFormProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [models, setModels] = useState<string[]>(["m6anet"])
  const [reference, setReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [devMode, setDevMode] = useState(false)

  // Upload progress tracking
  const { progress, startUpload, cancelUpload, reset: resetProgress } = useUploadProgress()
  const useMockMode = allowMockMode && devMode

  const handleDevModeToggle = (enabled: boolean) => {
    if (!allowMockMode) return

    setDevMode(enabled)
    if (enabled) {
      // Auto-fill mock reference when enabling dev mode
      setReference(MOCK_REFERENCE_URL)
      setFiles([]) // Clear any uploaded files
      resetProgress() // Reset upload progress
    } else {
      // Clear mock reference when disabling
      setReference("")
    }
  }

  const handleSubmit = async () => {
    // In dev mode, skip file validation
    if (!useMockMode) {
      const validation = validateFiles(files)
      if (!validation.isValid) {
        if (!validation.hasSignalFile && !validation.hasReadsFile) {
          toast.error("Upload raw signal (FAST5/POD5) and sequencing reads (FASTQ) files")
        } else if (!validation.hasSignalFile) {
          toast.error("Missing raw signal file (FAST5 or POD5)")
        } else if (!validation.hasReadsFile) {
          toast.error("Missing sequencing reads file (FASTQ)")
        }
        return
      }

      if (!validation.pod5Only && !reference.trim()) {
        toast.error("Enter a reference FASTA URL")
        return
      }
    }

    if (useMockMode && !reference.trim()) {
      toast.error("Enter a reference FASTA URL")
      return
    }

    if (!models.length) {
      toast.error("Select at least one detection model")
      return
    }

    setLoading(true)
    setSuccess(false)
    resetProgress()

    try {
      if (useMockMode) {
        // Submit mock job (no file upload needed)
        const resp = await fetch("/api/jobs/submit-mock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference_fasta: reference,
            models: models,
          }),
        })

        const payload = await resp.json().catch(() => undefined)
        if (!resp.ok) {
          const message = payload?.detail ?? "Submission failed"
          toast.error(message)
          setSuccess(false)
        } else {
          const jobId = payload?.job_id
          toast.success(
            jobId
              ? `Job ${jobId} submitted successfully`
              : "Job submitted successfully"
          )
          setSuccess(true)
          setFiles([])
          setReference("")

          setTimeout(() => {
            if (jobId) {
              window.location.href = `/results?job_id=${jobId}`
            }
          }, 2000)
        }
      } else {
        // Submit real job with files using progress tracking
        const result = await startUpload(files, models, reference)

        if (result.success) {
          toast.success(
            result.jobId
              ? `Job ${result.jobId} submitted successfully`
              : "Job submitted successfully"
          )
          setSuccess(true)
          setFiles([])
          setReference("")

          setTimeout(() => {
            if (result.jobId) {
              window.location.href = `/results?job_id=${result.jobId}`
            }
          }, 2000)
        } else if (progress.status === "cancelled") {
          toast.info("Upload cancelled")
        } else {
          toast.error(progress.error || "Upload failed")
          setSuccess(false)
        }
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error("Unexpected error while submitting job")
      setSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  // Determine if we're in an active upload state
  const isUploading = progress.status === "uploading"
  const canSubmit = !loading && !isUploading

  return (
    <motion.div
      className="w-full max-w-2xl"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="border-border/60 bg-card/95 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Submit new analysis</CardTitle>
          <CardDescription>
            Upload your Oxford Nanopore sequencing data for epitranscriptomics analysis.
            You'll need both raw signal data and basecalled reads.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dev Mode Toggle - only visible in development */}
          <DevModeToggle available={allowMockMode} enabled={devMode} onToggle={handleDevModeToggle} />

          {/* File requirements checklist - hidden in dev mode */}
          {!useMockMode && <FileRequirementsChecklist files={files} />}

          {/* File dropzone - disabled in dev mode */}
          {!useMockMode && (
            <FileDropzone onFiles={(newFiles) => setFiles(prev => [...prev, ...newFiles])} />
          )}

          {/* Mock mode indicator */}
          {useMockMode && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-center">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                File upload disabled — mock data will be generated by the backend
              </p>
            </div>
          )}

          {/* Selected files list - only shown when not in dev mode */}
          {!useMockMode && files.length > 0 && (
            <div className="rounded-md border border-border/50 bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Selected files ({files.length})</p>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isUploading}
                >
                  Clear all
                </button>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {files.map((file, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex justify-between items-center group">
                    <span className="truncate">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="whitespace-nowrap">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        disabled={isUploading}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload progress display */}
          {!useMockMode && progress.status !== "idle" && (
            <UploadProgressDisplay
              progress={progress}
              onCancel={cancelUpload}
            />
          )}

          <ModelSelector value={models} onChange={setModels} />
          <ReferenceSelector value={reference} onChange={setReference} />
        </CardContent>
        <CardFooter className="flex-col items-stretch">
          <AnimatedSubmit loading={loading || isUploading} success={success} onClick={handleSubmit} disabled={!canSubmit} />
        </CardFooter>
      </Card>
    </motion.div>
  )
}

export default UploadForm