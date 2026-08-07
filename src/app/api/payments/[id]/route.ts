import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { parseOrderId } from "@/lib/order-helpers";
import { paymentInclude } from "@/lib/prisma-includes";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const auth = await requireAuth(["KASIR", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_pembayaran = parseOrderId(id);
    if (!id_pembayaran) {
      return NextResponse.json(
        { success: false, error: "ID pembayaran tidak valid" },
        { status: 400 }
      );
    }

    const payment = await prisma.pembayaran.findUnique({
      where: { id_pembayaran },
      include: paymentInclude,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    console.error("GET /api/payments/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil detail pembayaran" },
      { status: 500 }
    );
  }
}
