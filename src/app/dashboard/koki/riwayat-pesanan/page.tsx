"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Check, Clock, ListFilter, Search, X } from "lucide-react";
import type { ApiPesanan } from "@/types/api";
import { api, formatRp } from "@/lib/api";

const ACCENT = "#F59E0B";
const PAD = (n: number) => String(n).padStart(2, "0");

function durationStyle(min: number): { bg: string; color: string } {
  if (min < 10) return { bg: "#10B98125", color: "#10B981" };
  if (min < 16) return { bg: "#37415180", color: "#9ca3af" };
  return { bg: "#7f1d1d80", color: "#f87171" };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${PAD(d.getHours())}:${PAD(d.getMinutes())}`;
}

function formatDateLabel(d = new Date()) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Estimasi durasi dari waktu pesanan sampai sekarang tidak akurat untuk riwayat;
 *  pakai proxy: menit sejak pesanan (untuk SELESAI tidak ideal).
 *  Tanpa completed_at di schema, tampilkan "-" jika > 24 jam, else elapsed kasar. */
function estimateDurationMin(waktu: string): number {
  const mins = Math.floor((Date.now() - new Date(waktu).getTime()) / 60000);
  return Math.max(0, Math.min(mins, 180));
}

export default function RiwayatPesananPage() {
  const [orders, setOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<ApiPesanan | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<"semua" | "DINE_IN" | "TAKEAWAY">("semua");
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await api.getOrders({ status: "SELESAI" });
      setOrders(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat riwayat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const itemsText = o.detail_pesanan
        .map((d) => d.menu.nama_menu)
        .join(" ")
        .toLowerCase();
      const matchSearch =
        String(o.id_pesanan).includes(search) ||
        itemsText.includes(search.toLowerCase()) ||
        (o.user?.nama_lengkap ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (o.meja ? `meja ${o.meja.nomor_meja}` : "takeaway").includes(search.toLowerCase());
      const matchType = filterType === "semua" || o.tipe_pesanan === filterType;
      return matchSearch && matchType;
    });
  }, [orders, search, filterType]);

  const avgMin =
    filtered.length === 0
      ? 0
      : Math.round(
          filtered.reduce((s, o) => s + estimateDurationMin(o.waktu_pesanan), 0) / filtered.length
        );

  function subtitle(o: ApiPesanan) {
    if (o.tipe_pesanan === "DINE_IN") {
      return `Meja ${o.meja?.nomor_meja ?? "-"} • ${o.user?.nama_lengkap ?? "Staff"}`;
    }
    return `Takeaway • ${o.user?.nama_lengkap ?? "Kasir"}`;
  }

  function itemsPreview(o: ApiPesanan) {
    const parts = o.detail_pesanan.map((d) => `${d.menu.nama_menu} (x${d.jumlah})`);
    const text = parts.join(", ");
    return text.length > 48 ? `${text.slice(0, 48)}...` : text;
  }

  return (
    <div className="p-6 flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Riwayat Pesanan</h1>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Order ID..."
            className="bg-[#1E1E2E] border border-white/10 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2 w-52 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="bg-[#1E1E2E] rounded-xl border border-[#45464C]">
        <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tanggal</span>
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>{formatDateLabel()}</span>
            </div>
          </div>
          <div className="w-px h-10 bg-[#45464C]" />
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Status</span>
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
              <span>SELESAI</span>
            </div>
          </div>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setFilterOpen((o) => !o)}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
              style={{ backgroundColor: "#31353F", color: "#cbd5e1" }}
            >
              <ListFilter size={13} />
              {filterType === "semua" ? "Filter Tipe" : filterType === "DINE_IN" ? "Dine-in" : "Takeaway"}
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1E1E2E] border border-[#45464C] rounded-xl overflow-hidden shadow-xl z-20">
                {(
                  [
                    { value: "semua", label: "Semua Tipe" },
                    { value: "DINE_IN", label: "Dine-in" },
                    { value: "TAKEAWAY", label: "Takeaway" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setFilterType(opt.value);
                      setFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: filterType === opt.value ? "#F59E0B" : "#94a3b8" }}
                  >
                    <span>{opt.label}</span>
                    {filterType === opt.value && <Check size={13} style={{ color: "#F59E0B" }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowExportSuccess(true)}
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ backgroundColor: "#BFC6DC", color: "#1E1E2E" }}
          >
            Export Report (.CSV)
          </button>
        </div>
      </div>

      <div className="bg-[#1E1E2E] rounded-xl border border-[#45464C] flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["ID", "TIPE", "ITEM PESANAN", "WAKTU", "TOTAL", "AKSI"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3.5 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap"
                    style={{ color: "#CBC3D7" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Memuat riwayat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Belum ada pesanan selesai
                  </td>
                </tr>
              ) : (
                filtered.map((order, i) => (
                  <tr
                    key={order.id_pesanan}
                    className={`border-b border-white/[0.04] ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}
                  >
                    <td className="px-5 py-4 text-white font-bold">#{order.id_pesanan}</td>
                    <td className="px-5 py-4">
                      {order.tipe_pesanan === "DINE_IN" ? (
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                          style={{ color: "#10B981", backgroundColor: "#10B98120", borderColor: "#10B98140" }}
                        >
                          DINE-IN
                        </span>
                      ) : (
                        <span
                          className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                          style={{ color: ACCENT, backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}40` }}
                        >
                          TAKEAWAY
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white font-medium leading-snug">{itemsPreview(order)}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{subtitle(order)}</p>
                    </td>
                    <td className="px-5 py-4 text-white font-mono font-semibold">
                      {formatTime(order.waktu_pesanan)}
                    </td>
                    <td className="px-5 py-4 text-white font-semibold">{formatRp(order.total_harga)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDetail(order)}
                        className="w-8 h-8 bg-[#121221] border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#2a2a3e] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                          <rect x="9" y="3" width="6" height="4" rx="1" />
                          <line x1="9" y1="12" x2="15" y2="12" />
                          <line x1="9" y1="16" x2="13" y2="16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-5 text-sm">
            <span className="text-slate-400">
              Total Pesanan: <span className="text-white font-bold">{filtered.length}</span>
            </span>
            <span className="text-slate-400">
              Estimasi rata-rata usia:{" "}
              <span className="font-bold" style={{ color: ACCENT }}>
                {avgMin}m
              </span>
            </span>
          </div>
        </div>
      </div>

      {showExportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[360px] rounded-2xl border border-white/10 bg-[#1E1E2E] p-8 flex flex-col items-center text-center space-y-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${ACCENT}20` }}
            >
              <Check size={26} style={{ color: ACCENT }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Export (demo)</h3>
              <p className="text-slate-400 text-sm">
                Fitur unduhan CSV belum diimplementasikan. Data di atas sudah dari database.
              </p>
            </div>
            <button
              onClick={() => setShowExportSuccess(false)}
              className="w-full py-2.5 rounded-xl font-bold text-black"
              style={{ backgroundColor: ACCENT }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-[480px] rounded-2xl border border-[#45464C] bg-[#1E1E2E] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#45464C]">
              <div className="flex items-center gap-3">
                <span className="text-white text-xl font-bold">#{detail.id_pesanan}</span>
                <span
                  className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                  style={
                    detail.tipe_pesanan === "DINE_IN"
                      ? { color: "#10B981", backgroundColor: "#10B98120", borderColor: "#10B98140" }
                      : { color: ACCENT, backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}40` }
                  }
                >
                  {detail.tipe_pesanan}
                </span>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-px bg-[#45464C] border-b border-[#45464C]">
              {[
                {
                  label: "Lokasi",
                  value:
                    detail.tipe_pesanan === "DINE_IN"
                      ? `Meja ${detail.meja?.nomor_meja ?? "-"}`
                      : "Takeaway",
                },
                { label: "Waktu", value: `${formatTime(detail.waktu_pesanan)} WIB` },
                { label: "Petugas", value: detail.user?.nama_lengkap ?? "-" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#1E1E2E] px-4 py-3">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className="text-white text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="px-6 py-4">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">
                Item Pesanan
              </p>
              <div className="space-y-2">
                {detail.detail_pesanan.map((item) => (
                  <div
                    key={item.id_detail}
                    className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "#10B981" }}
                      >
                        <Check size={11} className="text-black" strokeWidth={3} />
                      </div>
                      <span className="text-white text-sm">{item.menu.nama_menu}</span>
                    </div>
                    <span className="text-slate-400 text-sm font-mono">x{item.jumlah}</span>
                  </div>
                ))}
              </div>
              {detail.detail_pesanan.some((d) => d.catatan) && (
                <div className="mt-3 px-3 py-2.5 rounded-lg text-sm text-red-300 bg-red-900/25 border border-red-700/30">
                  <span className="font-bold text-[11px] uppercase tracking-wide">Catatan: </span>
                  {detail.detail_pesanan
                    .filter((d) => d.catatan)
                    .map((d) => d.catatan)
                    .join("; ")}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-[#45464C] bg-[#121221]">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock size={14} />
                <span>Total</span>
              </div>
              <span className="font-bold text-white">{formatRp(detail.total_harga)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
