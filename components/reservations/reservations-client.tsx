"use client";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "./status-badge";
import { ReservationFormDialog } from "./reservation-form-dialog";
import { formatDate, formatCurrency, getNights } from "@/lib/utils";
import { Plus, Search, LogIn, LogOut, X, ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface Reservation {
  id: number;
  status: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  pricePerNight: number;
  notes?: string;
  createdAt: string;
  guest: { id: number; name: string; email?: string; phone?: string };
  bed: { id: number; name: string; roomName: string; type: string };
}

export function ReservationsClient() {
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [initialBedId, setInitialBedId] = useState<string>();

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), search, status: statusFilter });
      const res = await fetch(`/api/reservations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations);
        setTotal(data.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  useEffect(() => {
    const newParam = searchParams.get("new");
    const bedId = searchParams.get("bedId");
    if (newParam === "1") {
      setInitialBedId(bedId ?? undefined);
      setShowForm(true);
    }
  }, [searchParams]);

  const handleStatusChange = async (id: number, newStatus: string, guestName: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        newStatus === "CHECKED_IN"
          ? `Check-in de ${guestName} completado`
          : newStatus === "CHECKED_OUT"
          ? `Check-out de ${guestName} completado`
          : `Reservación cancelada`
      );
      fetchReservations();
    } catch {
      toast.error("Error al actualizar la reservación");
    }
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "Nunito, sans-serif" }}>
            Reservaciones
          </h1>
          <p className="text-stone-500 text-sm">{total} reservaciones en total</p>
        </div>
        <Button onClick={() => { setInitialBedId(undefined); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          Nueva Reservación
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <Input
            placeholder="Buscar por huésped..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="RESERVED">Reservadas</SelectItem>
            <SelectItem value="CHECKED_IN">Check-in</SelectItem>
            <SelectItem value="CHECKED_OUT">Check-out</SelectItem>
            <SelectItem value="CANCELLED">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-[#ffffff]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-[#ece4d5]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Huésped</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Cama</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Check-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Check-out</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Noches</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={`sk-${i}`} className="border-b border-stone-300/30">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td>
                  ))}
                </tr>
              ))}
              {!loading && reservations.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title={search || statusFilter !== "ALL" ? "Sin resultados" : "Aún no hay reservaciones"}
                      description={
                        search || statusFilter !== "ALL"
                          ? "Prueba con otro nombre o cambia el filtro de estado."
                          : "Crea tu primera reservación para empezar a llenar el hostal."
                      }
                      action={
                        !search && statusFilter === "ALL" ? (
                          <Button onClick={() => { setInitialBedId(undefined); setShowForm(true); }}>
                            <Plus className="h-4 w-4" />
                            Nueva Reservación
                          </Button>
                        ) : undefined
                      }
                    />
                  </td>
                </tr>
              )}
              {!loading && reservations.map((r) => (
                <tr key={r.id} className="border-b border-stone-300/30 hover:bg-stone-100/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{r.guest.name}</p>
                    {r.guest.email && <p className="text-xs text-stone-500">{r.guest.email}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-stone-900">{r.bed.name}</p>
                    <p className="text-xs text-stone-500">{r.bed.roomName}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(r.checkIn)}</td>
                  <td className="px-4 py-3 text-stone-600">{formatDate(r.checkOut)}</td>
                  <td className="px-4 py-3 text-stone-600">{getNights(r.checkIn, r.checkOut)}</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(r.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === "RESERVED" && (
                        <Button size="sm" variant="success" onClick={() => handleStatusChange(r.id, "CHECKED_IN", r.guest.name)}>
                          <LogIn className="h-3 w-3" />
                        </Button>
                      )}
                      {r.status === "CHECKED_IN" && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(r.id, "CHECKED_OUT", r.guest.name)}>
                          <LogOut className="h-3 w-3" />
                        </Button>
                      )}
                      {(r.status === "RESERVED" || r.status === "CHECKED_IN") && (
                        <Button size="sm" variant="destructive" onClick={() => handleStatusChange(r.id, "CANCELLED", r.guest.name)}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200">
            <p className="text-xs text-stone-500">Página {page} de {totalPages} ({total} total)</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ReservationFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={fetchReservations}
        initialBedId={initialBedId}
      />
    </div>
  );
}
