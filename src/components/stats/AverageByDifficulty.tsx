"use client";
import type { Problem } from "@/context/ProblemsContext";
import { calculateAverageMinutes, normalizeDifficulty } from "@/lib/stats";

export function AverageByDifficulty({ problems }: { problems: Problem[] }) {
  const groups: Record<"EASY" | "MEDIUM" | "HARD", Problem[]> = {
    EASY: [],
    MEDIUM: [],
    HARD: [],
  };
  for (const p of problems) {
    const d = normalizeDifficulty(p.difficulty);
    if (d === "EASY" || d === "MEDIUM" || d === "HARD") groups[d].push(p);
  }
  const easy = Math.round(calculateAverageMinutes(groups.EASY));
  const med = Math.round(calculateAverageMinutes(groups.MEDIUM));
  const hard = Math.round(calculateAverageMinutes(groups.HARD));

  const pills = [
    { label: "EASY", value: easy, color: "bg-[var(--color-difficulty-easy)]" },
    {
      label: "MEDIUM",
      value: med,
      color: "bg-[var(--color-difficulty-medium)]",
    },
    { label: "HARD", value: hard, color: "bg-[var(--color-difficulty-hard)]" },
  ];

  return (
    <div className="w-full rounded-lg border border-border bg-card text-card-foreground p-4 md:col-span-2 lg:col-span-4">
      <div className="text-sm font-medium mb-2">Avg. time by difficulty</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {pills.map((p) => (
          <div
            key={p.label}
            className="rounded border border-border p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-block h-2 w-2 rounded ${p.color}`} />
              <span>{p.label}</span>
            </div>
            <div className="text-xl font-semibold">
              {isNaN(p.value) ? "-" : `${p.value}m`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
