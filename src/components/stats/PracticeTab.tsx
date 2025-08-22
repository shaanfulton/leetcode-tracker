"use client";
import type { Problem } from "@/context/ProblemsContext";
import { computeCapabilities, uniqueTags } from "@/lib/stats";
import { PracticeTagCard } from "./PracticeTagCard";
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
  const [sortOrder, setSortOrder] = useState<"default" | "desc" | "asc">(
    "default"
  );

  const sortedBreakdowns = useMemo(() => {
    if (sortOrder === "default") return breakdowns;
    const copy = [...breakdowns];
    copy.sort((a, b) =>
      sortOrder === "desc" ? b.score - a.score : a.score - b.score
    );
    return copy;
  }, [breakdowns, sortOrder]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label
          className="text-xs font-medium text-muted-foreground"
          htmlFor="practice-sort"
        >
          Order:
        </label>
        <div className="relative inline-flex items-center">
          <select
            id="practice-sort"
            className="text-xs appearance-none rounded-md border border-border bg-card text-card-foreground px-2 py-1 pr-6 outline-none"
            style={{
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
              backgroundColor: "var(--color-card)",
              color: "var(--color-card-foreground)",
              borderColor: "var(--color-border)",
            }}
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as "default" | "desc" | "asc")
            }
          >
            <option value="default">Default</option>
            <option value="desc">Highest %</option>
            <option value="asc">Lowest %</option>
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute right-2 h-3 w-3"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <path
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
      {sortedBreakdowns.map((b) => (
        <PracticeTagCard
          key={b.tag}
          breakdown={b}
          open={openTag === b.tag}
          onToggle={(tag) => setOpenTag(openTag === tag ? null : tag)}
        />
      ))}
    </div>
  );
}
