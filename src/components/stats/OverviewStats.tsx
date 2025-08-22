"use client";
import type { Problem } from "@/context/ProblemsContext";
import { calculateAverageMinutes, filterByDays } from "@/lib/stats";
import { StatCard } from "./StatCard";
import { TotalWithBreakdown } from "./TotalWithBreakdown";
import { AverageByDifficulty } from "./AverageByDifficulty";
import { ProblemList } from "@/components/ProblemList";

export function OverviewStats({ problems }: { problems: Problem[] }) {
  const avg = Math.round(calculateAverageMinutes(problems));
  const total = problems.length;
  const weekly = filterByDays(problems, 7).length;
  const daily = filterByDays(problems, 1).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <TotalWithBreakdown label="Total completed" problems={problems} />
      <TotalWithBreakdown
        label="This week"
        problems={filterByDays(problems, 7)}
      />
      <TotalWithBreakdown label="Today" problems={filterByDays(problems, 1)} />
      <AverageByDifficulty problems={problems} />
      <div className="md:col-span-2 lg:col-span-4">
        <ProblemList />
      </div>
    </div>
  );
}
