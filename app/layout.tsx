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
      <body className="min-h-full bg-[#f4efe4] text-stone-800" style={{ fontFamily: "var(--font-inter)" }}>
        {children}
        <Toaster
          position="top-right"
          richColors
          theme="light"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid #e7e0d3",
              color: "#292524",
            },
          }}
        />
      </body>
    </html>
  );
}
