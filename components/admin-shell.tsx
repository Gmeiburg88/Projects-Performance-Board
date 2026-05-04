"use client";

import { useState, useTransition } from "react";
import {
  saveMonthlyTargets,
  saveProjects,
  saveTeams,
  logoutAction,
  uploadProjectsFromExcel,
} from "@/server-actions/dashboard";
import type {
  MonthlyTarget,
  ProjectItem,
  TeamPerformance,
  ProjectStatus,
} from "@/lib/types";

const STATUS_OPTIONS: ProjectStatus[] = ["Active", "On Hold", "Complete"];

function formatRand(value: number) {
  if (!value) return "R0";
  return `R${Number(value).toLocaleString("en-ZA")}`;
}

function RandEditor({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);

  if (editing && !disabled) {
    return (
      <input
        autoFocus
        className="rounded-xl border px-3 py-2"
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter") setEditing(false);
          if (e.key === "Escape") setEditing(false);
        }}
      />
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setEditing(true)}
      className="rounded-xl border bg-slate-50 px-3 py-2 text-left font-medium text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      title={disabled ? "Company total is calculated automatically" : "Click to edit"}
    >
      {formatRand(value)}
    </button>
  );
}

function AdminCard({
  title,
  actionLabel,
  disabled,
  onAction,
  children,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  actionLabel: string;
  disabled?: boolean;
  onAction: () => void;
  children: React.ReactNode;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 p-6 pb-0">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <div className="flex gap-2">
          {secondaryLabel && onSecondary ? (
            <button
              className="rounded-xl border border-slate-300 px-4 py-2"
              onClick={onSecondary}
              type="button"
            >
              {secondaryLabel}
            </button>
          ) : null}

          <button
            disabled={disabled}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
            onClick={onAction}
            type="button"
          >
            {actionLabel}
          </button>
        </div>
      </div>

      <div className="space-y-3 p-6">{children}</div>
    </div>
  );
}

