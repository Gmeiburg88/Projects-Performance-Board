import DashboardLive from "@/components/dashboard-live";
import { getDashboardData } from "@/lib/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return <DashboardLive initialData={data} />;
}