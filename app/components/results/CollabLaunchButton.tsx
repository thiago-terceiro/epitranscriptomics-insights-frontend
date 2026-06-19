"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const CollabLaunchButton = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/collab/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Analysis collaboration" }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Failed to create collaboration session");
            }

            const data = await response.json();
            const sessionId = data?.session_id;
            if (!sessionId) {
                throw new Error("Missing session id in response");
            }
            toast.success("Collaboration room created");
            router.push(`/results/collab/${sessionId}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unable to start collaboration";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleClick} disabled={loading} variant="outline">
            {loading ? "Starting…" : "Start collaboration"}
        </Button>
    );
};

export default CollabLaunchButton;