export default function AdminShell({
  initialTrend,
  initialTeams,
  initialProjects,
}: {
  initialTrend: MonthlyTarget[];
  initialTeams: TeamPerformance[];
  initialProjects: ProjectItem[];
}) {
  const [trend, setTrend] = useState(initialTrend);
  const [teams, setTeams] = useState(initialTeams);
  const [projects, setProjects] = useState(initialProjects);
  const [isPending, startTransition] = useTransition();

  const updateTrend = (
    id: string,
    field: keyof MonthlyTarget,
    value: string
  ) =>
    setTrend((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: Number(value) || 0 } : row
      )
    );

  const updateTeam = (
    id: string,
    field: keyof TeamPerformance,
    value: string | boolean
  ) =>
    setTeams((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        if (field === "name") return { ...row, name: String(value) };

        const updated = { ...row, [field]: Number(value) || 0 };

        const targetValue = Number(updated.targetValue) || 0;
        const actualValue = Number(updated.actualValue) || 0;

        return {
          ...updated,
          achievementPct: targetValue
            ? Math.round((actualValue / targetValue) * 100)
            : 0,
          variancePct: targetValue
            ? Math.round(((actualValue - targetValue) / targetValue) * 100)
            : 0,
        };
      })
    );

  const updateProject = (
    id: string,
    field: keyof ProjectItem,
    value: string
  ) =>
    setProjects((prev) =>
      prev.map((row) =>
        row.id === id
          ? field === "name" || field === "ipm" || field === "status"
            ? { ...row, [field]: value }
            : { ...row, [field]: Number(value) || 0 }
          : row
      )
    );

  const addTeam = () => {
    const nextSort = teams.length
      ? Math.max(...teams.map((t) => t.sortOrder ?? 0)) + 1
      : 1;

    setTeams((prev) => [
      ...prev,
      {
        id: `new-team-${Date.now()}`,
        name: "New Team",
        targetValue: 0,
        actualValue: 0,
        achievementPct: 0,
        variancePct: 0,
        sortOrder: nextSort,
        isCompanyTotal: false,
      },
    ]);
  };

  const deleteTeam = (id: string) =>
    setTeams((prev) => prev.filter((row) => row.id !== id));

  const addProject = () => {
    const nextSort = projects.length
      ? Math.max(...projects.map((p) => p.sortOrder ?? 0)) + 1
      : 1;

    setProjects((prev) => [
      ...prev,
      {
        id: `new-project-${Date.now()}`,
        name: "New Project",
        ipm: "",
        progress: 0,
        status: "Active",
        sortOrder: nextSort,
      },
    ]);
  };

  const deleteProject = (id: string) =>
    setProjects((prev) => prev.filter((row) => row.id !== id));

  const sortedAdminTeams = [
    ...teams.filter((t) => !t.isCompanyTotal),
    ...teams.filter((t) => t.isCompanyTotal),
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Admin maintenance
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update dashboard data here.
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-300 px-4 py-2"
            onClick={() => startTransition(() => logoutAction())}
          >
            Log out
          </button>
        </div>

        <AdminCard
          title="Monthly target maintenance"
          actionLabel="Save targets"
          disabled={isPending}
          onAction={() =>
            startTransition(() => saveMonthlyTargets(trend))
          }
        >
          <div className="grid grid-cols-5 gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div>Month</div>
            <div>Minimum</div>
            <div>Target</div>
            <div>Stretch</div>
            <div>Actual</div>
          </div>

          {trend.map((row) => (
            <div key={row.id} className="grid grid-cols-5 gap-3">
              <div className="flex items-center rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700">
                {row.monthLabel}
              </div>
              <input
                className="rounded-xl border px-3 py-2"
                type="number"
                value={row.minimumTarget}
                onChange={(e) =>
                  updateTrend(row.id, "minimumTarget", e.target.value)
                }
              />
              <input
                className="rounded-xl border px-3 py-2"
                type="number"
                value={row.target}
                onChange={(e) =>
                  updateTrend(row.id, "target", e.target.value)
                }
              />
              <input
                className="rounded-xl border px-3 py-2"
                type="number"
                value={row.stretchTarget}
                onChange={(e) =>
                  updateTrend(row.id, "stretchTarget", e.target.value)
                }
              />
              <input
                className="rounded-xl border px-3 py-2"
                type="number"
                value={row.actual}
                onChange={(e) =>
                  updateTrend(row.id, "actual", e.target.value)
                }
              />
            </div>
          ))}
        </AdminCard>

        <AdminCard
          title="Team performance maintenance"
          actionLabel="Save teams"
          disabled={isPending}
          onAction={() =>
            startTransition(async () => {
              const updatedTeams = await saveTeams(teams);
              setTeams(updatedTeams);
            })
          }
          secondaryLabel="Add team"
          onSecondary={addTeam}
        >
          <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div>Team</div>
            <div>Target</div>
            <div>Actual</div>
            <div>Ach %</div>
            <div>Var %</div>
            <div></div>
          </div>

          {sortedAdminTeams.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr_auto] gap-3 items-center"
            >
              <input
                className="rounded-xl border px-3 py-2"
                value={row.name}
                onChange={(e) =>
                  updateTeam(row.id, "name", e.target.value)
                }
                disabled={row.isCompanyTotal}
              />

              <RandEditor
                value={row.targetValue}
                disabled={row.isCompanyTotal}
                onChange={(value) =>
                  updateTeam(row.id, "targetValue", value)
                }
              />

              <RandEditor
                value={row.actualValue}
                disabled={row.isCompanyTotal}
                onChange={(value) =>
                  updateTeam(row.id, "actualValue", value)
                }
              />

              <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {row.achievementPct}%
              </div>

              <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                {row.variancePct}%
              </div>

              <button
                className="rounded-xl border border-red-300 px-3 py-2 text-red-600 disabled:opacity-40"
                onClick={() => deleteTeam(row.id)}
                disabled={row.isCompanyTotal}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </AdminCard>
<AdminCard
  title="Import active projects from Excel"
  actionLabel="Upload and replace projects"
  disabled={isPending}
  onAction={() => {}}
>
  <form
    action={(formData) =>
      startTransition(async () => {
        const updatedProjects = await uploadProjectsFromExcel(formData);
        setProjects(updatedProjects);
      })
    }
    className="flex items-center gap-3"
  >
    <input
      name="file"
      type="file"
      accept=".xlsx,.xls"
      className="rounded-xl border px-3 py-2"
      required
    />

    <button
      type="submit"
      className="rounded-xl bg-slate-900 px-4 py-2 text-white"
      disabled={isPending}
    >
      Upload and replace projects
    </button>
  </form>

  <p className="text-sm text-slate-500">
    Uses sheet “Active projects”, row 9 headers, and imports IPM, Project and %.
  </p>
</AdminCard>
        <AdminCard
          title="Project maintenance"
          actionLabel="Save projects"
          disabled={isPending}
          onAction={() => startTransition(() => saveProjects(projects))}
          secondaryLabel="Add project"
          onSecondary={addProject}
        >
          <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <div>Project</div>
            <div>IPM</div>
            <div>Progress %</div>
            <div>Status</div>
            <div></div>
          </div>

          {projects.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[2fr_1.2fr_1fr_1fr_auto] gap-3 items-center"
            >
              <input
                className="rounded-xl border px-3 py-2"
                value={row.name}
                onChange={(e) =>
                  updateProject(row.id, "name", e.target.value)
                }
              />
              <input
                className="rounded-xl border px-3 py-2"
                value={row.ipm}
                onChange={(e) =>
                  updateProject(row.id, "ipm", e.target.value)
                }
              />
              <input
                className="rounded-xl border px-3 py-2"
                type="number"
                min="0"
                max="100"
                value={row.progress}
                onChange={(e) =>
                  updateProject(row.id, "progress", e.target.value)
                }
              />
              <select
                className="rounded-xl border bg-white px-3 py-2"
                value={row.status}
                onChange={(e) =>
                  updateProject(row.id, "status", e.target.value)
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                className="rounded-xl border border-red-300 px-3 py-2 text-red-600"
                onClick={() => deleteProject(row.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          ))}
        </AdminCard>
      </div>
    </div>
  );
}