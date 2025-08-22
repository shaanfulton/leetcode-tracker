"use client";
import type { Problem } from "@/context/ProblemsContext";
import { calculateAverageMinutes, filterByDays } from "@/lib/stats";
import { TotalWithBreakdown } from "./TotalWithBreakdown";
import { AverageByDifficulty } from "./AverageByDifficulty";
import { ProblemList } from "@/components/ProblemList";
import { CumulativeOverTime } from "./CumulativeOverTime";

export function OverviewStats({ problems }: { problems: Problem[] }) {
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const monthlyProblems = problems.filter(
    (p) => new Date(p.createdAt).getTime() >= monthStart.getTime()
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CumulativeOverTime problems={problems} />
      <TotalWithBreakdown label="This month" problems={monthlyProblems} />
      <TotalWithBreakdown
        label="This week"
        problems={filterByDays(problems, 7)}
      />
      <TotalWithBreakdown label="Today" problems={filterByDays(problems, 1)} />
      <AverageByDifficulty problems={problems} />
      <ProblemList />
    </div>
  );
}
