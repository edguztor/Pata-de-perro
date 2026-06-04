import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";
import { startOfDay, endOfDay, subDays, format, startOfWeek, startOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";
import { es } from "date-fns/locale";

export async function GET(req: NextRequest) {
  await ensureInitialized();
  try {
    const { searchParams } = req.nextUrl;
    const granularity = searchParams.get("granularity") ?? "daily";
    const daysBack = parseInt(searchParams.get("days") ?? "30");

    const endDate = new Date();
    const startDate = subDays(endDate, daysBack);

    const reservations = await prisma.reservation.findMany({
      where: {
        status: { in: ["CHECKED_IN", "CHECKED_OUT"] },
        checkIn: { gte: startOfDay(startDate) },
      },
      include: { bed: { select: { type: true } } },
    });

    if (granularity === "daily") {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      const data = days.map((day) => {
        const dayRes = reservations.filter((r) => {
          const ci = new Date(r.checkIn);
          return ci >= startOfDay(day) && ci <= endOfDay(day);
        });
        return {
          period: format(day, "dd/MM", { locale: es }),
          revenue: dayRes.reduce((s, r) => s + r.totalAmount, 0),
          dormRevenue: dayRes.filter((r) => r.bed.type === "DORM").reduce((s, r) => s + r.totalAmount, 0),
          privateRevenue: dayRes.filter((r) => r.bed.type === "PRIVATE").reduce((s, r) => s + r.totalAmount, 0),
          count: dayRes.length,
        };
      });
      return NextResponse.json(data);
    }

    if (granularity === "weekly") {
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });
      const data = weeks.map((week) => {
        const weekEnd = endOfDay(subDays(new Date(week.getTime() + 7 * 24 * 60 * 60 * 1000), 1));
        const weekRes = reservations.filter((r) => {
          const ci = new Date(r.checkIn);
          return ci >= startOfWeek(week, { weekStartsOn: 1 }) && ci <= weekEnd;
        });
        return {
          period: `Sem ${format(week, "dd/MM", { locale: es })}`,
          revenue: weekRes.reduce((s, r) => s + r.totalAmount, 0),
          dormRevenue: weekRes.filter((r) => r.bed.type === "DORM").reduce((s, r) => s + r.totalAmount, 0),
          privateRevenue: weekRes.filter((r) => r.bed.type === "PRIVATE").reduce((s, r) => s + r.totalAmount, 0),
          count: weekRes.length,
        };
      });
      return NextResponse.json(data);
    }

    // Monthly
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    const data = months.map((month) => {
      const monthRes = reservations.filter((r) => {
        const ci = new Date(r.checkIn);
        return ci >= startOfMonth(month) && ci.getMonth() === month.getMonth() && ci.getFullYear() === month.getFullYear();
      });
      return {
        period: format(month, "MMM yyyy", { locale: es }),
        revenue: monthRes.reduce((s, r) => s + r.totalAmount, 0),
        dormRevenue: monthRes.filter((r) => r.bed.type === "DORM").reduce((s, r) => s + r.totalAmount, 0),
        privateRevenue: monthRes.filter((r) => r.bed.type === "PRIVATE").reduce((s, r) => s + r.totalAmount, 0),
        count: monthRes.length,
      };
    });
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error fetching revenue" }, { status: 500 });
  }
}
