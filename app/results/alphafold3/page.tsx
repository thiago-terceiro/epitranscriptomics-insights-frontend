import AlphaFold3Explorer from "@/components/results/AlphaFold3Explorer";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const AlphaFold3ResultsPage = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        redirect("/");
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-10 text-slate-100">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
                <header className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                        Structural exploration
                    </p>
                    <h1 className="text-3xl font-bold sm:text-4xl">
                        AlphaFold3 3D insights
                    </h1>
                    <p className="max-w-3xl text-sm text-slate-300">
                        Queue AlphaFold3 structure predictions and explore completed models through an interactive 3D viewer, confidence summaries, and predicted aligned error overlays tailored for your epitranscriptomics pipelines.
                    </p>
                </header>

                <AlphaFold3Explorer />
            </div>
        </main>
    );
};

export default AlphaFold3ResultsPage;
