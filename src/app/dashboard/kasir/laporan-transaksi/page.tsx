"use client";

import { useState, useRef, useEffect } from "react";
import { ListFilter, Download, Check, X } from "lucide-react";

interface Transaction {
  time: string;
  tableOrType: string;
  type: "DINE-IN" | "TAKEAWAY";
  total: number;
  paymentMethod: string;
  status: "PAID" | "PENDING" | "KITCHEN";
}

const mockTransactions: Transaction[] = [
  { time: "14:28:05", tableOrType: "Meja 12", type: "DINE-IN", total: 450000, paymentMethod: "QRIS - BCA", status: "PAID" },
  { time: "14:15:30", tableOrType: "T0928", type: "TAKEAWAY", total: 125000, paymentMethod: "Cash", status: "PAID" },
  { time: "13:55:12", tableOrType: "Meja 04", type: "DINE-IN", total: 2140000, paymentMethod: "Debit Card", status: "PAID" },
  { time: "13:48:00", tableOrType: "Meja 21", type: "DINE-IN", total: 78000, paymentMethod: "Pending", status: "PENDING" },
  { time: "13:30:20", tableOrType: "T0927", type: "TAKEAWAY", total: 194500, paymentMethod: "OVO", status: "PAID" },
];

const paymentMethodIcon: Record<string, string> = {
  "QRIS - BCA": "/images/kasir/laporan/icon-qris.png",
  "Cash": "/images/kasir/laporan/icon-tunai.png",
  "Debit Card": "/images/kasir/laporan/icon-debit.png",
  "Pending": "/images/kasir/laporan/icon-pending.png",
  "OVO": "/images/kasir/laporan/icon-ewallet.png",
};

const statusStyles: Record<string, string> = {
  PAID: "bg-[#00B954]/15 text-[#00B954] border border-[#00B954]/30",
  PENDING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  KITCHEN: "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30",
};

type FilterStatus = "SEMUA" | "PAID" | "PENDING" | "KITCHEN";

const filterOptions: { value: FilterStatus; label: string; dot: string }[] = [
  { value: "SEMUA",   label: "Semua Status", dot: "#94a3b8" },
  { value: "PAID",    label: "Paid",         dot: "#00B954" },
  { value: "PENDING", label: "Pending",      dot: "#f59e0b" },
  { value: "KITCHEN", label: "Kitchen",      dot: "#22d3ee" },
];

