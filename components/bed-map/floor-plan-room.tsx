"use client";
import { cn } from "@/lib/utils";
import { BedData } from "./bunk-bed-unit";

const STATUS_BG: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 border-emerald-400 hover:bg-emerald-200",
  OCCUPIED:  "bg-rose-100  border-rose-400  hover:bg-rose-200",
  RESERVED:  "bg-amber-100 border-amber-400 hover:bg-amber-200",
  MAINTENANCE:"bg-stone-100 border-stone-300 hover:bg-stone-200",
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
  const isAvailable = s === "AVAILABLE";
  return (
    <button
      onClick={onClick}
      title={`${bed.name} · ${STATUS_LABEL[s] ?? s}${guest ? ` · ${guest}` : ""}`}
      className={cn(
        "group/bed relative w-full text-left px-2 py-1.5 border transition-all duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#e94560]/60 hover:scale-[1.03] hover:z-10 hover:shadow-md",
        position === "top" ? "rounded-t-md border-b-0" : "rounded-b-md",
        STATUS_BG[s] ?? STATUS_BG.AVAILABLE
      )}
    >
      {/* Soft glowing pulse ring on available beds */}
      {isAvailable && (
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-emerald-400/50 animate-glow" />
      )}
      <div className="relative flex items-center justify-between mb-0.5">
        <span className="text-[9px] text-stone-500 font-medium leading-none">
          {position === "top" ? "↑ Alta" : "↓ Baja"}
        </span>
        <span className={cn(
          "h-1.5 w-1.5 rounded-full flex-shrink-0",
          STATUS_DOT[s] ?? STATUS_DOT.AVAILABLE,
          isAvailable && "animate-glow"
        )} />
      </div>
      <p className="relative text-[11px] font-bold text-stone-900 leading-tight truncate">{bed.name}</p>
      <p className="relative text-[9px] text-stone-500 leading-tight truncate">
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
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1 text-center">{label}</p>
      <div className="w-full rounded-lg border border-stone-300 overflow-hidden shadow-lg ring-1 ring-white/60 bg-white">
        <BedSlot bed={topBed} position="top" onClick={() => onClick(topBed)} />
        {/* bunk frame rail */}
        <div className="h-[3px] bg-stone-300 border-x border-stone-300" />
        <BedSlot bed={bottomBed} position="bottom" onClick={() => onClick(bottomBed)} />
      </div>
    </div>
  );
}

function StaircaseIcon() {
  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none">
      <div className="bg-[#efe8db] border border-stone-300 rounded-lg px-3 py-2 flex flex-col items-center gap-1.5">
        {/* step pattern */}
        <div className="flex flex-col gap-[2px]">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-stone-300 rounded-[1px]"
              style={{ height: 3, width: 6 + i * 6 }}
            />
          ))}
        </div>
        <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Escalera</span>
      </div>
    </div>
  );
}

function DoorIcon() {
  return (
    <div className="flex flex-col items-center gap-1 select-none pointer-events-none">
      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Puerta</span>
      {/* double door leaves */}
      <div className="flex gap-0.5">
        <div className="w-5 h-8 bg-[#efe8db] border border-stone-300 rounded-sm" />
        <div className="w-5 h-8 bg-[#efe8db] border border-stone-300 rounded-sm" />
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

  const available = beds.filter((b) => b.currentStatus === "AVAILABLE").length;

  return (
    <div
      className="relative border-2 border-stone-300/70 rounded-xl p-5 select-none overflow-hidden"
      style={{
        backgroundColor: "#f4efe4",
        backgroundImage:
          "linear-gradient(#e3d9c4 1px, transparent 1px), linear-gradient(90deg, #e3d9c4 1px, transparent 1px)",
        backgroundSize: "26px 26px",
      }}
    >
      {/* Floor occupancy chip */}
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-stone-200 px-2.5 py-1 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-glow" />
        <span className="text-[10px] font-semibold text-stone-600">{available} libres</span>
      </div>

      {/* Row 1: TL bunk — escalera — TR bunk */}
      <div className="relative flex items-start justify-between gap-4">
        {renderBunk(0)}
        <StaircaseIcon />
        {renderBunk(1)}
      </div>

      {/* Spacer (room depth) */}
      <div className="h-8" />

      {/* Row 2: BL bunk — puerta — BR bunk */}
      <div className="relative flex items-end justify-between gap-4">
        {renderBunk(2)}
        <DoorIcon />
        {renderBunk(3)}
      </div>
    </div>
  );
}
