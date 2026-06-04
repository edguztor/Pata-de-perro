import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET(req: NextRequest) {
  await ensureInitialized();
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "25");

    const where = {
      ...(status && status !== "ALL" ? { status } : {}),
      ...(search
        ? {
            guest: {
              name: { contains: search },
            },
          }
        : {}),
    };

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: { guest: true, bed: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ]);

    return NextResponse.json({ reservations, total, page, limit });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching reservations" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureInitialized();
  try {
    const body = await req.json();
    const { guestId, guestName, guestEmail, guestPhone, guestNationality, bedId, checkIn, checkOut, pricePerNight, notes } = body;

    let gId = guestId;
    if (!gId && guestName) {
      const newGuest = await prisma.guest.create({
        data: { name: guestName, email: guestEmail, phone: guestPhone, nationality: guestNationality },
      });
      gId = newGuest.id;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

    const bed = await prisma.bed.findUnique({ where: { id: parseInt(bedId) } });
    if (!bed) return NextResponse.json({ error: "Cama no encontrada" }, { status: 404 });

    // Block double-booking: reject if any active reservation overlaps the requested dates
    const overlap = await prisma.reservation.findFirst({
      where: {
        bedId: parseInt(bedId),
        status: { notIn: ["CANCELLED", "CHECKED_OUT"] },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
      include: { guest: true },
    });
    if (overlap) {
      return NextResponse.json(
        {
          error: "La cama ya está reservada en esas fechas",
          conflict: true,
          guest: overlap.guest.name,
          checkIn: overlap.checkIn,
          checkOut: overlap.checkOut,
        },
        { status: 409 }
      );
    }

    const price = pricePerNight ?? bed.pricePerNight;

    const reservation = await prisma.reservation.create({
      data: {
        guestId: gId,
        bedId: parseInt(bedId),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: "RESERVED",
        pricePerNight: price,
        totalAmount: price * nights,
        notes,
      },
      include: { guest: true, bed: true },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error creating reservation" }, { status: 500 });
  }
}
