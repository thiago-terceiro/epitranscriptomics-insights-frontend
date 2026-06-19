"use client"

import { motion } from "framer-motion"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

import { cn } from "@/lib/utils"

const MAX_FILE_SIZE = 50 * 1024 * 1024 * 1024; // 50GB per file (production sequencing data)
const MAX_FILES = 1000; // Allow batch uploads

const FileDropzone = ({ onFiles }: { onFiles: (files: File[]) => void }) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[] = []) => {
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(f => f.errors[0]?.message || "Invalid file").join(", ")
      console.error("Rejected files:", errors)
    }
    if (acceptedFiles.length > 0) {
      onFiles(acceptedFiles)
    }
  }, [onFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    maxFiles: MAX_FILES,
    accept: {
      'application/octet-stream': ['.fast5', '.pod5', '.fastq', '.fq'],
      'application/gzip': ['.fastq.gz', '.fq.gz', '.gz'],
      'application/x-tar': ['.tar', '.tar.gz'],
    },
  })

  return (
    <motion.div
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40 p-8 text-center transition-colors",
        "shadow-xs backdrop-blur-sm",
        isDragActive && "border-primary/60 bg-primary/10 text-primary"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div {...getRootProps()} className="flex h-full w-full flex-col gap-2">
        <input
          type="file"
          {...getInputProps({
            onChange: (event) => {
              const fileList = event.target.files
              const files = fileList ? Array.from(fileList) : []
              if (files.length) {
                onFiles(files)
              }
            },
          })}
        />
        {isDragActive ? (
          <p className="text-sm font-medium">Drop the files here…</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag and drop files here, or click to select
            </p>
            <p className="text-xs text-muted-foreground/60">
              Supported: .fast5, .pod5, .fastq, .fq, .fastq.gz, .tar, .tar.gz • Max {MAX_FILE_SIZE / (1024 * 1024 * 1024)}GB per file • Up to {MAX_FILES} files
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}

export default FileDropzone