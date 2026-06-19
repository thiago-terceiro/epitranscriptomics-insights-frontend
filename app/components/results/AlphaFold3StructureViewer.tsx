"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

declare global {
    interface Window {
        $3Dmol?: any;
    }
}

type StructureFormat = "pdb" | "cif";

type AlphaFold3StructureViewerProps = {
    structureUrl?: string;
    format?: StructureFormat;
    className?: string;
};

const SCRIPT_ID = "alphafold3-3dmol-script";
const SCRIPT_SRC = "https://unpkg.com/3dmol@2.5.5/build/3Dmol-min.js";
const SCRIPT_INTEGRITY = "sha256-98x4khrnLnYj6JzdERQ09Ywu/d0v/aHNISZEtAb7gBY=";

const AlphaFold3StructureViewer = ({
    structureUrl,
    format = "pdb",
    className,
}: AlphaFold3StructureViewerProps) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<any>(null);
    const [scriptReady, setScriptReady] = useState(false);
    const [scriptError, setScriptError] = useState<string | null>(null);
    const [loadingStructure, setLoadingStructure] = useState(false);
    const [structureError, setStructureError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (window.$3Dmol) {
            setScriptReady(true);
            return;
        }

        let isMounted = true;
        const handleLoad = () => {
            if (!isMounted) return;
            setScriptError(null);
            setScriptReady(true);
        };

        const handleError = () => {
            if (!isMounted) return;
            setScriptError("Failed to load 3Dmol viewer script");
        };

        const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

        if (existingScript) {
            existingScript.addEventListener("load", handleLoad);
            existingScript.addEventListener("error", handleError);

            return () => {
                isMounted = false;
                existingScript.removeEventListener("load", handleLoad);
                existingScript.removeEventListener("error", handleError);
            };
        }

        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.integrity = SCRIPT_INTEGRITY;
        script.crossOrigin = "anonymous";
        script.referrerPolicy = "no-referrer";
        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleError);

        document.body.appendChild(script);

        return () => {
            isMounted = false;
            script.removeEventListener("load", handleLoad);
            script.removeEventListener("error", handleError);
        };
    }, []);

    useEffect(() => {
        const loadStructure = async () => {
            if (!structureUrl) {
                setStructureError(null);
                setLoadingStructure(false);
                if (viewerRef.current) {
                    viewerRef.current.removeAllModels?.();
                    viewerRef.current.removeAllSurfaces?.();
                    viewerRef.current.render?.();
                }
                return;
            }

            if (!scriptReady || !containerRef.current || !window.$3Dmol) {
                return;
            }

            try {
                setLoadingStructure(true);
                setStructureError(null);

                const response = await fetch(structureUrl, { cache: "no-store" });
                if (!response.ok) {
                    throw new Error(`Unable to load structure (${response.status})`);
                }

                const structureText = await response.text();

                if (!viewerRef.current) {
                    viewerRef.current = window.$3Dmol.createViewer(containerRef.current, {
                        backgroundColor: "#020817",
                    });
                }

                viewerRef.current.removeAllModels();
                viewerRef.current.removeAllSurfaces();
                viewerRef.current.addModel(structureText, format);
                viewerRef.current.setStyle({}, { cartoon: { color: "spectrum" } });

                const surfaceType = window.$3Dmol.SurfaceType?.VDW;
                if (surfaceType) {
                    viewerRef.current.addSurface(surfaceType, {
                        opacity: 0.07,
                        color: "white",
                    });
                }
                viewerRef.current.zoomTo();
                viewerRef.current.render();
                viewerRef.current.zoom(0.9, 500);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error";
                setStructureError(message);
            } finally {
                setLoadingStructure(false);
            }
        };

        loadStructure();

        return () => {
            viewerRef.current?.removeAllModels?.();
            viewerRef.current?.removeAllSurfaces?.();
        };
    }, [structureUrl, format, scriptReady]);

    return (
        <div
            className={cn(
                "relative flex h-[480px] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900",
                className,
            )}
        >
            <div ref={containerRef} className="h-full w-full" />

            {!structureUrl && (
                <div className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-sm">
                    Provide or select an AlphaFold3 prediction to render its 3D conformation.
                </div>
            )}

            {!!scriptError && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/60 px-6 text-center text-sm text-red-400">
                    {scriptError}
                </div>
            )}

            {loadingStructure && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/40">
                    <div className="border-primary h-12 w-12 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
            )}

            {!!structureError && structureUrl && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-900/60 px-6 text-center text-sm text-red-300">
                    {structureError}
                </div>
            )}
        </div>
    );
};

export default AlphaFold3StructureViewer;
