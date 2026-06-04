"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, UserPlus, Trash2, KeyRound, Users as UsersIcon } from "lucide-react";

interface AppUser {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "RECEPTIONIST";
  createdAt: string;
}

const ROLE_LABEL = { ADMIN: "Administrador", RECEPTIONIST: "Recepcionista" } as const;

export function UserManagement() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [meId, setMeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [pwUser, setPwUser] = useState<AppUser | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, meRes] = await Promise.all([fetch("/api/users"), fetch("/api/auth/me")]);
      if (uRes.ok) setUsers(await uRes.json());
      if (meRes.ok) setMeId((await meRes.json()).user?.id ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (user: AppUser) => {
    if (!confirm(`¿Eliminar la cuenta de ${user.name}?`)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Usuario eliminado");
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "No se pudo eliminar");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#e94560]" />
            Usuarios y accesos
          </CardTitle>
          <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Nuevo
          </Button>
        </div>
        <p className="text-xs text-stone-400 mt-1">
          El administrador ve todo. El recepcionista solo accede al mapa de camas y reservaciones.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[0, 1].map((i) => <div key={i} className="h-12 rounded-lg animate-shimmer" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2 text-stone-400">
            <UsersIcon className="h-6 w-6" />
            <p className="text-sm">No hay usuarios todavía</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-200">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-2.5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#e94560] to-[#f59e0b] text-xs font-bold text-white">
                  {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">
                    {u.name}
                    {u.id === meId && <span className="text-stone-400 font-normal"> · tú</span>}
                  </p>
                  <p className="text-xs text-stone-500">@{u.username}</p>
                </div>
                <Badge variant={u.role === "ADMIN" ? "reserved" : "secondary"}>{ROLE_LABEL[u.role]}</Badge>
                <button
                  type="button"
                  onClick={() => setPwUser(u)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                  title="Cambiar contraseña"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(u)}
                  disabled={u.id === meId}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-stone-400"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <CreateUserDialog open={createOpen} onClose={() => setCreateOpen(false)} onSaved={load} />
      <ChangePasswordDialog user={pwUser} onClose={() => setPwUser(null)} />
    </Card>
  );
}

function CreateUserDialog({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "RECEPTIONIST">("RECEPTIONIST");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) { setName(""); setUsername(""); setPassword(""); setRole("RECEPTIONIST"); }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password, role }),
      });
      if (res.ok) {
        toast.success("Usuario creado");
        onSaved();
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "No se pudo crear");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Nombre completo</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="María López" required />
          </div>
          <div className="space-y-1">
            <Label>Usuario</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="maria" autoComplete="off" required />
          </div>
          <div className="space-y-1">
            <Label>Contraseña</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" required />
          </div>
          <div className="space-y-1">
            <Label>Rol</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "ADMIN" | "RECEPTIONIST")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEPTIONIST">Recepcionista (solo reservas)</SelectItem>
                <SelectItem value="ADMIN">Administrador (acceso total)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creando..." : "Crear usuario"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordDialog({ user, onClose }: { user: AppUser | null; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPassword(""); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        toast.success("Contraseña actualizada");
        onClose();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "No se pudo actualizar");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña{user ? ` · ${user.name}` : ""}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label>Nueva contraseña</Label>
            <Input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Actualizar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
