"use client";
import { useProblems } from "@/context/ProblemsContext";
import { useState } from "react";
import confetti from "canvas-confetti";

export function AddProblemForm() {
  const { addProblem, isLoading } = useProblems();
  const [url, setUrl] = useState("");
  const [minutes, setMinutes] = useState<number>(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlTouched, setUrlTouched] = useState(false);

  const normalizeLeetCodeUrl = (value: string): string | null => {
    if (!value) return null;
    const trimmed = value.trim().replace(/^@+/, "");
    try {
      const parsed = new URL(trimmed);
      const host = parsed.hostname.replace(/^www\./, "");
      if (host !== "leetcode.com") return null;
      const match = parsed.pathname.match(/^\/problems\/([^\/]+)/);
      if (!match) return null;
      const slug = match[1];
      return `https://leetcode.com/problems/${slug}/`;
    } catch {
      return null;
    }
  };

  const validateUrl = (value: string): string | null => {
    if (!value) return null; // Defer empty-state message to required/UX hints
    const normalized = normalizeLeetCodeUrl(value);
    if (!normalized) {
      try {
        const parsed = new URL(value);
        const host = parsed.hostname.replace(/^www\./, "");
        if (host !== "leetcode.com") {
          return "Only leetcode.com problem URLs are supported.";
        }
        if (!/^\/problems\/[^/]+/.test(parsed.pathname)) {
          return "Paste a URL to a specific problem, e.g., /problems/two-sum";
        }
        return null;
      } catch {
        return "Enter a valid URL.";
      }
    }
    return null;
  };

  const urlError = urlTouched || !!url ? validateUrl(url) : null;

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    // Block submit on invalid URL
    const validationError =
      validateUrl(url) || (!url ? "Please enter a URL." : null);
    if (validationError) {
      setUrlTouched(true);
      return;
    }
    setError(null);
    try {
      setSubmitting(true);
      const canonical = normalizeLeetCodeUrl(url) || url;
      await addProblem({ url: canonical, minutesToSolve: minutes });
      // Celebration effect on successful submit
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            spread: 120,
            scalar: 0.9,
            ticks: 200,
            origin: { y: 0.6 },
          });
        }, 150);
      } catch {}
      setUrl("");
      setMinutes(30);
      setUrlTouched(false);
    } catch (err) {
      setError("Failed to add problem");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="sticky top-10 w-full rounded-lg border border-border bg-card text-card-foreground p-4 flex flex-col gap-3"
    >
      <div className="text-sm font-medium">Add completed problem</div>
      <label
        htmlFor="problemUrl"
        className="text-xs font-medium text-muted-foreground"
      >
        LeetCode problem URL
      </label>
      <input
        id="problemUrl"
        type="url"
        inputMode="url"
        required
        placeholder="https://leetcode.com/problems/two-sum/"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          if (error) setError(null);
        }}
        onBlur={(e) => {
          setUrlTouched(true);
          const normalized = normalizeLeetCodeUrl(e.currentTarget.value);
          if (normalized) setUrl(normalized);
        }}
        aria-invalid={!!urlError}
        aria-describedby="problemUrlHelp"
        className="w-full rounded border border-border bg-transparent px-3 py-2 text-sm outline-none"
        style={urlError ? { borderColor: "var(--color-danger)" } : undefined}
        spellCheck={false}
        autoComplete="off"
      />
      <div id="problemUrlHelp" className="text-xs">
        {urlError ? (
          <span style={{ color: "var(--color-danger)" }}>{urlError}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="minutes"
              className="text-xs font-medium text-muted-foreground"
            >
              Time to solve
            </label>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <input
                id="minutesInput"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={minutes}
                aria-label="Minutes to solve"
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw.trim() === "") return;
                  const next = Number(raw);
                  if (Number.isNaN(next)) return;
                  const clamped = Math.max(1, Math.min(180, next));
                  setMinutes(clamped);
                }}
                onBlur={(e) => {
                  const raw = e.target.value;
                  const next = Number(raw);
                  if (Number.isNaN(next)) return;
                  const clamped = Math.max(1, Math.min(180, next));
                  if (clamped !== minutes) setMinutes(clamped);
                }}
                className="w-14 bg-transparent text-right outline-none border-0 p-0 focus:outline-none"
              />
              <span>min</span>
            </div>
          </div>
          <input
            id="minutes"
            type="range"
            min={1}
            max={180}
            step={1}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            title="Minutes to solve"
            className="w-full appearance-none h-2 rounded-full bg-muted accent-foreground outline-none"
          />
        </div>
      </div>
      {error ? (
        <div className="text-xs" style={{ color: "var(--color-danger)" }}>
          {error}
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || isLoading || !url || !!validateUrl(url)}
          className="rounded bg-foreground text-background px-3 py-2 text-sm disabled:opacity-50"
        >
          Add problem
        </button>
      </div>
    </form>
  );
}
