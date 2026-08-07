import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu } from "@prisma/client";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { menuAdminInclude } from "@/lib/menu-helpers";

// GET /api/menu
// - default: kategori aktif + menu AKTIF (publik / pemesanan)
// - ?all=true: semua menu (butuh MANAJER)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      const auth = await requireAuth(["MANAJER"]);
      if (isAuthFailure(auth)) return auth.error;

      const menus = await prisma.menu.findMany({
        include: menuAdminInclude,
        orderBy: { nama_menu: "asc" },
      });
      return NextResponse.json({ success: true, data: menus });
    }

    const categories = await prisma.kategori.findMany({
      where: { aktif: true },
      include: {
        menu: {
          where: { status: StatusMenu.AKTIF },
          orderBy: { nama_menu: "asc" },
        },
      },
      orderBy: { nama_kategori: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/menu error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

// POST /api/menu — buat menu baru (MANAJER)
export async function POST(request: Request) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const body = (await request.json()) as {
      nama_menu?: string;
      id_kategori?: number;
      harga?: number;
      deskripsi?: string | null;
      status?: StatusMenu;
      gambar?: string | null;
      bahan?: Array<{ id_bahan: number; jumlah_pakai?: number }>;
    };

    const nama_menu = body.nama_menu?.trim();
    const id_kategori = Number(body.id_kategori);
    const harga = Number(body.harga);

    if (!nama_menu) {
      return NextResponse.json(
        { success: false, error: "nama_menu wajib diisi" },
        { status: 400 }
      );
    }
    if (!id_kategori || Number.isNaN(id_kategori)) {
      return NextResponse.json(
        { success: false, error: "id_kategori wajib diisi" },
        { status: 400 }
      );
    }
    if (!harga || Number.isNaN(harga) || harga <= 0) {
      return NextResponse.json(
        { success: false, error: "harga harus angka > 0" },
        { status: 400 }
      );
    }

    const kategori = await prisma.kategori.findUnique({ where: { id_kategori } });
    if (!kategori) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const status =
      body.status === "NONAKTIF" ? StatusMenu.NONAKTIF : StatusMenu.AKTIF;
    const bahan = Array.isArray(body.bahan) ? body.bahan : [];

    const created = await prisma.$transaction(async (tx) => {
      const menu = await tx.menu.create({
        data: {
          nama_menu,
          id_kategori,
          harga,
          deskripsi: body.deskripsi?.trim() || null,
          status,
          gambar: body.gambar?.trim() || null,
          menu_bahan:
            bahan.length > 0
              ? {
                  create: bahan.map((b) => ({
                    id_bahan: Number(b.id_bahan),
                    jumlah_pakai: Number(b.jumlah_pakai) > 0 ? Number(b.jumlah_pakai) : 1,
                  })),
                }
              : undefined,
        },
        include: menuAdminInclude,
      });

      const count = await tx.menu.count({ where: { id_kategori } });
      await tx.kategori.update({
        where: { id_kategori },
        data: { jumlah_menu: count },
      });

      return menu;
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/menu error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah menu" },
      { status: 500 }
    );
  }
}
