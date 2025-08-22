"use client";

import { ProblemsProvider, useProblems } from "@/context/ProblemsContext";
import { AddProblemForm } from "@/components/AddProblemForm";
import { OverviewStats } from "@/components/stats/OverviewStats";
import { PracticeTab } from "@/components/stats/PracticeTab";
import { useState } from "react";

function TabsContent() {
  const { problems } = useProblems();
  const [tab, setTab] = useState<"overview" | "practice">("overview");
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-black/[.08] dark:border-white/[.145]">
        <button
          className={`px-3 py-2 text-sm ${
            tab === "overview"
              ? "border-b-2 border-foreground font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={`px-3 py-2 text-sm ${
            tab === "practice"
              ? "border-b-2 border-foreground font-medium"
              : "text-gray-500"
          }`}
          onClick={() => setTab("practice")}
        >
          Practice
        </button>
      </div>
      {tab === "overview" ? (
        <OverviewStats problems={problems} />
      ) : (
        <PracticeTab problems={problems} />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <ProblemsProvider>
      <div className="min-h-screen p-6 sm:p-10">
        <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TabsContent />
          </div>
          <div className="lg:col-span-1">
            <AddProblemForm />
          </div>
        </div>
      </div>
    </ProblemsProvider>
  );
}
