import type { Metadata } from "next";
import { Nunito, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pata de Perro — Admin",
  description: "Sistema de administración para Hostal Pata de Perro, Querétaro",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${nunito.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0a0f1e] text-slate-100" style={{ fontFamily: "var(--font-inter)" }}>
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="dark"
          toastOptions={{
            style: {
              background: "#16213e",
              border: "1px solid #334155",
              color: "#f1f5f9",
            },
          }}
        />
      </body>
    </html>
  );
}
