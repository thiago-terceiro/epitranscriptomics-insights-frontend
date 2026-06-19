import { getBackendUrl } from "@/lib/server/runtime";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ sessionId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await context.params;

        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/collab/sessions/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (response.status === 404) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Backend responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch collaboration session", error);
        return NextResponse.json({ error: "Unable to load session" }, { status: 500 });
    }
}
