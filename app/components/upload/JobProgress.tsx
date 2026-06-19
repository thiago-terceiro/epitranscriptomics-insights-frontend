"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const JobProgress = ({ jobId }: { jobId: string }) => {
  const [status, setStatus] = useState("queued")
  const [progress, setProgress] = useState(10)

  useEffect(() => {
    const eventSource = new EventSource(`/api/jobs/${jobId}/stream`)
    eventSource.onmessage = (event) => {
      const update = JSON.parse(event.data)
      setStatus(update.status)
      setProgress((prevProgress) => update.progress ?? prevProgress)
      if (["completed", "failed"].includes(update.status)) {
        eventSource.close()
      }
    }
    return () => eventSource.close()
  }, [jobId])

  return (
    <div className="mt-6 space-y-2">
      <p className="text-sm font-medium text-foreground">Job status: {status}</p>
      <motion.div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: "10%" }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut", duration: 0.5 }}
        />
      </motion.div>
    </div>
  )
}

export default JobProgress