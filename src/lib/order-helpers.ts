import { prisma } from "@/lib/prisma";
import type { TipePesanan } from "@prisma/client";

export async function releaseMejaIfIdle(id_meja: number) {
  const activeOrders = await prisma.pesanan.count({
    where: {
      id_meja,
      status_pesanan: { notIn: ["SELESAI", "DIBATALKAN"] },
    },
  });

  if (activeOrders === 0) {
    await prisma.meja.update({
      where: { id_meja },
      data: { status: "KOSONG" },
    });
  }
}

export async function completeDineInOrder(id_pesanan: number, id_meja: number | null) {
  await prisma.pesanan.update({
    where: { id_pesanan },
    data: { status_pesanan: "SELESAI" },
  });

  if (id_meja) {
    await releaseMejaIfIdle(id_meja);
  }
}

export function parseOrderId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function parseOptionalEnum<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  if (!value) return undefined;
  return allowed.includes(value as T) ? (value as T) : undefined;
}

export const ORDER_STATUS_VALUES = [
  "MENUNGGU",
  "DIPROSES",
  "SIAP",
  "DIANTAR",
  "SELESAI",
  "DIBATALKAN",
] as const;

export const ORDER_TYPE_VALUES = ["DINE_IN", "TAKEAWAY"] as const;

export type OrderStatusFilter = (typeof ORDER_STATUS_VALUES)[number];
export type OrderTypeFilter = (typeof ORDER_TYPE_VALUES)[number];

export function buildOrderWhere(params: {
  status?: OrderStatusFilter;
  tipe_pesanan?: OrderTypeFilter;
  id_meja?: number;
  belum_bayar?: boolean;
}) {
  const where: {
    status_pesanan?: OrderStatusFilter;
    tipe_pesanan?: TipePesanan;
    id_meja?: number;
    OR?: Array<{ pembayaran: null } | { pembayaran: { status_pembayaran: "BELUM_BAYAR" } }>;
  } = {};

  if (params.status) where.status_pesanan = params.status;
  if (params.tipe_pesanan) where.tipe_pesanan = params.tipe_pesanan;
  if (params.id_meja) where.id_meja = params.id_meja;

  if (params.belum_bayar) {
    where.OR = [
      { pembayaran: null },
      { pembayaran: { status_pembayaran: "BELUM_BAYAR" } },
    ];
  }

  return where;
}
