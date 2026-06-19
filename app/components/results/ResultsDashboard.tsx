"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import JobCard from "./JobCard";

interface Job {
  id: string;
  status: string;
  created_at?: string;
  result?: {
    models?: Record<string, any>;  // Backend uses 'models'
    results?: Record<string, any>; // Keep for backwards compatibility
    execution_time?: number;
    completed_at?: string;
    error?: string;
  };
}

// Normalize backend status values to frontend display values
const normalizeStatus = (status: string): string => {
  switch (status) {
    case "succeeded":
      return "completed";
    default:
      return status;
  }
};

const ResultsDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "completed" | "running" | "failed"
  >("all");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jobs/list");

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      // Normalize status values from backend
      const normalizedJobs = (data.jobs || []).map((job: Job) => ({
        ...job,
        status: normalizeStatus(job.status),
      }));
      setJobs(normalizedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (filter === "all") return true;
    if (filter === "running") {
      return ["running", "pending", "queued"].includes(job.status);
    }
    return job.status === filter;
  });

  const statusCounts = {
    all: jobs.length,
    completed: jobs.filter((j) => j.status === "completed").length,
    running: jobs.filter((j) => ["running", "pending", "queued"].includes(j.status))
      .length,
    failed: jobs.filter((j) => j.status === "failed").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Jobs</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.all}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {statusCounts.completed}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Running</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {statusCounts.running}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {statusCounts.failed}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Your Analysis Jobs</CardTitle>
          <div className="mt-4 flex gap-2">
            {(["all", "completed", "running", "failed"] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === status
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
            <button
              onClick={fetchJobs}
              className="bg-muted hover:bg-muted/80 ml-auto rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              <p className="text-lg font-medium">No jobs found</p>
              <p className="mt-2 text-sm">
                {filter === "all"
                  ? "Submit your first analysis to get started"
                  : `No ${filter} jobs`}
              </p>
            </div>
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDashboard;
