"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import type { Role } from "@/lib/auth";

export interface SidebarUser {
  name: string;
  username: string;
  role: Role;
}

const navItems: { href: string; icon: typeof LayoutDashboard; label: string; roles: Role[] }[] = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", roles: ["ADMIN"] },
  { href: "/bed-map", icon: BedDouble, label: "Mapa de Camas", roles: ["ADMIN", "RECEPTIONIST"] },
  { href: "/reservations", icon: CalendarDays, label: "Reservaciones", roles: ["ADMIN", "RECEPTIONIST"] },
  { href: "/guests", icon: Users, label: "Huéspedes", roles: ["ADMIN"] },
  { href: "/revenue", icon: BarChart3, label: "Ingresos", roles: ["ADMIN"] },
  { href: "/settings", icon: Settings, label: "Configuración", roles: ["ADMIN"] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: SidebarUser;
}

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
};

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const items = navItems.filter((item) => item.roles.includes(user.role));
  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-stone-200 transition-transform duration-200",
        "bg-gradient-to-b from-[#ece4d5] to-[#f4efe4]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className="relative flex h-24 items-center justify-center border-b border-stone-200 px-5">
        <Logo className="h-16 w-auto" />
        {/* Close button — only on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          aria-label="Cerrar menú"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1.5 p-4 overflow-y-auto">
        {items.map(({ href, icon: Icon, label }, i) => {
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
                  ? "bg-gradient-to-r from-[#e94560]/15 to-transparent text-stone-900"
                  : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
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
                    : "text-stone-500 group-hover:text-stone-700"
                )}
              >
                <Icon size={18} />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user + logout */}
      <div className="border-t border-stone-200 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 border border-stone-200 p-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e94560] to-[#f59e0b] text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
            <p className="text-[11px] text-stone-500">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/40 px-3 py-2 text-xs font-semibold text-stone-600 transition-colors hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
