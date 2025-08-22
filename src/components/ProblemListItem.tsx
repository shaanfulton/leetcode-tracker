"use client";
import type { Problem } from "@/context/ProblemsContext";
import { useProblems } from "@/context/ProblemsContext";

export function ProblemListItem({
  problem,
  className = "",
  showTags = true,
  showDelete = true,
}: {
  problem: Problem;
  className?: string;
  showTags?: boolean;
  showDelete?: boolean;
}) {
  const { refresh } = useProblems();
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

  async function handleDelete() {
    try {
      await fetch(`/api/problems?id=${problem.id}`, { method: "DELETE" });
    } finally {
      await refresh();
    }
  }

  function formatRelative(iso: string): string {
    const created = new Date(iso);
    const diffMs = Date.now() - created.getTime();
    const sec = Math.max(0, Math.floor(diffMs / 1000));
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return "just now";
    if (min < 60) return `${min} min ago`;
    if (hr < 24) return `${hr} h ago`;
    if (day < 30) return `${day} days ago`;
    const mon = Math.floor(day / 30);
    if (mon < 12) return `${mon} mo ago`;
    const yr = Math.floor(mon / 12);
    return `${yr} y ago`;
  }

  return (
    <li
      className={`rounded-sm py-3 px-4 flex items-start justify-between gap-3 text-sm cursor-pointer ${className}`}
      role="link"
      tabIndex={0}
      onClick={() => window.open(problem.url, "_blank")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.open(problem.url, "_blank");
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate block">{problem.title || problem.url}</div>
        <div
          className="mt-1 flex flex-wrap items-center gap-1 text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {difficulty ? (
            <span className={`rounded border px-1 py-0.5 ${diffClass}`}>
              {difficulty === "EASY"
                ? "Easy"
                : difficulty === "MEDIUM"
                ? "Medium"
                : difficulty === "HARD"
                ? "Hard"
                : difficulty}
            </span>
          ) : null}
          {showTags
            ? tags.slice(0, 4).map((t) => (
                <span
                  key={`${problem.id}-${t}`}
                  className="rounded px-1 py-0.5"
                  style={{ background: "var(--color-muted)" }}
                >
                  {t}
                </span>
              ))
            : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="text-xs whitespace-nowrap mt-0.5"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {formatRelative(problem.createdAt)}
        </div>
        <div
          className="text-xs whitespace-nowrap mt-0.5"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {problem.minutesToSolve} mins
        </div>
        {showDelete ? (
          <button
            className="text-xs underline"
            style={{ color: "var(--color-danger)" }}
            onClick={(e) => {
              e.stopPropagation();
              void handleDelete();
            }}
          >
            Delete
          </button>
        ) : null}
      </div>
    </li>
  );
}
