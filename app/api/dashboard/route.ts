import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

export async function GET() {
  await ensureInitialized();
  try {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const [totalBeds, checkedIn, reserved, todayRevenue, upcomingCheckouts, recentActivity] = await Promise.all([
      prisma.bed.count(),
      prisma.reservation.count({ where: { status: "CHECKED_IN" } }),
      prisma.reservation.count({ where: { status: "RESERVED" } }),
      prisma.reservation.aggregate({
        where: {
          status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
          checkIn: { gte: todayStart, lte: todayEnd },
        },
        _sum: { totalAmount: true },
      }),
      prisma.reservation.findMany({
        where: {
          status: "CHECKED_IN",
          checkOut: { gte: todayStart, lte: endOfDay(subDays(today, -3)) },
        },
        include: { guest: true, bed: true },
        orderBy: { checkOut: "asc" },
        take: 10,
      }),
      prisma.reservation.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { guest: true, bed: true },
      }),
    ]);

    // Last 7 days revenue data
    const last7Days = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i);
        return prisma.reservation.aggregate({
          where: {
            status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
            checkIn: { gte: startOfDay(d), lte: endOfDay(d) },
          },
          _sum: { totalAmount: true },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }).then((r: any) => ({
          date: format(d, "dd/MM"),
          revenue: r._sum.totalAmount ?? 0,
        }));
      })
    );

    // Occupancy for last 7 days
    const occupancyData = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const d = subDays(today, 6 - i);
        return prisma.reservation.count({
          where: {
            status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
            checkIn: { lte: endOfDay(d) },
            checkOut: { gte: startOfDay(d) },
          },
        }).then((count) => ({
          date: format(d, "dd/MM"),
          occupancy: Math.round((count / totalBeds) * 100),
          count,
        }));
      })
    );

    const weekRevenue = await prisma.reservation.aggregate({
      where: {
        status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
        checkIn: { gte: startOfDay(subDays(today, 7)) },
      },
      _sum: { totalAmount: true },
    });

    const monthRevenue = await prisma.reservation.aggregate({
      where: {
        status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
        checkIn: { gte: startOfDay(subDays(today, 30)) },
      },
      _sum: { totalAmount: true },
    });

    return NextResponse.json({
      kpis: {
        totalBeds,
        checkedIn,
        reserved,
        available: totalBeds - checkedIn - reserved,
        occupancyRate: Math.round((checkedIn / totalBeds) * 100),
        todayRevenue: todayRevenue._sum.totalAmount ?? 0,
        weekRevenue: weekRevenue._sum.totalAmount ?? 0,
        monthRevenue: monthRevenue._sum.totalAmount ?? 0,
      },
      revenueChart: last7Days,
      occupancyChart: occupancyData,
      recentActivity,
      upcomingCheckouts,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching dashboard data" }, { status: 500 });
  }
}
