"use client";
import type { CapabilityBreakdown, Difficulty } from "@/lib/stats";
import { ProblemListItem } from "@/components/ProblemListItem";
import type { Problem } from "@/context/ProblemsContext";

export function PracticeContributionsTable({
  details,
}: {
  details: CapabilityBreakdown["details"];
}) {
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
