import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";

function parseDateParam(raw: string | null, endOfDay = false): Date | null {
  if (!raw) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

type MenuAgg = {
  id_menu: number;
  nama_menu: string;
  id_kategori: number;
  nama_kategori: string;
  warna: string | null;
  qty: number;
  revenue: number;
};

async function aggregatePeriod(from: Date, to: Date) {
  const payments = await prisma.pembayaran.findMany({
    where: {
      status_pembayaran: "LUNAS",
      waktu_pembayaran: { gte: from, lte: to },
    },
    select: {
      total: true,
      waktu_pembayaran: true,
      pesanan: {
        select: {
          waktu_pesanan: true,
          detail_pesanan: {
            select: {
              jumlah: true,
              subtotal: true,
              menu: {
                select: {
                  id_menu: true,
                  nama_menu: true,
                  id_kategori: true,
                  kategori: {
                    select: {
                      id_kategori: true,
                      nama_kategori: true,
                      warna: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const total_pendapatan = payments.reduce((s, p) => s + p.total, 0);
  const total_transaksi = payments.length;

  const menuMap = new Map<number, MenuAgg>();
  const hourCount = new Array(24).fill(0) as number[];

  for (const p of payments) {
    const order = p.pesanan;
    if (!order) continue;
    const hour = new Date(order.waktu_pesanan).getHours();
    hourCount[hour] += 1;

    for (const d of order.detail_pesanan) {
      const m = d.menu;
      const cur = menuMap.get(m.id_menu) ?? {
        id_menu: m.id_menu,
        nama_menu: m.nama_menu,
        id_kategori: m.id_kategori,
        nama_kategori: m.kategori.nama_kategori,
        warna: m.kategori.warna,
        qty: 0,
        revenue: 0,
      };
      cur.qty += d.jumlah;
      cur.revenue += d.subtotal;
      menuMap.set(m.id_menu, cur);
    }
  }

  const by_kategori_map = new Map<
    number,
    { id_kategori: number; nama_kategori: string; warna: string | null; qty: number; revenue: number }
  >();
  for (const m of menuMap.values()) {
    const cur = by_kategori_map.get(m.id_kategori) ?? {
      id_kategori: m.id_kategori,
      nama_kategori: m.nama_kategori,
      warna: m.warna,
      qty: 0,
      revenue: 0,
    };
    cur.qty += m.qty;
    cur.revenue += m.revenue;
    by_kategori_map.set(m.id_kategori, cur);
  }

  const top_menu = Array.from(menuMap.values()).sort((a, b) => b.qty - a.qty);
  const by_kategori = Array.from(by_kategori_map.values()).sort((a, b) => b.revenue - a.revenue);

  // Peak: find densest 2-hour window
  let bestStart = 12;
  let bestSum = 0;
  for (let h = 0; h <= 22; h++) {
    const sum = hourCount[h] + hourCount[h + 1];
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = h;
    }
  }

  const peaks: Array<{ label: string; start: number; end: number; count: number }> = [];
  if (bestSum > 0) {
    peaks.push({
      label: bestStart < 15 ? "Lunch Peak" : bestStart < 18 ? "Sore Peak" : "Dinner Peak",
      start: bestStart,
      end: bestStart + 2,
      count: bestSum,
    });
  }
  // Second peak excluding overlapping window
  let secondStart = 19;
  let secondSum = 0;
  for (let h = 0; h <= 22; h++) {
    if (Math.abs(h - bestStart) < 2) continue;
    const sum = hourCount[h] + hourCount[h + 1];
    if (sum > secondSum) {
      secondSum = sum;
      secondStart = h;
    }
  }
  if (secondSum > 0 && secondSum !== bestSum) {
    peaks.push({
      label: secondStart < 15 ? "Lunch Peak" : secondStart < 18 ? "Sore Peak" : "Dinner Peak",
      start: secondStart,
      end: secondStart + 2,
      count: secondSum,
    });
  }

  return {
    total_pendapatan,
    total_transaksi,
    rata_rata: total_transaksi > 0 ? Math.round(total_pendapatan / total_transaksi) : 0,
    top_menu,
    by_kategori,
    peaks,
    hour_count: hourCount,
  };
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

// GET /api/reports/tren?from=&to=&period=mingguan|bulanan|kuartalan
export async function GET(request: Request) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? "mingguan";

    let from: Date;
    let to: Date = endOfToday();
    let prevFrom: Date;
    let prevTo: Date;

    if (searchParams.get("from") && searchParams.get("to")) {
      from = parseDateParam(searchParams.get("from")) ?? daysAgo(6);
      to = parseDateParam(searchParams.get("to"), true) ?? endOfToday();
      const rangeMs = to.getTime() - from.getTime();
      prevTo = new Date(from.getTime() - 1);
      prevFrom = new Date(prevTo.getTime() - rangeMs);
    } else if (period === "bulanan") {
      from = daysAgo(29);
      prevFrom = daysAgo(59);
      prevTo = new Date(daysAgo(30).getTime() + 24 * 60 * 60 * 1000 - 1);
    } else if (period === "kuartalan") {
      from = daysAgo(89);
      prevFrom = daysAgo(179);
      prevTo = new Date(daysAgo(90).getTime() + 24 * 60 * 60 * 1000 - 1);
    } else {
      // mingguan
      from = daysAgo(6);
      prevFrom = daysAgo(13);
      prevTo = new Date(daysAgo(7).getTime() + 24 * 60 * 60 * 1000 - 1);
    }

    const [current, previous] = await Promise.all([
      aggregatePeriod(from, to),
      aggregatePeriod(prevFrom, prevTo),
    ]);

    // Today snapshot for dashboard cards
    const todayStart = daysAgo(0);
    const today = await aggregatePeriod(todayStart, endOfToday());
    const yesterdayStart = daysAgo(1);
    const yesterdayEnd = new Date(daysAgo(0).getTime() - 1);
    const yesterday = await aggregatePeriod(yesterdayStart, yesterdayEnd);

    return NextResponse.json({
      success: true,
      data: {
        periode: {
          from: toYMD(from),
          to: toYMD(to),
          period,
        },
        hari_ini: {
          total_pendapatan: today.total_pendapatan,
          total_transaksi: today.total_transaksi,
          rata_rata: today.rata_rata,
          perubahan_pendapatan_pct: pctChange(
            today.total_pendapatan,
            yesterday.total_pendapatan
          ),
          perubahan_transaksi_pct: pctChange(
            today.total_transaksi,
            yesterday.total_transaksi
          ),
          top_menu: today.top_menu[0] ?? null,
        },
        ringkasan: {
          total_pendapatan: current.total_pendapatan,
          total_transaksi: current.total_transaksi,
          rata_rata: current.rata_rata,
          perubahan_pendapatan_pct: pctChange(
            current.total_pendapatan,
            previous.total_pendapatan
          ),
          perubahan_transaksi_pct: pctChange(
            current.total_transaksi,
            previous.total_transaksi
          ),
        },
        by_kategori: current.by_kategori,
        by_kategori_prev: previous.by_kategori,
        top_menu: current.top_menu.slice(0, 10),
        peaks: current.peaks,
      },
    });
  } catch (error) {
    console.error("GET /api/reports/tren error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data tren" },
      { status: 500 }
    );
  }
}
