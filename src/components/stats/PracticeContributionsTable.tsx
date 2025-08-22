"use client";
import type { CapabilityBreakdown, Difficulty } from "@/lib/stats";
import { ProblemListItem } from "@/components/ProblemListItem";
import type { Problem } from "@/context/ProblemsContext";

function formatDifficulty(difficulty: Difficulty): string {
  if (difficulty === "EASY") return "Easy";
  if (difficulty === "MEDIUM") return "Medium";
  if (difficulty === "HARD") return "Hard";
  return difficulty;
}

export function PracticeContributionsTable({
  details,
}: {
  details: CapabilityBreakdown["details"];
}) {
  function formatAge(d: Date): string {
    const now = Date.now();
    const diffMs = now - d.getTime();
    const min = 60 * 1000;
    const hour = 60 * min;
    const day = 24 * hour;
    if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / min))}m ago`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
    if (diffMs < 30 * day) return `${Math.floor(diffMs / day)}d ago`;
    return d.toLocaleDateString();
  }
  return (
    <div className="max-h-40 overflow-auto">
      <ul className="flex flex-col">
        {details.map((d, idx) => {
          const p: Problem = {
            id: d.id,
            url: d.url,
            title: d.title,
            difficulty: d.difficulty,
            tags: [],
            minutesToSolve: d.minutesToSolve,
            createdAt: new Date(d.createdAt).toISOString(),
          };
          return (
            <ProblemListItem
              key={d.id}
              problem={p}
              className={idx % 2 === 1 ? "bg-[var(--color-muted)]" : ""}
              showTags={false}
              showDelete={false}
            />
          );
        })}
      </ul>
    </div>
  );
}
