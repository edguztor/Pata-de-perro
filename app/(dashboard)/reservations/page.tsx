import { Suspense } from "react";
import { ReservationsClient } from "@/components/reservations/reservations-client";
export const dynamic = "force-dynamic";
export const metadata = { title: "Reservaciones — Pata de Perro" };

export default function ReservationsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-center py-20">Cargando reservaciones...</div>}>
      <ReservationsClient />
    </Suspense>
  );
}
