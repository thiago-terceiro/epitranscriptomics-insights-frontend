import { getBackendUrl, isAlphaFoldDemoEnabled, shouldProxyAlphaFold3 } from "@/lib/server/runtime";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

const AMINO_ACIDS = /^[ACDEFGHIKLMNPQRSTVWY]+$/i;

export async function POST(request: Request) {
    try {

        const payload = await request.json().catch(() => null);

        if (!payload?.sequence || typeof payload.sequence !== "string") {
            return NextResponse.json({ error: "Missing sequence" }, { status: 400 });
        }

        const sanitizedSequence = payload.sequence.replace(/\s+/g, "").toUpperCase();

        if (!sanitizedSequence || !AMINO_ACIDS.test(sanitizedSequence)) {
            return NextResponse.json(
                { error: "Sequence must contain only standard amino acid characters" },
                { status: 400 },
            );
        }

        const allowDemoMode = isAlphaFoldDemoEnabled();
        const useBackend = shouldProxyAlphaFold3();

        if (useBackend) {
            try {
                const backendUrl = getBackendUrl();
                const response = await fetch(`${backendUrl}/alphafold3/predict`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        sequence: sanitizedSequence,
                        name: payload.name,
                    }),
                });

                if (!response.ok) {
                    const message = await response.text();
                    throw new Error(message || `Backend responded with ${response.status}`);
                }

                const data = await response.json();
                return NextResponse.json(data, { status: response.status });
            } catch (error) {
                if (!allowDemoMode) {
                    console.error("AlphaFold3 predict proxy error", error);
                    return NextResponse.json(
                        { error: "AlphaFold3 backend is unavailable" },
                        { status: 502 },
                    );
                }
                console.warn("Falling back to mock AlphaFold3 predict handler", error);
            }
        }

        if (!allowDemoMode) {
            return NextResponse.json(
                { error: "AlphaFold3 demo mode is disabled" },
                { status: 503 },
            );
        }

        const id = randomUUID();
        const createdAt = new Date().toISOString();
        const name: string | undefined = typeof payload.name === "string" && payload.name.trim()
            ? payload.name.trim()
            : undefined;

        return NextResponse.json(
            {
                result: {
                    id,
                    job_id: id,
                    target_name: name || `AlphaFold3 target (${sanitizedSequence.length} aa)`,
                    status: "queued",
                    sequence_length: sanitizedSequence.length,
                    created_at: createdAt,
                },
            },
            { status: 202 },
        );
    } catch (error) {
        console.error("AlphaFold3 predict error", error);
        return NextResponse.json(
            { error: "Unable to queue AlphaFold3 prediction" },
            { status: 500 },
        );
    }
}
