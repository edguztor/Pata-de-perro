import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET(req: NextRequest) {
  await ensureInitialized();
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? "";

    const guests = await prisma.guest.findMany({
      where: search ? { name: { contains: search } } : undefined,
      include: {
        reservations: {
          select: { id: true, checkIn: true, status: true, totalAmount: true },
          orderBy: { checkIn: "desc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const withStats = guests.map((g) => ({
      ...g,
      totalVisits: g.reservations.filter((r) => r.status !== "CANCELLED").length,
      totalSpent: g.reservations.filter((r) => r.status !== "CANCELLED").reduce((s, r) => s + r.totalAmount, 0),
      lastStay: g.reservations.find((r) => r.status === "CHECKED_OUT")?.checkIn ?? null,
    }));

    return NextResponse.json(withStats);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureInitialized();
  try {
    const body = await req.json();
    const guest = await prisma.guest.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        nationality: body.nationality,
        idNumber: body.idNumber,
      },
    });
    return NextResponse.json(guest, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error creating guest" }, { status: 500 });
  }
}
