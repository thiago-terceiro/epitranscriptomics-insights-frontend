import { getBackendUrl } from "@/lib/server/runtime";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type CreateSessionPayload = {
    title?: string;
};

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const backendUrl = getBackendUrl();
        const body: CreateSessionPayload | null = await request.json().catch(() => null);

        const response = await fetch(`${backendUrl}/collab/sessions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title: body?.title }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Backend responded with ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error) {
        console.error("Failed to create collaboration session", error);
        return NextResponse.json({ error: "Unable to create collaboration session" }, { status: 500 });
    }
}
