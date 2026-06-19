"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Line, Stage } from "react-konva";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type Konva from "konva";

const COLOR_OPTIONS = ["#f97316", "#22c55e", "#38bdf8", "#a855f7", "#ef4444", "#facc15"] as const;

type Participant = {
    user_id: string;
    name?: string;
    color?: string;
    joined_at?: string;
};

type CollabSticky = {
    id: string;
    row_id?: string | null;
    text: string;
    x: number;
    y: number;
    color: string;
    created_by: string;
    created_by_name?: string | null;
    created_at: string;
    updated_at?: string | null;
};

type CollabShape = {
    id: string;
    type: "circle" | "path" | "rectangle";
    data: Record<string, unknown>;
    color: string;
    stroke_width: number;
    row_id?: string | null;
    created_by: string;
    created_by_name?: string | null;
    created_at: string;
    updated_at?: string | null;
};

type CollabSessionState = {
    session_id: string;
    title: string;
    created_at: string;
    owner_id: string;
    owner_name?: string | null;
    stickies: Record<string, CollabSticky>;
    shapes: Record<string, CollabShape>;
};

type CollabSessionDetail = {
    session: CollabSessionState;
    participants: Participant[];
    max_participants: number;
};

type AnalysisRow = {
    id: string;
    gene: string;
    position: number;
    probability: number;
    model: string;
};

type CollabWorkspaceProps = {
    sessionId: string;
    wsTicket: string;
    wsBaseUrl: string;
    initialState: CollabSessionDetail;
};

type Tool = "select" | "sticky" | "pen";

type DraftLine = {
    id: string;
    points: number[];
    color: string;
    strokeWidth: number;
};

const FALLBACK_ROWS: AnalysisRow[] = [
    { id: "row-1", gene: "TP53", position: 7579472, probability: 0.94, model: "m6anet" },
    { id: "row-2", gene: "METTL3", position: 17895432, probability: 0.87, model: "cheui" },
    { id: "row-3", gene: "FTO", position: 5278841, probability: 0.82, model: "m6anet" },
    { id: "row-4", gene: "YTHDF2", position: 2389912, probability: 0.78, model: "cheui" },
    { id: "row-5", gene: "WTAP", position: 4688892, probability: 0.75, model: "m6anet" },
];

