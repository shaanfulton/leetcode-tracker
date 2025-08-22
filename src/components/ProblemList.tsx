"use client";
import { useProblems } from "@/context/ProblemsContext";
import { ProblemListItem } from "./ProblemListItem";

export function ProblemList() {
  const { problems, isLoading } = useProblems();
  const list = Array.isArray(problems) ? problems : [];
  return (
    <div className="w-full rounded-lg border border-border bg-card text-card-foreground p-4">
      <div className="text-sm font-medium mb-3">Completed problems</div>
      {isLoading ? (
        <div
          className="text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Loading…
        </div>
      ) : list.length === 0 ? (
        <div
          className="text-sm"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          No problems yet.
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((p) => (
            <ProblemListItem key={p.id} problem={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
