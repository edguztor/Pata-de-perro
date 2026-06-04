"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Mascot } from "@/components/brand/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, LogIn } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo iniciar sesión");
        return;
      }
      const from = params.get("from");
      // Full navigation so the proxy re-evaluates with the new cookie.
      window.location.href = from && from.startsWith("/") ? from : "/";
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f4efe4] via-[#efe8db] to-[#ece4d5] px-4">
      {/* decorative blobs */}
      <div className="pointer-events-none fixed -top-20 -right-20 h-64 w-64 rounded-full bg-[#e94560]/8 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl bg-white border border-stone-200 shadow-xl shadow-stone-300/30 overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center gap-3 px-8 pt-8 pb-6 bg-gradient-to-b from-white to-[#faf6ee]">
            <Logo className="h-14 w-auto" />
            <div className="flex items-center gap-2 text-stone-400">
              <Mascot className="h-9 w-9 animate-bob" tintClass="text-stone-600" />
              <p className="text-sm font-medium">Panel de administración</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                autoFocus
                autoComplete="username"
                placeholder="tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="h-4 w-4" />
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-stone-400">
          Pata de Perro Hostel · Querétaro 🐾
        </p>
      </div>
    </div>
  );
}
