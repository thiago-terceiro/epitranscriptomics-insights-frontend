import { getBackendUrl, isDevMockRoutesEnabled } from "@/lib/server/runtime"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    if (!isDevMockRoutesEnabled()) {
        return NextResponse.json(
            { detail: "Not found" },
            { status: 404 }
        )
    }

    try {
        const backendUrl = getBackendUrl()

        const body = await request.json()
        const { reference_fasta, models } = body

        // Validation
        if (!reference_fasta || typeof reference_fasta !== "string") {
            return NextResponse.json(
                { detail: "reference_fasta is required" },
                { status: 400 }
            )
        }

        if (!models || !Array.isArray(models) || models.length === 0) {
            return NextResponse.json(
                { detail: "models array is required" },
                { status: 400 }
            )
        }

        // Build headers
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        }

        // Submit mock job to backend
        const jobPayload = {
            accession: "mock", // Magic keyword for mock mode
            reference_fasta: reference_fasta.trim(),
            models: models,
            analysis: {
                mock: true,
            },
        }

        console.log("[submit-mock] Submitting mock job:", jobPayload)

        const backendResponse = await fetch(`${backendUrl}/jobs`, {
            method: "POST",
            headers,
            body: JSON.stringify(jobPayload),
        })

        const responseData = await backendResponse.json().catch(() => undefined)

        if (!backendResponse.ok) {
            console.error("[submit-mock] Backend error:", responseData)
            return NextResponse.json(
                { detail: responseData?.detail ?? "Failed to submit mock job to backend" },
                { status: backendResponse.status }
            )
        }

        console.log("[submit-mock] Mock job submitted successfully:", responseData)
        return NextResponse.json(responseData)
    } catch (error) {
        console.error("[submit-mock] Error:", error)
        return NextResponse.json(
            { detail: "Internal server error" },
            { status: 500 }
        )
    }
}
