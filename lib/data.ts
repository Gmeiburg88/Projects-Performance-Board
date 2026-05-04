import { prisma } from "@/lib/prisma";
import type { MonthlyTarget, TeamPerformance, ProjectItem } from "@/lib/types";
export async function getDashboardData(): Promise<{ trend: MonthlyTarget[]; teams: TeamPerformance[]; projects: ProjectItem[] }> {
  const [trend, teams, projects] = await Promise.all([
    prisma.monthlyTarget.findMany({ orderBy: { monthOrder: "asc" } }),
  prisma.team.findMany({
  orderBy: [
    { isCompanyTotal: "asc" },
    { sortOrder: "asc" },
    { name: "asc" },
  ],
}),
    prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { progress: "asc" }] }),
  ]);
  return { trend, teams, projects };
}
