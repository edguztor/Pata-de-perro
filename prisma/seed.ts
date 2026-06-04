import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { addDays, subDays, startOfDay } from "date-fns";
import { hashPassword } from "../lib/auth";

const url = process.env.DATABASE_URL ?? `file:${process.cwd()}/prisma/dev.db`;
const authToken = process.env.DATABASE_AUTH_TOKEN;
const adapter = authToken ? new PrismaLibSql({ url, authToken }) : new PrismaLibSql({ url });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.reservation.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  // Default admin account (override with SEED_ADMIN_* env vars).
  await prisma.user.create({
    data: {
      username: process.env.SEED_ADMIN_USERNAME ?? "admin",
      name: process.env.SEED_ADMIN_NAME ?? "Administrador",
      passwordHash: await hashPassword(process.env.SEED_ADMIN_PASSWORD ?? "admin123"),
      role: "ADMIN",
    },
  });

  await prisma.setting.createMany({
    data: [
      { key: "hostel_name", value: "Pata de Perro Hostel" },
      { key: "hostel_address", value: "Centro Histórico, Querétaro, México" },
      { key: "hostel_phone", value: "+52 442 000 0000" },
      { key: "hostel_email", value: "hola@patadeperro.mx" },
      { key: "dorm_price_per_night", value: "350" },
      { key: "private_price_per_night", value: "850" },
    ],
  });

  const beds = [];

  // Room 1 - Floor 1 - 4 bunks (beds 1-8)
  for (let bunk = 1; bunk <= 4; bunk++) {
    const bedNum = (bunk - 1) * 2 + 1;
    beds.push({ number: bedNum, name: `H1-P1-L${bunk}A`, type: "DORM", position: "BOTTOM", bunkNumber: bunk, floor: 1, room: 1, roomName: "Hab. Mixta 1", pricePerNight: 350 });
    beds.push({ number: bedNum + 1, name: `H1-P1-L${bunk}B`, type: "DORM", position: "TOP", bunkNumber: bunk, floor: 1, room: 1, roomName: "Hab. Mixta 1", pricePerNight: 350 });
  }

  // Room 1 - Floor 2 - 4 bunks (beds 9-16)
  for (let bunk = 1; bunk <= 4; bunk++) {
    const bedNum = 8 + (bunk - 1) * 2 + 1;
    beds.push({ number: bedNum, name: `H1-P2-L${bunk}A`, type: "DORM", position: "BOTTOM", bunkNumber: bunk, floor: 2, room: 1, roomName: "Hab. Mixta 1", pricePerNight: 350 });
    beds.push({ number: bedNum + 1, name: `H1-P2-L${bunk}B`, type: "DORM", position: "TOP", bunkNumber: bunk, floor: 2, room: 1, roomName: "Hab. Mixta 1", pricePerNight: 350 });
  }

  // Room 2 - Floor 1 - 3 bunks (beds 17-22)
  for (let bunk = 1; bunk <= 3; bunk++) {
    const bedNum = 16 + (bunk - 1) * 2 + 1;
    beds.push({ number: bedNum, name: `H2-P1-L${bunk}A`, type: "DORM", position: "BOTTOM", bunkNumber: bunk, floor: 1, room: 2, roomName: "Hab. Mixta 2", pricePerNight: 350 });
    beds.push({ number: bedNum + 1, name: `H2-P1-L${bunk}B`, type: "DORM", position: "TOP", bunkNumber: bunk, floor: 1, room: 2, roomName: "Hab. Mixta 2", pricePerNight: 350 });
  }

  // Room 2 - Floor 2 - 3 bunks (beds 23-28)
  for (let bunk = 1; bunk <= 3; bunk++) {
    const bedNum = 22 + (bunk - 1) * 2 + 1;
    beds.push({ number: bedNum, name: `H2-P2-L${bunk}A`, type: "DORM", position: "BOTTOM", bunkNumber: bunk, floor: 2, room: 2, roomName: "Hab. Mixta 2", pricePerNight: 350 });
    beds.push({ number: bedNum + 1, name: `H2-P2-L${bunk}B`, type: "DORM", position: "TOP", bunkNumber: bunk, floor: 2, room: 2, roomName: "Hab. Mixta 2", pricePerNight: 350 });
  }

  // Private Room
  beds.push({ number: 29, name: "Privado", type: "PRIVATE", position: "SINGLE", bunkNumber: null, floor: 1, room: 3, roomName: "Cuarto Privado", pricePerNight: 850 });

  await prisma.bed.createMany({ data: beds });
  console.log(`✅ Created ${beds.length} beds`);

  const allBeds = await prisma.bed.findMany({ orderBy: { number: "asc" } });

  const guestData = [
    { name: "Carlos Ramírez", email: "carlos@gmail.com", phone: "+52 442 111 2233", nationality: "Mexicano" },
    { name: "Ana Martínez", email: "ana.m@outlook.com", phone: "+52 55 9876 5432", nationality: "Mexicana" },
    { name: "Lucas Schneider", email: "l.schneider@mail.de", phone: "+49 176 12345678", nationality: "Alemán" },
    { name: "Sofia Bianchi", email: "sofiab@email.it", phone: "+39 333 1234567", nationality: "Italiana" },
    { name: "James Wilson", email: "jwilson@gmail.com", phone: "+1 555 234 5678", nationality: "Estadounidense" },
    { name: "María González", email: "mariag@proton.me", phone: "+52 442 555 6677", nationality: "Mexicana" },
    { name: "Yuki Tanaka", email: "yuki.t@yahoo.co.jp", phone: "+81 90-1234-5678", nationality: "Japonesa" },
    { name: "Diego Herrera", email: "dherrera@gmail.com", phone: "+52 33 1234 5678", nationality: "Mexicano" },
    { name: "Emma Dubois", email: "emma.d@laposte.fr", phone: "+33 6 12 34 56 78", nationality: "Francesa" },
    { name: "Pablo Rodríguez", email: "pablor@mail.com", phone: "+54 11 1234-5678", nationality: "Argentino" },
    { name: "Lena Mueller", email: "lena.m@web.de", phone: "+49 151 23456789", nationality: "Alemana" },
    { name: "Kevin O'Brien", email: "kobrien@gmail.com", phone: "+353 87 123 4567", nationality: "Irlandés" },
  ];

  const guests = await Promise.all(guestData.map((g) => prisma.guest.create({ data: g })));
  console.log(`✅ Created ${guests.length} guests`);

  const today = startOfDay(new Date());

  const reservations = [
    { guestIdx: 0, bedNum: 1, checkIn: subDays(today, 2), checkOut: addDays(today, 1), status: "CHECKED_IN" },
    { guestIdx: 1, bedNum: 2, checkIn: subDays(today, 1), checkOut: addDays(today, 2), status: "CHECKED_IN" },
    { guestIdx: 2, bedNum: 5, checkIn: subDays(today, 3), checkOut: addDays(today, 1), status: "CHECKED_IN" },
    { guestIdx: 3, bedNum: 7, checkIn: today, checkOut: addDays(today, 3), status: "CHECKED_IN" },
    { guestIdx: 4, bedNum: 9, checkIn: subDays(today, 1), checkOut: addDays(today, 2), status: "CHECKED_IN" },
    { guestIdx: 5, bedNum: 29, checkIn: subDays(today, 2), checkOut: addDays(today, 3), status: "CHECKED_IN" },
    { guestIdx: 6, bedNum: 11, checkIn: addDays(today, 1), checkOut: addDays(today, 4), status: "RESERVED" },
    { guestIdx: 7, bedNum: 13, checkIn: addDays(today, 2), checkOut: addDays(today, 5), status: "RESERVED" },
    { guestIdx: 8, bedNum: 17, checkIn: addDays(today, 1), checkOut: addDays(today, 3), status: "RESERVED" },
    { guestIdx: 9, bedNum: 3, checkIn: subDays(today, 10), checkOut: subDays(today, 7), status: "CHECKED_OUT" },
    { guestIdx: 10, bedNum: 4, checkIn: subDays(today, 8), checkOut: subDays(today, 5), status: "CHECKED_OUT" },
    { guestIdx: 11, bedNum: 6, checkIn: subDays(today, 15), checkOut: subDays(today, 12), status: "CHECKED_OUT" },
    { guestIdx: 0, bedNum: 19, checkIn: subDays(today, 20), checkOut: subDays(today, 16), status: "CHECKED_OUT" },
    { guestIdx: 1, bedNum: 21, checkIn: subDays(today, 12), checkOut: subDays(today, 9), status: "CHECKED_OUT" },
    { guestIdx: 2, bedNum: 23, checkIn: subDays(today, 5), checkOut: subDays(today, 3), status: "CHECKED_OUT" },
  ];

  for (const r of reservations) {
    const bed = allBeds.find((b) => b.number === r.bedNum)!;
    const nights = Math.max(1, Math.round((r.checkOut.getTime() - r.checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    await prisma.reservation.create({
      data: {
        guestId: guests[r.guestIdx].id,
        bedId: bed.id,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status,
        pricePerNight: bed.pricePerNight,
        totalAmount: bed.pricePerNight * nights,
      },
    });
  }

  console.log(`✅ Created ${reservations.length} reservations`);
  console.log("✅ Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
