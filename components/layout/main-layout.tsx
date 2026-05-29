"use client";
import { Sidebar } from "./sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0a0f1e]">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-x-hidden">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
