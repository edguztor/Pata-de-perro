"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Hotel, DollarSign, Phone, Mail, MapPin } from "lucide-react";

interface Settings {
  hostel_name: string;
  hostel_address: string;
  hostel_phone: string;
  hostel_email: string;
  dorm_price_per_night: string;
  private_price_per_night: string;
}

const defaultSettings: Settings = {
  hostel_name: "Pata de Perro Hostel",
  hostel_address: "Centro Histórico, Querétaro, México",
  hostel_phone: "+52 442 000 0000",
  hostel_email: "hola@patadeperro.mx",
  dorm_price_per_night: "200",
  private_price_per_night: "650",
};

export function SettingsClient() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => setSettings({ ...defaultSettings, ...data }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((s) => ({ ...s, [key]: e.target.value }));

  if (loading) return <div className="text-slate-400 text-center py-20">Cargando...</div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
          Configuración
        </h1>
        <p className="text-slate-400 text-sm">Administra la información y precios del hostal</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hostel Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Hotel className="h-4 w-4 text-[#e94560]" />
              Información del Hostal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nombre del hostal</Label>
              <Input value={settings.hostel_name} onChange={set("hostel_name")} placeholder="Pata de Perro Hostel" />
            </div>
            <div className="space-y-1">
              <Label><MapPin className="inline h-3 w-3 mr-1" />Dirección</Label>
              <Input value={settings.hostel_address} onChange={set("hostel_address")} placeholder="Dirección completa" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label><Phone className="inline h-3 w-3 mr-1" />Teléfono</Label>
                <Input value={settings.hostel_phone} onChange={set("hostel_phone")} placeholder="+52 442 000 0000" />
              </div>
              <div className="space-y-1">
                <Label><Mail className="inline h-3 w-3 mr-1" />Email</Label>
                <Input type="email" value={settings.hostel_email} onChange={set("hostel_email")} placeholder="hola@hostal.mx" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              Precios (MXN por noche)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Cama en dormitorio</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={settings.dorm_price_per_night}
                    onChange={set("dorm_price_per_night")}
                    min="0"
                    placeholder="200"
                  />
                </div>
                <p className="text-xs text-slate-500">Para las 28 camas de dormitorio</p>
              </div>
              <div className="space-y-1">
                <Label>Cuarto privado / Airbnb</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                  <Input
                    type="number"
                    className="pl-7"
                    value={settings.private_price_per_night}
                    onChange={set("private_price_per_night")}
                    min="0"
                    placeholder="650"
                  />
                </div>
                <p className="text-xs text-slate-500">Para el cuarto privado</p>
              </div>
            </div>

            {/* Visual summary */}
            <div className="mt-4 p-4 bg-[#0d1627] rounded-lg border border-slate-700">
              <p className="text-xs text-slate-400 mb-2">Ingresos máximos potenciales por noche:</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">28 camas dorm × ${settings.dorm_price_per_night}</span>
                <span className="text-sm text-emerald-400 font-medium">
                  ${(28 * parseFloat(settings.dorm_price_per_night || "0")).toLocaleString("es-MX")} MXN
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-slate-300">1 cuarto privado × ${settings.private_price_per_night}</span>
                <span className="text-sm text-purple-400 font-medium">
                  ${parseFloat(settings.private_price_per_night || "0").toLocaleString("es-MX")} MXN
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700">
                <span className="text-sm font-medium text-white">Total máximo / noche</span>
                <span className="text-base text-white font-bold">
                  ${(28 * parseFloat(settings.dorm_price_per_night || "0") + parseFloat(settings.private_price_per_night || "0")).toLocaleString("es-MX")} MXN
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          <Save className="h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </form>
    </div>
  );
}
