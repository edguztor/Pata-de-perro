"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { getNights, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { AlertCircle } from "lucide-react";

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

const defaultForm = (): ReservationFormData => ({
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  guestNationality: "",
  bedId: "",
  checkIn: format(new Date(), "yyyy-MM-dd"),
  checkOut: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
  pricePerNight: "",
  notes: "",
});

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
  const [form, setForm] = useState<ReservationFormData>({ ...defaultForm(), bedId: initialBedId ?? "" });
  const [beds, setBeds] = useState<BedOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetch("/api/beds")
        .then((r) => r.json())
        .then((data) => {
          setBeds(
            data.filter(
              (b: BedOption & { currentStatus: string }) =>
                b.currentStatus === "AVAILABLE" || b.id === parseInt(initialBedId ?? "0")
            )
          );
        });
      setForm({ ...defaultForm(), bedId: initialBedId ?? "" });
      setConflictMsg(null);
    }
  }, [open, initialBedId]);

  const selectedBed = beds.find((b) => b.id === parseInt(form.bedId));
  const nights = form.checkIn && form.checkOut ? getNights(form.checkIn, form.checkOut) : 0;
  const price = form.pricePerNight ? parseFloat(form.pricePerNight) : (selectedBed?.pricePerNight ?? 0);
  const total = nights * price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictMsg(null);
    if (!form.guestName || !form.bedId || !form.checkIn || !form.checkOut) {
      toast.error("Completa los campos requeridos");
      return;
    }
    if (nights <= 0) {
      toast.error("La fecha de salida debe ser posterior a la de entrada");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, pricePerNight: price }),
      });
      if (res.status === 409) {
        const data = await res.json();
        setConflictMsg(
          data.guest
            ? `Esta cama ya tiene una reservación de ${data.guest} en esas fechas. Elige otras fechas o una cama diferente.`
            : "Esta cama ya está reservada en esas fechas."
        );
        return;
      }
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

  const set = (field: keyof ReservationFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const checkInDate = form.checkIn ? new Date(form.checkIn + "T12:00:00") : undefined;
  // Check-out must be at least 1 day after check-in
  const minCheckOut = checkInDate
    ? new Date(checkInDate.getTime() + 86400000)
    : new Date(Date.now() + 86400000);

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
              <Select
                value={form.bedId}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, bedId: v, pricePerNight: "" }));
                  setConflictMsg(null);
                }}
              >
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
                <DatePicker
                  value={form.checkIn}
                  onChange={(v) => {
                    setConflictMsg(null);
                    setForm((f) => ({
                      ...f,
                      checkIn: v,
                      // auto-advance checkout if it's now before checkin
                      checkOut:
                        f.checkOut && f.checkOut <= v
                          ? format(new Date(new Date(v + "T12:00:00").getTime() + 86400000), "yyyy-MM-dd")
                          : f.checkOut,
                    }));
                  }}
                  minDate={new Date()}
                  placeholder="Fecha de entrada"
                />
              </div>
              <div className="space-y-1">
                <Label>Check-out *</Label>
                <DatePicker
                  value={form.checkOut}
                  onChange={(v) => { setConflictMsg(null); setForm((f) => ({ ...f, checkOut: v })); }}
                  minDate={minCheckOut}
                  placeholder="Fecha de salida"
                />
              </div>
              <div className="space-y-1">
                <Label>Precio/noche (MXN)</Label>
                <Input
                  type="number"
                  placeholder={selectedBed ? selectedBed.pricePerNight.toString() : "350"}
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

          {/* Conflict error */}
          {conflictMsg && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-950/50 border border-rose-600/50 p-3 text-sm text-rose-200">
              <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <p>{conflictMsg}</p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading || nights <= 0}>
              {loading ? "Guardando..." : "Crear Reservación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
