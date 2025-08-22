"use client";
import type { Problem } from "@/context/ProblemsContext";
import { countByDifficulty } from "@/lib/stats";

export function TotalWithBreakdown({
  label,
  problems,
}: {
  label: string;
  problems: Problem[];
}) {
  const total = problems.length;
  const counts = countByDifficulty(problems);
  const order: Array<"EASY" | "MEDIUM" | "HARD"> = ["EASY", "MEDIUM", "HARD"];
  const colors: Record<string, string> = {
    EASY: "bg-[var(--color-difficulty-easy)]",
    MEDIUM: "bg-[var(--color-difficulty-medium)]",
    HARD: "bg-[var(--color-difficulty-hard)]",
  };

  return (
    <div className="w-full rounded-lg border border-border bg-card text-card-foreground p-4">
      <div
        className="text-sm"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </div>
      <div className="text-3xl font-semibold mt-1">{total}</div>
      <div
        className="mt-3 flex flex-col gap-3 text-xs"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {order.map((d) => (
          <div key={d} className="flex items-center gap-1">
            <span className={`inline-block h-2 w-2 rounded ${colors[d]}`} />
            <span>
              {d === "EASY" ? "Easy" : d === "MEDIUM" ? "Medium" : "Hard"}
            </span>
            <span style={{ color: "#9ca3af" }}>({counts[d]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
