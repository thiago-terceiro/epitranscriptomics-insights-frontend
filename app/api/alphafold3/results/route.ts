import { getBackendUrl, isAlphaFoldDemoEnabled, shouldProxyAlphaFold3 } from "@/lib/server/runtime";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allowDemoMode = isAlphaFoldDemoEnabled();
        const useBackend = shouldProxyAlphaFold3();

        if (useBackend) {
            try {
                const backendUrl = getBackendUrl();
                const response = await fetch(`${backendUrl}/alphafold3/results`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(`Backend responded with ${response.status}`);
                }

                const data = await response.json();
                return NextResponse.json(data);
            } catch (error) {
                if (!allowDemoMode) {
                    console.error("AlphaFold3 results proxy error", error);
                    return NextResponse.json(
                        { error: "AlphaFold3 backend is unavailable" },
                        { status: 502 },
                    );
                }
                console.warn("Falling back to demo AlphaFold3 results", error);
            }
        }

        if (!allowDemoMode) {
            return NextResponse.json(
                { error: "AlphaFold3 demo mode is disabled" },
                { status: 503 },
            );
        }

        const now = Date.now();
        const demoResults = [
            {
                id: "af3-demo-ready",
                job_id: "af3-demo-ready",
                target_name: "Demo poly-alanine",
                status: "ready",
                sequence_length: 120,
                created_at: new Date(now - 7200_000).toISOString(),
                updated_at: new Date(now - 3600_000).toISOString(),
                outputs: {
                    pdb_url: "/api/alphafold3/structures/demo",
                    confidence: {
                        mean_plddt: 88.6,
                        mean_pae: 6.5,
                        coverage: 0.94,
                    },
                },
                notes:
                    "Mock AlphaFold3 structure for UI development. Replace with backend data when available.",
            },
            {
                id: "af3-demo-running",
                job_id: "af3-demo-running",
                target_name: "RNA-binding motif",
                status: "running",
                sequence_length: 242,
                created_at: new Date(now - 1800_000).toISOString(),
            },
        ];

        return NextResponse.json({ results: demoResults });
    } catch (error) {
        console.error("Error serving AlphaFold3 results", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
