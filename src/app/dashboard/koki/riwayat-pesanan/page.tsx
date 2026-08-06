"use client";

import { useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check, Clock, ListFilter, Search, X } from "lucide-react";

interface OrderItem { name: string; qty: number }

interface HistoryOrder {
  id: number;
  type: "dine-in" | "takeaway";
  items: string;
  itemsList: OrderItem[];
  subtitle: string;
  name: string;
  completedAt: string;
  durationMin: number;
  durationSec: number;
  chef: string;
  note?: string;
}

const mockHistory: HistoryOrder[] = [
  { id: 340, type: "dine-in",  items: "Ribeye Steak (x2), Caesar Salad...",         subtitle: "Table 12 • Server: Andre",    name: "Andre",       completedAt: "14:20", durationMin: 12, durationSec: 45, chef: "Chef Jatmiko", itemsList: [{ name: "Ribeye Steak", qty: 2 }, { name: "Caesar Salad", qty: 1 }, { name: "Sparkling Water", qty: 2 }] },
  { id: 339, type: "takeaway", items: "Wagyu Burger (x1), Truffle Fries (x2)...",   subtitle: "Gojek • ID: GK-9921",         name: "Budi Santoso", completedAt: "14:12", durationMin: 8,  durationSec: 12, chef: "Chef Budi",    itemsList: [{ name: "Wagyu Burger", qty: 1 }, { name: "Truffle Fries", qty: 2 }], note: "Saus terpisah" },
  { id: 338, type: "dine-in",  items: "Pasta Carbonara (x4), Garlic Bread...",       subtitle: "Table 05 • Server: Mira",     name: "Mira",         completedAt: "14:05", durationMin: 22, durationSec: 10, chef: "Chef Rina",    itemsList: [{ name: "Pasta Carbonara", qty: 4 }, { name: "Garlic Bread", qty: 2 }, { name: "Es Teh Manis", qty: 4 }] },
  { id: 337, type: "dine-in",  items: "Lobster Thermidor (x1), Wine Pairing...",     subtitle: "VIP Table • Server: Kevin",   name: "Kevin",        completedAt: "13:55", durationMin: 15, durationSec: 30, chef: "Chef Jatmiko", itemsList: [{ name: "Lobster Thermidor", qty: 1 }, { name: "Wine Pairing", qty: 1 }], note: "Sajikan dengan lilin meja" },
  { id: 336, type: "takeaway", items: "Pizza Pepperoni Large (x2)",                  subtitle: "Self-Pickup • ID: P-102",     name: "Dewi Sari",    completedAt: "13:40", durationMin: 10, durationSec: 5,  chef: "Chef Budi",    itemsList: [{ name: "Pizza Pepperoni Large", qty: 2 }] },
  { id: 335, type: "dine-in",  items: "Ayam Bakar Madu (x2), Es Teh Leci...",        subtitle: "Table 08 • Server: Budi",     name: "Budi",         completedAt: "13:22", durationMin: 9,  durationSec: 40, chef: "Chef Jatmiko", itemsList: [{ name: "Ayam Bakar Madu", qty: 2 }, { name: "Es Teh Leci", qty: 2 }] },
  { id: 334, type: "takeaway", items: "Nasi Goreng Spesial (x3)",                    subtitle: "Grab • ID: GB-4412",          name: "Rizal Pratama",completedAt: "13:10", durationMin: 7,  durationSec: 55, chef: "Chef Rina",    itemsList: [{ name: "Nasi Goreng Spesial", qty: 3 }] },
  { id: 333, type: "dine-in",  items: "Rendang Sapi (x1), Soto Ayam (x2)...",        subtitle: "Table 03 • Server: Rina",     name: "Rina",         completedAt: "12:58", durationMin: 18, durationSec: 20, chef: "Chef Jatmiko", itemsList: [{ name: "Rendang Sapi", qty: 1 }, { name: "Soto Ayam", qty: 2 }, { name: "Nasi Putih", qty: 3 }] },
];

const PAD = (n: number) => String(n).padStart(2, "0");

function durationLabel(min: number, sec: number) {
  return `${PAD(min)}m ${PAD(sec)}s`;
}

function durationStyle(min: number): { bg: string; color: string } {
  if (min < 10) return { bg: "#10B98125", color: "#10B981" };
  if (min < 16) return { bg: "#37415180", color: "#9ca3af" };
  return { bg: "#7f1d1d80", color: "#f87171" };
}

const ACCENT = "#F59E0B";

