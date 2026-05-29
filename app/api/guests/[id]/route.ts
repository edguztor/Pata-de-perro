import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  try {
    const { id } = await params;
    const guest = await prisma.guest.findUnique({
      where: { id: parseInt(id) },
      include: {
        reservations: {
          include: { bed: true },
          orderBy: { checkIn: "desc" },
        },
      },
    });
    if (!guest) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(guest);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  try {
    const { id } = await params;
    const body = await req.json();
    const guest = await prisma.guest.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        nationality: body.nationality,
        idNumber: body.idNumber,
      },
    });
    return NextResponse.json(guest);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error updating guest" }, { status: 500 });
  }
}
