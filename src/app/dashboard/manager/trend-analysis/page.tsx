"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TrendingUp, ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { DateRangePicker } from "@/components/manager/date-range-picker";
import { api, formatRp } from "@/lib/api";
import type { ApiLaporanTren, ApiTrenKategori, ApiTrenMenu } from "@/types/api";

const BG = "#151C25";
const PAGE = "#0d1117";
const BORD = "rgba(255,255,255,0.07)";
const ACCENT = "#D0BCFF";

const FALLBACK_COLORS = ["#10B981", "#8b5cf6", "#f59e0b", "#475569", "#ADC6FF", "#ef4444"];

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatCompactRp(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")}M`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return formatRp(n);
}

function formatPctLabel(pct: number | null, suffix: string): string {
  if (pct === null) return `— ${suffix}`;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}% ${suffix}`;
}

function hourLabel(h: number): string {
  return `${String(h).padStart(2, "0")}:00`;
}

function GroupedBarChart({
  categories,
  current,
  previous,
}: {
  categories: string[];
  current: number[];
  previous: number[];
}) {
  const maxVal = Math.max(1, ...current, ...previous);
  const W = 500;
  const H = 200;
  const pL = 8;
  const pB = 32;
  const pT = 8;
  const chartH = H - pB - pT;
  const groupW = categories.length > 0 ? (W - pL * 2) / categories.length : W;
  const bW = 20;
  const gap = 6;

  if (categories.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-xs" style={{ color: "#64748b" }}>
        Belum ada data kategori
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={pL}
          y1={pT + t * chartH}
          x2={W - pL}
          y2={pT + t * chartH}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="3 3"
        />
      ))}
      {categories.map((cat, i) => {
        const gx = pL + i * groupW + groupW / 2;
        const x1 = gx - bW - gap / 2;
        const x2 = gx + gap / 2;
        const h1 = (current[i] / maxVal) * chartH;
        const h2 = (previous[i] / maxVal) * chartH;
        const label = cat.length > 12 ? `${cat.slice(0, 10)}…` : cat;
        return (
          <g key={i}>
            <rect x={x1} y={pT + chartH - h1} width={bW} height={h1} rx="4" fill="#C4B5FD" />
            <rect
              x={x2}
              y={pT + chartH - h2}
              width={bW}
              height={h2}
              rx="4"
              fill="#C4B5FD"
              opacity="0.35"
            />
            <text x={gx} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#475569">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({
  segments,
}: {
  segments: Array<{ pct: number; color: string }>;
}) {
  const cx = 110;
  const cy = 110;
  const r = 80;
  const inner = 52;

  function p2c(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  if (segments.length === 0 || segments.every((s) => s.pct === 0)) {
    return (
      <svg viewBox="0 0 220 220" width="100%" height="100%">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={28} />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">
          Total Volume
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">
          0%
        </text>
      </svg>
    );
  }

  let cum = 0;
  return (
    <svg viewBox="0 0 220 220" width="100%" height="100%">
      {segments.map((s, i) => {
        if (s.pct <= 0) return null;
        const sa = cum * 3.6;
        cum += s.pct;
        const ea = Math.min(cum * 3.6 - 0.5, 359.9);
        const start = p2c(sa, r);
        const end = p2c(ea, r);
        const iS = p2c(sa, inner);
        const iE = p2c(ea, inner);
        const large = ea - sa > 180 ? 1 : 0;
        const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} L ${iE.x} ${iE.y} A ${inner} ${inner} 0 ${large} 0 ${iS.x} ${iS.y} Z`;
        return <path key={i} d={d} fill={s.color} />;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">
        Total Volume
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">
        100%
      </text>
    </svg>
  );
}

