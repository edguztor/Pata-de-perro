"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar, type SidebarUser } from "./sidebar";
import { Logo } from "@/components/brand/logo";

export function MainLayout({ children, user }: { children: React.ReactNode; user: SidebarUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f4efe4]">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-stone-200 bg-gradient-to-r from-[#ece4d5] to-[#f4efe4] px-4 lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Logo className="h-8 w-auto" />
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

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />

      <main className="ml-0 flex-1 overflow-x-hidden pt-14 lg:ml-64 lg:pt-0">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
