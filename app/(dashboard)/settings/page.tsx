import { SettingsClient } from "@/components/settings/settings-client";
export const dynamic = "force-dynamic";
export const metadata = { title: "Configuración — Pata de Perro" };

export default function SettingsPage() {
  return <SettingsClient />;
}
