"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getNights, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface BedOption {
  id: number;
  name: string;
  roomName: string;
  pricePerNight: number;
  type: string;
}

interface ReservationFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestNationality: string;
  bedId: string;
  checkIn: string;
  checkOut: string;
  pricePerNight: string;
  notes: string;
}

const defaultForm: ReservationFormData = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  guestNationality: "",
  bedId: "",
  checkIn: format(new Date(), "yyyy-MM-dd"),
  checkOut: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
  pricePerNight: "",
  notes: "",
};

export function ReservationFormDialog({
  open,
  onClose,
  onSaved,
  initialBedId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialBedId?: string;
}) {
  const [form, setForm] = useState<ReservationFormData>({ ...defaultForm, bedId: initialBedId ?? "" });
  const [beds, setBeds] = useState<BedOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/beds").then((r) => r.json()).then((data) => {
        setBeds(data.filter((b: BedOption & { currentStatus: string }) => b.currentStatus === "AVAILABLE" || b.id === parseInt(initialBedId ?? "0")));
      });
      setForm({ ...defaultForm, bedId: initialBedId ?? "" });
    }
  }, [open, initialBedId]);

  const selectedBed = beds.find((b) => b.id === parseInt(form.bedId));
  const nights = form.checkIn && form.checkOut ? getNights(form.checkIn, form.checkOut) : 0;
  const price = form.pricePerNight ? parseFloat(form.pricePerNight) : (selectedBed?.pricePerNight ?? 0);
  const total = nights * price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guestName || !form.bedId || !form.checkIn || !form.checkOut) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          pricePerNight: price,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reservación creada correctamente");
      onSaved();
      onClose();
    } catch {
      toast.error("Error al crear la reservación");
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof ReservationFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Reservación</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Huésped</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Nombre completo *</Label>
                <Input placeholder="Nombre del huésped" value={form.guestName} onChange={set("guestName")} required />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" placeholder="email@ejemplo.com" value={form.guestEmail} onChange={set("guestEmail")} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input placeholder="+52 442 000 0000" value={form.guestPhone} onChange={set("guestPhone")} />
              </div>
              <div className="space-y-1">
                <Label>Nacionalidad</Label>
                <Input placeholder="Mexicano/a" value={form.guestNationality} onChange={set("guestNationality")} />
              </div>
            </div>
          </div>

          {/* Booking */}
          <div className="space-y-3 pt-2 border-t border-slate-700">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reservación</p>
            <div className="space-y-1">
              <Label>Cama *</Label>
              <Select value={form.bedId} onValueChange={(v) => setForm((f) => ({ ...f, bedId: v, pricePerNight: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cama disponible" />
                </SelectTrigger>
                <SelectContent>
                  {beds.map((bed) => (
                    <SelectItem key={bed.id} value={bed.id.toString()}>
                      {bed.name} — {bed.roomName} ({formatCurrency(bed.pricePerNight)}/noche)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Check-in *</Label>
                <Input type="date" value={form.checkIn} onChange={set("checkIn")} required />
              </div>
              <div className="space-y-1">
                <Label>Check-out *</Label>
                <Input type="date" value={form.checkOut} onChange={set("checkOut")} required />
              </div>
              <div className="space-y-1">
                <Label>Precio/noche (MXN)</Label>
                <Input
                  type="number"
                  placeholder={selectedBed ? selectedBed.pricePerNight.toString() : "200"}
                  value={form.pricePerNight}
                  onChange={set("pricePerNight")}
                />
              </div>
              <div className="space-y-1">
                <Label>Total calculado</Label>
                <div className="flex h-9 w-full items-center rounded-lg border border-slate-600 bg-[#0a0f1e] px-3 text-sm text-emerald-400 font-medium">
                  {total > 0 ? `${formatCurrency(total)} (${nights} noches)` : "—"}
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notas</Label>
              <Textarea placeholder="Notas especiales, llegada tardía, etc." value={form.notes} onChange={set("notes")} rows={2} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Crear Reservación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
