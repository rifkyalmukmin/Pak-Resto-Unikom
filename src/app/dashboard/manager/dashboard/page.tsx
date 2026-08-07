"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp, TrendingDown, MoreVertical, ArrowRight, X } from "lucide-react";
import { DateRangePicker } from "@/components/manager/date-range-picker";
import { api, formatRp } from "@/lib/api";
import type { ApiLaporanTren, ApiPesanan } from "@/types/api";
import type { StatusPesanan } from "@prisma/client";
import Link from "next/link";

type UiStatus = "Completed" | "Preparing" | "Cancelled";

const statusStyle: Record<UiStatus, { bg: string; color: string; border: string }> = {
  Completed: { bg: "rgba(16,185,129,0.12)", color: "#10B981", border: "rgba(16,185,129,0.25)" },
  Preparing: { bg: "rgba(173,198,255,0.10)", color: "#ADC6FF", border: "rgba(173,198,255,0.20)" },
  Cancelled: { bg: "rgba(239,68,68,0.12)", color: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  return `${Math.abs(pct).toFixed(1)}%`;
}

function mapStatus(s: StatusPesanan): UiStatus {
  if (s === "SELESAI") return "Completed";
  if (s === "DIBATALKAN") return "Cancelled";
  return "Preparing";
}

function formatTimeParts(iso: string): { time: string; period: string } {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return { time: `${String(h).padStart(2, "0")}:${m}`, period };
}

function itemsLabel(order: ApiPesanan): string {
  return order.detail_pesanan
    .map((d) => `${d.menu.nama_menu} (${d.jumlah}x)`)
    .join(", ");
}

function tableLabel(order: ApiPesanan): string {
  if (order.tipe_pesanan === "TAKEAWAY") return "Takeaway";
  if (order.meja) return `Meja ${order.meja.nomor_meja}`;
  return "—";
}

function handlerLabel(order: ApiPesanan): string {
  const role =
    order.user.role === "PELAYAN"
      ? "Pelayan"
      : order.user.role === "KASIR"
        ? "Kasir"
        : order.user.role === "CHEF"
          ? "Koki"
          : "Manajer";
  return `${role} – ${order.user.nama_lengkap}`;
}

export default function ManagerDashboardPage() {
  const [tren, setTren] = useState<ApiLaporanTren | null>(null);
  const [orders, setOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ApiPesanan | null>(null);
  const [rangeMode, setRangeMode] = useState(false);

  const load = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      const [trenData, orderData] = await Promise.all([
        api.getLaporanTren(from && to ? { from, to } : { period: "mingguan" }),
        api.getOrders(),
      ]);
      setTren(trenData);
      setOrders(orderData);
      setRangeMode(Boolean(from && to));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleDateChange(range: { start: Date | null; end: Date | null }) {
    if (!range.start) {
      load();
      return;
    }
    const from = toYMD(range.start);
    const to = toYMD(range.end ?? new Date());
    load(from, to);
  }

  const stats = rangeMode ? tren?.ringkasan : tren?.hari_ini;
  const pendapatanPct = stats?.perubahan_pendapatan_pct ?? null;
  const transaksiPct = stats?.perubahan_transaksi_pct ?? null;
  const topMenu = tren?.hari_ini.top_menu ?? tren?.top_menu[0] ?? null;
  const recent = orders.slice(0, 10);

  const avgPct =
    stats && tren
      ? (() => {
          // Approximate avg change from pendapatan & transaksi when available
          if (pendapatanPct === null || transaksiPct === null) return null;
          // rata change ≈ pendapatan_pct - transaksi_pct when both known
          return Math.round((pendapatanPct - transaksiPct) * 10) / 10;
        })()
      : null;

  return (
    <div className="p-6 space-y-5 min-h-full" style={{ backgroundColor: "#0d1117" }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ringkasan Eksekutif</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Analitik kinerja real-time cabang UNIKOM.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            iconSrc="/images/manager/icon-kalender.png"
            onChange={handleDateChange}
          />
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm border"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            borderColor: "rgba(239,68,68,0.3)",
            color: "#ef4444",
          }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <div
          className="rounded-xl p-5 border"
          style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="rounded-xl p-2.5 flex items-center justify-center"
              style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/manager/icon-pendapatan.png" alt="" width={22} height={22} />
            </div>
            <span
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{
                color:
                  pendapatanPct === null
                    ? "#64748b"
                    : pendapatanPct >= 0
                      ? "#10B981"
                      : "#ef4444",
              }}
            >
              {pendapatanPct !== null && pendapatanPct >= 0 ? (
                <TrendingUp size={10} />
              ) : pendapatanPct !== null ? (
                <TrendingDown size={10} />
              ) : null}
              {loading ? "—" : formatPct(pendapatanPct)}
            </span>
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#CBC3D7" }}
          >
            {rangeMode ? "TOTAL PENDAPATAN PERIODE" : "TOTAL PENDAPATAN HARIAN"}
          </p>
          <p className="text-xl font-bold" style={{ color: "#D0BCFF" }}>
            {loading ? "—" : formatRp(stats?.total_pendapatan ?? 0)}
          </p>
        </div>

        <div
          className="rounded-xl p-5 border"
          style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="rounded-xl p-2.5 flex items-center justify-center"
              style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/manager/icon-totalpesanan.png" alt="" width={22} height={22} />
            </div>
            <span
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{
                color:
                  transaksiPct === null
                    ? "#64748b"
                    : transaksiPct >= 0
                      ? "#10B981"
                      : "#ef4444",
              }}
            >
              {transaksiPct !== null && transaksiPct >= 0 ? (
                <TrendingUp size={10} />
              ) : transaksiPct !== null ? (
                <TrendingDown size={10} />
              ) : null}
              {loading ? "—" : formatPct(transaksiPct)}
            </span>
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#CBC3D7" }}
          >
            TOTAL PESANAN
          </p>
          <p className="text-xl font-bold" style={{ color: "#ADC6FF" }}>
            {loading ? "—" : String(stats?.total_transaksi ?? 0)}
          </p>
        </div>

        <div
          className="rounded-xl p-5 border"
          style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div
              className="rounded-xl p-2.5 flex items-center justify-center"
              style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/manager/icon-ratarata.png"
                alt=""
                width={22}
                height={22}
                style={{
                  filter:
                    "brightness(0) saturate(100%) invert(74%) sepia(47%) saturate(627%) hue-rotate(105deg) brightness(103%)",
                }}
              />
            </div>
            <span
              className="flex items-center gap-1 text-[11px] font-bold"
              style={{
                color:
                  avgPct === null ? "#64748b" : avgPct >= 0 ? "#10B981" : "#ef4444",
              }}
            >
              {avgPct !== null && avgPct >= 0 ? (
                <TrendingUp size={10} />
              ) : avgPct !== null ? (
                <TrendingDown size={10} />
              ) : null}
              {loading ? "—" : formatPct(avgPct)}
            </span>
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#CBC3D7" }}
          >
            RATA-RATA NILAI BELANJA
          </p>
          <p className="text-xl font-bold" style={{ color: "#4EDEA3" }}>
            {loading ? "—" : formatRp(stats?.rata_rata ?? 0)}
          </p>
        </div>

        <div
          className="rounded-xl p-5 border relative overflow-hidden"
          style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <span
            className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981" }}
          >
            Top Pick
          </span>
          <div
            className="rounded-xl p-2.5 flex items-center justify-center mb-3 w-fit"
            style={{ backgroundColor: "rgba(139,92,246,0.15)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/manager/icon-menuterlaris.png" alt="" width={22} height={22} />
          </div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#CBC3D7" }}
          >
            MENU TERLARIS
          </p>
          <p className="text-base font-bold text-white leading-tight">
            {loading ? "—" : topMenu?.nama_menu ?? "Belum ada data"}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="px-5 py-4 border-b flex items-start justify-between"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div>
            <h3 className="text-white font-bold">Aktivitas Pesanan Terbaru</h3>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              Overview of last 10 transactions
            </p>
          </div>
          <Link
            href="/dashboard/manager/financial-reports"
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "#10B981" }}
          >
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["ID PESANAN", "WAKTU", "MENU", "TOTAL", "STATUS", "AKSI"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] font-bold tracking-widest"
                  style={{ color: "#CBC3D7" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                  Memuat…
                </td>
              </tr>
            )}
            {!loading && recent.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                  Belum ada pesanan
                </td>
              </tr>
            )}
            {!loading &&
              recent.map((order) => {
                const ui = mapStatus(order.status_pesanan);
                const st = statusStyle[ui];
                const { time, period } = formatTimeParts(order.waktu_pesanan);
                return (
                  <tr key={order.id_pesanan} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-4 text-white font-mono text-xs font-semibold">
                      #UK-{String(order.id_pesanan).padStart(5, "0")}
                    </td>
                    <td className="px-5 py-4 text-white text-xs font-semibold whitespace-nowrap">
                      {time} <span style={{ color: "#64748b" }}>{period}</span>
                    </td>
                    <td className="px-5 py-4 text-white text-xs max-w-[280px] truncate">
                      {itemsLabel(order) || "—"}
                    </td>
                    <td
                      className="px-5 py-4 text-sm font-bold whitespace-nowrap"
                      style={{ color: "#D0BCFF" }}
                    >
                      {formatRp(order.total_harga)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                        style={{
                          backgroundColor: st.bg,
                          color: st.color,
                          borderColor: st.border,
                        }}
                      >
                        {ui}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(order)}
                        className="text-slate-400 hover:text-white transition-colors p-1"
                      >
                        <MoreVertical size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {selected && (() => {
        const ui = mapStatus(selected.status_pesanan);
        const st = statusStyle[ui];
        const { time, period } = formatTimeParts(selected.waktu_pesanan);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setSelected(null)}
          >
            <div
              className="w-[420px] rounded-2xl border p-6 space-y-5"
              style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.08)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-base font-mono">
                    #UK-{String(selected.id_pesanan).padStart(5, "0")}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    {time} {period} · {tableLabel(selected)}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Tipe</span>
                  <span className="text-white font-medium">
                    {selected.tipe_pesanan === "TAKEAWAY" ? "Takeaway" : "Dine-in"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Ditangani</span>
                  <span className="text-white font-medium">{handlerLabel(selected)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Status</span>
                  <span
                    className="px-3 py-0.5 rounded-full text-[11px] font-semibold border"
                    style={{
                      backgroundColor: st.bg,
                      color: st.color,
                      borderColor: st.border,
                    }}
                  >
                    {ui}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Total</span>
                  <span className="text-white font-bold">{formatRp(selected.total_harga)}</span>
                </div>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#CBC3D7" }}
                >
                  Item Pesanan
                </p>
                <ul className="space-y-2">
                  {selected.detail_pesanan.map((d) => (
                    <li key={d.id_detail} className="flex items-center gap-2 text-sm text-white">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: "#D0BCFF" }}
                      />
                      {d.menu.nama_menu} ({d.jumlah}x)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
