"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { BedDouble, Lock, LogIn, LogOut, Wrench, CalendarPlus } from "lucide-react";
import Link from "next/link";

interface BedData {
  id: number;
  name: string;
  type: string;
  roomName: string;
  floor: number;
  pricePerNight: number;
  currentStatus: string;
  currentReservation: {
    id: number;
    status: string;
    checkIn: string;
    checkOut: string;
    guest: { id?: number; name: string; phone?: string };
  } | null;
}

const statusVariantMap: Record<string, "available" | "occupied" | "reserved" | "checkout" | "maintenance" | "cancelled"> = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
  MAINTENANCE: "maintenance",
};

const statusLabelMap: Record<string, string> = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  RESERVED: "Reservada",
  MAINTENANCE: "Mantenimiento",
};

export function BedDetailDialog({
  bed,
  open,
  onClose,
  onUpdate,
}: {
  bed: BedData;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    if (!bed.currentReservation) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${bed.currentReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CHECKED_IN" }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Check-in de ${bed.currentReservation.guest.name} completado`);
      onUpdate();
      onClose();
    } catch {
      toast.error("Error al hacer check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!bed.currentReservation) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/reservations/${bed.currentReservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CHECKED_OUT" }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Check-out de ${bed.currentReservation.guest.name} completado`);
      onUpdate();
      onClose();
    } catch {
      toast.error("Error al hacer check-out");
    } finally {
      setLoading(false);
    }
  };

  const res = bed.currentReservation;
  const statusVariant = statusVariantMap[bed.currentStatus] ?? "available";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {bed.type === "PRIVATE" ? <Lock className="h-5 w-5 text-purple-400" /> : <BedDouble className="h-5 w-5 text-blue-400" />}
            Cama {bed.name}
          </DialogTitle>
          <DialogDescription>{bed.roomName} · Piso {bed.floor === 1 ? "Bajo" : "Alto"} · {formatCurrency(bed.pricePerNight)}/noche</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0d1627] border border-slate-700">
            <span className="text-sm text-slate-300">Estado actual</span>
            <Badge variant={statusVariant}>{statusLabelMap[bed.currentStatus]}</Badge>
          </div>

          {/* Current Reservation */}
          {res && (
            <div className="p-4 rounded-lg bg-[#0d1627] border border-slate-700 space-y-2">
              <p className="text-sm font-semibold text-white">{res.guest.name}</p>
              {res.guest.phone && <p className="text-xs text-slate-400">{res.guest.phone}</p>}
              <div className="flex gap-4 text-xs text-slate-400">
                <span>Check-in: {formatDate(res.checkIn)}</span>
                <span>Check-out: {formatDate(res.checkOut)}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {bed.currentStatus === "RESERVED" && res && (
              <Button variant="success" onClick={handleCheckIn} disabled={loading} className="w-full">
                <LogIn className="h-4 w-4" />
                Hacer Check-in
              </Button>
            )}
            {bed.currentStatus === "OCCUPIED" && res && (
              <Button variant="outline" onClick={handleCheckOut} disabled={loading} className="w-full">
                <LogOut className="h-4 w-4" />
                Hacer Check-out
              </Button>
            )}
            {bed.currentStatus === "AVAILABLE" && (
              <Link href={`/reservations?new=1&bedId=${bed.id}`}>
                <Button className="w-full" onClick={onClose}>
                  <CalendarPlus className="h-4 w-4" />
                  Nueva Reservación
                </Button>
              </Link>
            )}
            {res && (
              <Link href={`/reservations?id=${res.id}`}>
                <Button variant="ghost" size="sm" className="w-full" onClick={onClose}>
                  Ver reservación completa
                </Button>
              </Link>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
