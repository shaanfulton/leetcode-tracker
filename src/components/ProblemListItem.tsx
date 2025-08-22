"use client";
import type { Problem } from "@/context/ProblemsContext";

export function ProblemListItem({ problem }: { problem: Problem }) {
  const difficulty = (problem.difficulty || "").toUpperCase();
  const diffClass =
    difficulty === "EASY"
      ? "text-[var(--color-difficulty-easy)] border-[color:var(--color-difficulty-easy)]/40"
      : difficulty === "MEDIUM"
      ? "text-[var(--color-difficulty-medium)] border-[color:var(--color-difficulty-medium)]/40"
      : difficulty === "HARD"
      ? "text-[var(--color-difficulty-hard)] border-[color:var(--color-difficulty-hard)]/40"
      : "text-[var(--color-muted-foreground)] border-[color:var(--color-muted-foreground)]/30";
  const tags = Array.isArray(problem.tags) ? problem.tags : [];

  return (
    <li className="flex items-start justify-between gap-3 text-sm">
      <div className="min-w-0 flex-1">
        <a
          href={problem.url}
          target="_blank"
          className="underline underline-offset-2 truncate block"
        >
          {problem.title || problem.url}
        </a>
        <div
          className="mt-1 flex flex-wrap items-center gap-1 text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {difficulty ? (
            <span className={`rounded border px-1 py-0.5 ${diffClass}`}>
              {difficulty}
            </span>
          ) : null}
          {tags.slice(0, 4).map((t) => (
            <span
              key={`${problem.id}-${t}`}
              className="rounded px-1 py-0.5"
              style={{ background: "var(--color-muted)" }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div
        className="text-xs whitespace-nowrap mt-0.5"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {problem.minutesToSolve}m
      </div>
    </li>
  );
}
