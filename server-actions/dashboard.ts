"use server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, setAdminSession } from "@/lib/auth";
import type { MonthlyTarget, ProjectItem, TeamPerformance } from "@/lib/types";

export async function saveMonthlyTargets(rows: MonthlyTarget[]) {
  for (const row of rows) {
    await prisma.monthlyTarget.upsert({
      where: { id: row.id },
      update: { monthLabel: row.monthLabel, monthOrder: row.monthOrder, minimumTarget: row.minimumTarget, target: row.target, stretchTarget: row.stretchTarget, actual: row.actual },
      create: { id: row.id, monthLabel: row.monthLabel, monthOrder: row.monthOrder, minimumTarget: row.minimumTarget, target: row.target, stretchTarget: row.stretchTarget, actual: row.actual },
    });
  }
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function saveTeams(rows: TeamPerformance[]) {
  const ids = rows.map((r) => r.id);

  await prisma.team.deleteMany({
    where: { id: { notIn: ids } },
  });

  let totalTarget = 0;
  let totalActual = 0;

  for (const row of rows) {
    // Skip company total row (we calculate it)
    if (row.isCompanyTotal) continue;

    const targetValue = Number(row.targetValue) || 0;
    const actualValue = Number(row.actualValue) || 0;

    totalTarget += targetValue;
    totalActual += actualValue;

    const achievementPct = targetValue
      ? Math.round((actualValue / targetValue) * 100)
      : 0;

    const variancePct = targetValue
      ? Math.round(((actualValue - targetValue) / targetValue) * 100)
      : 0;

    await prisma.team.upsert({
      where: { id: row.id },
      update: {
        name: row.name,
        targetValue,
        actualValue,
        achievementPct,
        variancePct,
        sortOrder: row.sortOrder,
        isCompanyTotal: false,
      },
      create: {
        id: row.id,
        name: row.name,
        targetValue,
        actualValue,
        achievementPct,
        variancePct,
        sortOrder: row.sortOrder,
        isCompanyTotal: false,
      },
    });
  }

  // 👉 Calculate company totals
  const totalAchievement = totalTarget
    ? Math.round((totalActual / totalTarget) * 100)
    : 0;

  const totalVariance = totalTarget
    ? Math.round(((totalActual - totalTarget) / totalTarget) * 100)
    : 0;

  // 👉 Upsert Ukwazi row
  await prisma.team.upsert({
    where: { id: "ukwazi" },
    update: {
      name: "Ukwazi",
      targetValue: totalTarget,
      actualValue: totalActual,
      achievementPct: totalAchievement,
      variancePct: totalVariance,
      sortOrder: 999,
      isCompanyTotal: true,
    },
    create: {
      id: "ukwazi",
      name: "Ukwazi",
      targetValue: totalTarget,
      actualValue: totalActual,
      achievementPct: totalAchievement,
      variancePct: totalVariance,
      sortOrder: 999,
      isCompanyTotal: true,
    },
  });

revalidatePath("/dashboard");
revalidatePath("/admin");

return await prisma.team.findMany({
  orderBy: [
    { isCompanyTotal: "asc" },
    { sortOrder: "asc" },
    { name: "asc" },
  ],
});
}

export async function saveProjects(rows: ProjectItem[]) {
  const ids = rows.map((r) => r.id);
  await prisma.project.deleteMany({ where: { id: { notIn: ids } } });
  for (const row of rows) {
    await prisma.project.upsert({
      where: { id: row.id },
      update: { name: row.name, ipm: row.ipm, progress: row.progress, status: row.status, sortOrder: row.sortOrder },
      create: { id: row.id, name: row.name, ipm: row.ipm, progress: row.progress, status: row.status, sortOrder: row.sortOrder },
    });
  }
  revalidatePath("/dashboard");
  revalidatePath("/admin");
}

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    await setAdminSession();
    redirect("/admin");
  }
  redirect("/login?error=1");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/login");
}


function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toProgress(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  let n =
    typeof value === "number"
      ? value
      : Number(String(value).replace("%", "").replace(",", ".").trim());

  if (!Number.isFinite(n)) return 0;

  if (n > 0 && n <= 1) n = n * 100;

  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function uploadProjectsFromExcel(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("No Excel file uploaded.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });

  const sheet =
    workbook.Sheets["Active projects"] ??
    workbook.Sheets["Active Projects"] ??
    workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    throw new Error("No worksheet found in uploaded Excel file.");
  }

  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  // Header is on Excel row 9, so data starts on row 10.
  const dataRows = rows.slice(9);

  const importedProjects = dataRows
    .map((row, index) => {
      const activeStatus = String(row[1] ?? "").trim().toLowerCase(); // Column B

      if (activeStatus !== "active") return null;

      const ipm = String(row[2] ?? "").trim(); // Column C

      const projectName =
        String(row[11] ?? "").trim() || // Column L
        String(row[12] ?? "").trim();   // Column M fallback

      const progress = toProgress(row[36]); // Column AK

      if (!ipm || !projectName) return null;

      const id = slugify(`${ipm}-${projectName}`);

      if (!id) return null;

      return {
        id,
        name: projectName,
        ipm,
        progress,
        status: "Active" as const,
        sortOrder: index + 1,
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      ipm: string;
      progress: number;
      status: "Active";
      sortOrder: number;
    }[];

  // Remove duplicate projects caused by duplicate Excel rows.
  const uniqueProjects = Array.from(
    new Map(importedProjects.map((project) => [project.id, project])).values()
  );

  const ids = uniqueProjects.map((project) => project.id);

  await prisma.project.deleteMany({
    where: {
      id: {
        notIn: ids,
      },
    },
  });

  for (const project of uniqueProjects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return await prisma.project.findMany({
    orderBy: [
      { sortOrder: "asc" },
      { progress: "asc" },
    ],
  });
}

const dataRows = rows.slice(9); // Excel row 10 onwards

const importedProjects = dataRows
  .map((row, index) => {
    const status = String(row[1] ?? "").trim().toLowerCase(); // Column B

    if (status !== "active") return null;

    const ipm = String(row[2] ?? "").trim(); // Column C
    const projectName =
      String(row[11] ?? "").trim() || String(row[12] ?? "").trim(); // Column L, fallback M
    const progress = toProgress(row[36]); // Column AK

    if (!ipm || !projectName) return null;

      return {
        id: slugify(`${ipm}-${projectName}`) || `project-${index + 1}`,
        name: projectName,
        ipm,
        progress,
        status: "Active" as const,
        sortOrder: index + 1,
      };
    })
    .filter(Boolean) as {
    id: string;
    name: string;
    ipm: string;
    progress: number;
    status: "Active";
    sortOrder: number;
  }[];

  const ids = importedProjects.map((p) => p.id);

  await prisma.project.deleteMany({
    where: { id: { notIn: ids } },
  });

  for (const project of importedProjects) {
    await prisma.project.upsert({
      where: { id: project.id },
      update: project,
      create: project,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/admin");

  return await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { progress: "asc" }],
  });
}