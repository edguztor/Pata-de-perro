"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Logo } from "@/components/brand/logo";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-[#0d1627] to-[#0a0f1e] px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo iconOnly={false} className="[&_p:last-child]:hidden [&_p]:text-sm" />
        {/* spacer to balance hamburger */}
        <div className="w-9" />
      </div>

      {/* Overlay on mobile when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="ml-0 flex-1 overflow-x-hidden pt-14 lg:ml-64 lg:pt-0">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
