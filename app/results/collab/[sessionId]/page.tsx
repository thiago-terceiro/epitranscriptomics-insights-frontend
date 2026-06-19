import CollabWorkspace from "@/components/results/collab/CollabWorkspace";
import { Button } from "@/components/ui/button";
import { getBackendUrl, getCollabWebSocketBaseUrl } from "@/lib/server/runtime";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type PageProps = {
    params: Promise<{ sessionId: string }>;
};

const CollabSessionPage = async ({ params }: PageProps) => {
    const { sessionId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        redirect("/");
    }

    const backendHttp = getBackendUrl();

    const sessionResponse = await fetch(`${backendHttp}/collab/sessions/${sessionId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (sessionResponse.status === 404) {
        notFound();
    }

    if (!sessionResponse.ok) {
        throw new Error(`Failed to load collaboration session (${sessionResponse.status})`);
    }

    const ticketResponse = await fetch(`${backendHttp}/collab/sessions/${sessionId}/ws-ticket`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (ticketResponse.status === 404) {
        notFound();
    }

    if (!ticketResponse.ok) {
        throw new Error(`Failed to create collaboration websocket ticket (${ticketResponse.status})`);
    }

    const data = await sessionResponse.json();
    const { ticket } = await ticketResponse.json();

    return (
        <main className="min-h-screen bg-slate-50 py-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Collaboration</p>
                        <h1 className="text-3xl font-bold text-slate-900">Model analysis workspace</h1>
                    </div>
                    <Link href="/results">
                        <Button variant="outline">Back to results</Button>
                    </Link>
                </div>

                <CollabWorkspace
                    sessionId={sessionId}
                    wsTicket={ticket}
                    wsBaseUrl={getCollabWebSocketBaseUrl()}
                    initialState={data}
                />
            </div>
        </main>
    );
};

export default CollabSessionPage;
