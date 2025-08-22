"use client";
export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="w-full rounded-lg border border-border bg-card text-card-foreground p-4">
      <div
        className="text-sm"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        {label}
      </div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
      {sub ? (
        <div
          className="text-xs mt-2"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
}
