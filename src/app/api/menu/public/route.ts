import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu } from "@prisma/client";

// GET /api/menu/public — menu publik tanpa auth untuk halaman customer
export async function GET() {
  try {
    const categories = await prisma.kategori.findMany({
      where: { aktif: true },
      include: {
        menu: {
          where: { status: StatusMenu.AKTIF },
          orderBy: { nama_menu: "asc" },
          select: {
            id_menu: true,
            nama_menu: true,
            deskripsi: true,
            harga: true,
            gambar: true,
            status: true,
          },
        },
      },
      orderBy: { nama_kategori: "asc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/menu/public error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}
