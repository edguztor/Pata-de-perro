import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureInitialized } from "@/lib/db-init";

export async function GET() {
  await ensureInitialized();
  try {
    const settings = await prisma.setting.findMany();
    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json(map);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await ensureInitialized();
  try {
    const body = await req.json();
    const updates = Object.entries(body as Record<string, string>);
    await Promise.all(
      updates.map(([key, value]) =>
        prisma.setting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error saving settings" }, { status: 500 });
  }
}
