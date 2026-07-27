import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
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
