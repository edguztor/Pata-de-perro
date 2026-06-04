"use client";
import { useEffect, useState } from "react";
import { BedData } from "./bunk-bed-unit";
import { BedCard } from "./bed-card";
import { BedLegend } from "./bed-legend";
import { BedDetailDialog } from "./bed-detail-dialog";
import { FloorPlanRoom } from "./floor-plan-room";
import { ReservationFormDialog } from "@/components/reservations/reservation-form-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type RoomTab = "1" | "2" | "3";

export function BedMapView() {
  const [beds, setBeds] = useState<BedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomTab, setRoomTab] = useState<RoomTab>("1");
  const [floor, setFloor] = useState<1 | 2>(1);
  // selected bed for detail/check-in/out (reserved or occupied)
  const [detailBed, setDetailBed] = useState<BedData | null>(null);
  // bed id for new reservation dialog (available beds)
  const [newResoBedId, setNewResoBedId] = useState<string | null>(null);

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

  const handleBedClick = (bed: BedData) => {
    if (bed.currentStatus === "AVAILABLE") {
      setNewResoBedId(bed.id.toString());
    } else {
      setDetailBed(bed);
    }
  };

  const stats = {
    available: beds.filter((b) => b.currentStatus === "AVAILABLE").length,
    occupied:  beds.filter((b) => b.currentStatus === "OCCUPIED").length,
    reserved:  beds.filter((b) => b.currentStatus === "RESERVED").length,
  };

  const roomBeds = beds.filter((b) => b.room === parseInt(roomTab));
  const floorBeds = roomBeds.filter((b) => b.floor === floor);

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
        <Button variant="outline" size="sm" onClick={fetchBeds} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <BedLegend />

      {/* Room tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["1", "2", "3"] as RoomTab[]).map((r) => (
          <Button
            key={r}
            variant={roomTab === r ? "default" : "outline"}
            size="sm"
            onClick={() => { setRoomTab(r); setFloor(1); }}
          >
            {r === "3" ? "Cuarto Privado" : `Habitación ${r}`}
          </Button>
        ))}
      </div>

      {/* Dorm floor plan */}
      {roomTab !== "3" && (
        <div className="bg-[#16213e] rounded-xl border border-slate-700/50 p-5 space-y-5">
          {/* Room header + floor toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
                {roomTab === "1" ? "Hab. Mixta 1" : "Hab. Mixta 2"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Haz clic en una cama para reservar o ver detalles
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={floor === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setFloor(1)}
              >
                Planta Baja
              </Button>
              <Button
                variant={floor === 2 ? "default" : "outline"}
                size="sm"
                onClick={() => setFloor(2)}
              >
                Planta Alta
              </Button>
            </div>
          </div>

          {/* Floor plan */}
          {floorBeds.length > 0 ? (
            <FloorPlanRoom beds={floorBeds} onBedClick={handleBedClick} />
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Sin camas registradas en este piso</p>
          )}
        </div>
      )}

      {/* Private room */}
      {roomTab === "3" && (
        <div className="bg-[#16213e] rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "Nunito, sans-serif" }}>
            Cuarto Privado / Airbnb
          </h2>
          <div className="flex gap-4 flex-wrap">
            {roomBeds.map((bed) => (
              <BedCard key={bed.id} bed={bed} onClick={() => handleBedClick(bed)} />
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {detailBed && (
        <BedDetailDialog
          bed={detailBed}
          open={!!detailBed}
          onClose={() => setDetailBed(null)}
          onUpdate={fetchBeds}
        />
      )}
      {newResoBedId && (
        <ReservationFormDialog
          open={!!newResoBedId}
          onClose={() => setNewResoBedId(null)}
          onSaved={() => { setNewResoBedId(null); fetchBeds(); }}
          initialBedId={newResoBedId}
        />
      )}
    </div>
  );
}
