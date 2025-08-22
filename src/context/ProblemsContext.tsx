"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Problem = {
  id: number;
  url: string;
  title?: string | null;
  difficulty?: string | null;
  tags?: string[];
  minutesToSolve: number;
  createdAt: string;
};

type ProblemsContextValue = {
  problems: Problem[];
  isLoading: boolean;
  addProblem: (input: {
    url: string;
    minutesToSolve: number;
    title?: string;
  }) => Promise<void>;
  averageMinutes: number;
  count: number;
  refresh: () => Promise<void>;
};

const ProblemsContext = createContext<ProblemsContextValue | undefined>(
  undefined
);

export function ProblemsProvider({ children }: { children: React.ReactNode }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [averageMinutes, setAverageMinutes] = useState<number>(0);
  const [count, setCount] = useState<number>(0);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch("/api/problems"),
        fetch("/api/stats"),
      ]);

      let problemsData: unknown = [];
      if (pRes.ok) {
        try {
          problemsData = await pRes.json();
        } catch {}
      }
      setProblems(
        Array.isArray(problemsData) ? (problemsData as Problem[]) : []
      );

      let avg = 0;
      let cnt = 0;
      if (sRes.ok) {
        try {
          const sJson = await sRes.json();
          avg = Number(sJson?.averageMinutes) || 0;
          cnt = Number(sJson?.count) || 0;
        } catch {}
      }
      setAverageMinutes(avg);
      setCount(cnt);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addProblem = useCallback(
    async (input: { url: string; minutesToSolve: number; title?: string }) => {
      const res = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to add problem");
      await fetchAll();
    },
    [fetchAll]
  );

  const value = useMemo<ProblemsContextValue>(
    () => ({
      problems,
      isLoading,
      addProblem,
      averageMinutes,
      count,
      refresh: fetchAll,
    }),
    [problems, isLoading, addProblem, averageMinutes, count, fetchAll]
  );

  return (
    <ProblemsContext.Provider value={value}>
      {children}
    </ProblemsContext.Provider>
  );
}

export function useProblems() {
  const ctx = useContext(ProblemsContext);
  if (!ctx) throw new Error("useProblems must be used within ProblemsProvider");
  return ctx;
}
