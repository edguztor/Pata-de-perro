import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy", { locale: es });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: es });
}

export function getNights(checkIn: Date | string, checkOut: Date | string): number {
  return Math.max(1, differenceInDays(new Date(checkOut), new Date(checkIn)));
}

export function exportToCSV(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? "" : String(val);
        return str.includes(",") ? `"${str}"` : str;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const BED_STATUS = {
  AVAILABLE: "AVAILABLE",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export const RESERVATION_STATUS = {
  RESERVED: "RESERVED",
  CHECKED_IN: "CHECKED_IN",
  CHECKED_OUT: "CHECKED_OUT",
  CANCELLED: "CANCELLED",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
  MAINTENANCE: "Mantenimiento",
  CHECKED_IN: "Check-in",
  CHECKED_OUT: "Check-out",
  CANCELLED: "Cancelada",
};

export const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  OCCUPIED: "bg-rose-500",
  RESERVED: "bg-amber-500",
  MAINTENANCE: "bg-slate-400",
  CHECKED_IN: "bg-emerald-500",
  CHECKED_OUT: "bg-slate-400",
  CANCELLED: "bg-rose-400",
};
