"use client";

import { useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard-shell";
import type { MonthlyTarget, ProjectItem, TeamPerformance } from "@/lib/types";

type DashboardData = {
  trend: MonthlyTarget[];
  teams: TeamPerformance[];
  projects: ProjectItem[];
};

export default function DashboardLive({ initialData }: { initialData: DashboardData }) {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetch("/api/dashboard-data", { cache: "no-store" });
      if (!res.ok) return;

      const freshData = await res.json();
      setData(freshData);
    };

    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardShell
      trend={data.trend}
      teamPerformance={data.teams}
      projects={data.projects}
      graphType="bar"
    />
  );
}