import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";
import { verifyPassword, createSessionToken, sessionCookieName, sessionMaxAge, type Role } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await ensureInitialized();
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username: String(username).trim() } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const token = await createSessionToken({
      sub: user.id,
      username: user.username,
      name: user.name,
      role: user.role as Role,
    });

    const res = NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
    res.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionMaxAge,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 });
  }
}
