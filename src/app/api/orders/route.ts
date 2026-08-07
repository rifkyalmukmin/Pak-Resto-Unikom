import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu, TipePesanan } from "@prisma/client";

// GET /api/orders - Ambil semua pesanan
export async function GET() {
  try {
    const orders = await prisma.pesanan.findMany({
      include: {
        detail_pesanan: { include: { menu: true } },
        meja: true,
        user: {
          select: { id_user: true, nama_lengkap: true, username: true, role: true },
        },
        pembayaran: true,
      },
      orderBy: { waktu_pesanan: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Buat pesanan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      id_meja,
      id_user,
      tipe_pesanan = "DINE_IN",
      catatan,
    } = body as {
      items: { id_menu: number; jumlah: number; catatan?: string }[];
      id_meja?: number | null;
      id_user: number;
      tipe_pesanan?: TipePesanan;
      catatan?: string;
    };

    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "id_user wajib diisi" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Items pesanan wajib diisi" },
        { status: 400 }
      );
    }

    const tipe =
      tipe_pesanan === "TAKEAWAY" ? TipePesanan.TAKEAWAY : TipePesanan.DINE_IN;

    if (tipe === TipePesanan.DINE_IN && !id_meja) {
      return NextResponse.json(
        { success: false, error: "id_meja wajib untuk pesanan dine-in" },
        { status: 400 }
      );
    }

    const menus = await prisma.menu.findMany({
      where: {
        id_menu: { in: items.map((i) => i.id_menu) },
        status: StatusMenu.AKTIF,
      },
    });

    const detailData = items.map((item) => {
      const menuItem = menus.find((m) => m.id_menu === item.id_menu);
      if (!menuItem) throw new Error(`Menu ${item.id_menu} tidak ditemukan`);
      return {
        id_menu: item.id_menu,
        jumlah: item.jumlah,
        catatan: item.catatan ?? catatan ?? null,
        subtotal: menuItem.harga * item.jumlah,
      };
    });

    const total_harga = detailData.reduce((sum, d) => sum + d.subtotal, 0);

    const order = await prisma.pesanan.create({
      data: {
        id_user,
        id_meja: tipe === TipePesanan.TAKEAWAY ? null : id_meja ?? null,
        tipe_pesanan: tipe,
        total_harga,
        detail_pesanan: { create: detailData },
      },
      include: {
        detail_pesanan: { include: { menu: true } },
        meja: true,
      },
    });

    if (order.id_meja) {
      await prisma.meja.update({
        where: { id_meja: order.id_meja },
        data: { status: "TERISI" },
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Gagal membuat pesanan",
      },
      { status: 500 }
    );
  }
}
