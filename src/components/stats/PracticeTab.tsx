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

  return (
    <div className="flex flex-col gap-3">
      {breakdowns.map((b) => (
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
