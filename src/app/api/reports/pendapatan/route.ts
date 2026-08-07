import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";

function parseDateParam(raw: string | null, endOfDay = false): Date | null {
  if (!raw) return null;
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatTanggalId(isoDate: string): string {
  const [y, m, day] = isoDate.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
  return `${day} ${months[m - 1]} ${y}`;
}

// GET /api/reports/pendapatan?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(request: Request) {
  const auth = await requireAuth(["MANAJER", "KASIR"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 29);

    const from =
      parseDateParam(searchParams.get("from")) ??
      new Date(defaultFrom.toISOString().slice(0, 10) + "T00:00:00.000");
    const to =
      parseDateParam(searchParams.get("to"), true) ??
      new Date(now.toISOString().slice(0, 10) + "T23:59:59.999");

    if (from > to) {
      return NextResponse.json(
        { success: false, error: "from tidak boleh lebih besar dari to" },
        { status: 400 }
      );
    }

    const payments = await prisma.pembayaran.findMany({
      where: {
        status_pembayaran: "LUNAS",
        waktu_pembayaran: { gte: from, lte: to },
      },
      select: {
        total: true,
        waktu_pembayaran: true,
      },
      orderBy: { waktu_pembayaran: "desc" },
    });

    const byDay = new Map<string, { transaksi: number; pendapatan: number }>();
    for (const p of payments) {
      const key = toDateKey(p.waktu_pembayaran);
      const cur = byDay.get(key) ?? { transaksi: 0, pendapatan: 0 };
      cur.transaksi += 1;
      cur.pendapatan += p.total;
      byDay.set(key, cur);
    }

    const harian = Array.from(byDay.entries())
      .map(([tanggal, v]) => ({
        tanggal,
        tanggal_label: formatTanggalId(tanggal),
        transaksi: v.transaksi,
        pendapatan: v.pendapatan,
        rata_rata: v.transaksi > 0 ? Math.round(v.pendapatan / v.transaksi) : 0,
        status: "Finalized" as const,
      }))
      .sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));

    const total_pendapatan = payments.reduce((s, p) => s + p.total, 0);
    const total_transaksi = payments.length;
    const rata_rata =
      total_transaksi > 0 ? Math.round(total_pendapatan / total_transaksi) : 0;

    // Periode sebelumnya (sama panjang) untuk % change
    const rangeMs = to.getTime() - from.getTime();
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - rangeMs);

    const prevPayments = await prisma.pembayaran.findMany({
      where: {
        status_pembayaran: "LUNAS",
        waktu_pembayaran: { gte: prevFrom, lte: prevTo },
      },
      select: { total: true },
    });
    const prevTotal = prevPayments.reduce((s, p) => s + p.total, 0);
    const prevCount = prevPayments.length;
    const prevAvg = prevCount > 0 ? Math.round(prevTotal / prevCount) : 0;

    function pctChange(current: number, previous: number): number | null {
      if (previous === 0) return current === 0 ? 0 : null;
      return Math.round(((current - previous) / previous) * 1000) / 10;
    }

    return NextResponse.json({
      success: true,
      data: {
        periode: {
          from: toDateKey(from),
          to: toDateKey(to),
        },
        ringkasan: {
          total_pendapatan,
          total_transaksi,
          rata_rata,
          perubahan_pendapatan_pct: pctChange(total_pendapatan, prevTotal),
          perubahan_transaksi_pct: pctChange(total_transaksi, prevCount),
          perubahan_rata_pct: pctChange(rata_rata, prevAvg),
        },
        harian,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/pendapatan error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil laporan pendapatan" },
      { status: 500 }
    );
  }
}
