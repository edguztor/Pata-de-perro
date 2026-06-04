"use client";
import { useCountUp } from "@/lib/hooks";

interface OccupancyHeroProps {
  checkedIn: number;
  reserved: number;
  available: number;
  totalBeds: number;
  occupancyRate: number;
}

export function OccupancyHero({ checkedIn, reserved, available, totalBeds, occupancyRate }: OccupancyHeroProps) {
  const animRate = useCountUp(occupancyRate, 1200);
  const animIn = useCountUp(checkedIn, 900);

  const r = 80;
  const circumference = 2 * Math.PI * r; // 502.65
  const totalArc = circumference * 0.75;  // 270°
  const fillArc = totalArc * (animRate / 100);

  const accentColor = occupancyRate >= 80 ? "#e94560" : occupancyRate >= 50 ? "#f59e0b" : "#10b981";

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-stone-200 shadow-sm">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#e94560]/6 blur-3xl" />
      <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full bg-amber-400/6 blur-3xl" />

      <div className="relative flex flex-col sm:flex-row items-center gap-6 p-6">
        {/* Gauge */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 200 200" className="h-40 w-40 drop-shadow-sm">
            {/* Track */}
            <circle
              cx="100" cy="100" r={r}
              fill="none"
              stroke="#ece4d5"
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${totalArc} ${circumference - totalArc}`}
              transform="rotate(-225 100 100)"
            />
            {/* Fill */}
            <circle
              cx="100" cy="100" r={r}
              fill="none"
              stroke={accentColor}
              strokeWidth="13"
              strokeLinecap="round"
              strokeDasharray={`${fillArc} ${circumference - fillArc}`}
              transform="rotate(-225 100 100)"
              style={{ transition: "stroke-dasharray 0.6s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 6px ${accentColor}55)` }}
            />
          </svg>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[2rem] font-extrabold leading-none text-stone-900" style={{ fontFamily: "Nunito, sans-serif" }}>
              {animRate}%
            </span>
            <span className="text-[11px] text-stone-500 font-semibold tracking-wide uppercase mt-0.5">ocupación</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 w-full">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-0.5">{greeting}</p>
          <h2 className="text-xl font-extrabold text-stone-900 leading-tight mb-1" style={{ fontFamily: "Nunito, sans-serif" }}>
            Pata de Perro Hostel
          </h2>
          <p className="text-sm text-stone-500 mb-4 capitalize">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <StatPill label="Ocupadas" value={animIn} accent="rose" />
            <StatPill label="Reservadas" value={reserved} accent="amber" />
            <StatPill label="Disponibles" value={available} accent="emerald" />
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
            <div className="flex h-full rounded-full overflow-hidden">
              <div
                style={{ width: totalBeds > 0 ? `${(checkedIn / totalBeds) * 100}%` : "0%" }}
                className="bg-rose-400 transition-all duration-700"
              />
              <div
                style={{ width: totalBeds > 0 ? `${(reserved / totalBeds) * 100}%` : "0%" }}
                className="bg-amber-400 transition-all duration-700"
              />
              <div
                style={{ width: totalBeds > 0 ? `${(available / totalBeds) * 100}%` : "0%" }}
                className="bg-emerald-300 transition-all duration-700"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-1.5">
            <Legend color="bg-rose-400" label="Ocupadas" />
            <Legend color="bg-amber-400" label="Reservadas" />
            <Legend color="bg-emerald-300" label="Disponibles" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: number; accent: "rose" | "amber" | "emerald" }) {
  const styles = {
    rose: { bg: "bg-rose-50 border-rose-200", text: "text-rose-600" },
    amber: { bg: "bg-amber-50 border-amber-200", text: "text-amber-600" },
    emerald: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-600" },
  }[accent];
  return (
    <div className={`rounded-xl border ${styles.bg} px-3 py-2.5 text-center`}>
      <p className={`text-2xl font-extrabold ${styles.text} leading-none`} style={{ fontFamily: "Nunito, sans-serif" }}>
        {value}
      </p>
      <p className="text-[11px] text-stone-500 font-semibold mt-1">{label}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-stone-400">
      <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
