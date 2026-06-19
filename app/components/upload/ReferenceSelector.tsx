"use client"

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ReferenceSelector = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const inputId = "reference-fasta"

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>Reference FASTA URL</Label>
      <Input
        id={inputId}
        type="url"
        placeholder="https://example.com/genome.fa"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
    </div>
  )
}

export default ReferenceSelector