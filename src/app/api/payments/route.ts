import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MetodePembayaran, StatusPembayaran } from "@prisma/client";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { releaseMejaIfIdle } from "@/lib/order-helpers";
import { PAYABLE_ORDER_STATUSES } from "@/lib/order-status";
import { paymentInclude } from "@/lib/prisma-includes";

const PAYMENT_METHODS = ["CASH", "QRIS", "TRANSFER"] as const;
const PAYMENT_STATUSES = ["BELUM_BAYAR", "LUNAS", "DIBATALKAN"] as const;

// GET /api/payments?status=LUNAS&id_pesanan=1
export async function GET(request: Request) {
  const auth = await requireAuth(["KASIR", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as StatusPembayaran | null;
    const id_pesanan = searchParams.get("id_pesanan")
      ? Number(searchParams.get("id_pesanan"))
      : undefined;

    if (status && !PAYMENT_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, error: "status pembayaran tidak valid" },
        { status: 400 }
      );
    }

    if (searchParams.get("id_pesanan") && (!id_pesanan || Number.isNaN(id_pesanan))) {
      return NextResponse.json(
        { success: false, error: "id_pesanan tidak valid" },
        { status: 400 }
      );
    }

    const payments = await prisma.pembayaran.findMany({
      where: {
        ...(status ? { status_pembayaran: status } : {}),
        ...(id_pesanan ? { id_pesanan } : {}),
      },
      include: paymentInclude,
      orderBy: { waktu_pembayaran: "desc" },
      take: 100,
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pembayaran" },
      { status: 500 }
    );
  }
}

// POST /api/payments
export async function POST(request: Request) {
  const auth = await requireAuth(["KASIR", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const body = (await request.json()) as {
      id_pesanan: number;
      metode_pembayaran: MetodePembayaran;
      total?: number;
    };

    const { id_pesanan, metode_pembayaran, total } = body;

    if (!id_pesanan || Number.isNaN(Number(id_pesanan))) {
      return NextResponse.json(
        { success: false, error: "id_pesanan wajib diisi" },
        { status: 400 }
      );
    }

    if (!metode_pembayaran || !PAYMENT_METHODS.includes(metode_pembayaran)) {
      return NextResponse.json(
        { success: false, error: "metode_pembayaran tidak valid (CASH, QRIS, TRANSFER)" },
        { status: 400 }
      );
    }

    const order = await prisma.pesanan.findUnique({
      where: { id_pesanan: Number(id_pesanan) },
      include: { pembayaran: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    if (order.status_pesanan === "DIBATALKAN") {
      return NextResponse.json(
        { success: false, error: "Pesanan dibatalkan tidak bisa dibayar" },
        { status: 400 }
      );
    }

    if (!PAYABLE_ORDER_STATUSES.includes(order.status_pesanan)) {
      return NextResponse.json(
        {
          success: false,
          error: `Pesanan harus berstatus ${PAYABLE_ORDER_STATUSES.join(", ")} sebelum dibayar`,
        },
        { status: 400 }
      );
    }

    if (order.pembayaran?.status_pembayaran === "LUNAS") {
      return NextResponse.json(
        { success: false, error: "Pesanan ini sudah lunas" },
        { status: 400 }
      );
    }

    const paymentTotal = total ?? order.total_harga;
    if (paymentTotal < order.total_harga) {
      return NextResponse.json(
        { success: false, error: "Total pembayaran kurang dari total pesanan" },
        { status: 400 }
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
      const existing = order.pembayaran;

      const record = existing
        ? await tx.pembayaran.update({
            where: { id_pembayaran: existing.id_pembayaran },
            data: {
              id_user: auth.userId,
              metode_pembayaran,
              total: paymentTotal,
              status_pembayaran: StatusPembayaran.LUNAS,
              waktu_pembayaran: new Date(),
            },
            include: paymentInclude,
          })
        : await tx.pembayaran.create({
            data: {
              id_user: auth.userId,
              id_pesanan: order.id_pesanan,
              metode_pembayaran,
              total: paymentTotal,
              status_pembayaran: StatusPembayaran.LUNAS,
            },
            include: paymentInclude,
          });

      if (order.status_pesanan !== "SELESAI") {
        await tx.pesanan.update({
          where: { id_pesanan: order.id_pesanan },
          data: { status_pesanan: "SELESAI" },
        });
      }

      return record;
    });

    if (order.id_meja) {
      await releaseMejaIfIdle(order.id_meja);
    }

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mencatat pembayaran" },
      { status: 500 }
    );
  }
}
