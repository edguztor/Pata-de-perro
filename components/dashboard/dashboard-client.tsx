"use client";
import { useEffect, useState } from "react";
import { KpiCards } from "./kpi-cards";
import { RevenueChart } from "./revenue-chart";
import { OccupancyChart } from "./occupancy-chart";
import { RecentActivity } from "./recent-activity";
import { UpcomingCheckouts } from "./upcoming-checkouts";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardData {
  kpis: {
    totalBeds: number;
    checkedIn: number;
    reserved: number;
    available: number;
    occupancyRate: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
  };
  revenueChart: Array<{ date: string; revenue: number }>;
  occupancyChart: Array<{ date: string; occupancy: number; count: number }>;
  recentActivity: Array<{
    id: number;
    status: string;
    createdAt: string;
    checkIn: string;
    checkOut: string;
    guest: { name: string };
    bed: { name: string; roomName: string };
  }>;
  upcomingCheckouts: Array<{
    id: number;
    checkOut: string;
    guest: { name: string };
    bed: { name: string; roomName: string };
  }>;
}

export function DashboardClient({ initialData }: { initialData: DashboardData | null }) {
  const [data, setData] = useState<DashboardData | null>(initialData);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) refresh();
  }, [initialData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* KPI Cards */}
      {data?.kpis && <KpiCards kpis={data.kpis} />}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data?.revenueChart && <RevenueChart data={data.revenueChart} />}
        {data?.occupancyChart && <OccupancyChart data={data.occupancyChart} />}
      </div>

      {/* Activity & Checkouts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {data?.recentActivity && <RecentActivity activity={data.recentActivity} />}
        {data?.upcomingCheckouts && <UpcomingCheckouts checkouts={data.upcomingCheckouts} />}
      </div>
    </div>
  );
}
