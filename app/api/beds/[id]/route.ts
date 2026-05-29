import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  try {
    const { id } = await params;
    const bed = await prisma.bed.findUnique({
      where: { id: parseInt(id) },
      include: {
        reservations: {
          include: { guest: true },
          orderBy: { checkIn: "desc" },
          take: 10,
        },
      },
    });
    if (!bed) return NextResponse.json({ error: "Cama no encontrada" }, { status: 404 });
    return NextResponse.json(bed);
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
    const bed = await prisma.bed.update({
      where: { id: parseInt(id) },
      data: { pricePerNight: body.pricePerNight },
    });
    return NextResponse.json(bed);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error updating bed" }, { status: 500 });
  }
}
