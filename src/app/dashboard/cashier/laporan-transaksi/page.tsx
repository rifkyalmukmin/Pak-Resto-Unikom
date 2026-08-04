"use client";

import { useState } from "react";
import { Filter, Download } from "lucide-react";

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
  "QRIS - BCA": "/images/laporan/icon-qris.png",
  "Cash": "/images/laporan/icon-tunai.png",
  "Debit Card": "/images/laporan/icon-debit.png",
  "Pending": "/images/laporan/icon-pending.png",
  "OVO": "/images/laporan/icon-ewallet.png",
};

const statusStyles: Record<string, string> = {
  PAID: "bg-[#00B954]/15 text-[#00B954] border border-[#00B954]/30",
  PENDING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  KITCHEN: "bg-[#22d3ee]/15 text-[#22d3ee] border border-[#22d3ee]/30",
};

export default function LaporanTransaksiPage() {
  const [currentPage, setCurrentPage] = useState(1);

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
            <img src="/images/laporan/icon-total.png" alt="" width={28} height={28} />
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
              <img src="/images/laporan/icon-jumlah.png" alt="" width={28} height={28} />
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
            <button className="flex items-center gap-2 bg-[#333344] border border-white/10 text-slate-300 text-sm px-3.5 py-2 rounded-lg hover:bg-[#3d3d55] transition-colors">
              <Filter size={13} />
              Filter
            </button>
            <button className="flex items-center gap-2 bg-[#4CD7F6] text-black text-sm px-3.5 py-2 rounded-lg hover:bg-[#3bc5e3] transition-colors font-semibold">
              <Download size={13} />
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1.5fr_1.2fr_1.5fr_1fr_0.5fr] gap-4 px-5 py-3" style={{ backgroundColor: "#1E1E2E" }}>
          {["Waktu", "No. Meja / Tipe", "Total (IDR)", "Metode Bayar", "Status", "Aksi"].map((h) => (
            <p key={h} className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {/* Rows */}
        {mockTransactions.map((tx, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_1.5fr_1.2fr_1.5fr_1fr_0.5fr] gap-4 px-5 py-4 border-t border-white/[0.04]"
            style={{ backgroundColor: "#1A1A2A" }}
          >
            <p className="text-slate-300 text-sm font-mono self-center">{tx.time}</p>
            <div className="self-center">
              <p className="text-white text-sm font-semibold">{tx.tableOrType}</p>
              <p className="text-slate-500 text-[10px] font-semibold tracking-wide">{tx.type}</p>
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
              <span className="text-slate-300 text-sm">{tx.paymentMethod}</span>
            </div>
            <div className="self-center">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${statusStyles[tx.status]}`}>
                {tx.status}
              </span>
            </div>
            <div className="self-center flex justify-center">
              <button className="p-1 transition-opacity hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/laporan/icon-eye.png"
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
    </div>
  );
}
