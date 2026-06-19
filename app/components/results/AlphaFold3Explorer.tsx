"use client";

import AlphaFold3StructureViewer from "@/components/results/AlphaFold3StructureViewer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Loader2, RefreshCw, Sparkles, UploadCloud } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PredictionStatus = "pending" | "queued" | "running" | "ready" | "failed";

type AlphaFold3Structure = {
  id: string;
  jobId?: string;
  targetName?: string;
  status: PredictionStatus;
  createdAt?: string;
  updatedAt?: string;
  sequenceLength?: number;
  metadata?: Record<string, unknown>;
  outputs?: {
    pdbUrl?: string;
    cifUrl?: string;
    paeImageUrl?: string;
    paeJsonUrl?: string;
    confidence?: {
      meanPlddt?: number;
      meanPae?: number;
      coverage?: number;
    };
  };
  notes?: string;
};

const statusAccent: Record<PredictionStatus, string> = {
  ready: "bg-emerald-100 text-emerald-700 border-emerald-200",
  running: "bg-blue-100 text-blue-700 border-blue-200",
  queued: "bg-blue-100 text-blue-700 border-blue-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

const AlphaFold3Explorer = () => {
  const [structures, setStructures] = useState<AlphaFold3Structure[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sequence, setSequence] = useState("");
  const [proteinName, setProteinName] = useState("");

  const selectedStructure = useMemo(
    () => structures.find((item) => item.id === selectedId) ?? null,
    [structures, selectedId],
  );

  const structureUrl = useMemo(() => {
    if (!selectedStructure) return undefined;
    return selectedStructure.outputs?.pdbUrl ?? selectedStructure.outputs?.cifUrl;
  }, [selectedStructure]);

  const structureFormat = useMemo(() => {
    if (!selectedStructure) return "pdb";
    return selectedStructure.outputs?.cifUrl ? "cif" : "pdb";
  }, [selectedStructure]);

  const fetchStructures = useCallback(async () => {
    try {
      setLoadingList(true);
      const response = await fetch("/api/alphafold3/results", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const payload = await response.json();
      const records: AlphaFold3Structure[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
          ? payload.results
          : [];

      const normalized = records.map(normalizeStructureRecord);
      setStructures(normalized);

      if (normalized.length && !selectedId) {
        const readyStructure = normalized.find((item) => item.status === "ready");
        setSelectedId((readyStructure ?? normalized[0]).id);
      } else if (selectedId) {
        const stillExists = normalized.some((item) => item.id === selectedId);
        if (!stillExists && normalized.length) {
          setSelectedId(normalized[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load AlphaFold3 results", error);
      toast.error("Unable to load AlphaFold3 results");
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSequence = sequence.replace(/\s+/g, "");

    if (!trimmedSequence) {
      toast.error("Provide an amino acid sequence before submitting");
      return;
    }

    if (!/^([ACDEFGHIKLMNPQRSTVWY]+)$/i.test(trimmedSequence)) {
      toast.error("Sequence must contain only standard amino acid letters");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/alphafold3/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sequence: trimmedSequence.toUpperCase(),
          name: proteinName?.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const message = await safeReadError(response);
        throw new Error(message || `Prediction request failed (${response.status})`);
      }

      const body = await response.json();
      toast.success("AlphaFold3 prediction queued");

      if (body?.result) {
        const normalized = normalizeStructureRecord(body.result);
        setStructures((prev) => {
          const existingIndex = prev.findIndex((item) => item.id === normalized.id);
          if (existingIndex >= 0) {
            const clone = [...prev];
            clone[existingIndex] = normalized;
            return clone;
          }
          return [normalized, ...prev];
        });
        setSelectedId(normalized.id);
      } else {
        fetchStructures();
      }

      setSequence("");
      setProteinName("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Run a new AlphaFold3 prediction
              </CardTitle>
              <CardDescription>
                Submit a protein sequence to queue an AlphaFold3 structure prediction job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="protein-name">
                    Target label
                  </label>
                  <input
                    id="protein-name"
                    name="protein-name"
                    className="bg-background focus-visible:ring-ring w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    placeholder="Optional descriptive name"
                    value={proteinName}
                    onChange={(event) => setProteinName(event.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="protein-sequence">
                    Amino acid sequence
                  </label>
                  <textarea
                    id="protein-sequence"
                    name="protein-sequence"
                    className="bg-background focus-visible:ring-ring min-h-[160px] w-full rounded-md border border-border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    placeholder="Paste your FASTA-formatted amino acid sequence (letters only)"
                    value={sequence}
                    onChange={(event) => setSequence(event.target.value)}
                    spellCheck={false}
                    maxLength={5000}
                  />
                  <div className="text-xs text-muted-foreground">
                    {sequence.replace(/\s+/g, "").length} residues · Supports up to ~5k residues per request
                  </div>
                </div>
                <Button className="w-full" disabled={submitting} type="submit">
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Queue prediction
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-start gap-2">
              <div className="flex-1">
                <CardTitle className="text-lg">Predicted structures</CardTitle>
                <CardDescription>
                  Select a completed job to visualise its AlphaFold3 structure.
                </CardDescription>
              </div>
              <Button
                aria-label="Refresh AlphaFold3 results"
                className="self-start"
                onClick={fetchStructures}
                size="icon"
                type="button"
                variant="ghost"
              >
                {loadingList ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {loadingList ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading structures
                </div>
              ) : structures.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                  No AlphaFold3 predictions yet. Submit a sequence to generate the first structure.
                </div>
              ) : (
                <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-1">
                  {structures.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={cn(
                        "border-border/60 hover:bg-muted flex flex-col gap-2 rounded-lg border px-3 py-3 text-left transition",
                        selectedId === item.id ? "border-primary bg-primary/5" : "",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {item.targetName || item.jobId || item.id}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-1 text-xs font-medium",
                            statusAccent[item.status] ?? statusAccent.pending,
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.sequenceLength ? `${item.sequenceLength} aa` : "Length pending"}
                        {item.createdAt && (
                          <span className="ml-2">
                            · {new Date(item.createdAt).toLocaleString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              month: "short",
                              day: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedStructure?.targetName || "AlphaFold3 structure preview"}
            </CardTitle>
            <CardDescription>
              Interactive 3D rendering with confidence overlays and metadata summaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <AlphaFold3StructureViewer
              className="flex-1"
              format={structureFormat}
              structureUrl={
                selectedStructure?.status === "ready" ? structureUrl : undefined
              }
            />

            <div className="grid gap-3 md:grid-cols-2">
              <StatBlock
                label="Prediction status"
                value={selectedStructure?.status ? selectedStructure.status : "No selection"}
              />
              <StatBlock
                label="Sequence length"
                value={selectedStructure?.sequenceLength ? `${selectedStructure.sequenceLength} residues` : "Pending"}
              />
              <StatBlock
                label="Mean pLDDT"
                value={formatConfidence(selectedStructure?.outputs?.confidence?.meanPlddt)}
              />
              <StatBlock
                label="Mean PAE"
                value={formatConfidence(selectedStructure?.outputs?.confidence?.meanPae)}
              />
            </div>

            {selectedStructure?.outputs?.paeImageUrl && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="mb-2 text-sm font-medium">Predicted aligned error</p>
                <img
                  alt="Predicted aligned error heatmap"
                  className="w-full rounded border border-border/60 bg-background"
                  src={selectedStructure.outputs.paeImageUrl}
                  loading="lazy"
                />
              </div>
            )}

            {selectedStructure?.notes && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                {selectedStructure.notes}
              </div>
            )}

            {selectedStructure && selectedStructure.status !== "ready" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                AlphaFold3 is still generating this structure. The 3D preview becomes available once the job completes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

const formatConfidence = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return "Not available";
  return `${value.toFixed(1)}`;
};

const normalizeStructureRecord = (record: any): AlphaFold3Structure => {
  const raw = (record ?? {}) as Record<string, any>;
  const fallbackId = typeof window !== "undefined" && window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `structure-${Math.random().toString(36).slice(2, 9)}`;

  const status = (record?.status || raw.state || "pending") as PredictionStatus;

  const normalized: AlphaFold3Structure = {
    id: record?.id || raw.job_id || fallbackId,
    jobId: record?.jobId || raw.job_id || raw.parent_job_id,
    targetName:
      record?.targetName ||
      raw.target_name ||
      raw.sequence_name ||
      raw.metadata?.name,
    status,
    createdAt: record?.createdAt || raw.created_at,
    updatedAt: record?.updatedAt || raw.updated_at,
    sequenceLength:
      record?.sequenceLength ||
      raw.sequence_length ||
      raw.metadata?.sequence_length,
    metadata: record?.metadata || raw.metadata,
    outputs: {
      pdbUrl:
        record?.outputs?.pdbUrl ||
        raw.outputs?.pdbUrl ||
        raw.outputs?.pdb_url ||
        raw.pdb_url,
      cifUrl:
        record?.outputs?.cifUrl ||
        raw.outputs?.cifUrl ||
        raw.outputs?.cif_url ||
        raw.cif_url,
      paeImageUrl:
        record?.outputs?.paeImageUrl ||
        raw.outputs?.paeImageUrl ||
        raw.outputs?.pae_image_url ||
        raw.pae_image_url,
      paeJsonUrl:
        record?.outputs?.paeJsonUrl ||
        raw.outputs?.paeJsonUrl ||
        raw.outputs?.pae_json_url ||
        raw.pae_json_url,
      confidence: {
        meanPlddt:
          record?.outputs?.confidence?.meanPlddt ||
          raw.outputs?.confidence?.mean_plddt ||
          raw.mean_plddt,
        meanPae:
          record?.outputs?.confidence?.meanPae ||
          raw.outputs?.confidence?.mean_pae ||
          raw.mean_pae,
        coverage:
          record?.outputs?.confidence?.coverage ||
          raw.outputs?.confidence?.coverage ||
          raw.coverage,
      },
    },
    notes: record?.notes || raw.notes,
  };

  if (!normalized.targetName) {
    normalized.targetName = normalized.jobId || normalized.id;
  }

  return normalized;
};

const StatBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted/40 p-3">
    <div className="text-xs uppercase tracking-wide text-muted-foreground">
      {label}
    </div>
    <div className="text-sm font-semibold text-foreground">{value}</div>
  </div>
);

const safeReadError = async (response: Response) => {
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      const parsed = JSON.parse(text);
      return parsed?.error || parsed?.message || text;
    } catch (error) {
      return text;
    }
  } catch (error) {
    return null;
  }
};

export default AlphaFold3Explorer;