export default function LaporanTransaksiPage() {
  const [currentPage, setCurrentPage]       = useState(1);
  const [filterStatus, setFilterStatus]     = useState<FilterStatus>("SEMUA");
  const [filterOpen, setFilterOpen]         = useState(false);
  const filterRef                           = useRef<HTMLDivElement>(null);
  const [detail, setDetail]                 = useState<Transaction | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = filterStatus === "SEMUA"
    ? mockTransactions
    : mockTransactions.filter((tx) => tx.status === filterStatus);

  return (
    <div className="p-6 space-y-5">
      {/* Stat cards — 75/25 */}
      <div className="grid grid-cols-[3fr_1fr] gap-4">
        {/* Total Penjualan — 75% */}
        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Total Penjualan Hari Ini
            </p>
            <p className="text-[#4CD7F6] font-bold tabular-nums flex items-baseline gap-1.5">
              <span className="text-sm">IDR</span>
              <span className="text-3xl">42.850.000</span>
            </p>
            <p className="text-xs mt-1.5 flex items-center gap-1">
              <span className="text-[#4AE176] font-semibold">+12.5%</span>
              <span className="text-white">vs kemarin</span>
            </p>
          </div>
          <div className="w-14 h-14 bg-[#22d3ee]/10 rounded-xl flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kasir/laporan/icon-total.png" alt="" width={28} height={28} />
          </div>
        </div>

        {/* Jumlah Transaksi — 25% */}
        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 relative">
          <div className="flex items-start justify-between mb-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Jumlah Transaksi
            </p>
            <div className="w-14 h-14 bg-[#00B954]/10 rounded-xl flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/kasir/laporan/icon-jumlah.png" alt="" width={28} height={28} />
            </div>
          </div>
          <p className="text-white text-3xl font-bold mb-3">184</p>
          <div className="w-full h-1.5 bg-[#2a2a3e] rounded-full overflow-hidden">
            <div className="h-full bg-[#4AE176] rounded-full" style={{ width: "73.6%" }} />
          </div>
          <p className="text-slate-400 text-xs mt-1.5">Target Harian: 250 Pesanan</p>
        </div>
      </div>

      {/* Transaction table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        {/* Header bar */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#292839" }}>
          <h3 className="text-white font-semibold text-base">Riwayat Transaksi Terkini</h3>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-2 border border-white/10 text-slate-300 text-sm px-3.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ backgroundColor: "#333344" }}
              >
                <ListFilter size={13} />
                Filter
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border overflow-hidden z-50 shadow-xl"
                  style={{ backgroundColor: "#1A1A2A", borderColor: "#333344" }}>
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setFilterStatus(opt.value); setFilterOpen(false); }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: filterStatus === opt.value ? "#4CD7F6" : "#94a3b8" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.dot }} />
                        <span>{opt.label}</span>
                      </div>
                      {filterStatus === opt.value && <Check size={13} style={{ color: "#4CD7F6" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowExportSuccess(true)}
              className="flex items-center gap-2 bg-[#4CD7F6] text-black text-sm px-3.5 py-2 rounded-lg hover:bg-[#3bc5e3] transition-colors font-semibold"
            >
              <Download size={13} />
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1.5fr_1.2fr_1.5fr_1fr_0.5fr] gap-4 px-5 py-3" style={{ backgroundColor: "#1E1E2E" }}>
          {["Waktu", "No. Meja / Tipe", "Total (IDR)", "Metode Bayar", "Status", "Aksi"].map((h) => (
            <p key={h} className="text-white text-sm font-bold uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {filtered.map((tx, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.5fr_1.2fr_1.5fr_1fr_0.5fr] gap-4 px-5 py-4 border-t border-white/[0.04]"
            style={{ backgroundColor: "#1A1A2A" }}
          >
            <p className="text-sm font-normal self-center" style={{ color: "#E3E0F7" }}>{tx.time}</p>
            <div className="self-center">
              <p className="text-sm font-normal" style={{ color: "#E3E0F7" }}>{tx.tableOrType}</p>
              <p className="text-slate-500 text-[10px] tracking-wide">{tx.type}</p>
            </div>
            <p className="text-[#4CD7F6] text-sm font-bold font-mono tabular-nums self-center">
              {tx.total.toLocaleString("id-ID")}
            </p>
            <div className="self-center flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={paymentMethodIcon[tx.paymentMethod]}
                alt={tx.paymentMethod}
                width={16}
                height={16}
              />
              <span className="text-sm font-normal" style={{ color: "#E3E0F7" }}>{tx.paymentMethod}</span>
            </div>
            <div className="self-center">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${statusStyles[tx.status]}`}>
                {tx.status}
              </span>
            </div>
            <div className="self-center flex justify-center">
              <button onClick={() => setDetail(tx)} className="p-1 transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/kasir/laporan/icon-eye.png"
                  alt="view"
                  width={16}
                  height={16}
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              </button>
            </div>
          </div>
        ))}

        {/* Table footer — pagination */}
        <div
          style={{ backgroundColor: "#292839" }}
          className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between text-sm text-slate-400"
        >
          <p>Menampilkan 1-10 dari 184 transaksi</p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80 text-white"
              style={{ backgroundColor: "#333344" }}
            >
              ‹
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: currentPage === p ? "#4CD7F6" : "#333344",
                  color: currentPage === p ? "#000" : "#cbd5e1",
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:opacity-80 text-white"
              style={{ backgroundColor: "#333344" }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
      {/* Modal detail transaksi */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="w-[440px] rounded-2xl border border-white/10 bg-[#1E1E2E] overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="h-1 bg-[#22C55E]" />
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">Detail Transaksi</p>
                <h3 className="text-white font-bold text-lg">TX-9021</h3>
              </div>
              <button onClick={() => setDetail(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                { label: "Waktu Transaksi", value: detail.time },
                { label: "No. Meja / Tipe", value: `${detail.tableOrType} — ${detail.type}` },
                { label: "Metode Pembayaran", value: detail.paymentMethod },
                { label: "Total", value: `Rp ${detail.total.toLocaleString("id-ID")}`, highlight: true },
                { label: "Status", value: detail.status },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className={`text-sm font-semibold ${highlight ? "text-[#22C55E] font-bold text-base tabular-nums" : "text-white"}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setDetail(null)}
                className="w-full py-2.5 rounded-xl font-bold text-black text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#22C55E" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sukses ekspor */}
      {showExportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[360px] rounded-2xl border border-white/10 bg-[#1E1E2E] p-8 flex flex-col items-center text-center space-y-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(34,197,94,0.15)" }}>
              <Download size={26} style={{ color: "#22C55E" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Data Berhasil Diekspor!</h3>
              <p className="text-slate-400 text-sm">File CSV laporan transaksi telah berhasil diunduh.</p>
            </div>
            <button
              onClick={() => setShowExportSuccess(false)}
              className="w-full py-2.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#22C55E" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
