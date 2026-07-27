import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Categories
  const makanan = await prisma.category.upsert({
    where: { slug: "makanan" },
    update: {},
    create: {
      name: "Makanan",
      slug: "makanan",
      description: "Menu makanan utama",
    },
  });

  const minuman = await prisma.category.upsert({
    where: { slug: "minuman" },
    update: {},
    create: {
      name: "Minuman",
      slug: "minuman",
      description: "Menu minuman segar",
    },
  });

  const snack = await prisma.category.upsert({
    where: { slug: "snack" },
    update: {},
    create: {
      name: "Snack",
      slug: "snack",
      description: "Cemilan ringan",
    },
  });

  // Menu Items
  const menuItems = [
    { name: "Nasi Goreng Spesial", price: 25000, categoryId: makanan.id, description: "Nasi goreng dengan telur, ayam, dan sayuran" },
    { name: "Mie Goreng", price: 22000, categoryId: makanan.id, description: "Mie goreng dengan ayam dan sayuran" },
    { name: "Ayam Geprek", price: 28000, categoryId: makanan.id, description: "Ayam geprek dengan sambal pedas" },
    { name: "Es Teh Manis", price: 5000, categoryId: minuman.id, description: "Teh manis dingin" },
    { name: "Es Jeruk", price: 8000, categoryId: minuman.id, description: "Jeruk peras segar" },
    { name: "Kopi Hitam", price: 10000, categoryId: minuman.id, description: "Kopi hitam tanpa gula" },
    { name: "Pisang Goreng", price: 12000, categoryId: snack.id, description: "Pisang goreng crispy" },
    { name: "Kentang Goreng", price: 15000, categoryId: snack.id, description: "Kentang goreng dengan saus" },
  ];

  for (const item of menuItems) {
    const slug = item.name.toLowerCase().replace(/\s+/g, "-");
    await prisma.menuItem.upsert({
      where: { slug },
      update: {},
      create: { ...item, slug },
    });
  }

  // Tables
  for (let i = 1; i <= 10; i++) {
    await prisma.restaurantTable.upsert({
      where: { number: i },
      update: {},
      create: { number: i, capacity: i <= 4 ? 4 : i <= 8 ? 6 : 8 },
    });
  }

  // Admin user (contoh)
  await prisma.user.upsert({
    where: { email: "admin@pakresto.unikom" },
    update: {},
    create: {
      email: "admin@pakresto.unikom",
      name: "Admin Resto",
      role: Role.ADMIN,
      phone: "081234567890",
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   - ${await prisma.category.count()} categories`);
  console.log(`   - ${await prisma.menuItem.count()} menu items`);
  console.log(`   - ${await prisma.restaurantTable.count()} tables`);
  console.log(`   - ${await prisma.user.count()} users`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
