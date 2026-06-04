"use client";
import { useEffect, useState, useCallback } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatCurrency, exportToCSV } from "@/lib/utils";
import { Download, TrendingUp } from "lucide-react";

interface RevenueItem {
  period: string;
  revenue: number;
  dormRevenue: number;
  privateRevenue: number;
  count: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#f0e8d9] border border-stone-300 rounded-lg p-3 text-sm space-y-1">
        <p className="text-stone-600 font-medium">{label}</p>
        {payload.map((p: { color: string; name: string; value: number }) => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueClient() {
  const [data, setData] = useState<RevenueItem[]>([]);
  const [granularity, setGranularity] = useState<"daily" | "weekly" | "monthly">("daily");
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/revenue?granularity=${granularity}&days=${days}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [granularity, days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = data.reduce(
    (acc, d) => ({
      revenue: acc.revenue + d.revenue,
      dorm: acc.dorm + d.dormRevenue,
      private: acc.private + d.privateRevenue,
      count: acc.count + d.count,
    }),
    { revenue: 0, dorm: 0, private: 0, count: 0 }
  );

  const handleExport = () => {
    exportToCSV(
      data.map((d) => ({
        Periodo: d.period,
        "Ingresos Total": d.revenue,
        "Ingresos Dormitorio": d.dormRevenue,
        "Ingresos Privado": d.privateRevenue,
        Reservaciones: d.count,
      })),
      `ingresos-pata-de-perro-${granularity}.csv`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "Nunito, sans-serif" }}>
            Ingresos
          </h1>
          <p className="text-stone-500 text-sm">Reportes de ganancias y ocupación</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={granularity} onValueChange={(v) => setGranularity(v as "daily" | "weekly" | "monthly")}>
          <TabsList>
            <TabsTrigger value="daily">Diario</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensual</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
              {d} días
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Ingresos", value: formatCurrency(totals.revenue), color: "text-emerald-600" },
          { label: "Dormitorio", value: formatCurrency(totals.dorm), color: "text-blue-400" },
          { label: "Cuarto Privado", value: formatCurrency(totals.private), color: "text-purple-400" },
          { label: "Total Reservaciones", value: totals.count.toString(), color: "text-amber-600" },
        ].map((card) => (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-stone-400" />
                <p className="text-xs text-stone-500">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${card.color}`} style={{ fontFamily: "Nunito, sans-serif" }}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ingresos por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-stone-400">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8" }} />
                  <Bar dataKey="dormRevenue" name="Dormitorio" fill="#3b82f6" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="privateRevenue" name="Privado" fill="#a855f7" radius={[2, 2, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tendencia de Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center text-stone-400">Cargando...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e94560" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#e94560" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d4a" vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" name="Total" stroke="#e94560" strokeWidth={2} dot={{ fill: "#e94560", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalle por Período</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-[#ece4d5]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Período</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Dormitorio</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Privado</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Total</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Reservaciones</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="border-b border-stone-300/30 hover:bg-stone-100/20">
                    <td className="px-4 py-2.5 text-stone-600">{row.period}</td>
                    <td className="px-4 py-2.5 text-right text-blue-400">{formatCurrency(row.dormRevenue)}</td>
                    <td className="px-4 py-2.5 text-right text-purple-400">{formatCurrency(row.privateRevenue)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-600 font-medium">{formatCurrency(row.revenue)}</td>
                    <td className="px-4 py-2.5 text-right text-stone-500">{row.count}</td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-stone-400">No hay datos para este período</td></tr>
                )}
              </tbody>
              {data.length > 0 && (
                <tfoot>
                  <tr className="border-t border-stone-300 bg-[#ece4d5]">
                    <td className="px-4 py-3 text-xs font-semibold text-stone-500 uppercase">Total</td>
                    <td className="px-4 py-3 text-right text-blue-400 font-bold">{formatCurrency(totals.dorm)}</td>
                    <td className="px-4 py-3 text-right text-purple-400 font-bold">{formatCurrency(totals.private)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-bold">{formatCurrency(totals.revenue)}</td>
                    <td className="px-4 py-3 text-right text-stone-500 font-bold">{totals.count}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
