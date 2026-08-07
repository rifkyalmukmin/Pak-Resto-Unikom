import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu } from "@prisma/client";

export async function GET() {
  try {
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
