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

export async function GET() {
  await ensureInitialized();
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const users = await prisma.user.findMany({
    select: { id: true, username: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  await ensureInitialized();
  if (!(await requireAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  try {
    const { username, name, password, role } = await req.json();
    if (!username || !name || !password) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }
    if (String(password).length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }
    const normalizedRole: Role = role === "ADMIN" ? "ADMIN" : "RECEPTIONIST";
    const existing = await prisma.user.findUnique({ where: { username: String(username).trim() } });
    if (existing) return NextResponse.json({ error: "Ese usuario ya existe" }, { status: 409 });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username: String(username).trim(), name, passwordHash, role: normalizedRole },
      select: { id: true, username: true, name: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
