import CollabLaunchButton from "@/components/results/CollabLaunchButton";
import ResultsDashboard from "@/components/results/ResultsDashboard";
import Link from "next/link";

const ResultsPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-foreground text-3xl font-bold">
            Analysis Results
          </h1>
          <p className="text-muted-foreground mt-2">
            View, download, and explore your epitranscriptomics analysis results
          </p>
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
          <div className="flex-1 text-sm text-muted-foreground">
            Visualise structural predictions with the interactive AlphaFold3 explorer, or collaborate with teammates on model results in real time.
          </div>
          <div className="flex items-center gap-2">
            <CollabLaunchButton />
            <Link
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition"
              href="/results/alphafold3"
            >
              Open 3D explorer
            </Link>
          </div>
        </div>
        <ResultsDashboard />
      </div>
    </main>
  );
};

export default ResultsPage;
