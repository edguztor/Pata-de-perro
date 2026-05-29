import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const beds = await prisma.bed.findMany({
      orderBy: { number: "asc" },
      include: {
        reservations: {
          where: {
            status: { in: ["CHECKED_IN", "RESERVED"] },
            checkIn: { lte: endOfDay(today) },
            checkOut: { gte: startOfDay(today) },
          },
          include: { guest: true },
          take: 1,
        },
      },
    });

    const bedsWithStatus = beds.map((bed) => {
      const activeRes = bed.reservations[0];
      let currentStatus = "AVAILABLE";
      if (activeRes) {
        currentStatus = activeRes.status === "CHECKED_IN" ? "OCCUPIED" : "RESERVED";
      }
      return {
        ...bed,
        currentStatus,
        currentReservation: activeRes ?? null,
        reservations: undefined,
      };
    });

    return NextResponse.json(bedsWithStatus);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching beds" }, { status: 500 });
  }
}
