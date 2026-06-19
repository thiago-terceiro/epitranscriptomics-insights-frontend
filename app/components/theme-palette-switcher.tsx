"use client";

import { Palette } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pastelPalettes = [
  { value: "mint", label: "Mint", swatch: "#d8f2e7", accent: "#4aa785" },
  { value: "blush", label: "Blush", swatch: "#f7dde7", accent: "#d1668f" },
  {
    value: "lavender",
    label: "Lavender",
    swatch: "#e6e0f5",
    accent: "#8a6ac9",
  },
  { value: "sky", label: "Sky", swatch: "#dceffc", accent: "#4f91c9" },
  { value: "peach", label: "Peach", swatch: "#fbe3d4", accent: "#e98a5a" },
  { value: "sand", label: "Sand", swatch: "#f2eadb", accent: "#c69b6d" },
] satisfies Array<{
  value: string;
  label: string;
  swatch: string;
  accent: string;
}>;

const baseModes: Array<{ value: "system" | "light" | "dark"; label: string }> =
  [
    { value: "system", label: "System" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ];

const ThemePaletteSwitcher = () => {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const activeTheme =
    theme === "system" ? (resolvedTheme ?? "light") : (theme ?? "light");

  return (
    <aside className="border-border/60 bg-background/80 pointer-events-auto fixed right-4 bottom-4 z-50 flex w-[min(18rem,calc(100%-2rem))] flex-col gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground flex items-center gap-2 text-xs font-semibold tracking-[0.32em] uppercase">
          <Palette className="size-3.5" aria-hidden /> Palette
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {baseModes.map((mode) => {
            const isActive = theme === mode.value;
            return (
              <Button
                key={mode.value}
                type="button"
                size="sm"
                variant={isActive ? "default" : "outline"}
                className={cn(
                  "h-7 min-w-0 px-3 text-[0.6rem] leading-none font-semibold tracking-[0.18em] uppercase"
                )}
                onClick={() => setTheme(mode.value)}
                aria-pressed={isActive}
              >
                {mode.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {pastelPalettes.map((palette) => {
          const isActive = activeTheme === palette.value;
          return (
            <button
              key={palette.value}
              type="button"
              onClick={() => setTheme(palette.value)}
              aria-pressed={isActive}
              aria-label={`${palette.label} theme`}
              className={cn(
                "group border-border/70 focus-visible:ring-ring/50 relative size-12 rounded-full border p-[2px] transition-transform focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
                isActive && "border-ring scale-105 shadow-lg"
              )}
            >
              <span
                className="text-foreground/70 flex size-full items-center justify-center rounded-full text-[0.65rem] font-medium tracking-[0.2em] uppercase"
                style={{
                  background: palette.swatch,
                  color: palette.accent,
                  boxShadow: isActive
                    ? `0 0 0 4px ${palette.swatch}`
                    : `inset 0 0 0 1px ${palette.accent}33`,
                }}
              >
                {palette.label.slice(0, 2)}
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity group-hover:opacity-20"
                style={{ background: palette.accent }}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ThemePaletteSwitcher;
