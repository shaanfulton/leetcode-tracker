"use client";
import { useProblems } from "@/context/ProblemsContext";
import { useState } from "react";

export function AddProblemForm() {
  const { addProblem, isLoading } = useProblems();
  const [url, setUrl] = useState("");
  const [minutes, setMinutes] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    try {
      setSubmitting(true);
      await addProblem({ url, minutesToSolve: minutes });
      setUrl("");
      setMinutes(30);
    } catch (err) {
      setError("Failed to add problem");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-lg border border-border bg-card text-card-foreground p-4 flex flex-col gap-3"
    >
      <div className="text-sm font-medium">Add problem</div>
      <input
        type="url"
        required
        placeholder="https://leetcode.com/problems/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm outline-none"
      />
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={1}
          max={180}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="flex-1"
        />
        <div className="w-16 text-right text-sm">{minutes}m</div>
      </div>
      {error ? (
        <div className="text-xs" style={{ color: "var(--color-danger)" }}>
          {error}
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || isLoading || !url}
          className="rounded bg-foreground text-background px-3 py-2 text-sm disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  );
}
