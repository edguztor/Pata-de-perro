import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/dashboard`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardClient initialData={data} />;
}
