"use client";
import { useEffect, useState } from "react";
import { BedCard } from "./bed-card";
import { BedLegend } from "./bed-legend";
import { BedDetailDialog } from "./bed-detail-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface BedData {
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

type RoomFilter = "all" | "1" | "2" | "3";

function groupByRoom(beds: BedData[]) {
  const byRoom: Record<number, BedData[]> = {};
  beds.forEach((b) => {
    if (!byRoom[b.room]) byRoom[b.room] = [];
    byRoom[b.room].push(b);
  });
  return byRoom;
}

function groupByFloorAndBunk(beds: BedData[]) {
  const floors: Record<number, Record<number, BedData[]>> = {};
  beds.forEach((b) => {
    if (!floors[b.floor]) floors[b.floor] = {};
    const bunk = b.bunkNumber ?? 0;
    if (!floors[b.floor][bunk]) floors[b.floor][bunk] = [];
    floors[b.floor][bunk].push(b);
    floors[b.floor][bunk].sort((a, b2) => (a.position === "BOTTOM" ? -1 : 1));
  });
  return floors;
}

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

  const filteredRooms = filter === "all"
    ? [1, 2, 3]
    : [parseInt(filter)];

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

        if (roomNum === 3) {
          return (
            <div key={roomNum} className="bg-[#16213e] rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>
                🏠 Cuarto Privado / Airbnb
              </h2>
              <div className="flex gap-4">
                {roomBeds.map((bed) => (
                  <BedCard key={bed.id} bed={bed} onClick={() => setSelectedBed(bed)} />
                ))}
              </div>
            </div>
          );
        }

        const floors = groupByFloorAndBunk(roomBeds);

        return (
          <div key={roomNum} className="bg-[#16213e] rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "Nunito, sans-serif" }}>
              🛏 {roomNames[roomNum]}
            </h2>
            <div className="space-y-6">
              {[1, 2].map((floor) => {
                const floorBunks = floors[floor];
                if (!floorBunks) return null;
                return (
                  <div key={floor}>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Piso {floor === 1 ? "Bajo" : "Alto"}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(floorBunks).map(([bunkNum, bunkBeds]) => (
                        <div key={bunkNum} className="flex flex-col gap-2">
                          <p className="text-xs text-slate-500 text-center">Litera {bunkNum}</p>
                          <div className="flex flex-col-reverse gap-1.5">
                            {bunkBeds.map((bed) => (
                              <div key={bed.id} className="relative">
                                {bed.position === "TOP" && (
                                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-medium">↑ Arriba</div>
                                )}
                                <BedCard bed={bed} onClick={() => setSelectedBed(bed)} />
                                {bed.position === "BOTTOM" && (
                                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-medium">↓ Abajo</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
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
