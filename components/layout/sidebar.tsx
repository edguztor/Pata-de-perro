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
  X,
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-[#0d1627] border-r border-slate-700/50 transition-transform duration-200",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-6">
        <div className="flex items-center gap-3">
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
        {/* Close button — only on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
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
