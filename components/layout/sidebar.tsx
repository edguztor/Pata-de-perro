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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { DogMascot } from "@/components/brand/dog-mascot";

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
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-slate-800/80 transition-transform duration-200",
        "bg-gradient-to-b from-[#0d1627] to-[#0a0f1e]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
        <Logo />
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
      <nav className="flex flex-1 flex-col gap-1.5 p-4">
        {navItems.map(({ href, icon: Icon, label }, i) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              style={{ animationDelay: `${i * 40}ms` }}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 animate-slide-in-left",
                isActive
                  ? "bg-gradient-to-r from-[#e94560]/15 to-transparent text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              )}
            >
              {/* Active accent bar */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-[#e94560] to-[#f59e0b] transition-all duration-200",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                )}
              />
              <span
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors",
                  isActive
                    ? "bg-[#e94560]/20 text-[#e94560]"
                    : "text-slate-400 group-hover:text-slate-200"
                )}
              >
                <Icon size={18} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — mascot */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#16213e] to-[#0d1627] p-4">
          <div className="flex items-center gap-3">
            <DogMascot className="h-12 w-12 flex-shrink-0 text-amber-400/90 animate-bob" />
            <div className="leading-tight">
              <p className="text-xs font-bold text-white">¡Bienvenido!</p>
              <p className="text-[11px] text-slate-400">Tu hostal, en orden 🐾</p>
            </div>
          </div>
          {/* subtle glow */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#e94560]/10 blur-2xl" />
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-600">v1.0 · Admin Panel</p>
      </div>
    </aside>
  );
}
