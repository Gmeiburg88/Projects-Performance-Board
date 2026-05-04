import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/admin-shell";
import { getDashboardData } from "@/lib/data";
export default async function AdminPage(){await requireAdmin(); const { trend, teams, projects } = await getDashboardData(); return <AdminShell initialTrend={trend} initialTeams={teams} initialProjects={projects} />;}
