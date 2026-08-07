import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu, TipePesanan } from "@prisma/client";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { orderInclude } from "@/lib/prisma-includes";
import {
  buildOrderWhere,
  ORDER_STATUS_VALUES,
  ORDER_TYPE_VALUES,
  parseOptionalEnum,
} from "@/lib/order-helpers";

const STAFF_ROLES = ["PELAYAN", "CHEF", "KASIR", "MANAJER"] as const;

// GET /api/orders?status=MENUNGGU&tipe_pesanan=DINE_IN&id_meja=1&belum_bayar=true
export async function GET(request: Request) {
  const auth = await requireAuth([...STAFF_ROLES]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = parseOptionalEnum(
      searchParams.get("status"),
      ORDER_STATUS_VALUES
    );
    const tipe_pesanan = parseOptionalEnum(
      searchParams.get("tipe_pesanan"),
      ORDER_TYPE_VALUES
    );
    const id_meja = searchParams.get("id_meja")
      ? Number(searchParams.get("id_meja"))
      : undefined;
    const belum_bayar = searchParams.get("belum_bayar") === "true";

    if (searchParams.get("id_meja") && (!id_meja || Number.isNaN(id_meja))) {
      return NextResponse.json(
        { success: false, error: "id_meja tidak valid" },
        { status: 400 }
      );
    }

    const orders = await prisma.pesanan.findMany({
      where: buildOrderWhere({ status, tipe_pesanan, id_meja, belum_bayar }),
      include: orderInclude,
      orderBy: { waktu_pesanan: "desc" },
      take: 100,
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

// POST /api/orders
export async function POST(request: Request) {
  const auth = await requireAuth(["PELAYAN", "KASIR", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

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
      id_user?: number;
      tipe_pesanan?: TipePesanan;
      catatan?: string;
    };

    if (auth.role === "KASIR" && tipe_pesanan !== "TAKEAWAY") {
      return NextResponse.json(
        { success: false, error: "Kasir hanya boleh membuat pesanan takeaway" },
        { status: 403 }
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
        id_user: id_user ?? auth.userId,
        id_meja: tipe === TipePesanan.TAKEAWAY ? null : id_meja ?? null,
        tipe_pesanan: tipe,
        total_harga,
        detail_pesanan: { create: detailData },
      },
      include: orderInclude,
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
