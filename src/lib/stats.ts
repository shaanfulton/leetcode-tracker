import type { Problem } from "@/context/ProblemsContext";

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "UNKNOWN";

export function normalizeDifficulty(input?: string | null): Difficulty {
  const d = (input || "").toUpperCase();
  if (d === "EASY" || d === "MEDIUM" || d === "HARD") return d;
  return "UNKNOWN";
}

export function calculateAverageMinutes(problems: Problem[]): number {
  if (!problems.length) return 0;
  const sum = problems.reduce((acc, p) => acc + (p.minutesToSolve || 0), 0);
  return sum / problems.length;
}

export function filterByDays(problems: Problem[], days: number): Problem[] {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return problems.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
}

export function countByDifficulty(
  problems: Problem[]
): Record<Difficulty, number> {
  const counts: Record<Difficulty, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    UNKNOWN: 0,
  };
  for (const p of problems) counts[normalizeDifficulty(p.difficulty)]++;
  return counts;
}

export function uniqueTags(allProblems: Problem[], known: string[]): string[] {
  const set = new Set<string>(known.map((t) => t));
  for (const p of allProblems)
    Array.isArray(p.tags) && p.tags.forEach((t) => set.add(t));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export type CapabilityBreakdown = {
  tag: string;
  score: number; // 0..1
  total: number;
  easy: number;
  medium: number;
  hard: number;
  lastPracticedAt: Date | null;
  details: Array<{
    id: number;
    title: string | null;
    url: string;
    difficulty: Difficulty;
    minutesToSolve: number;
    createdAt: Date;
    timeFactor: number;
    weight: number;
    contribution: number;
  }>;
};

// Heuristic scoring per instructions
export function computeCapabilityForTag(
  problems: Problem[],
  tag: string
): CapabilityBreakdown {
  const tagged = problems.filter(
    (p) => Array.isArray(p.tags) && p.tags.includes(tag)
  );
  const total = tagged.length;
  let easy = 0,
    medium = 0,
    hard = 0;
  let lastPracticedAt: Date | null = null;

  // Optimal times (min)
  const optimal: Record<Exclude<Difficulty, "UNKNOWN">, number> = {
    EASY: 10,
    MEDIUM: 20,
    HARD: 30,
  };
  const weights: Record<Difficulty, number> = {
    EASY: 0.5,
    MEDIUM: 1,
    HARD: 2,
    UNKNOWN: 0.5,
  };

  const details: CapabilityBreakdown["details"] = [];
  let weightedSum = 0;

  for (const p of tagged) {
    const d = normalizeDifficulty(p.difficulty);
    if (d === "EASY") easy++;
    else if (d === "MEDIUM") medium++;
    else if (d === "HARD") hard++;
    const created = new Date(p.createdAt);
    if (!lastPracticedAt || created > lastPracticedAt)
      lastPracticedAt = created;

    const opt = d === "UNKNOWN" ? 20 : optimal[d];
    const t = Math.max(0, p.minutesToSolve || 0);
    // Over-time attempts still contribute: decay by ratio with a small floor
    // If t <= opt → near 1, if t >> opt → approaches floor (e.g., 0.1)
    const ratio = t > 0 ? opt / t : 1;
    const timeFloor = 0.1;
    const timeFactor = Math.max(timeFloor, Math.min(1, ratio));
    const weight = weights[d];
    const contribution = weight * timeFactor;
    weightedSum += contribution;
    details.push({
      id: p.id,
      title: p.title ?? null,
      url: p.url,
      difficulty: d,
      minutesToSolve: t,
      createdAt: created,
      timeFactor,
      weight,
      contribution,
    });
  }

  // Base target: 4 medium-equivalents for full score, with at least 8 total attempts for full credit
  const baseScore = Math.min(1, weightedSum / 4);
  const volumeFactor = Math.min(1, total / 8);

  // Recency via forgetting curve (exponential decay):
  // retention ~ exp(-lambda * daysSince), where half-life grows with history
  const now = Date.now();
  let recencyFactor = 1;
  if (lastPracticedAt) {
    const daysSince = (now - lastPracticedAt.getTime()) / (24 * 60 * 60 * 1000);
    const baseHalfLifeDays = 7; // base half-life in days
    const halfLife = baseHalfLifeDays * (1 + Math.log1p(total)); // more attempts → slower forgetting
    const lambda = Math.log(2) / Math.max(1, halfLife);
    const raw = Math.exp(-lambda * Math.max(0, daysSince));
    const recencyFloor = 0.1; // never fully zero out historical work
    recencyFactor = Math.max(recencyFloor, Math.min(1, raw));
  } else {
    recencyFactor = 0; // never practiced
  }

  const score = Math.max(
    0,
    Math.min(1, baseScore * volumeFactor * recencyFactor)
  );

  return { tag, score, total, easy, medium, hard, lastPracticedAt, details };
}

export function computeCapabilities(
  allProblems: Problem[],
  tags: string[]
): CapabilityBreakdown[] {
  return tags.map((t) => computeCapabilityForTag(allProblems, t));
}
