"use client"

import { cn } from "@/lib/utils"
import { FlaskConical } from "lucide-react"

interface DevModeToggleProps {
    available?: boolean
    enabled: boolean
    onToggle: (enabled: boolean) => void
}

export default function DevModeToggle({ available = false, enabled, onToggle }: DevModeToggleProps) {
    if (!available) return null

    return (
        <div
            className={cn(
                "rounded-lg border-2 border-dashed p-4 transition-colors",
                enabled
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-muted-foreground/20 bg-muted/20"
            )}
        >
            <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="peer sr-only"
                    />
                    <div
                        className={cn(
                            "h-5 w-9 rounded-full transition-colors",
                            enabled ? "bg-amber-500" : "bg-muted-foreground/30"
                        )}
                    />
                    <div
                        className={cn(
                            "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                            enabled && "translate-x-4"
                        )}
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <FlaskConical className={cn(
                            "h-4 w-4",
                            enabled ? "text-amber-600" : "text-muted-foreground"
                        )} />
                        <span className={cn(
                            "text-sm font-semibold",
                            enabled ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground"
                        )}>
                            Dev Mode — Use Mock Data
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {enabled
                            ? "Mock mode enabled. The backend will generate synthetic test data for the full pipeline."
                            : "Enable to skip file upload and test the pipeline with auto-generated mock data."
                        }
                    </p>
                </div>
            </label>
        </div>
    )
}
