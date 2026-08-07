import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth, STAFF_ROLES } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireAuth(STAFF_ROLES);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const tables = await prisma.meja.findMany({
      orderBy: { nomor_meja: "asc" },
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
