import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu, TipePesanan } from "@prisma/client";

// POST /api/orders/customer — buat pesanan dari customer (tanpa auth)
export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      items: { id_menu: number; jumlah: number; catatan?: string }[];
      nomor_meja: number;
      nama_pelanggan?: string;
      catatan?: string;
    };

    const { items, nomor_meja, catatan } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Items pesanan wajib diisi" },
        { status: 400 }
      );
    }

    if (!nomor_meja) {
      return NextResponse.json(
        { success: false, error: "Nomor meja wajib diisi" },
        { status: 400 }
      );
    }

    // Cari meja berdasarkan nomor
    const meja = await prisma.meja.findUnique({
      where: { nomor_meja },
    });

    if (!meja) {
      return NextResponse.json(
        { success: false, error: `Meja nomor ${nomor_meja} tidak ditemukan` },
        { status: 404 }
      );
    }

    // Gunakan user system (PELAYAN pertama) untuk atribusi order customer
    const systemUser = await prisma.user.findFirst({
      where: { role: "PELAYAN" },
      orderBy: { id_user: "asc" },
    });

    if (!systemUser) {
      return NextResponse.json(
        { success: false, error: "Sistem belum dikonfigurasi. Hubungi admin." },
        { status: 500 }
      );
    }

    // Validasi dan hitung item
    const menuIds = items.map((i) => i.id_menu);
    const menus = await prisma.menu.findMany({
      where: {
        id_menu: { in: menuIds },
        status: StatusMenu.AKTIF,
      },
    });

    if (menus.length !== menuIds.length) {
      const foundIds = menus.map((m) => m.id_menu);
      const missing = menuIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        { success: false, error: `Menu tidak tersedia: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const detailData = items.map((item) => {
      const menuItem = menus.find((m) => m.id_menu === item.id_menu)!;
      return {
        id_menu: item.id_menu,
        jumlah: item.jumlah,
        catatan: item.catatan ?? catatan ?? null,
        subtotal: menuItem.harga * item.jumlah,
      };
    });

    const total_harga = detailData.reduce((sum, d) => sum + d.subtotal, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.pesanan.create({
        data: {
          id_user: systemUser.id_user,
          id_meja: meja.id_meja,
          tipe_pesanan: TipePesanan.DINE_IN,
          total_harga,
          detail_pesanan: { create: detailData },
        },
        include: {
          detail_pesanan: {
            include: { menu: true },
          },
          meja: true,
        },
      });

      await tx.meja.update({
        where: { id_meja: meja.id_meja },
        data: { status: "TERISI" },
      });

      return newOrder;
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders/customer error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat pesanan",
      },
      { status: 500 }
    );
  }
}
