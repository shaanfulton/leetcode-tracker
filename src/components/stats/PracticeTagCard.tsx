"use client";
import type { CapabilityBreakdown } from "@/lib/stats";
import { PracticeContributionsTable } from "./PracticeContributionsTable";

export function PracticeTagCard({
  breakdown,
  open,
  onToggle,
}: {
  breakdown: CapabilityBreakdown;
  open: boolean;
  onToggle: (tag: string) => void;
}) {
  const b = breakdown;
  const pct = Math.round(b.score * 100);
  const pctColor =
    pct < 25
      ? "var(--color-difficulty-hard)"
      : pct < 75
      ? "var(--color-difficulty-medium)"
      : "var(--color-difficulty-easy)";
  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-sm font-medium truncate">{b.tag}</div>
          <div
            className="text-sm font-medium tabular-nums"
            style={{ color: pctColor }}
          >
            {pct}%
          </div>
          <div
            className="text-xs whitespace-nowrap"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Total: {b.total} • Easy: {b.easy} • Medium: {b.medium} • Hard:{" "}
            {b.hard}
          </div>
        </div>
        <button className="text-xs underline" onClick={() => onToggle(b.tag)}>
          {open ? "Hide" : "Details"}
        </button>
      </div>
      <div className="mt-2">
        <div
          className="h-2 rounded overflow-hidden"
          style={{ background: "var(--color-muted)" }}
        >
          <div
            className="h-full"
            style={{ background: pctColor, width: `${pct}%` }}
          />
        </div>
      </div>
      {open ? (
        <div className="mt-3">
          <div
            className="text-xs mb-2"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Contributions
          </div>
          <PracticeContributionsTable details={b.details} />
        </div>
      ) : null}
    </div>
  );
}
