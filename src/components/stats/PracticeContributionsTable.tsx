"use client";
import type { CapabilityBreakdown, Difficulty } from "@/lib/stats";

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
  return (
    <div className="max-h-40 overflow-auto">
      <table className="w-full text-xs">
        <thead style={{ color: "var(--color-muted-foreground)" }}>
          <tr>
            <th className="text-left">Name</th>
            <th className="text-left">Difficulty</th>
            <th className="text-left">Contribution</th>
          </tr>
        </thead>
        <tbody>
          {details.map((d) => (
            <tr
              key={d.id}
              className="border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <td>
                <a
                  href={d.url}
                  target="_blank"
                  className="underline underline-offset-2"
                >
                  {d.title || d.url}
                </a>
              </td>
              <td>{formatDifficulty(d.difficulty)}</td>
              <td>{d.contribution.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
