"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AnimatedSubmitProps {
  loading: boolean
  success: boolean
  onClick: () => void
  disabled?: boolean
}

const AnimatedSubmit = ({ loading, success, onClick, disabled }: AnimatedSubmitProps) => {
  const label = loading ? "Submitting…" : success ? "Submitted!" : "Submit"
  const isDisabled = disabled ?? loading

  return (
    <motion.div
      className="mt-4 w-full"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: isDisabled ? 1 : 1.01 }}
    >
      <Button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={cn(
          "w-full",
          success && "bg-emerald-600 text-emerald-50 hover:bg-emerald-600"
        )}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : success ? (
          <CheckCircle2 className="size-4" />
        ) : null}
        {label}
      </Button>
    </motion.div>
  )
}

export default AnimatedSubmit