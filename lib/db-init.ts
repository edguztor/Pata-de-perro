import { prisma } from "./prisma";
import { hashPassword } from "./auth";

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "Bed" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DORM',
    "position" TEXT NOT NULL DEFAULT 'BOTTOM',
    "bunkNumber" INTEGER,
    "floor" INTEGER NOT NULL,
    "room" INTEGER NOT NULL,
    "roomName" TEXT NOT NULL,
    "pricePerNight" REAL NOT NULL DEFAULT 350,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Guest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "nationality" TEXT,
    "idNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Reservation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guestId" INTEGER NOT NULL,
    "bedId" INTEGER NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RESERVED',
    "totalAmount" REAL NOT NULL,
    "pricePerNight" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("guestId") REFERENCES "Guest" ("id"),
    FOREIGN KEY ("bedId") REFERENCES "Bed" ("id")
  )`,
  `CREATE TABLE IF NOT EXISTS "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Setting_key_key" ON "Setting"("key")`,
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'RECEPTIONIST',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username")`,
];

async function ensureSchema() {
  for (const stmt of SCHEMA_STATEMENTS) {
    await prisma.$executeRawUnsafe(stmt);
  }
  console.log("[db-init] Schema ensured");
}

async function seedDatabase() {
  console.log("[db-init] Seeding database...");

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
  console.log(`[db-init] Created ${beds.length} beds`);
}

async function seedAdminUser() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const name = process.env.SEED_ADMIN_NAME ?? "Administrador";
  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { username, name, passwordHash, role: "ADMIN" },
  });
  console.log(`[db-init] Created admin user "${username}"`);
}

let initialized = false;

export async function ensureInitialized() {
  if (initialized) return;
  await ensureSchema();
  const count = await prisma.bed.count();
  if (count === 0) {
    await seedDatabase();
  }
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await seedAdminUser();
  }
  initialized = true;
}
