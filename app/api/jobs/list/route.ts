import { getBackendUrl } from "@/lib/server/runtime";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = getBackendUrl();

    const response = await fetch(`${backendUrl}/jobs/list`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Don't cache job list - always get fresh data
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Backend returned error:", response.status, response.statusText);
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
