"use client";

import { useState, useRef, useEffect } from "react";
import { TrendingUp, ArrowUpRight, ArrowRight, Check } from "lucide-react";
import { DateRangePicker } from "@/components/manager/date-range-picker";

// ── Bar Chart ─────────────────────────────────────────────────────────────
function GroupedBarChart() {
  const categories = ["Appetizer", "Main Course", "Dessert", "Snack", "Beverage"];
  const current  = [65, 120, 45, 35, 95];
  const previous = [50,  95, 55, 25, 110];
  const maxVal   = 130;
  const W = 500; const H = 200;
  const pL = 8; const pB = 32; const pT = 8;
  const chartH = H - pB - pT;
  const groupW = (W - pL * 2) / categories.length;
  const bW = 20; const gap = 6;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={i} x1={pL} y1={pT + t * chartH} x2={W - pL} y2={pT + t * chartH}
          stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
      ))}
      {categories.map((cat, i) => {
        const gx  = pL + i * groupW + groupW / 2;
        const x1  = gx - bW - gap / 2;
        const x2  = gx + gap / 2;
        const h1  = (current[i]  / maxVal) * chartH;
        const h2  = (previous[i] / maxVal) * chartH;
        return (
          <g key={i}>
            <rect x={x1} y={pT + chartH - h1} width={bW} height={h1} rx="4" fill="#C4B5FD" />
            <rect x={x2} y={pT + chartH - h2} width={bW} height={h2} rx="4" fill="#C4B5FD" opacity="0.35" />
            <text x={gx} y={H - 6} textAnchor="middle" fontSize="8.5" fill="#475569">{cat}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────────────────────────────
function DonutChart() {
  const segments = [
    { pct: 42, color: "#10B981" },
    { pct: 28, color: "#8b5cf6" },
    { pct: 18, color: "#f59e0b" },
    { pct: 12, color: "#475569" },
  ];
  const cx = 110; const cy = 110; const r = 80; const inner = 52;

  function p2c(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  let cum = 0;
  return (
    <svg viewBox="0 0 220 220" width="100%" height="100%">
      {segments.map((s, i) => {
        const sa = cum * 3.6;
        cum += s.pct;
        const ea = cum * 3.6 - 1;
        const start = p2c(sa, r); const end = p2c(ea, r);
        const iS = p2c(sa, inner); const iE = p2c(ea, inner);
        const large = (ea - sa + 1) > 180 ? 1 : 0;
        const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} L ${iE.x} ${iE.y} A ${inner} ${inner} 0 ${large} 0 ${iS.x} ${iS.y} Z`;
        return <path key={i} d={d} fill={s.color} />;
      })}
      <text x={cx} y={cy - 8}  textAnchor="middle" fontSize="11" fill="#94a3b8">Total Volume</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">100%</text>
    </svg>
  );
}

const donutLegend = [
  { label: "Main Course", pct: "42%", color: "#10B981" },
  { label: "Beverage",    pct: "28%", color: "#8b5cf6" },
  { label: "Dessert",     pct: "18%", color: "#f59e0b" },
  { label: "Others",      pct: "12%", color: "#475569" },
];

interface TopItem { name: string; sku: string; category: string; sold: string; revenue: string; trend: "up" | "neutral"; }

const topItems: TopItem[] = [
  { name: "Nasi Goreng Wagyu Special", sku: "SKU: MC-0012", category: "Main Course", sold: "1.240 unit", revenue: "Rp 155.000.000", trend: "up" },
  { name: "Signature Matcha Latte",    sku: "SKU: BV-0045", category: "Beverage",    sold: "980 unit",   revenue: "Rp 44.100.000",  trend: "up" },
  { name: "Molten Lava Dessert",       sku: "SKU: DS-0008", category: "Dessert",     sold: "825 unit",   revenue: "Rp 41.250.000",  trend: "neutral" },
];

const categoryColor: Record<string, { bg: string; color: string }> = {
  "Main Course": { bg: "rgba(16,185,129,0.15)",  color: "#10B981" },
  "Beverage":    { bg: "rgba(139,92,246,0.15)",  color: "#8b5cf6" },
  "Dessert":     { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  "Snack":       { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
};

const BG     = "#151C25";
const PAGE   = "#0d1117";
const BORD   = "rgba(255,255,255,0.07)";
const ACCENT = "#D0BCFF";

type KategoriFilter = "Semua" | "Main Course" | "Beverage" | "Dessert" | "Snack";
const KATEGORI_OPTIONS: KategoriFilter[] = ["Semua", "Main Course", "Beverage", "Dessert", "Snack"];

function CategoryDropdown({ value, onChange }: { value: KategoriFilter; onChange: (v: KategoriFilter) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const catColor: Record<string, string> = {
    "Semua": "rgba(255,255,255,0.2)", "Main Course": "#10B981",
    "Beverage": "#8b5cf6", "Dessert": "#f59e0b", "Snack": "#94a3b8",
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors hover:bg-white/5"
        style={{ borderColor: open ? ACCENT : "rgba(255,255,255,0.1)", color: open ? ACCENT : "#94a3b8", backgroundColor: BG }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor[value] }} />
        {value === "Semua" ? "Semua Kategori" : value}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border z-50 shadow-xl overflow-hidden"
          style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}>
          {KATEGORI_OPTIONS.map((opt) => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs transition-colors hover:bg-white/5"
              style={{ color: value === opt ? "#fff" : "#94a3b8" }}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catColor[opt] }} />
              <span className="flex-1 text-left font-medium">{opt === "Semua" ? "Semua Kategori" : opt}</span>
              {value === opt && <Check size={11} style={{ color: ACCENT }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrendAnalysisPage() {
  const [period, setPeriod]   = useState<"Mingguan" | "Bulanan" | "Kuartalan">("Mingguan");
  const [kategori, setKategori] = useState<KategoriFilter>("Semua");

  return (
    <div className="p-6 space-y-4 min-h-full" style={{ backgroundColor: PAGE }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trend Penjualan</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Analisis tren penjualan dan performa menu restoran secara berkala.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {(["Mingguan", "Bulanan", "Kuartalan"] as const).map((tab) => (
              <button key={tab} onClick={() => setPeriod(tab)}
                className="px-3.5 py-1.5 text-sm font-semibold transition-colors"
                style={period === tab ? { backgroundColor: "#D0BCFF", color: "#000" } : { backgroundColor: "transparent", color: "#64748b" }}>
                {tab}
              </button>
            ))}
          </div>
          <DateRangePicker iconSrc="/images/manager/icon-kalender.png" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Pendapatan */}
        <div className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>Pendapatan Hari Ini</p>
            <TrendingUp size={14} style={{ color: "#10B981" }} />
          </div>
          <p className="text-2xl font-bold text-white">Rp 4,25M</p>
          <p className="flex items-center gap-1 text-xs font-semibold mt-1.5" style={{ color: "#10B981" }}>
            <ArrowUpRight size={11} /> +12.5% dari kemarin
          </p>
        </div>

        {/* Pesanan */}
        <div className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>Pesanan Diproses</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADC6FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <p className="text-2xl font-bold text-white">342</p>
          <p className="flex items-center gap-1 text-xs font-semibold mt-1.5" style={{ color: "#10B981" }}>
            <ArrowUpRight size={11} /> +5.2% vs rata-rata
          </p>
        </div>

        {/* Jam Puncak */}
        <div className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#CBC3D7" }}>Jam Puncak Performa</p>
          <div className="flex items-start gap-3">
            <div>
              <p className="text-base font-bold text-white">12:30 – 14:00</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: ACCENT }}>Lunch Peak</p>
            </div>
            <div className="w-px self-stretch" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div>
              <p className="text-base font-bold text-white">19:00 – 21:00</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: ACCENT }}>Dinner Peak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts 50:50 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bar chart */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <h3 className="text-white font-bold text-sm">Volume Penjualan Kategori</h3>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "#64748b" }}>Performa harian seluruh kategori menu</p>
          <div style={{ height: 200 }}>
            <GroupedBarChart />
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#C4B5FD" }} />
              <span className="text-xs" style={{ color: "#94a3b8" }}>Minggu Ini</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#C4B5FD", opacity: 0.35 }} />
              <span className="text-xs" style={{ color: "#94a3b8" }}>Minggu Lalu</span>
            </div>
          </div>
        </div>

        {/* Donut */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: BG, borderColor: BORD }}>
          <h3 className="text-white font-bold text-sm">Distribusi Pesanan</h3>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "#64748b" }}>Berdasarkan kategori pendapatan</p>
          <div style={{ height: 200 }}>
            <DonutChart />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {donutLegend.map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                <span className="text-xs" style={{ color: "#94a3b8" }}>{l.label}</span>
                <span className="text-xs font-bold text-white ml-auto">{l.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Catalog */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: BG, borderColor: BORD }}>
        <div className="px-5 py-3.5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h3 className="text-white font-bold">Katalog Penjualan Terbaik</h3>
          <div className="flex items-center gap-2">
            <CategoryDropdown value={kategori} onChange={setKategori} />
            <button className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}>
              Lihat Katalog
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["DETAIL ITEM", "KATEGORI", "JUMLAH TERJUAL", "PENDAPATAN", "TREN"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topItems.filter((it) => kategori === "Semua" || it.category === kategori).map((item, i) => {
              const cat = categoryColor[item.category] ?? { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" };
              return (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-base"
                        style={{ backgroundColor: "rgba(139,92,246,0.12)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        🍽️
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{item.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold" style={{ backgroundColor: cat.bg, color: cat.color }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white font-semibold">{item.sold}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: ACCENT }}>{item.revenue}</td>
                  <td className="px-5 py-3.5">
                    {item.trend === "up"
                      ? <ArrowUpRight size={17} style={{ color: "#10B981" }} />
                      : <ArrowRight   size={17} style={{ color: "#64748b" }} />}
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
