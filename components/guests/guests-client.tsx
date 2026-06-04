"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/reservations/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Plus, Search, Mail, Phone, Globe } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface Guest {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  nationality?: string;
  idNumber?: string;
  totalVisits: number;
  totalSpent: number;
  lastStay: string | null;
  reservations?: Array<{
    id: number;
    status: string;
    checkIn: string;
    checkOut: string;
    totalAmount: number;
    bed: { name: string; roomName: string };
  }>;
}

function GuestFormDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", nationality: "", idNumber: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Huésped creado");
      onSaved();
      onClose();
      setForm({ name: "", email: "", phone: "", nationality: "", idNumber: "" });
    } catch {
      toast.error("Error al crear huésped");
    } finally {
      setLoading(false);
    }
  };

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [f]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo Huésped</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1"><Label>Nombre completo *</Label><Input required value={form.name} onChange={set("name")} placeholder="Nombre completo" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={set("email")} placeholder="email@ejemplo.com" /></div>
            <div className="space-y-1"><Label>Teléfono</Label><Input value={form.phone} onChange={set("phone")} placeholder="+52 442..." /></div>
            <div className="space-y-1"><Label>Nacionalidad</Label><Input value={form.nationality} onChange={set("nationality")} placeholder="Mexicano/a" /></div>
            <div className="space-y-1"><Label>ID / Pasaporte</Label><Input value={form.idNumber} onChange={set("idNumber")} placeholder="CURP o pasaporte" /></div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Crear Huésped"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GuestProfileDialog({ guest, open, onClose }: { guest: Guest | null; open: boolean; onClose: () => void }) {
  const [fullGuest, setFullGuest] = useState<Guest | null>(null);

  useEffect(() => {
    if (guest && open) {
      fetch(`/api/guests/${guest.id}`).then((r) => r.json()).then(setFullGuest);
    }
  }, [guest, open]);

  if (!guest) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{guest.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {guest.email && (
              <div className="flex items-center gap-2 text-stone-600"><Mail className="h-4 w-4 text-stone-400" />{guest.email}</div>
            )}
            {guest.phone && (
              <div className="flex items-center gap-2 text-stone-600"><Phone className="h-4 w-4 text-stone-400" />{guest.phone}</div>
            )}
            {guest.nationality && (
              <div className="flex items-center gap-2 text-stone-600"><Globe className="h-4 w-4 text-stone-400" />{guest.nationality}</div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#ece4d5] rounded-lg p-3 text-center border border-stone-300">
              <p className="text-xl font-bold text-stone-900">{guest.totalVisits}</p>
              <p className="text-xs text-stone-500">Visitas</p>
            </div>
            <div className="bg-[#ece4d5] rounded-lg p-3 text-center border border-stone-300">
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(guest.totalSpent)}</p>
              <p className="text-xs text-stone-500">Total gastado</p>
            </div>
            <div className="bg-[#ece4d5] rounded-lg p-3 text-center border border-stone-300">
              <p className="text-sm font-bold text-stone-600">{guest.lastStay ? formatDate(guest.lastStay) : "—"}</p>
              <p className="text-xs text-stone-500">Última visita</p>
            </div>
          </div>

          {/* Reservation History */}
          {fullGuest?.reservations && fullGuest.reservations.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Historial de estancias</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {fullGuest.reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-[#ece4d5] rounded-lg border border-stone-300 text-sm">
                    <div>
                      <p className="text-stone-900">{r.bed.name} · {r.bed.roomName}</p>
                      <p className="text-xs text-stone-500">{formatDate(r.checkIn)} → {formatDate(r.checkOut)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600">{formatCurrency(r.totalAmount)}</span>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GuestsClient() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guests?search=${encodeURIComponent(search)}`);
      if (res.ok) setGuests(await res.json());
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "Nunito, sans-serif" }}>
            Huéspedes
          </h1>
          <p className="text-stone-500 text-sm">{guests.length} huéspedes registrados</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Nuevo Huésped
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
        <Input placeholder="Buscar huésped..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Grid */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}
      {!loading && guests.length === 0 && (
        <EmptyState
          title={search ? "Sin resultados" : "Aún no hay huéspedes"}
          description={
            search
              ? "No encontramos huéspedes con ese nombre."
              : "Registra a tu primer huésped o se crearán solos al hacer reservaciones."
          }
          action={
            !search ? (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Nuevo Huésped
              </Button>
            ) : undefined
          }
        />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!loading && guests.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGuest(g)}
            className="text-left bg-[#ffffff] border border-stone-200 rounded-xl p-4 hover:border-[#e94560]/40 hover:bg-[#f0e8d9] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e94560]/10 text-[#e94560] font-bold text-sm flex-shrink-0">
                {g.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600 font-medium">{formatCurrency(g.totalSpent)}</p>
                <p className="text-xs text-stone-400">{g.totalVisits} visita{g.totalVisits !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <p className="font-semibold text-stone-900">{g.name}</p>
            {g.nationality && <p className="text-xs text-stone-500 mt-0.5">{g.nationality}</p>}
            {g.email && <p className="text-xs text-stone-400 mt-0.5 truncate">{g.email}</p>}
            {g.lastStay && <p className="text-xs text-stone-400 mt-1">Última visita: {formatDate(g.lastStay)}</p>}
          </button>
        ))}
      </div>

      <GuestFormDialog open={showForm} onClose={() => setShowForm(false)} onSaved={fetchGuests} />
      <GuestProfileDialog guest={selectedGuest} open={!!selectedGuest} onClose={() => setSelectedGuest(null)} />
    </div>
  );
}
