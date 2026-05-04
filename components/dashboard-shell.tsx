"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ReferenceLine,
  Cell,
} from "recharts";
import type { MonthlyTarget, ProjectItem, TeamPerformance } from "@/lib/types";
import { clampPercent, progressTone, rowTone } from "@/lib/utils";

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

function formatRand(value: number) {
  const abs = Math.abs(value);

  if (abs >= 1_000_000) {
    return `${value < 0 ? "-" : "+"}R${(abs / 1_000_000).toFixed(2)}m`;
  }

  return `${value < 0 ? "-" : "+"}R${abs.toLocaleString("en-ZA")}`;
}

export default function DashboardShell({
  trend,
  teamPerformance,
  projects,
  graphType = "bar",
}: {
  trend: MonthlyTarget[];
  teamPerformance: TeamPerformance[];
  projects: ProjectItem[];
  graphType?: "bar" | "line";
}) {
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const avgProgress = Math.round(
    projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(projects.length, 1)
  );

  const currentPeriod = trend[trend.length - 1];
  const targetAchievement = currentPeriod?.target
    ? Math.round((currentPeriod.actual / currentPeriod.target) * 100)
    : 0;

  const sortedProjects = [...projects]
    .filter((p) => p.status === "Active")
    .sort((a, b) => a.progress - b.progress);

  const otherTeams = teamPerformance.filter((t) => !t.isCompanyTotal);
  const companyTeam = teamPerformance.find((t) => t.isCompanyTotal);
  const sortedTeams = [...otherTeams].sort((a, b) => a.achievementPct - b.achievementPct);
  const teamRows = companyTeam ? [...sortedTeams, companyTeam] : sortedTeams;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Delivery dashboard system
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            Project target dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">Read-only front-end dashboard.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Active projects" value={String(activeProjects)} />
          <MetricCard label="Average progress" value={`${avgProgress}%`} />
          <MetricCard label="Target achievement" value={`${targetAchievement}%`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Actual vs target</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Includes minimum and stretch target guides.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                  Target
                </div>
                <div className="flex items-center gap-2">
                  <span className="block h-0.5 w-6 bg-amber-500" />
                  Minimum
                </div>
                <div className="flex items-center gap-2">
                  <span className="block h-0.5 w-6 bg-slate-500" />
                  Stretch
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Actual
                </div>
              </div>

              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {graphType === "bar" ? (
                    <BarChart data={trend} barCategoryGap={18}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <ReferenceLine y={0} stroke="#e2e8f0" />
                      <Line
                        type="monotone"
                        dataKey="minimumTarget"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="stretchTarget"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Bar dataKey="target" radius={[10, 10, 0, 0]}>
                        {trend.map((_, i) => (
                          <Cell key={`t-${i}`} fill="#cbd5e1" />
                        ))}
                      </Bar>
                      <Bar dataKey="actual" radius={[10, 10, 0, 0]}>
                        {trend.map((entry, i) => (
                          <Cell
                            key={`a-${i}`}
                            fill={entry.actual >= entry.target ? "#10b981" : "#2563eb"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    <LineChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="minimumTarget"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="6 6"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#94a3b8"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="stretchTarget"
                        stroke="#64748b"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Team performance vs running target
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Compact ranking from lowest to highest delivery.
              </p>
            </div>

            <div className="space-y-2 px-6 pb-6">
              <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <div className="w-[130px] shrink-0">Team</div>
                <div className="flex-1">Progress</div>
                <div className="w-[52px] text-right">%</div>
                <div className="w-[90px] text-right">Gap</div>
              </div>

              {teamRows.map((team) => {
                const gap = (team.actualValue ?? 0) - (team.targetValue ?? 0);

                return (
                  <div
                    key={team.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                      team.isCompanyTotal
                        ? "border-blue-200 bg-blue-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="w-[130px] shrink-0 truncate text-xs font-semibold text-slate-900">
                      {team.name}
                    </div>

                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full ${progressTone(team.achievementPct)}`}
                          style={{ width: `${clampPercent(team.achievementPct)}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-[52px] text-right text-xs font-medium text-slate-700">
                      {team.achievementPct}%
                    </div>

                    <div
                      className={`w-[90px] text-right text-xs font-semibold ${
                        gap >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {formatRand(gap)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 pb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Current active projects
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sorted by lowest progress first for quick intervention.
            </p>
          </div>

          <div className="space-y-2 px-6 pb-6">
            <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <div className="w-[240px] shrink-0">Project</div>
              <div className="w-[140px] shrink-0">IPM</div>
              <div className="flex-1">Progress</div>
              <div className="w-[56px] text-right">%</div>
            </div>

            {sortedProjects.map((project) => (
              <div
                key={project.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${rowTone(
                  project.progress
                )}`}
              >
                <div className="w-[240px] shrink-0 truncate text-sm font-medium text-slate-900">
                  {project.name}
                </div>
                <div className="w-[140px] shrink-0 truncate text-sm text-slate-600">
                  {project.ipm || "-"}
                </div>
                <div className="flex-1">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/80">
                    <div
                      className={`h-full ${progressTone(project.progress)}`}
                      style={{ width: `${clampPercent(project.progress)}%` }}
                    />
                  </div>
                </div>
                <div className="w-[56px] text-right text-sm font-semibold text-slate-700">
                  {project.progress}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}