function CategoryDropdown({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-white/5"
        style={{
          borderColor: open ? ACCENT : "rgba(255,255,255,0.1)",
          color: open ? ACCENT : "#94a3b8",
          backgroundColor: BG,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
        {value === "Semua" ? "Semua Kategori" : value}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border z-50 shadow-xl overflow-hidden max-h-60 overflow-y-auto"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors hover:bg-white/5"
              style={{ color: value === opt ? "#fff" : "#94a3b8" }}
            >
              <span className="flex-1 text-left font-medium">
                {opt === "Semua" ? "Semua Kategori" : opt}
              </span>
              {value === opt && <Check size={11} style={{ color: ACCENT }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function mergeKategoriNames(
  current: ApiTrenKategori[],
  previous: ApiTrenKategori[]
): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const c of [...current, ...previous]) {
    if (!seen.has(c.nama_kategori)) {
      seen.add(c.nama_kategori);
      names.push(c.nama_kategori);
    }
  }
  return names;
}

function colorFor(cat: ApiTrenKategori | undefined, index: number): string {
  return cat?.warna || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

type PeriodTab = "Mingguan" | "Bulanan" | "Kuartalan";

const PERIOD_API: Record<PeriodTab, "mingguan" | "bulanan" | "kuartalan"> = {
  Mingguan: "mingguan",
  Bulanan: "bulanan",
  Kuartalan: "kuartalan",
};

const PERIOD_LABEL: Record<PeriodTab, { current: string; previous: string }> = {
  Mingguan: { current: "Minggu Ini", previous: "Minggu Lalu" },
  Bulanan: { current: "Bulan Ini", previous: "Bulan Lalu" },
  Kuartalan: { current: "Kuartal Ini", previous: "Kuartal Lalu" },
};

export default function TrendAnalysisPage() {
  const [period, setPeriod] = useState<PeriodTab>("Mingguan");
  const [kategori, setKategori] = useState("Semua");
  const [tren, setTren] = useState<ApiLaporanTren | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState<{ from: string; to: string } | null>(null);

  const load = useCallback(
    async (opts?: { period?: PeriodTab; from?: string; to?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const p = opts?.period ?? period;
        const data = await api.getLaporanTren(
          opts?.from && opts?.to
            ? { from: opts.from, to: opts.to }
            : { period: PERIOD_API[p] }
        );
        setTren(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat tren");
      } finally {
        setLoading(false);
      }
    },
    [period]
  );

  useEffect(() => {
    if (customRange) {
      load({ from: customRange.from, to: customRange.to });
    } else {
      load({ period });
    }
  }, [period, customRange, load]);

  function handlePeriod(tab: PeriodTab) {
    setCustomRange(null);
    setPeriod(tab);
  }

  function handleDateChange(range: { start: Date | null; end: Date | null }) {
    if (!range.start) {
      setCustomRange(null);
      return;
    }
    setCustomRange({
      from: toYMD(range.start),
      to: toYMD(range.end ?? new Date()),
    });
  }

  const categoryNames = useMemo(
    () => mergeKategoriNames(tren?.by_kategori ?? [], tren?.by_kategori_prev ?? []),
    [tren]
  );

  const filterOptions = useMemo(() => ["Semua", ...categoryNames], [categoryNames]);

  const barCurrent = categoryNames.map((name) => {
    const row = tren?.by_kategori.find((c) => c.nama_kategori === name);
    return row?.qty ?? 0;
  });
  const barPrevious = categoryNames.map((name) => {
    const row = tren?.by_kategori_prev.find((c) => c.nama_kategori === name);
    return row?.qty ?? 0;
  });

  const totalRevenue = (tren?.by_kategori ?? []).reduce((s, c) => s + c.revenue, 0);
  const donutSegments = (tren?.by_kategori ?? []).map((c, i) => ({
    pct: totalRevenue > 0 ? Math.round((c.revenue / totalRevenue) * 1000) / 10 : 0,
    color: colorFor(c, i),
    label: c.nama_kategori,
  }));

  // Normalize donut to ~100
  const donutSum = donutSegments.reduce((s, d) => s + d.pct, 0);
  if (donutSegments.length > 0 && donutSum > 0 && Math.abs(donutSum - 100) > 0.2) {
    donutSegments[0].pct += 100 - donutSum;
  }

  const donutLegend = donutSegments.map((s) => ({
    label: s.label,
    pct: `${s.pct.toFixed(0)}%`,
    color: s.color,
  }));

  const topItems: ApiTrenMenu[] = (tren?.top_menu ?? []).filter(
    (it) => kategori === "Semua" || it.nama_kategori === kategori
  );

  const prevQtyMap = useMemo(() => {
    const m = new Map<number, number>();
    // Use previous period kategori totals only; per-menu prev not available — compare via current vs 0
    for (const c of tren?.by_kategori_prev ?? []) {
      m.set(c.id_kategori, c.qty);
    }
    return m;
  }, [tren]);

  const peaks = tren?.peaks ?? [];
  const periodLabels = PERIOD_LABEL[period];
  const hariIni = tren?.hari_ini;
  const pendapatanPct = hariIni?.perubahan_pendapatan_pct ?? null;
  const transaksiPct = hariIni?.perubahan_transaksi_pct ?? null;

  const categoryColor = useMemo(() => {
    const map: Record<string, { bg: string; color: string }> = {};
    (tren?.by_kategori ?? []).forEach((c, i) => {
      const color = colorFor(c, i);
      map[c.nama_kategori] = { bg: `${color}26`, color };
    });
    return map;
  }, [tren]);

  return (
    <div className="p-6 space-y-4 min-h-full" style={{ backgroundColor: PAGE }}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trend Penjualan</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Analisis tren penjualan dan performa menu restoran secara berkala.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg overflow-hidden border"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            {(["Mingguan", "Bulanan", "Kuartalan"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handlePeriod(tab)}
                className="px-3.5 py-1.5 text-sm font-semibold transition-colors"
                style={
                  period === tab && !customRange
                    ? { backgroundColor: "#D0BCFF", color: "#000" }
                    : { backgroundColor: "transparent", color: "#64748b" }
                }
              >
                {tab}
              </button>
            ))}
          </div>
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

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>
              Pendapatan Hari Ini
            </p>
            <TrendingUp size={14} style={{ color: "#10B981" }} />
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? "—" : formatCompactRp(hariIni?.total_pendapatan ?? 0)}
          </p>
          <p
            className="flex items-center gap-1 text-xs font-semibold mt-1.5"
            style={{
              color:
                pendapatanPct === null
                  ? "#64748b"
                  : pendapatanPct >= 0
                    ? "#10B981"
                    : "#ef4444",
            }}
          >
            {pendapatanPct !== null && <ArrowUpRight size={11} />}
            {loading ? "—" : formatPctLabel(pendapatanPct, "dari kemarin")}
          </p>
        </div>

        <div className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>
              Pesanan Diproses
            </p>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ADC6FF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">
            {loading ? "—" : String(hariIni?.total_transaksi ?? 0)}
          </p>
          <p
            className="flex items-center gap-1 text-xs font-semibold mt-1.5"
            style={{
              color:
                transaksiPct === null
                  ? "#64748b"
                  : transaksiPct >= 0
                    ? "#10B981"
                    : "#ef4444",
            }}
          >
            {transaksiPct !== null && <ArrowUpRight size={11} />}
            {loading ? "—" : formatPctLabel(transaksiPct, "vs kemarin")}
          </p>
        </div>

        <div className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#CBC3D7" }}>
            Jam Puncak Performa
          </p>
          {loading ? (
            <p className="text-white">—</p>
          ) : peaks.length === 0 ? (
            <p className="text-sm" style={{ color: "#64748b" }}>
              Belum ada data jam puncak
            </p>
          ) : (
            <div className="flex items-start gap-3">
              {peaks.slice(0, 2).map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  {i > 0 && (
                    <div
                      className="w-px self-stretch"
                      style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                    />
                  )}
                  <div>
                    <p className="text-base font-bold text-white">
                      {hourLabel(p.start)} – {hourLabel(p.end)}
                    </p>
                    <p className="text-xs font-semibold mt-0.5" style={{ color: ACCENT }}>
                      {p.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-5 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <h3 className="text-white font-bold text-sm">Volume Penjualan Kategori</h3>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "#64748b" }}>
            Performa seluruh kategori menu
          </p>
          <div style={{ height: 200 }}>
            <GroupedBarChart
              categories={categoryNames}
              current={barCurrent}
              previous={barPrevious}
            />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#C4B5FD" }} />
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {periodLabels.current}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: "#C4B5FD", opacity: 0.35 }}
              />
              <span className="text-xs" style={{ color: "#94a3b8" }}>
                {periodLabels.previous}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <h3 className="text-white font-bold text-sm">Distribusi Pesanan</h3>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "#64748b" }}>
            Berdasarkan kategori pendapatan
          </p>
          <div style={{ height: 200 }}>
            <DonutChart segments={donutSegments} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {donutLegend.length === 0 ? (
              <span className="text-xs" style={{ color: "#64748b" }}>
                Belum ada distribusi
              </span>
            ) : (
              donutLegend.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    {l.label}
                  </span>
                  <span className="text-xs font-bold text-white ml-auto">{l.pct}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: BG, borderColor: BORD }}>
        <div
          className="px-5 py-3.5 border-b flex items-center justify-between"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <h3 className="text-white font-bold">Katalog Penjualan Terbaik</h3>
          <div className="flex items-center gap-2">
            <CategoryDropdown
              options={filterOptions}
              value={kategori}
              onChange={setKategori}
            />
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
            >
              Lihat Katalog
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["DETAIL ITEM", "KATEGORI", "JUMLAH TERJUAL", "PENDAPATAN", "TREN"].map((h) => (
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
                <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                  Memuat…
                </td>
              </tr>
            )}
            {!loading && topItems.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                  Belum ada penjualan pada periode ini
                </td>
              </tr>
            )}
            {!loading &&
              topItems.map((item) => {
                const cat =
                  categoryColor[item.nama_kategori] ?? {
                    bg: "rgba(100,116,139,0.15)",
                    color: "#94a3b8",
                  };
                const prevCatQty = prevQtyMap.get(item.id_kategori) ?? 0;
                const trendUp = item.qty > 0 && (prevCatQty === 0 || item.qty >= prevCatQty / Math.max(1, (tren?.by_kategori.length ?? 1)));
                return (
                  <tr
                    key={item.id_menu}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-base"
                          style={{
                            backgroundColor: "rgba(139,92,246,0.12)",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          🍽️
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{item.nama_menu}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                            SKU: MN-{String(item.id_menu).padStart(4, "0")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        {item.nama_kategori}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-white font-semibold">
                      {item.qty.toLocaleString("id-ID")} unit
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: ACCENT }}>
                      {formatRp(item.revenue)}
                    </td>
                    <td className="px-5 py-3.5">
                      {trendUp ? (
                        <ArrowUpRight size={17} style={{ color: "#10B981" }} />
                      ) : (
                        <ArrowRight size={17} style={{ color: "#64748b" }} />
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
