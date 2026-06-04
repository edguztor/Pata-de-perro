"use client";
import { cn } from "@/lib/utils";
import { BedDouble, Lock, Wrench } from "lucide-react";

interface BedData {
  id: number;
  name: string;
  type: string;
  position: string;
  currentStatus: string;
  pricePerNight: number;
  currentReservation: {
    guest: { name: string };
    checkIn: string;
    checkOut: string;
  } | null;
}

const statusConfig = {
  AVAILABLE: {
    bg: "bg-emerald-900/30 border-emerald-600/40 hover:bg-emerald-800/40",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    label: "Disponible",
  },
  OCCUPIED: {
    bg: "bg-rose-900/30 border-rose-600/40 hover:bg-rose-800/40",
    dot: "bg-rose-400",
    text: "text-rose-300",
    label: "Ocupada",
  },
  RESERVED: {
    bg: "bg-amber-900/30 border-amber-600/40 hover:bg-amber-800/40",
    dot: "bg-amber-400",
    text: "text-amber-300",
    label: "Reservada",
  },
  MAINTENANCE: {
    bg: "bg-slate-800/50 border-slate-600/40 hover:bg-slate-700/50",
    dot: "bg-slate-400",
    text: "text-slate-400",
    label: "Mantenimiento",
  },
};

export function BedCard({ bed, onClick }: { bed: BedData; onClick: () => void }) {
  const cfg = statusConfig[bed.currentStatus as keyof typeof statusConfig] ?? statusConfig.AVAILABLE;
  const isPrivate = bed.type === "PRIVATE";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start rounded-xl border p-3 transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e94560]",
        isPrivate ? "w-40 min-h-[100px]" : "w-[110px] min-h-[80px]",
        cfg.bg
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-bold text-white">{bed.name}</span>
        <span className={cn("h-2 w-2 rounded-full flex-shrink-0", cfg.dot)} />
      </div>

      <div className="flex-1 w-full">
        {bed.currentReservation ? (
          <p className={cn("text-xs font-medium truncate w-full", cfg.text)}>
            {bed.currentReservation.guest.name}
          </p>
        ) : (
          <p className={cn("text-xs", cfg.text)}>{cfg.label}</p>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1">
        {isPrivate ? (
          <Lock className="h-3 w-3 text-slate-400" />
        ) : (
          <BedDouble className="h-3 w-3 text-slate-500" />
        )}
        {bed.currentStatus === "MAINTENANCE" && <Wrench className="h-3 w-3 text-slate-400" />}
        <span className="text-[10px] text-slate-500">${bed.pricePerNight}/noche</span>
      </div>
    </button>
  );
}
