"use client";
import type { Problem } from "@/context/ProblemsContext";
import { useCallback, useMemo, useState } from "react";

type Point = { x: number; y: number };

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CumulativeOverTime({ problems }: { problems: Problem[] }) {
  const { points, labels, increases } = useMemo(() => {
    if (!problems.length)
      return {
        points: [] as Point[],
        labels: [] as string[],
        increases: [] as number[],
      };

    const sorted = [...problems].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Group by day and compute cumulative counts
    const dayToCount = new Map<string, number>();
    for (const p of sorted) {
      const d = new Date(p.createdAt);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString();
      dayToCount.set(key, (dayToCount.get(key) || 0) + 1);
    }

    const days = Array.from(dayToCount.keys())
      .map((k) => new Date(k))
      .sort((a, b) => a.getTime() - b.getTime());

    let cumulative = 0;
    const pts: Point[] = [];
    const lbls: string[] = [];
    const incs: number[] = [];
    days.forEach((day, idx) => {
      const inc = dayToCount.get(day.toISOString()) || 0;
      cumulative += inc;
      pts.push({ x: idx, y: cumulative });
      lbls.push(formatDateLabel(day));
      incs.push(inc);
    });

    return { points: pts, labels: lbls, increases: incs };
  }, [problems]);

  const width = 600;
  const height = 180;
  const padding = 16;

  const maxY = points.length ? points[points.length - 1].y : 0;
  const maxX = points.length ? points[points.length - 1].x : 1;

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      if (!points.length) return;
      const rect = (
        e.currentTarget.parentNode as SVGSVGElement
      ).getBoundingClientRect();
      const xClient = e.clientX - rect.left;
      const xView = (xClient / rect.width) * width;
      const clamped = Math.max(padding, Math.min(width - padding, xView));
      const ratio = (clamped - padding) / Math.max(1, width - padding * 2);
      const idx = Math.round(ratio * maxX);
      setHoverIdx(Math.max(0, Math.min(points.length - 1, idx)));
    },
    [points, maxX]
  );

  const handleMouseLeave = useCallback(() => setHoverIdx(null), []);

  const { path, areaPath, gridLines, xLabels } = useMemo(() => {
    if (!points.length)
      return {
        path: "",
        areaPath: "",
        gridLines: [] as string[],
        xLabels: [] as Array<{ x: number; text: string }>,
      };
    const sx = (x: number) =>
      padding + (x / Math.max(1, maxX)) * (width - padding * 2);
    const sy = (y: number) =>
      height - padding - (y / Math.max(1, maxY)) * (height - padding * 2);
    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.x)},${sy(p.y)}`)
      .join(" ");
    const x0 = sx(points[0].x);
    const y0 = sy(points[0].y);
    const xN = sx(points[points.length - 1].x);
    const yBase = sy(0);
    const a = `${d} L${xN},${yBase} L${x0},${yBase} Z`;

    const grid: string[] = [];
    const ticks = 4;
    for (let i = 1; i <= ticks; i++) {
      const gy = padding + ((height - padding * 2) * i) / (ticks + 1);
      grid.push(`M${padding},${gy} L${width - padding},${gy}`);
    }
    const xTickCount = Math.min(4, Math.max(1, points.length - 1));
    const lbls: Array<{ x: number; text: string }> = [];
    for (let i = 0; i <= xTickCount; i++) {
      const idx = Math.round((points.length - 1) * (i / xTickCount));
      const gx = sx(points[idx].x);
      grid.push(`M${gx},${padding} L${gx},${height - padding}`);
      lbls.push({ x: gx, text: labels[idx] });
    }

    return { path: d, areaPath: a, gridLines: grid, xLabels: lbls };
  }, [points, maxX, maxY, labels]);

  return (
    <div className="w-full rounded-lg border border-border bg-card text-card-foreground p-4 md:col-span-2 lg:col-span-3 lg:row-span-2">
      <div
        className="text-sm"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        Cumulative over time
      </div>
      <div className="text-3xl font-semibold mt-1">{maxY}</div>
      <div className="mt-3">
        {points.length ? (
          <svg
            width="100%"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Cumulative problems over time"
          >
            <defs>
              <linearGradient id="cumulative-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g stroke="var(--color-border)" strokeWidth="1" opacity="0.3">
              {gridLines.map((d, i) => (
                <path key={i} d={d} fill="none" />
              ))}
            </g>
            <path d={areaPath} fill="url(#cumulative-area)" stroke="none" />
            <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
            {hoverIdx !== null && points[hoverIdx] ? (
              <g>
                {(() => {
                  const xPos =
                    padding +
                    (points[hoverIdx].x / Math.max(1, maxX)) *
                      (width - padding * 2);
                  const inc = increases[hoverIdx] ?? 0;
                  const total = points[hoverIdx].y;
                  return (
                    <g>
                      <line
                        x1={xPos}
                        x2={xPos}
                        y1={padding}
                        y2={height - padding}
                        stroke="currentColor"
                        strokeOpacity="0.5"
                        strokeWidth="1"
                      />
                      <text
                        x={xPos}
                        y={Math.max(10, padding - 4)}
                        textAnchor="middle"
                        fontSize="10"
                        fill="currentColor"
                      >
                        {`+${inc} • ${total}`}
                      </text>
                    </g>
                  );
                })()}
              </g>
            ) : null}
            {xLabels.map((t, i) => (
              <text
                key={i}
                x={t.x}
                y={height - 2}
                textAnchor="middle"
                fontSize="10"
                fill="var(--color-muted-foreground)"
              >
                {t.text}
              </text>
            ))}
            <rect
              x={0}
              y={0}
              width={width}
              height={height}
              fill="transparent"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />
          </svg>
        ) : (
          <div
            className="text-xs"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            No data yet
          </div>
        )}
      </div>
    </div>
  );
}
