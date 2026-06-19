"use client"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const MODELS = ["cheui", "m6anet"]

const ModelSelector = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">Select models</p>
      <ToggleGroup
        type="multiple"
        value={value}
        onValueChange={(models) => onChange(models)}
        variant="outline"
        className="flex flex-wrap gap-2"
        aria-label="Model selection"
      >
        {MODELS.map((model) => (
          <ToggleGroupItem key={model} value={model} className="capitalize">
            {model}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export default ModelSelector