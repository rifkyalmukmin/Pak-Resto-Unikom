import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { orderInclude } from "@/lib/prisma-includes";
import {
  buildOrderWhere,
  ORDER_STATUS_VALUES,
  ORDER_TYPE_VALUES,
  parseOptionalEnum,
  parseOrderId,
  releaseMejaIfIdle,
} from "@/lib/order-helpers";
import { canTransitionStatus } from "@/lib/order-status";
import type { StatusPesanan } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const auth = await requireAuth(["PELAYAN", "CHEF", "KASIR", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_pesanan = parseOrderId(id);
    if (!id_pesanan) {
      return NextResponse.json(
        { success: false, error: "ID pesanan tidak valid" },
        { status: 400 }
      );
    }

    const order = await prisma.pesanan.findUnique({
      where: { id_pesanan },
      include: orderInclude,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil detail pesanan" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["PELAYAN", "CHEF", "KASIR", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_pesanan = parseOrderId(id);
    if (!id_pesanan) {
      return NextResponse.json(
        { success: false, error: "ID pesanan tidak valid" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { status_pesanan?: StatusPesanan };
    const { status_pesanan } = body;

    if (!status_pesanan || !ORDER_STATUS_VALUES.includes(status_pesanan)) {
      return NextResponse.json(
        { success: false, error: "status_pesanan tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.pesanan.findUnique({
      where: { id_pesanan },
      include: { pembayaran: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    const transitionError = canTransitionStatus(
      existing.status_pesanan,
      status_pesanan,
      existing.tipe_pesanan,
      auth.role
    );
    if (transitionError) {
      return NextResponse.json(
        { success: false, error: transitionError },
        { status: 400 }
      );
    }

    if (
      status_pesanan === "DIBATALKAN" &&
      existing.pembayaran?.status_pembayaran === "LUNAS"
    ) {
      return NextResponse.json(
        { success: false, error: "Pesanan yang sudah dibayar tidak bisa dibatalkan" },
        { status: 400 }
      );
    }

    const order = await prisma.pesanan.update({
      where: { id_pesanan },
      data: { status_pesanan },
      include: orderInclude,
    });

    if (
      (status_pesanan === "SELESAI" || status_pesanan === "DIBATALKAN") &&
      order.id_meja
    ) {
      await releaseMejaIfIdle(order.id_meja);
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status pesanan" },
      { status: 500 }
    );
  }
}

