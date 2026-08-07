"use client";

import { useState, useCallback, useEffect } from "react";
import { TrendingUp, TrendingDown, FileText, FileSpreadsheet, Search, ListFilter, ChevronDown, Check } from "lucide-react";
import { DateRangePicker } from "@/components/manager/date-range-picker";
import { api, formatRp } from "@/lib/api";
import type { ApiLaporanHarian, ApiLaporanPendapatan } from "@/types/api";

const ACCENT = "#D0BCFF";

const statusStyle = {
  Finalized: { bg: "rgba(16,185,129,0.12)", color: "#10B981", border: "rgba(16,185,129,0.25)" },
};

type FilterStatus = "Semua" | "Finalized";

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

export default function FinancialReportsPage() {
  const [laporan, setLaporan] = useState<ApiLaporanPendapatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("Semua");
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportType, setExportType] = useState<"PDF" | "Excel" | null>(null);

  const loadLaporan = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLaporanPendapatan({ from, to });
      setLaporan(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLaporan();
  }, [loadLaporan]);

  function handleDateChange(range: { start: Date | null; end: Date | null }) {
    if (!range.start) {
      loadLaporan();
      return;
    }
    const from = toYMD(range.start);
    const endDate = range.end ?? new Date();
    const to = toYMD(endDate);
    loadLaporan(from, to);
  }

  const harian = laporan?.harian ?? [];
  const ringkasan = laporan?.ringkasan;

  const filtered = harian.filter((r) => {
    const matchSearch = r.tanggal_label.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statCards = [
    {
      img: "/images/manager/financial-totalpendapatan.png",
      label: "Total Pendapatan (IDR)",
      value: loading ? "—" : formatRp(ringkasan?.total_pendapatan ?? 0),
      change: loading ? "—" : formatPct(ringkasan?.perubahan_pendapatan_pct ?? null),
      up: ringkasan?.perubahan_pendapatan_pct === null || (ringkasan?.perubahan_pendapatan_pct ?? 0) >= 0,
      sub: "Bulan ini vs periode sebelumnya",
    },
    {
      img: "/images/manager/financial-totaltransaksi.png",
      label: "Total Transaksi",
      value: loading ? "—" : String(ringkasan?.total_transaksi ?? 0),
      change: loading ? "—" : formatPct(ringkasan?.perubahan_transaksi_pct ?? null),
      up: ringkasan?.perubahan_transaksi_pct === null || (ringkasan?.perubahan_transaksi_pct ?? 0) >= 0,
      sub: "Pesanan berhasil diproses",
    },
    {
      img: "/images/manager/financial-ratarata.png",
      label: "Rata-rata Nilai Pesanan (IDR)",
      value: loading ? "—" : formatRp(ringkasan?.rata_rata ?? 0),
      change: loading ? "—" : formatPct(ringkasan?.perubahan_rata_pct ?? null),
      up: ringkasan?.perubahan_rata_pct === null || (ringkasan?.perubahan_rata_pct ?? 0) >= 0,
      sub: "Pendapatan per rata-rata transaksi",
    },
  ];

  return (
    <div className="p-6 space-y-5 min-h-full" style={{ backgroundColor: "#0d1117" }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Keuangan</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Pantau dan analisis pendapatan serta transaksi restoran secara menyeluruh.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            iconSrc="/images/manager/financial-totalpendapatan.png"
            onChange={handleDateChange}
          />
          <button
            onClick={() => setExportType("PDF")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94a3b8" }}
          >
            <FileText size={14} />
            Export PDF
          </button>
          <button
            onClick={() => setExportType("Excel")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            <FileSpreadsheet size={14} />
            Export Excel
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm border"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <div key={i} className="rounded-xl p-5 border" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
            <div className="flex items-start justify-between mb-4">
              <div className="rounded-xl p-2.5 flex items-center justify-center w-fit" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" width={20} height={20} />
              </div>
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
                style={
                  s.change === "—"
                    ? { backgroundColor: "rgba(100,116,139,0.12)", color: "#94a3b8" }
                    : s.up
                      ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" }
                      : { backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }
                }
              >
                {s.change !== "—" && (s.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />)}
                {s.change}
              </span>
            </div>
            <p className="text-[11px] font-semibold mb-1" style={{ color: "#CBC3D7" }}>{s.label}</p>
            <p className="text-2xl font-bold text-white mb-1">{s.value}</p>
            <p className="text-[11px]" style={{ color: "#64748b" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h3 className="text-white font-bold">Rincian Penjualan</h3>
        </div>

        <div
          className="px-5 py-3 flex items-center gap-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.01)" }}
        >
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
              <div
                className="absolute right-0 top-full mt-1 w-44 rounded-xl border overflow-hidden z-50 shadow-xl"
                style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
              >
                {(["Semua", "Finalized"] as FilterStatus[]).map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setFilterStatus(val);
                      setFilterOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: filterStatus === val ? "#fff" : "#94a3b8" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: val === "Finalized" ? "#10B981" : "rgba(255,255,255,0.2)" }}
                    />
                    <span className="flex-1 text-left font-medium">{val}</span>
                    {filterStatus === val && <Check size={13} style={{ color: ACCENT }} />}
                  </button>
                ))}
                {filterStatus !== "Semua" && (
                  <div className="px-4 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button
                      onClick={() => {
                        setFilterStatus("Semua");
                        setFilterOpen(false);
                      }}
                      className="text-xs font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: ACCENT }}
                    >
                      Reset filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm" style={{ color: "#64748b" }}>Memuat laporan...</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["Tanggal", "Total Transaksi", "Total Pendapatan (Rp)", "Rata-rata per Transaksi (Rp)", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                      Tidak ada data yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row: ApiLaporanHarian) => {
                    const st = statusStyle[row.status];
                    return (
                      <tr
                        key={row.tanggal}
                        className="hover:bg-white/[0.02] transition-colors"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        <td className="px-5 py-3.5 text-white font-medium">{row.tanggal_label}</td>
                        <td className="px-5 py-3.5" style={{ color: "#94a3b8" }}>{row.transaksi}</td>
                        <td className="px-5 py-3.5 font-semibold" style={{ color: ACCENT }}>{formatRp(row.pendapatan)}</td>
                        <td className="px-5 py-3.5" style={{ color: "#94a3b8" }}>{formatRp(row.rata_rata)}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                            style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            <div
              className="px-5 py-3.5 flex items-center justify-between border-t text-xs"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "#64748b" }}
            >
              <span>
                Menampilkan <span className="text-white font-semibold">{filtered.length}</span> dari{" "}
                <span className="text-white font-semibold">{harian.length}</span> tanggal
              </span>
            </div>
          </>
        )}
      </div>

      {exportType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              {exportType === "PDF" ? (
                <FileText size={26} style={{ color: "#D0BCFF" }} />
              ) : (
                <FileSpreadsheet size={26} style={{ color: "#D0BCFF" }} />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-lg">Laporan Berhasil Diekspor!</h3>
              <p className="text-sm" style={{ color: "#64748b" }}>
                File {exportType} laporan keuangan telah berhasil diunduh.
              </p>
            </div>
            <button
              onClick={() => setExportType(null)}
              className="w-full py-2.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
