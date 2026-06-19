import { SECTION_PADDING } from "./constants";

const HeroSection = () => {
  return (
    <section className={`mx-auto w-full max-w-6xl ${SECTION_PADDING}`}>
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm font-semibold tracking-[0.2em] uppercase">
            RNA modification intelligence
          </p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Accelerate m6A and m5C discovery with a production-grade
            epitranscriptomics pipeline.
          </h1>
          <p className="text-muted-foreground max-w-xl text-base sm:text-lg">
            Epimod Pipeline ingests Oxford Nanopore Direct RNA Sequencing data,
            orchestrates CHEUI, m6Anet, and xPore models, and serves actionable
            modification calls via secure APIs and dashboards.
          </p>
          <div
            className="text-muted-foreground flex flex-wrap gap-3 text-sm"
            role="list"
            aria-label="Deployment highlights"
          >
            <span className="border-border inline-flex items-center gap-2 rounded-full border px-3 py-1">
              Containerized runners
            </span>
            <span className="border-border inline-flex items-center gap-2 rounded-full border px-3 py-1">
              Signed S3 artifacts
            </span>
            <span className="border-border inline-flex items-center gap-2 rounded-full border px-3 py-1">
              Prometheus + MLflow
            </span>
          </div>
        </div>

        <figure
          aria-labelledby="future-demo"
          className="border-border bg-card relative aspect-[16/9] w-full overflow-hidden rounded-3xl border"
        >
          <div
            aria-hidden="true"
            className="text-foreground absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_top,var(--primary)/0.35,var(--card)/0.95)]"
          >
            <span className="border-border text-foreground/75 rounded-full border px-4 py-1 text-xs tracking-[0.3em] uppercase">
              Coming soon
            </span>
            <div className="flex flex-col items-center gap-2 text-center">
              <span className="text-2xl font-semibold">
                Interactive pipeline tour
              </span>
              <span className="text-foreground/80 max-w-sm text-sm">
                Reserve space for a cinematic walkthrough of run submissions,
                live telemetry, and differential analysis.
              </span>
            </div>
          </div>
          <figcaption id="future-demo" className="sr-only">
            Placeholder for a future video explaining the Epimod Pipeline
            interface.
          </figcaption>
        </figure>
      </div>
    </section>
  );
};

export default HeroSection;
