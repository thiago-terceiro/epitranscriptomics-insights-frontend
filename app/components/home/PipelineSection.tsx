import { SECTION_PADDING } from "./constants";

const PipelineSection = () => {
  return (
    <section id="pipeline" className={`bg-muted ${SECTION_PADDING}`}>
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-foreground text-2xl font-semibold sm:text-3xl">
            From raw reads to validated modification calls
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Submit SRA accessions or raw FAST5/FASTQ files, map against trusted
            references, and let the pipeline coordinate downloads, indexing,
            model execution, and results delivery. Each job is recorded,
            versioned, and auditable end-to-end.
          </p>
        </div>
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Key capabilities"
        >
          <article aria-label="FastAPI gateway" className="border-border bg-card h-full rounded-2xl border p-6 shadow-sm transition-colors">
            <h3 className="text-foreground text-base font-semibold">
              FastAPI gateway
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Typed submission APIs with JWT-secured access keys and signed
              download URLs for artifacts.
            </p>
          </article>
          <article aria-label="Celery scale-out" className="border-border bg-card h-full rounded-2xl border p-6 shadow-sm transition-colors">
            <h3 className="text-foreground text-base font-semibold">
              Celery scale-out
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Modular tasks that autoscale across GPU or CPU pools to meet lab
              throughput demands.
            </p>
          </article>
          <article aria-label="Observability native" className="border-border bg-card h-full rounded-2xl border p-6 shadow-sm transition-colors">
            <h3 className="text-foreground text-base font-semibold">
              Observability native
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              MLflow for experiment lineage tracking.{" "}
              <span className="text-primary/70 text-xs font-medium">
                Prometheus & Grafana coming soon.
              </span>
            </p>
          </article>
          <article aria-label="Secure by default" className="border-border bg-card h-full rounded-2xl border p-6 shadow-sm transition-colors">
            <h3 className="text-foreground text-base font-semibold">
              Secure by default
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              JWT authentication and signed URLs for artifacts.{" "}
              <span className="text-primary/70 text-xs font-medium">
                Encryption, RBAC & audit trails coming soon.
              </span>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;
