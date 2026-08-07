import { PrismaClient, Role, StatusMenu, StatusBahan, StatusMeja } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Hapus data lama (urutan aman untuk FK)
  await prisma.pembayaran.deleteMany();
  await prisma.detail_pesanan.deleteMany();
  await prisma.pesanan.deleteMany();
  await prisma.menu_bahan.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.bahan_baku.deleteMany();
  await prisma.kategori.deleteMany();
  await prisma.meja.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const [pelayan, chef, kasir, manajer] = await Promise.all([
    prisma.user.create({
      data: {
        nama_lengkap: "Budi Pelayan",
        username: "pelayan",
        password: passwordHash,
        role: Role.PELAYAN,
      },
    }),
    prisma.user.create({
      data: {
        nama_lengkap: "Andi Chef",
        username: "chef",
        password: passwordHash,
        role: Role.CHEF,
      },
    }),
    prisma.user.create({
      data: {
        nama_lengkap: "Siti Kasir",
        username: "kasir",
        password: passwordHash,
        role: Role.KASIR,
      },
    }),
    prisma.user.create({
      data: {
        nama_lengkap: "Rina Manajer",
        username: "manajer",
        password: passwordHash,
        role: Role.MANAJER,
      },
    }),
  ]);

  void chef;
  void kasir;
  void manajer;

  const makanan = await prisma.kategori.create({
    data: {
      nama_kategori: "Makanan",
      deskripsi: "Menu makanan utama",
      warna: "#9D4300",
      aktif: true,
    },
  });

  const minuman = await prisma.kategori.create({
    data: {
      nama_kategori: "Minuman",
      deskripsi: "Menu minuman segar",
      warna: "#2563EB",
      aktif: true,
    },
  });

  const snack = await prisma.kategori.create({
    data: {
      nama_kategori: "Snack",
      deskripsi: "Cemilan ringan",
      warna: "#CA8A04",
      aktif: true,
    },
  });

  const menuItems = await Promise.all([
    prisma.menu.create({
      data: {
        id_kategori: makanan.id_kategori,
        nama_menu: "Nasi Goreng Spesial",
        deskripsi: "Nasi goreng dengan telur, ayam, dan sayuran",
        harga: 25000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/nasi-goreng.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: makanan.id_kategori,
        nama_menu: "Mie Goreng",
        deskripsi: "Mie goreng dengan ayam dan sayuran",
        harga: 22000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/rendang-sapi.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: makanan.id_kategori,
        nama_menu: "Ayam Geprek",
        deskripsi: "Ayam geprek dengan sambal pedas",
        harga: 28000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/ayam-goreng.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: minuman.id_kategori,
        nama_menu: "Es Teh Manis",
        deskripsi: "Teh manis dingin",
        harga: 5000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/lychee-tea.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: minuman.id_kategori,
        nama_menu: "Es Jeruk",
        deskripsi: "Jeruk peras segar",
        harga: 8000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/lychee-tea.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: minuman.id_kategori,
        nama_menu: "Kopi Hitam",
        deskripsi: "Kopi hitam tanpa gula",
        harga: 10000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/iced-cappucino.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: snack.id_kategori,
        nama_menu: "Pisang Goreng",
        deskripsi: "Pisang goreng crispy",
        harga: 12000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/chocolate-lava.png",
      },
    }),
    prisma.menu.create({
      data: {
        id_kategori: snack.id_kategori,
        nama_menu: "Kentang Goreng",
        deskripsi: "Kentang goreng dengan saus",
        harga: 15000,
        status: StatusMenu.AKTIF,
        gambar: "/images/menu/mix-dim-sum.png",
      },
    }),
  ]);

  // Update jumlah_menu per kategori
  await prisma.kategori.update({
    where: { id_kategori: makanan.id_kategori },
    data: { jumlah_menu: 3 },
  });
  await prisma.kategori.update({
    where: { id_kategori: minuman.id_kategori },
    data: { jumlah_menu: 3 },
  });
  await prisma.kategori.update({
    where: { id_kategori: snack.id_kategori },
    data: { jumlah_menu: 2 },
  });

  // Meja
  for (let i = 1; i <= 10; i++) {
    await prisma.meja.create({
      data: {
        nomor_meja: i,
        kapasitas: i <= 4 ? 4 : i <= 8 ? 6 : 8,
        kode_qr: `MEJA-${String(i).padStart(2, "0")}`,
        status: StatusMeja.KOSONG,
      },
    });
  }

  // Bahan baku
  const [beras, mie, ayam, telur, teh, jeruk, kopi, pisang, kentang, minyak] =
    await Promise.all([
      prisma.bahan_baku.create({
        data: { nama_bahan: "Beras", jumlah: 50, satuan: "kg", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Mie", jumlah: 30, satuan: "pack", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Ayam", jumlah: 20, satuan: "kg", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Telur", jumlah: 100, satuan: "butir", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Teh", jumlah: 5, satuan: "kg", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Jeruk", jumlah: 15, satuan: "kg", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Kopi", jumlah: 3, satuan: "kg", status: StatusBahan.MENIPIS },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Pisang", jumlah: 10, satuan: "kg", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Kentang", jumlah: 12, satuan: "kg", status: StatusBahan.TERSEDIA },
      }),
      prisma.bahan_baku.create({
        data: { nama_bahan: "Minyak Goreng", jumlah: 8, satuan: "liter", status: StatusBahan.TERSEDIA },
      }),
    ]);

  const [
    nasiGoreng,
    mieGoreng,
    ayamGeprek,
    esTeh,
    esJeruk,
    kopiHitam,
    pisangGoreng,
    kentangGoreng,
  ] = menuItems;

  // Resep (menu_bahan)
  await prisma.menu_bahan.createMany({
    data: [
      { id_menu: nasiGoreng.id_menu, id_bahan: beras.id_bahan, jumlah_pakai: 0.2 },
      { id_menu: nasiGoreng.id_menu, id_bahan: ayam.id_bahan, jumlah_pakai: 0.1 },
      { id_menu: nasiGoreng.id_menu, id_bahan: telur.id_bahan, jumlah_pakai: 1 },
      { id_menu: nasiGoreng.id_menu, id_bahan: minyak.id_bahan, jumlah_pakai: 0.05 },
      { id_menu: mieGoreng.id_menu, id_bahan: mie.id_bahan, jumlah_pakai: 1 },
      { id_menu: mieGoreng.id_menu, id_bahan: ayam.id_bahan, jumlah_pakai: 0.08 },
      { id_menu: mieGoreng.id_menu, id_bahan: minyak.id_bahan, jumlah_pakai: 0.05 },
      { id_menu: ayamGeprek.id_menu, id_bahan: ayam.id_bahan, jumlah_pakai: 0.25 },
      { id_menu: ayamGeprek.id_menu, id_bahan: minyak.id_bahan, jumlah_pakai: 0.1 },
      { id_menu: esTeh.id_menu, id_bahan: teh.id_bahan, jumlah_pakai: 0.01 },
      { id_menu: esJeruk.id_menu, id_bahan: jeruk.id_bahan, jumlah_pakai: 0.15 },
      { id_menu: kopiHitam.id_menu, id_bahan: kopi.id_bahan, jumlah_pakai: 0.015 },
      { id_menu: pisangGoreng.id_menu, id_bahan: pisang.id_bahan, jumlah_pakai: 0.2 },
      { id_menu: pisangGoreng.id_menu, id_bahan: minyak.id_bahan, jumlah_pakai: 0.05 },
      { id_menu: kentangGoreng.id_menu, id_bahan: kentang.id_bahan, jumlah_pakai: 0.25 },
      { id_menu: kentangGoreng.id_menu, id_bahan: minyak.id_bahan, jumlah_pakai: 0.08 },
    ],
  });

  // Sample pesanan dine-in (opsional demo)
  const meja1 = await prisma.meja.findUnique({ where: { nomor_meja: 1 } });
  if (meja1) {
    await prisma.meja.update({
      where: { id_meja: meja1.id_meja },
      data: { status: StatusMeja.TERISI },
    });

    await prisma.pesanan.create({
      data: {
        id_user: pelayan.id_user,
        id_meja: meja1.id_meja,
        tipe_pesanan: "DINE_IN",
        status_pesanan: "MENUNGGU",
        total_harga: 30000,
        detail_pesanan: {
          create: [
            {
              id_menu: nasiGoreng.id_menu,
              jumlah: 1,
              catatan: "Tidak pedas",
              subtotal: 25000,
            },
            {
              id_menu: esTeh.id_menu,
              jumlah: 1,
              subtotal: 5000,
            },
          ],
        },
      },
    });
  }

  console.log("Seed completed!");
  console.log(`   - ${await prisma.user.count()} users (password: password123)`);
  console.log(`   - ${await prisma.kategori.count()} kategori`);
  console.log(`   - ${await prisma.menu.count()} menu`);
  console.log(`   - ${await prisma.meja.count()} meja`);
  console.log(`   - ${await prisma.bahan_baku.count()} bahan baku`);
  console.log(`   - ${await prisma.menu_bahan.count()} resep menu_bahan`);
  console.log(`   - ${await prisma.pesanan.count()} pesanan sample`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
