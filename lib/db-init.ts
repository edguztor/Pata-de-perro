import { prisma } from "./prisma";

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

let initialized = false;

export async function ensureInitialized() {
  if (initialized) return;
  const count = await prisma.bed.count();
  if (count === 0) {
    await seedDatabase();
  }
  initialized = true;
}
