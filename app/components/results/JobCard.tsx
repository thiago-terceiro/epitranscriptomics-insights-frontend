"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Download,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface JobCardProps {
  job: {
    id: string;
    status: string;
    created_at?: string;
    result?: {
      models?: Record<string, any>;  // Backend format
      results?: Record<string, any>; // Legacy format
      execution_time?: number;
      completed_at?: string;
      error?: string;
    };
  };
}

const JobCard = ({ job }: JobCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = () => {
    switch (job.status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "running":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "queued":
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "queued":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleDownload = async (type: string, url: string) => {
    try {
      toast.info(`Downloading ${type}...`);
      // In production, this would fetch from the presigned S3 URL
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${job.id}_${type}.tsv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast.success(`${type} downloaded successfully`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(`Failed to download ${type}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Support both 'models' (backend) and 'results' (legacy) formats
  const results = job.result?.models || job.result?.results || {};
  const hasResults = Object.keys(results).length > 0;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              {getStatusIcon()}
              <CardTitle className="text-lg">
                Job {job.id.slice(0, 8)}
              </CardTitle>
              <span
                className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor()}`}
              >
                {job.status}
              </span>
            </div>
            <CardDescription>
              Created: {formatDate(job.created_at)}
              {job.result?.execution_time && (
                <span className="ml-4">
                  Duration: {formatDuration(job.result.execution_time)}
                </span>
              )}
            </CardDescription>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hover:bg-muted rounded-lg p-2 transition-colors"
            aria-label={expanded ? "Collapse details" : "Expand details"}
          >
            {expanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CardContent>
            {job.status === "completed" && hasResults ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(results).map(
                    ([modelName, modelResults]: [string, any]) => (
                      <Card key={modelName} className="border-2">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-4 w-4" />
                            {modelName.toUpperCase()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {modelResults.sites_tsv && (
                            <button
                              onClick={() =>
                                handleDownload("TSV", modelResults.sites_tsv)
                              }
                              className="bg-primary/10 hover:bg-primary/20 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              <span>Download TSV</span>
                              <Download className="ml-auto h-4 w-4" />
                            </button>
                          )}
                          {modelResults.sites_bed && (
                            <button
                              onClick={() =>
                                handleDownload("BED", modelResults.sites_bed)
                              }
                              className="bg-primary/10 hover:bg-primary/20 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
                            >
                              <Database className="h-4 w-4" />
                              <span>Download BED</span>
                              <Download className="ml-auto h-4 w-4" />
                            </button>
                          )}
                          {modelResults.error && (
                            <div className="rounded bg-red-50 p-2 text-xs text-red-600">
                              Error: {modelResults.error}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>

                {/* Summary Statistics */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Summary Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Models Run:
                        </span>
                        <span className="font-medium">
                          {Object.keys(results).join(", ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Completed:
                        </span>
                        <span className="font-medium">
                          {formatDate(job.result?.completed_at)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Total Runtime:
                        </span>
                        <span className="font-medium">
                          {formatDuration(job.result?.execution_time)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : job.status === "failed" ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">Job Failed</p>
                <p className="mt-1 text-xs text-red-600">
                  {job.result?.error || "An unknown error occurred"}
                </p>
              </div>
            ) : job.status === "running" ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">
                  Analysis Running
                </p>
                <p className="mt-1 text-xs text-blue-600">
                  Your analysis is actively being processed. Results will appear here when complete.
                </p>
              </div>
            ) : job.status === "queued" ? (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-800">
                  Queued for Processing
                </p>
                <p className="mt-1 text-xs text-orange-600">
                  Your job is in the queue and will start processing soon.
                </p>
              </div>
            ) : job.status === "pending" ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800">
                  Pending
                </p>
                <p className="mt-1 text-xs text-yellow-600">
                  Job submitted and waiting to be queued.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-800">
                  No additional details available
                </p>
              </div>
            )}
          </CardContent>
        </motion.div>
      )}
    </Card>
  );
};

export default JobCard;