const CollabWorkspace = ({ sessionId, wsTicket, wsBaseUrl, initialState }: CollabWorkspaceProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<"connecting" | "open" | "closed">("connecting");
    const [stickies, setStickies] = useState<Record<string, CollabSticky>>(() => initialState.session.stickies || {});
    const [shapes, setShapes] = useState<Record<string, CollabShape>>(() => initialState.session.shapes || {});
    const [participants, setParticipants] = useState<Participant[]>(initialState.participants || []);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [tool, setTool] = useState<Tool>("select");
    const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
    const [draftLine, setDraftLine] = useState<DraftLine | null>(null);
    // TODO: Replace with actual data fetch when implementing data integration
    const [analysisRows] = useState<AnalysisRow[]>(FALLBACK_ROWS);

    const wsUrl = useMemo(() => {
        const separator = wsBaseUrl.endsWith("/") ? "" : "/";
        return `${wsBaseUrl}${separator}collab/ws/${sessionId}`;
    }, [wsBaseUrl, sessionId]);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new ResizeObserver(() => {
            const rect = element.getBoundingClientRect();
            setDimensions({ width: rect.width, height: rect.height });
        });

        observer.observe(element);
        const rect = element.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });

        return () => {
            observer.disconnect();
        };
    }, []);

    const applyStickyUpdate = useCallback((updated: CollabSticky) => {
        setStickies((prev) => ({ ...prev, [updated.id]: updated }));
    }, []);

    const removeSticky = useCallback((stickyId: string) => {
        setStickies((prev) => {
            const clone = { ...prev };
            delete clone[stickyId];
            return clone;
        });
    }, []);

    const applyShapeUpdate = useCallback((updated: CollabShape) => {
        setShapes((prev) => ({ ...prev, [updated.id]: updated }));
    }, []);

    const removeShape = useCallback((shapeId: string) => {
        setShapes((prev) => {
            const clone = { ...prev };
            delete clone[shapeId];
            return clone;
        });
    }, []);

    const handlePresence = useCallback((list: Participant[]) => {
        setParticipants(list);
    }, []);

    const sendEvent = useCallback(
        (type: string, payload: Record<string, unknown>) => {
            const socket = wsRef.current;
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                return;
            }
            socket.send(JSON.stringify({ type, payload }));
        },
        []
    );

    useEffect(() => {
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
            setConnectionStatus("open");
            socket.send(JSON.stringify({ type: "auth", ticket: wsTicket }));
        };

        socket.onclose = () => {
            setConnectionStatus("closed");
        };

        socket.onerror = () => {
            toast.error("Collaboration connection error");
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                switch (message.type) {
                    case "session:init":
                        if (message.session?.stickies) {
                            setStickies(message.session.stickies);
                        }
                        if (message.session?.shapes) {
                            setShapes(message.session.shapes);
                        }
                        if (Array.isArray(message.participants)) {
                            setParticipants(message.participants);
                        }
                        break;
                    case "presence":
                        if (Array.isArray(message.participants)) {
                            handlePresence(message.participants);
                        }
                        break;
                    case "sticky.create":
                    case "sticky.update":
                        if (message.payload) {
                            applyStickyUpdate(message.payload as CollabSticky);
                        }
                        break;
                    case "sticky.delete":
                        if (message.payload?.id) {
                            removeSticky(String(message.payload.id));
                        }
                        break;
                    case "shape.create":
                    case "shape.update":
                        if (message.payload) {
                            applyShapeUpdate(message.payload as CollabShape);
                        }
                        break;
                    case "shape.delete":
                        if (message.payload?.id) {
                            removeShape(String(message.payload.id));
                        }
                        break;
                    case "error":
                        if (message.message) {
                            toast.error(String(message.message));
                        }
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error("Failed to parse collaboration message", error);
            }
        };

        return () => {
            socket.close();
            wsRef.current = null;
        };
    }, [wsTicket, wsUrl, applyShapeUpdate, applyStickyUpdate, handlePresence, removeShape, removeSticky]);

    const generateId = () =>
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `collab-${Math.random().toString(36).slice(2, 10)}`;

    const handleAddSticky = (event: React.MouseEvent<HTMLTableSectionElement, MouseEvent>) => {
        if (tool !== "sticky" || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const xNorm = (event.clientX - rect.left) / rect.width;
        const yNorm = (event.clientY - rect.top) / rect.height;

        const stickyId = generateId();
        const newSticky: CollabSticky = {
            id: stickyId,
            text: "New note",
            x: xNorm,
            y: yNorm,
            color,
            created_by: "local",
            created_at: new Date().toISOString(),
        };

        applyStickyUpdate(newSticky);
        sendEvent("sticky.create", newSticky);
    };

    const updateStickyTextLocal = (stickyId: string, text: string) => {
        setStickies((prev) => {
            const existing = prev[stickyId];
            if (!existing) return prev;
            return { ...prev, [stickyId]: { ...existing, text } };
        });
    };

    const commitStickyText = (stickyId: string, text: string) => {
        sendEvent("sticky.update", { id: stickyId, text });
    };

    const handleStickyDelete = (stickyId: string) => {
        removeSticky(stickyId);
        sendEvent("sticky.delete", { id: stickyId });
    };

    const beginDrawing = (event: Konva.KonvaEventObject<MouseEvent>) => {
        if (tool !== "pen" || !containerRef.current) return;
        const stage = event.target.getStage();
        const pointer = stage?.getPointerPosition();
        if (!pointer) return;

        const { width, height } = dimensions;
        if (!width || !height) return;

        const id = generateId();
        const xNorm = pointer.x / width;
        const yNorm = pointer.y / height;
        setDraftLine({ id, points: [xNorm, yNorm], color, strokeWidth: 2.5 });
    };

    const continueDrawing = (event: Konva.KonvaEventObject<MouseEvent>) => {
        if (!draftLine || !containerRef.current) return;
        const stage = event.target.getStage();
        const pointer = stage?.getPointerPosition();
        if (!pointer) return;
        const { width, height } = dimensions;
        if (!width || !height) return;

        setDraftLine((prev) => {
            if (!prev) return prev;
            const nextPoints = [...prev.points, pointer.x / width, pointer.y / height];
            return { ...prev, points: nextPoints };
        });
    };

    const endDrawing = () => {
        if (!draftLine) return;
        if (draftLine.points.length < 4) {
            setDraftLine(null);
            return;
        }
        const shapePayload = {
            id: draftLine.id,
            type: "path" as const,
            data: { points: draftLine.points },
            color: draftLine.color,
            stroke_width: draftLine.strokeWidth,
        };
        setDraftLine(null);
        sendEvent("shape.create", shapePayload);
    };

    const renderStickies = () => {
        const { width, height } = dimensions;
        if (!width || !height) return null;

        return Object.values(stickies).map((sticky) => {
            const left = sticky.x * width;
            const top = sticky.y * height;
            return (
                <div
                    key={sticky.id}
                    className="pointer-events-auto absolute w-48 rounded-lg border border-primary/40 p-3 shadow-lg"
                    style={{ left, top, backgroundColor: sticky.color ?? "#facc15" }}
                >
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                        <span className="truncate">{sticky.created_by_name || sticky.created_by}</span>
                        <button
                            type="button"
                            className="text-muted-foreground hover:text-red-500"
                            onClick={() => handleStickyDelete(sticky.id)}
                        >
                            ×
                        </button>
                    </div>
                    <textarea
                        className="h-24 w-full resize-none rounded bg-transparent text-sm outline-none"
                        value={sticky.text}
                        onChange={(event) => updateStickyTextLocal(sticky.id, event.target.value)}
                        onBlur={(event) => commitStickyText(sticky.id, event.target.value)}
                    />
                </div>
            );
        });
    };

    const renderShapes = () => {
        const { width, height } = dimensions;
        if (!width || !height) return null;

        return Object.values(shapes).map((shape) => {
            if (shape.type === "path") {
                const points = Array.isArray(shape.data?.points) ? (shape.data.points as number[]) : [];
                const scaled = [] as number[];
                for (let index = 0; index < points.length; index += 2) {
                    scaled.push(points[index] * width, points[index + 1] * height);
                }
                return (
                    <Line
                        key={shape.id}
                        points={scaled}
                        stroke={shape.color}
                        strokeWidth={shape.stroke_width}
                        tension={0.5}
                        lineCap="round"
                        lineJoin="round"
                    />
                );
            }
            return null;
        });
    };

    const draftShapeElement = useMemo(() => {
        if (!draftLine || !dimensions.width || !dimensions.height) return null;
        const scaled = [] as number[];
        for (let index = 0; index < draftLine.points.length; index += 2) {
            scaled.push(draftLine.points[index] * dimensions.width, draftLine.points[index + 1] * dimensions.height);
        }
        return (
            <Line
                points={scaled}
                stroke={draftLine.color}
                strokeWidth={draftLine.strokeWidth}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                opacity={0.6}
            />
        );
    }, [draftLine, dimensions.height, dimensions.width]);

    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Collaboration link copied to clipboard");
        } catch (error) {
            toast.error("Unable to copy link");
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Session</p>
                        <h1 className="text-xl font-semibold">{initialState.session.title}</h1>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <Button variant="outline" onClick={copyShareLink} size="sm">
                            Share link
                        </Button>
                        <div className="text-xs text-muted-foreground">
                            {participants.length}/{initialState.max_participants} collaborators
                        </div>
                        <span
                            className={cn(
                                "rounded-full px-2 py-1 text-xs font-medium",
                                connectionStatus === "open" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                            )}
                        >
                            {connectionStatus === "open" ? "Connected" : connectionStatus === "connecting" ? "Connecting" : "Disconnected"}
                        </span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {participants.map((participant) => (
                        <span
                            key={participant.user_id}
                            className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: participant.color || "#38bdf8" }}
                            />
                            {participant.name || participant.user_id}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    {(["select", "sticky", "pen"] satisfies Tool[]).map((item) => (
                        <Button
                            key={item}
                            variant={tool === item ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTool(item)}
                        >
                            {item === "pen" ? "Highlight" : item === "sticky" ? "Sticky" : "Select"}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {COLOR_OPTIONS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            className={cn(
                                "h-6 w-6 rounded-full border-2",
                                color === option ? "border-slate-900" : "border-transparent",
                                "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                            style={{ backgroundColor: option }}
                            onClick={() => setColor(option)}
                            aria-label={`Select ${option} color`}
                        />
                    ))}
                </div>
            </div>

            <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm" ref={containerRef}>
                <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Gene</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Position</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Probability</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Model</th>
                            </tr>
                        </thead>
                        <tbody
                            className={cn("divide-y divide-slate-200", tool === "sticky" ? "cursor-copy" : "cursor-default")}
                            onClick={handleAddSticky}
                        >
                            {analysisRows.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-medium text-slate-700">{row.gene}</td>
                                    <td className="px-4 py-3 text-slate-600">{row.position.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-slate-600">{Math.round(row.probability * 100)}%</td>
                                    <td className="px-4 py-3 text-slate-600 uppercase">{row.model}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {dimensions.width > 0 && dimensions.height > 0 && (
                    <Stage
                        width={dimensions.width}
                        height={dimensions.height}
                        className={cn(
                            "absolute inset-0",
                            tool === "pen" ? "pointer-events-auto" : "pointer-events-none"
                        )}
                        onMouseDown={beginDrawing}
                        onMouseMove={continueDrawing}
                        onMouseUp={endDrawing}
                        onMouseLeave={endDrawing}
                    >
                        <Layer>{renderShapes()}</Layer>
                        {draftShapeElement && <Layer>{draftShapeElement}</Layer>}
                    </Stage>
                )}

                <div className="absolute inset-0 pointer-events-none">{renderStickies()}</div>
            </div>
        </div>
    );
};

export default CollabWorkspace;