export default function RiwayatPesananPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<HistoryOrder | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState<"semua" | "dine-in" | "takeaway">("semua");
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const totalPages = 12;
  const totalOrders = 124;
  const avgDuration = "11m 20s";

  const filtered = mockHistory.filter((o) => {
    const matchSearch =
      String(o.id).includes(search) ||
      o.items.toLowerCase().includes(search.toLowerCase()) ||
      o.subtitle.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "semua" || o.type === filterType;
    return matchSearch && matchType;
  });

  return (
    <div className="p-6 flex flex-col gap-5 h-full">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Riwayat Pesanan</h1>

        {/* Search + icons */}
        <div className="flex items-center gap-2">
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
      </div>

      {/* Filter card */}
      <div className="bg-[#1E1E2E] rounded-xl border border-[#45464C]">
        <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tanggal</span>
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <Calendar size={13} className="text-slate-400 shrink-0" />
              <span>Hari Ini, 24 Okt 2023</span>
            </div>
          </div>

          <div className="w-px h-10 bg-[#45464C]" />

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Status</span>
            <div className="flex items-center gap-2 text-sm text-white font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
              <span>Semua Selesai</span>
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
              {filterType === "semua" ? "Filter Tipe" : filterType === "dine-in" ? "Dine-in" : "Takeaway"}
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-[#1E1E2E] border border-[#45464C] rounded-xl overflow-hidden shadow-xl z-20">
                {(["semua", "dine-in", "takeaway"] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setFilterType(opt); setFilterOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                    style={{ color: filterType === opt ? "#F59E0B" : "#94a3b8" }}
                  >
                    <span className="capitalize">{opt === "semua" ? "Semua Tipe" : opt === "dine-in" ? "Dine-in" : "Takeaway"}</span>
                    {filterType === opt && <Check size={13} style={{ color: "#F59E0B" }} />}
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

      {/* Table card */}
      <div className="bg-[#1E1E2E] rounded-xl border border-[#45464C] flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["ID", "TIPE", "ITEM PESANAN", "WAKTU SELESAI", "DURASI", "AKSI"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold tracking-widest uppercase whitespace-nowrap" style={{ color: "#CBC3D7" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const dur = durationStyle(order.durationMin);
                return (
                  <tr key={order.id} className={`border-b border-white/[0.04] ${i % 2 === 0 ? "" : "bg-white/[0.015]"}`}>
                    {/* ID */}
                    <td className="px-5 py-4 text-white font-bold">#{order.id}</td>

                    {/* Tipe */}
                    <td className="px-5 py-4">
                      {order.type === "dine-in" ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                          style={{ color: "#10B981", backgroundColor: "#10B98120", borderColor: "#10B98140" }}>
                          DINE-IN
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                          style={{ color: ACCENT, backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}40` }}>
                          TAKEAWAY
                        </span>
                      )}
                    </td>

                    {/* Item pesanan */}
                    <td className="px-5 py-4">
                      <p className="text-white font-medium leading-snug">{order.items}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{order.name}</p>
                    </td>

                    {/* Waktu selesai */}
                    <td className="px-5 py-4 text-white font-mono font-semibold">{order.completedAt}</td>

                    {/* Durasi */}
                    <td className="px-5 py-4">
                      <span
                        className="font-mono font-bold text-sm px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: dur.bg, color: dur.color }}
                      >
                        {durationLabel(order.durationMin, order.durationSec)}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDetail(order)}
                        className="w-8 h-8 bg-[#121221] border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#2a2a3e] transition-colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                          <rect x="9" y="3" width="6" height="4" rx="1"/>
                          <line x1="9" y1="12" x2="15" y2="12"/>
                          <line x1="9" y1="16" x2="13" y2="16"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/5 shrink-0">
          <div className="flex items-center gap-5 text-sm">
            <span className="text-slate-400">
              Total Pesanan: <span className="text-white font-bold">{totalOrders}</span>
            </span>
            <span className="text-slate-400">
              Rata-rata Durasi: <span className="font-bold" style={{ color: ACCENT }}>{avgDuration}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-sm text-slate-400 px-2">
              Halaman <span className="text-white font-semibold">{page}</span> dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal sukses export */}
      {showExportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[360px] rounded-2xl border border-white/10 bg-[#1E1E2E] p-8 flex flex-col items-center text-center space-y-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ACCENT}20` }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Laporan Berhasil Diekspor!</h3>
              <p className="text-slate-400 text-sm">File CSV riwayat pesanan telah berhasil diunduh.</p>
            </div>
            <button
              onClick={() => setShowExportSuccess(false)}
              className="w-full py-2.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Detail popup */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="w-[480px] rounded-2xl border border-[#45464C] bg-[#1E1E2E] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#45464C]">
              <div className="flex items-center gap-3">
                <span className="text-white text-xl font-bold">#{detail.id}</span>
                {detail.type === "dine-in" ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                    style={{ color: "#10B981", backgroundColor: "#10B98120", borderColor: "#10B98140" }}>DINE-IN</span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded border tracking-widest"
                    style={{ color: ACCENT, backgroundColor: `${ACCENT}20`, borderColor: `${ACCENT}40` }}>TAKEAWAY</span>
                )}
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-3 gap-px bg-[#45464C] border-b border-[#45464C]">
              {[
                { label: "Lokasi", value: detail.subtitle.split("•")[0].trim() },
                { label: "Selesai", value: `${detail.completedAt} WIB` },
                { label: "Chef", value: detail.chef },
              ].map(({ label, value }) => (
                <div key={label} className="bg-[#1E1E2E] px-4 py-3">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-white text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="px-6 py-4">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Item Pesanan</p>
              <div className="space-y-2">
                {detail.itemsList.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#10B981" }}>
                        <Check size={11} className="text-black" strokeWidth={3} />
                      </div>
                      <span className="text-white text-sm">{item.name}</span>
                    </div>
                    <span className="text-slate-400 text-sm font-mono">x{item.qty}</span>
                  </div>
                ))}
              </div>

              {detail.note && (
                <div className="mt-3 px-3 py-2.5 rounded-lg text-sm text-red-300 bg-red-900/25 border border-red-700/30">
                  <span className="font-bold text-[11px] uppercase tracking-wide">Catatan: </span>{detail.note}
                </div>
              )}
            </div>

            {/* Durasi footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#45464C] bg-[#121221]">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Clock size={14} />
                <span>Durasi pengerjaan</span>
              </div>
              <span
                className="font-mono font-bold text-sm px-3 py-1.5 rounded-lg"
                style={durationStyle(detail.durationMin)}
              >
                {durationLabel(detail.durationMin, detail.durationSec)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
