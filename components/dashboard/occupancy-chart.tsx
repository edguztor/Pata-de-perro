"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  data: Array<{ date: string; occupancy: number; count: number }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#f0e8d9] border border-stone-300 rounded-lg p-3 text-sm">
        <p className="text-stone-600 mb-1">{label}</p>
        <p className="text-amber-600 font-bold">{payload[0].value}% ocupación</p>
        <p className="text-stone-500">{payload[0].payload.count} huéspedes</p>
      </div>
    );
  }
  return null;
};

export function OccupancyChart({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Ocupación — Últimos 7 días</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="occupancyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7ddca" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#78716c", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="occupancy" stroke="#f59e0b" strokeWidth={2.5} fill="url(#occupancyGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
