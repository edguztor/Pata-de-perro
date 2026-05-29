"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  PawPrint,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/bed-map", icon: BedDouble, label: "Mapa de Camas" },
  { href: "/reservations", icon: CalendarDays, label: "Reservaciones" },
  { href: "/guests", icon: Users, label: "Huéspedes" },
  { href: "/revenue", icon: BarChart3, label: "Ingresos" },
  { href: "/settings", icon: Settings, label: "Configuración" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 flex-shrink-0 border-r border-slate-700/50 bg-[#0d1627]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e94560]">
          <PawPrint className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white leading-none" style={{ fontFamily: "Nunito, sans-serif" }}>
            Pata de Perro
          </p>
          <p className="text-xs text-slate-400">Hostel · Querétaro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#e94560]/10 text-[#e94560] border border-[#e94560]/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", isActive ? "text-[#e94560]" : "")} size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 p-4">
        <p className="text-xs text-slate-500 text-center">v1.0 · Admin Panel</p>
      </div>
    </aside>
  );
}
