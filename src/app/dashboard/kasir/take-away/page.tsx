"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, XCircle, Check, RefreshCw } from "lucide-react";
import type { ApiPesanan } from "@/types/api";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { StatusPesanan } from "@prisma/client";

function mapStatusLabel(order: ApiPesanan): string {
  if (!order.pembayaran || order.pembayaran.status_pembayaran !== "LUNAS") {
    if (["MENUNGGU", "DIPROSES", "SIAP"].includes(order.status_pesanan)) {
      return "MENUNGGU BAYAR";
    }
  }
  if (order.status_pesanan === "SELESAI" || order.status_pesanan === "DIBATALKAN") {
    return "SELESAI";
  }
  if (order.status_pesanan === "DIPROSES" || order.status_pesanan === "SIAP") {
    return "DIPROSES";
  }
  return order.status_pesanan;
}

const statusStyles: Record<string, string> = {
  "MENUNGGU BAYAR": "bg-red-500/15 text-red-400 border border-red-500/30",
  DIPROSES: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  SELESAI: "bg-[#00B954]/15 text-[#00B954] border border-[#00B954]/30",
  MENUNGGU: "bg-slate-500/15 text-slate-400 border border-slate-500/30",
};

export default function TakeAwayPage() {
  const [orders, setOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const data = await api.getOrders({ tipe_pesanan: "TAKEAWAY" });
      setOrders(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const interval = setInterval(() => void loadOrders(), 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const filtered = orders.filter((o) => {
    const label = mapStatusLabel(o);
    const matchSearch =
      String(o.id_pesanan).includes(search) ||
      o.user.nama_lengkap.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua Status" || label === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: orders.length,
    menunggu: orders.filter((o) => mapStatusLabel(o) === "MENUNGGU BAYAR").length,
    diproses: orders.filter((o) => mapStatusLabel(o) === "DIPROSES").length,
    selesai: orders.filter((o) => mapStatusLabel(o) === "SELESAI").length,
  };

  async function handleCancel(id: number) {
    try {
      await api.updateOrderStatus(id, "DIBATALKAN" as StatusPesanan);
      setCancelTarget(null);
      setShowCancelSuccess(true);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membatalkan pesanan");
      setCancelTarget(null);
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pesanan", value: counts.total, color: "text-white" },
          { label: "Menunggu Pembayaran", value: counts.menunggu, color: "text-[#4CD7F6]" },
          { label: "Sedang Diproses", value: counts.diproses, color: "text-[#FFB873]" },
          { label: "Selesai", value: counts.selesai, color: "text-[#4AE176]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1E1E2E] rounded-xl border border-white/5 px-5 py-4">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => void loadOrders()}
          className="p-2.5 rounded-lg border border-white/10 text-slate-400"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Pesanan..."
            className="w-full bg-[#1E1E2E] border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2.5"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1E1E2E] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2.5"
        >
          {["Semua Status", "MENUNGGU BAYAR", "DIPROSES", "SELESAI"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <Link
          href="/dashboard/kasir/take-away/tambah"
          className="ml-auto flex items-center gap-2 bg-[#06B6D4] text-black text-sm font-bold px-4 py-2.5 rounded-lg"
        >
          <PlusCircle size={16} />
          Tambah Pesanan
        </Link>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_0.5fr] gap-4 px-5 py-3 bg-[#292839]">
          {["NO. PESANAN", "PELAYAN", "JUMLAH ITEM", "TOTAL", "STATUS", "AKSI"].map((h) => (
            <p key={h} className="text-white text-sm font-bold uppercase tracking-wider">
              {h}
            </p>
          ))}
        </div>

        {loading && orders.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Memuat pesanan...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Tidak ada pesanan takeaway</p>
        ) : (
          filtered.map((order, i) => {
            const label = mapStatusLabel(order);
            return (
              <div
                key={order.id_pesanan}
                className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_0.5fr] gap-4 px-5 py-4"
                style={{ backgroundColor: i % 2 === 0 ? "#1E1E2E" : "#252538" }}
              >
                <p className="text-sm self-center text-[#E3E0F7]">#{order.id_pesanan}</p>
                <p className="text-sm self-center text-[#E3E0F7]">{order.user.nama_lengkap}</p>
                <p className="text-sm self-center text-[#E3E0F7]">
                  {order.detail_pesanan.length} Item
                </p>
                <p className="text-sm self-center text-[#E3E0F7]">
                  {formatCurrency(order.total_harga)}
                </p>
                <div className="self-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                      statusStyles[label] ?? statusStyles.MENUNGGU
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <div className="self-center flex justify-center">
                  {order.status_pesanan !== "DIBATALKAN" &&
                    order.status_pesanan !== "SELESAI" && (
                      <button
                        onClick={() => setCancelTarget(order.id_pesanan)}
                        className="text-white hover:text-red-400 p-1"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {cancelTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[380px] mx-4 rounded-2xl border border-white/10 bg-[#1E2235] p-8 text-center space-y-5">
            <XCircle size={28} className="text-red-400 mx-auto" />
            <h3 className="text-white font-bold text-lg">Batalkan Pesanan?</h3>
            <p className="text-slate-400 text-sm">Pesanan #{cancelTarget} akan dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white"
              >
                Kembali
              </button>
              <button
                onClick={() => void handleCancel(cancelTarget)}
                className="flex-1 py-2.5 rounded-xl bg-[#22C55E] text-black font-bold"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-white/10 bg-[#1E2235] p-8 text-center space-y-5">
            <Check size={28} className="text-[#22C55E] mx-auto" />
            <h3 className="text-white font-bold text-lg">Pesanan Dibatalkan</h3>
            <button
              onClick={() => setShowCancelSuccess(false)}
              className="w-full py-2.5 rounded-xl bg-[#22C55E] text-black font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
