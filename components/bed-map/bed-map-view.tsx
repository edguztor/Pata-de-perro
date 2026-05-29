"use client";
import { useEffect, useState } from "react";
import { BunkBedUnit, BedData } from "./bunk-bed-unit";
import { BedCard } from "./bed-card";
import { BedLegend } from "./bed-legend";
import { BedDetailDialog } from "./bed-detail-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type RoomFilter = "all" | "1" | "2" | "3";

function groupByRoom(beds: BedData[]) {
  const byRoom: Record<number, BedData[]> = {};
  beds.forEach((b) => {
    if (!byRoom[b.room]) byRoom[b.room] = [];
    byRoom[b.room].push(b);
  });
  return byRoom;
}

/** Returns a map: floor -> bunkNumber -> { top, bottom } */
function groupByFloorAndBunkPairs(beds: BedData[]) {
  const floors: Record<number, Record<number, { top?: BedData; bottom?: BedData }>> = {};
  beds.forEach((b) => {
    const floor = b.floor;
    const bunk = b.bunkNumber ?? 0;
    if (!floors[floor]) floors[floor] = {};
    if (!floors[floor][bunk]) floors[floor][bunk] = {};
    if (b.position === "TOP") {
      floors[floor][bunk].top = b;
    } else {
      floors[floor][bunk].bottom = b;
    }
  });
  return floors;
}

const floorLabels: Record<number, string> = {
  1: "Planta Baja",
  2: "Planta Alta",
};

export function BedMapView() {
  const [beds, setBeds] = useState<BedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RoomFilter>("all");
  const [selectedBed, setSelectedBed] = useState<BedData | null>(null);

  const fetchBeds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/beds");
      if (res.ok) setBeds(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBeds(); }, []);

  const rooms = groupByRoom(beds);
  const roomNames: Record<number, string> = { 1: "Hab. Mixta 1", 2: "Hab. Mixta 2", 3: "Cuarto Privado" };

  const filteredRooms = filter === "all" ? [1, 2, 3] : [parseInt(filter)];

  const stats = {
    available: beds.filter((b) => b.currentStatus === "AVAILABLE").length,
    occupied: beds.filter((b) => b.currentStatus === "OCCUPIED").length,
    reserved: beds.filter((b) => b.currentStatus === "RESERVED").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
            Mapa de Camas
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {stats.occupied} ocupadas · {stats.reserved} reservadas · {stats.available} disponibles
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "1", "2", "3"] as RoomFilter[]).map((r) => (
            <Button
              key={r}
              variant={filter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(r)}
            >
              {r === "all" ? "Todas" : r === "3" ? "Privado" : `Hab. ${r}`}
            </Button>
          ))}
          <Button variant="outline" size="sm" onClick={fetchBeds} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <BedLegend />

      {/* Rooms */}
      {filteredRooms.map((roomNum) => {
        const roomBeds = rooms[roomNum] ?? [];
        if (roomBeds.length === 0) return null;

        // Private room — single large card
        if (roomNum === 3) {
          return (
            <div key={roomNum} className="bg-[#16213e] rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>
                Cuarto Privado / Airbnb
              </h2>
              <div className="flex gap-4 flex-wrap">
                {roomBeds.map((bed) => (
                  <BedCard key={bed.id} bed={bed} onClick={() => setSelectedBed(bed)} />
                ))}
              </div>
            </div>
          );
        }

        const floorPairs = groupByFloorAndBunkPairs(roomBeds);

        return (
          <div key={roomNum} className="bg-[#16213e] rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "Nunito, sans-serif" }}>
              {roomNames[roomNum]}
            </h2>
            <div className="space-y-6">
              {[1, 2].map((floor) => {
                const pairs = floorPairs[floor];
                if (!pairs) return null;
                const bunkNums = Object.keys(pairs)
                  .map(Number)
                  .sort((a, b) => a - b);
                return (
                  <div key={floor}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                      {floorLabels[floor] ?? `Piso ${floor}`}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {bunkNums.map((bunkNum) => {
                        const pair = pairs[bunkNum];
                        if (!pair.top || !pair.bottom) return null;
                        return (
                          <BunkBedUnit
                            key={bunkNum}
                            topBed={pair.top}
                            bottomBed={pair.bottom}
                            bunkLabel={`Litera ${bunkNum}`}
                            onClick={(bed) => setSelectedBed(bed)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedBed && (
        <BedDetailDialog
          bed={selectedBed}
          open={!!selectedBed}
          onClose={() => setSelectedBed(null)}
          onUpdate={fetchBeds}
        />
      )}
    </div>
  );
}
