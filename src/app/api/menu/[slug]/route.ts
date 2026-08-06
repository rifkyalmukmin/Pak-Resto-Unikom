import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { slug: params.slug },
      include: { category: true },
    });
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/menu/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}
