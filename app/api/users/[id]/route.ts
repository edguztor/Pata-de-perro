import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";
import { getSession } from "@/lib/session";
import { hashPassword, type Role } from "@/lib/auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const { name, password, role } = await req.json();

    const data: { name?: string; passwordHash?: string; role?: Role } = {};
    if (name) data.name = name;
    if (role) data.role = role === "ADMIN" ? "ADMIN" : "RECEPTIONIST";
    if (password) {
      if (String(password).length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
      }
      data.passwordHash = await hashPassword(password);
    }

    // Don't allow demoting the last admin.
    if (data.role === "RECEPTIONIST") {
      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (target?.role === "ADMIN") {
        const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) {
          return NextResponse.json({ error: "Debe quedar al menos un administrador" }, { status: 400 });
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (userId === session.sub) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta" }, { status: 400 });
    }
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (target?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Debe quedar al menos un administrador" }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}
