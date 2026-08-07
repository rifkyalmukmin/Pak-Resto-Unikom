import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const id_menu = Number(id);
    if (Number.isNaN(id_menu)) {
      return NextResponse.json(
        { success: false, error: "ID menu tidak valid" },
        { status: 400 }
      );
    }

    const item = await prisma.menu.findUnique({
      where: { id_menu },
      include: { kategori: true },
    });
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}
