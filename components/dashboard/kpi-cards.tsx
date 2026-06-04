"use client";
import { DollarSign, TrendingUp, CalendarDays } from "lucide-react";
import { useCountUp } from "@/lib/hooks";

interface KpiProps {
  kpis: {
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
  };
}

interface RevenueCardProps {
  label: string;
  sub: string;
  value: number;
  icon: React.ElementType;
  accent: string;
  glow: string;
  border: string;
  delay?: number;
}

function formatMXN(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n.toLocaleString("es-MX")}`;
}

function RevenueCard({ label, sub, value, icon: Icon, accent, glow, border, delay = 0 }: RevenueCardProps) {
  const animated = useCountUp(value, 1000 + delay);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border ${border} shadow-sm group hover:shadow-md transition-shadow duration-200`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Glow */}
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${glow} blur-2xl opacity-60`} />
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accent} rounded-l-2xl`} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{label}</p>
            <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${glow} border ${border}`}>
            <Icon className={`h-4 w-4 ${accent.replace("bg-", "text-").replace("/80", "")}`} />
          </div>
        </div>
        <p className="text-3xl font-extrabold text-stone-900 leading-none" style={{ fontFamily: "Nunito, sans-serif" }}>
          {formatMXN(animated)}
        </p>
        <p className="text-xs text-stone-400 mt-1">MXN</p>
      </div>
    </div>
  );
}

export function KpiCards({ kpis }: KpiProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <RevenueCard
        label="Ingresos Hoy"
        sub="check-ins de hoy"
        value={kpis.todayRevenue}
        icon={DollarSign}
        accent="bg-emerald-500"
        glow="bg-emerald-400/15"
        border="border-emerald-200"
        delay={0}
      />
      <RevenueCard
        label="Esta Semana"
        sub="últimos 7 días"
        value={kpis.weekRevenue}
        icon={CalendarDays}
        accent="bg-[#e94560]"
        glow="bg-[#e94560]/10"
        border="border-rose-200"
        delay={80}
      />
      <RevenueCard
        label="Este Mes"
        sub="últimos 30 días"
        value={kpis.monthRevenue}
        icon={TrendingUp}
        accent="bg-amber-500"
        glow="bg-amber-400/15"
        border="border-amber-200"
        delay={160}
      />
    </div>
  );
}
