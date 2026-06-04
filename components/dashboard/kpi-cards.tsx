import { Card, CardContent } from "@/components/ui/card";
import { BedDouble, Users, TrendingUp, DollarSign, Percent, CalendarCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KpiProps {
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
}

export function KpiCards({ kpis }: KpiProps) {
  const cards = [
    {
      label: "Camas Ocupadas",
      value: `${kpis.checkedIn} / ${kpis.totalBeds}`,
      sub: `${kpis.available} disponibles`,
      icon: BedDouble,
      color: "text-rose-600",
      bg: "bg-rose-400/10",
    },
    {
      label: "Reservaciones",
      value: kpis.reserved.toString(),
      sub: "por hacer check-in",
      icon: CalendarCheck,
      color: "text-amber-600",
      bg: "bg-amber-400/10",
    },
    {
      label: "Ocupación Hoy",
      value: `${kpis.occupancyRate}%`,
      sub: `${kpis.checkedIn} huéspedes activos`,
      icon: Percent,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Ingresos Hoy",
      value: formatCurrency(kpis.todayRevenue),
      sub: "check-ins de hoy",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-400/10",
    },
    {
      label: "Ingresos Semana",
      value: formatCurrency(kpis.weekRevenue),
      sub: "últimos 7 días",
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
    {
      label: "Ingresos Mes",
      value: formatCurrency(kpis.monthRevenue),
      sub: "últimos 30 días",
      icon: Users,
      color: "text-[#e94560]",
      bg: "bg-[#e94560]/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-3`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-stone-900 leading-tight" style={{ fontFamily: "Nunito, sans-serif" }}>
              {card.value}
            </p>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">{card.label}</p>
            <p className="text-xs text-stone-400 mt-0.5">{card.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
