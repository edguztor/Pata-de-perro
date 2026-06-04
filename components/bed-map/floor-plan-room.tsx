"use client";
import { cn } from "@/lib/utils";
import { BedData } from "./bunk-bed-unit";

const STATUS_BG: Record<string, string> = {
  AVAILABLE: "bg-emerald-900/50 border-emerald-500/40 hover:bg-emerald-800/60",
  OCCUPIED:  "bg-rose-900/50  border-rose-500/40  hover:bg-rose-800/60",
  RESERVED:  "bg-amber-900/50 border-amber-500/40 hover:bg-amber-800/60",
  MAINTENANCE:"bg-slate-800/50 border-slate-500/40 hover:bg-slate-700/60",
};
const STATUS_DOT: Record<string, string> = {
  AVAILABLE: "bg-emerald-400",
  OCCUPIED:  "bg-rose-400",
  RESERVED:  "bg-amber-400",
  MAINTENANCE:"bg-slate-500",
};
const STATUS_LABEL: Record<string, string> = {
  AVAILABLE: "Disponible",
  OCCUPIED:  "Ocupada",
  RESERVED:  "Reservada",
  MAINTENANCE:"Mant.",
};

function BedSlot({ bed, position, onClick }: { bed: BedData; position: "top" | "bottom"; onClick: () => void }) {
  const s = bed.currentStatus;
  const guest = bed.currentReservation?.guest.name;
  return (
    <button
      onClick={onClick}
      title={`${bed.name} · ${STATUS_LABEL[s] ?? s}${guest ? ` · ${guest}` : ""}`}
      className={cn(
        "w-full text-left px-2 py-1.5 border transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e94560]/60",
        position === "top" ? "rounded-t-md border-b-0" : "rounded-b-md",
        STATUS_BG[s] ?? STATUS_BG.AVAILABLE
      )}
    >
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-slate-400 font-medium leading-none">
          {position === "top" ? "↑ Alta" : "↓ Baja"}
        </span>
        <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", STATUS_DOT[s] ?? STATUS_DOT.AVAILABLE)} />
      </div>
      <p className="text-[11px] font-bold text-white leading-tight truncate">{bed.name}</p>
      <p className="text-[9px] text-slate-400 leading-tight truncate">
        {guest ?? STATUS_LABEL[s] ?? s}
      </p>
    </button>
  );
}

function BunkUnit({
  topBed,
  bottomBed,
  label,
  onClick,
}: {
  topBed: BedData;
  bottomBed: BedData;
  label: string;
  onClick: (bed: BedData) => void;
}) {
  return (
    <div className="flex flex-col items-center" style={{ width: 128 }}>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 text-center">{label}</p>
      <div className="w-full rounded-md border border-slate-600/50 overflow-hidden shadow-lg">
        <BedSlot bed={topBed} position="top" onClick={() => onClick(topBed)} />
        {/* bunk frame rail */}
        <div className="h-[3px] bg-slate-600/70 border-x border-slate-600/60" />
        <BedSlot bed={bottomBed} position="bottom" onClick={() => onClick(bottomBed)} />
      </div>
    </div>
  );
}

function StaircaseIcon() {
  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none">
      <div className="bg-[#1a2744] border border-slate-600/60 rounded-lg px-3 py-2 flex flex-col items-center gap-1.5">
        {/* step pattern */}
        <div className="flex flex-col gap-[2px]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-600 rounded-[1px]"
              style={{ height: 3, width: 6 + i * 6 }}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Escalera</span>
      </div>
    </div>
  );
}

function DoorIcon() {
  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Puerta</span>
      {/* double door leaves */}
      <div className="flex gap-0.5">
        <div className="w-5 h-8 bg-[#1a2744] border border-slate-500/60 rounded-sm" />
        <div className="w-5 h-8 bg-[#1a2744] border border-slate-500/60 rounded-sm" />
      </div>
    </div>
  );
}

interface FloorPlanRoomProps {
  beds: BedData[];
  onBedClick: (bed: BedData) => void;
}

export function FloorPlanRoom({ beds, onBedClick }: FloorPlanRoomProps) {
  const bunkMap: Record<number, { top?: BedData; bottom?: BedData }> = {};
  beds.forEach((b) => {
    const n = b.bunkNumber ?? 0;
    if (!bunkMap[n]) bunkMap[n] = {};
    if (b.position === "TOP") bunkMap[n].top = b;
    else bunkMap[n].bottom = b;
  });
  const bunkNums = Object.keys(bunkMap).map(Number).sort((a, b) => a - b);

  const renderBunk = (idx: number) => {
    const n = bunkNums[idx];
    if (n == null) return <div style={{ width: 128 }} />;
    const pair = bunkMap[n];
    if (!pair.top || !pair.bottom) return <div style={{ width: 128 }} />;
    return (
      <BunkUnit
        key={n}
        topBed={pair.top}
        bottomBed={pair.bottom}
        label={`Litera ${n}`}
        onClick={onBedClick}
      />
    );
  };

  return (
    <div className="bg-[#0a0f1e] border-2 border-slate-600/70 rounded-xl p-5 select-none">
      {/* Row 1: TL bunk — escalera — TR bunk */}
      <div className="flex items-start justify-between gap-4">
        {renderBunk(0)}
        <StaircaseIcon />
        {renderBunk(1)}
      </div>

      {/* Spacer (room depth) */}
      <div className="h-8" />

      {/* Row 2: BL bunk — puerta — BR bunk */}
      <div className="flex items-end justify-between gap-4">
        {renderBunk(2)}
        <DoorIcon />
        {renderBunk(3)}
      </div>
    </div>
  );
}
