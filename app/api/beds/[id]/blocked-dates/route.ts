import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await ensureInitialized();
  try {
    const { id } = await params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reservations = await prisma.reservation.findMany({
      where: {
        bedId: parseInt(id),
        status: { notIn: ["CANCELLED", "CHECKED_OUT"] },
        checkOut: { gt: today },
      },
      include: { guest: true },
      orderBy: { checkIn: "asc" },
    });

    return NextResponse.json(
      reservations.map((r) => ({
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        guestName: r.guest.name,
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json([], { status: 200 });
  }
}
