export type ProjectStatus = "Active" | "On Hold" | "Complete";
export type MonthlyTarget = { id: string; monthOrder: number; monthLabel: string; minimumTarget: number; target: number; stretchTarget: number; actual: number; };
export type TeamPerformance = {
  id: string;
  name: string;
  targetValue: number;
  actualValue: number;
  achievementPct: number;
  variancePct: number;
  sortOrder: number | null;
  isCompanyTotal: boolean;
};
export type ProjectItem = { id: string; name: string; ipm: string; progress: number; status: ProjectStatus; sortOrder: number | null; };
