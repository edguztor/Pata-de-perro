import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: parseInt(id) },
      include: { guest: true, bed: true },
    });
    if (!reservation) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(reservation);
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

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.checkIn !== undefined) updateData.checkIn = new Date(body.checkIn);
    if (body.checkOut !== undefined) updateData.checkOut = new Date(body.checkOut);
    if (body.pricePerNight !== undefined) {
      updateData.pricePerNight = body.pricePerNight;
      if (body.checkIn && body.checkOut) {
        const nights = Math.max(1, Math.round((new Date(body.checkOut).getTime() - new Date(body.checkIn).getTime()) / (1000 * 60 * 60 * 24)));
        updateData.totalAmount = body.pricePerNight * nights;
      }
    }

    const reservation = await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { guest: true, bed: true },
    });
    return NextResponse.json(reservation);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  try {
    const { id } = await params;
    await prisma.reservation.update({
      where: { id: parseInt(id) },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error cancelling" }, { status: 500 });
  }
}
