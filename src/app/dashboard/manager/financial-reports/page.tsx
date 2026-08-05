"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, FileText, FileSpreadsheet, Search, ListFilter, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRangePicker } from "@/components/manager/date-range-picker";

const ACCENT = "#D0BCFF";

interface SalesRow {
  tanggal: string;
  transaksi: number;
  pendapatan: string;
  rataRata: string;
  status: "Finalized" | "Archived";
}

const salesRows: SalesRow[] = [
  { tanggal: "24 Okt 2023", transaksi: 42, pendapatan: "Rp. 16.250.000", rataRata: "Rp. 386.904", status: "Finalized" },
  { tanggal: "23 Okt 2023", transaksi: 38, pendapatan: "Rp. 14.820.000", rataRata: "Rp. 390.000", status: "Finalized" },
  { tanggal: "22 Okt 2023", transaksi: 56, pendapatan: "Rp. 22.400.000", rataRata: "Rp. 400.000", status: "Finalized" },
  { tanggal: "21 Okt 2023", transaksi: 45, pendapatan: "Rp. 17.100.000", rataRata: "Rp. 380.000", status: "Finalized" },
  { tanggal: "20 Okt 2023", transaksi: 31, pendapatan: "Rp. 11.470.000", rataRata: "Rp. 370.000", status: "Archived" },
];

const statusStyle: Record<SalesRow["status"], { bg: string; color: string; border: string }> = {
  Finalized: { bg: "rgba(16,185,129,0.12)",  color: "#10B981", border: "rgba(16,185,129,0.25)" },
  Archived:  { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "rgba(100,116,139,0.25)" },
};

const statCards = [
  { img: "/images/manager/financial-totalpendapatan.png", label: "Total Pendapatan (IDR)",       value: "Rp. 482.550.000", change: "+12.5%", up: true,  sub: "Bulan ini vs periode sebelumnya" },
  { img: "/images/manager/financial-totaltransaksi.png",  label: "Total Transaksi",               value: "1.248",           change: "+5.2%",  up: true,  sub: "Pesanan berhasil diproses" },
  { img: "/images/manager/financial-ratarata.png",        label: "Rata-rata Nilai Pesanan (IDR)", value: "Rp. 386.658",     change: "-1.8%",  up: false, sub: "Pendapatan per rata-rata transaksi" },
];

type FilterStatus = "Semua" | "Finalized" | "Archived";

export default function FinancialReportsPage() {
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("Semua");
  const [filterOpen, setFilterOpen]     = useState(false);

  const filtered = salesRows.filter((r) =>
    r.tanggal.toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus === "Semua" || r.status === filterStatus)
  );

  return (
    <div className="p-6 space-y-5 min-h-full" style={{ backgroundColor: "#0d1117" }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Pantau dan analisis pendapatan serta transaksi restoran secara menyeluruh.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94a3b8" }}
          >
            <FileText size={14} />
            Export PDF
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            <FileSpreadsheet size={14} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="rounded-xl p-5 border" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl p-2.5 flex items-center justify-center w-fit" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" width={20} height={20} />
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={s.up
                  ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" }
                  : { backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
              >
                {s.change}
              </span>
            </div>
            <p className="text-[11px] font-semibold mb-1" style={{ color: "#CBC3D7" }}>{s.label}</p>
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-[11px]" style={{ color: "#64748b" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Sales Breakdown */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
        {/* Table header */}
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h3 className="text-white font-bold">Rincian Penjualan</h3>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)" }}>
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full border text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none"
              style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
            />
          </div>

          <div className="flex-1" />

          {/* Filter Status */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen((p) => !p)}
              className="flex items-center gap-2 text-sm px-3.5 py-2 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8", backgroundColor: "#151C25" }}
            >
              <ListFilter size={13} />
              <span>{filterStatus === "Semua" ? "Filter Status" : filterStatus}</span>
              <ChevronDown size={12} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>

            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border overflow-hidden z-50 shadow-xl"
                style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}>
                {(["Semua", "Finalized", "Archived"] as FilterStatus[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => { setFilterStatus(val); setFilterOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: filterStatus === val ? "#fff" : "#94a3b8" }}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{
                      backgroundColor: val === "Finalized" ? "#10B981" : val === "Archived" ? "#64748b" : "rgba(255,255,255,0.2)"
                    }} />
                    <span className="flex-1 text-left font-medium">{val}</span>
                    {filterStatus === val && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
                {filterStatus !== "Semua" && (
                  <div className="px-4 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button onClick={() => { setFilterStatus("Semua"); setFilterOpen(false); }}
                      className="text-xs font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: ACCENT }}>
                      Reset filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Tanggal", "Total Transaksi", "Total Pendapatan (Rp)", "Rata-rata per Transaksi (Rp)", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>Tidak ada data yang sesuai.</td>
              </tr>
            ) : filtered.map((row, i) => {
              const st = statusStyle[row.status];
              return (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-3.5 text-white font-medium">{row.tanggal}</td>
                  <td className="px-5 py-3.5" style={{ color: "#94a3b8" }}>{row.transaksi}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: ACCENT }}>{row.pendapatan}</td>
                  <td className="px-5 py-3.5" style={{ color: "#94a3b8" }}>{row.rataRata}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                      style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-5 py-3.5 flex items-center justify-between border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.06)", color: "#64748b" }}>
          <span>Menampilkan <span className="text-white font-semibold">{filtered.length}</span> dari <span className="text-white font-semibold">{salesRows.length}</span> tanggal</span>
          <div className="flex items-center gap-1.5">
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
              <ChevronLeft size={14} />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold transition-colors"
                style={n === 1 ? { backgroundColor: "#D0BCFF", color: "#000" } : { color: "#64748b" }}
              >
                {n}
              </button>
            ))}
            <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
