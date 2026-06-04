"use client";
import { cn } from "@/lib/utils";

export interface BedData {
  id: number;
  number: number;
  name: string;
  type: string;
  position: string;
  bunkNumber: number | null;
  floor: number;
  room: number;
  roomName: string;
  pricePerNight: number;
  currentStatus: string;
  currentReservation: {
    id: number;
    status: string;
    checkIn: string;
    checkOut: string;
    guest: { name: string; phone?: string };
  } | null;
}

const statusConfig = {
  AVAILABLE: {
    bg: "bg-emerald-100 border-emerald-400 hover:bg-emerald-200",
    dot: "bg-emerald-400",
    text: "text-emerald-700",
    label: "Disponible",
  },
  OCCUPIED: {
    bg: "bg-rose-100 border-rose-400 hover:bg-rose-200",
    dot: "bg-rose-400",
    text: "text-rose-700",
    label: "Ocupada",
  },
  RESERVED: {
    bg: "bg-amber-100 border-amber-400 hover:bg-amber-200",
    dot: "bg-amber-400",
    text: "text-amber-700",
    label: "Reservada",
  },
  MAINTENANCE: {
    bg: "bg-stone-100 border-stone-300 hover:bg-stone-200",
    dot: "bg-slate-400",
    text: "text-stone-500",
    label: "Mant.",
  },
};

interface BunkBedUnitProps {
  topBed: BedData;
  bottomBed: BedData;
  bunkLabel: string;
  onClick: (bed: BedData) => void;
}

function BedHalf({
  bed,
  isTop,
  onClick,
}: {
  bed: BedData;
  isTop: boolean;
  onClick: () => void;
}) {
  const cfg = statusConfig[bed.currentStatus as keyof typeof statusConfig] ?? statusConfig.AVAILABLE;
  const guestName = bed.currentReservation?.guest.name;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full border px-2.5 py-2 text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#e94560]",
        isTop ? "rounded-t-xl border-b-0" : "rounded-b-xl",
        cfg.bg
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="text-[10px] font-semibold text-stone-500 leading-none">
          {isTop ? "↑ Arriba" : "↓ Abajo"}
        </span>
        <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", cfg.dot)} />
      </div>
      <p className="text-xs font-bold text-stone-900 leading-tight truncate">{bed.name}</p>
      <p className={cn("text-[11px] leading-tight truncate mt-0.5", cfg.text)}>
        {guestName ? guestName : cfg.label}
      </p>
    </button>
  );
}

export function BunkBedUnit({ topBed, bottomBed, bunkLabel, onClick }: BunkBedUnitProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{bunkLabel}</p>
      <div className="w-[140px]">
        {/* Top bed */}
        <BedHalf bed={topBed} isTop={true} onClick={() => onClick(topBed)} />
        {/* Divider representing the bunk frame */}
        <div className="h-[3px] bg-stone-300 border-x border-stone-300" />
        {/* Bottom bed */}
        <BedHalf bed={bottomBed} isTop={false} onClick={() => onClick(bottomBed)} />
      </div>
    </div>
  );
}
