"use client";
import type { Problem } from "@/context/ProblemsContext";
import { computeCapabilities, uniqueTags } from "@/lib/stats";
import { useMemo, useState } from "react";

const DEFAULT_TAGS = [
  "Array",
  "Hash Table",
  "Math",
  "String",
  "Two Pointers",
  "Binary Search",
  "Dynamic Programming",
  "Greedy",
  "Stack",
  "Queue",
  "Heap",
  "Graph",
  "Tree",
  "Trie",
  "Backtracking",
  "Divide and Conquer",
  "Bit Manipulation",
  "Sliding Window",
  "Union Find",
  "Design",
  "Database",
];

export function PracticeTab({ problems }: { problems: Problem[] }) {
  const tags = useMemo(() => uniqueTags(problems, DEFAULT_TAGS), [problems]);
  const breakdowns = useMemo(
    () => computeCapabilities(problems, tags),
    [problems, tags]
  );
  const [openTag, setOpenTag] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {breakdowns.map((b) => (
        <div
          key={b.tag}
          className="rounded-lg border border-border bg-card text-card-foreground p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">{b.tag}</div>
            <div
              className="flex-1 mx-3 h-2 rounded overflow-hidden"
              style={{ background: "var(--color-muted)" }}
            >
              <div
                className="h-full"
                style={{
                  background: "var(--color-difficulty-easy)",
                  width: `${Math.round(b.score * 100)}%`,
                }}
              />
            </div>
            <button
              className="text-xs underline"
              onClick={() => setOpenTag(openTag === b.tag ? null : b.tag)}
            >
              {openTag === b.tag ? "Hide" : "Details"}
            </button>
          </div>
          <div
            className="mt-2 text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Score: {Math.round(b.score * 100)}% • Total: {b.total} • Easy:{" "}
            {b.easy} • Medium: {b.medium} • Hard: {b.hard}
          </div>
          {openTag === b.tag ? (
            <div className="mt-3">
              <div
                className="text-xs mb-2"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Contributions
              </div>
              <div className="max-h-40 overflow-auto">
                <table className="w-full text-xs">
                  <thead style={{ color: "var(--color-muted-foreground)" }}>
                    <tr>
                      <th className="text-left">Difficulty</th>
                      <th className="text-left">Minutes</th>
                      <th className="text-left">Time factor</th>
                      <th className="text-left">Weight</th>
                      <th className="text-left">Contribution</th>
                      <th className="text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.details.map((d) => (
                      <tr
                        key={`${b.tag}-${d.id}`}
                        className="border-t"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <td>{d.difficulty}</td>
                        <td>{d.minutesToSolve}</td>
                        <td>{d.timeFactor.toFixed(2)}</td>
                        <td>{d.weight.toFixed(2)}</td>
                        <td>{d.contribution.toFixed(2)}</td>
                        <td>{d.createdAt.toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
