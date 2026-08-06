import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      orderBy: { number: "asc" },
    });
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data meja" },
      { status: 500 }
    );
  }
}
