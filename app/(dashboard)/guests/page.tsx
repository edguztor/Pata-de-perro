import { GuestsClient } from "@/components/guests/guests-client";
export const dynamic = "force-dynamic";
export const metadata = { title: "Huéspedes — Pata de Perro" };

export default function GuestsPage() {
  return <GuestsClient />;
}
