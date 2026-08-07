import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth, STAFF_ROLES } from "@/lib/api-auth";

// GET /api/kategori — semua kategori (termasuk nonaktif) untuk manajer
export async function GET() {
  const auth = await requireAuth(STAFF_ROLES);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const list = await prisma.kategori.findMany({
      orderBy: { nama_kategori: "asc" },
    });
    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("GET /api/kategori error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data kategori" },
      { status: 500 }
    );
  }
}

// POST /api/kategori
export async function POST(request: Request) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const body = (await request.json()) as {
      nama_kategori?: string;
      deskripsi?: string | null;
      warna?: string | null;
      aktif?: boolean;
    };

    const nama_kategori = body.nama_kategori?.trim();
    if (!nama_kategori) {
      return NextResponse.json(
        { success: false, error: "nama_kategori wajib diisi" },
        { status: 400 }
      );
    }

    const created = await prisma.kategori.create({
      data: {
        nama_kategori,
        deskripsi: body.deskripsi?.trim() || null,
        warna: body.warna?.trim() || null,
        aktif: body.aktif ?? true,
        jumlah_menu: 0,
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/kategori error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah kategori" },
      { status: 500 }
    );
  }
}
