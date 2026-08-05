"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, MoreVertical, ArrowRight, X } from "lucide-react";
import { DateRangePicker } from "@/components/manager/date-range-picker";

interface OrderRow {
  id: string;
  time: string;
  period: string;
  items: string;
  amount: string;
  status: "Completed" | "Preparing" | "Cancelled";
  table: string;
  handler: string;
  type: "Dine-in" | "Takeaway";
}

const recentOrders: OrderRow[] = [
  { id: "#UK-89210", time: "14:23", period: "PM", items: "Ayam Bakar Madu (2x), Es Teh Manis (2x)",      amount: "156.000", status: "Completed", table: "Meja 3",   handler: "Pelayan – Rina",  type: "Dine-in"  },
  { id: "#UK-89209", time: "14:15", period: "PM", items: "Sate Maranggi (1x), Nasi Putih (1x)",           amount: "78.500",  status: "Preparing", table: "Takeaway", handler: "Kasir – Dani",    type: "Takeaway" },
  { id: "#UK-89208", time: "13:58", period: "PM", items: "Gado-Gado Spesial (1x), Jus Alpukat (1x)",      amount: "62.000",  status: "Completed", table: "Meja 1",   handler: "Pelayan – Rina",  type: "Dine-in"  },
  { id: "#UK-89207", time: "13:45", period: "PM", items: "Iga Bakar Penyet (1x), Kerupuk Kaleng (3x)",    amount: "112.000", status: "Cancelled", table: "Meja 5",   handler: "Pelayan – Budi",  type: "Dine-in"  },
];

const statusStyle: Record<OrderRow["status"], { bg: string; color: string; border: string }> = {
  Completed: { bg: "rgba(16,185,129,0.12)",  color: "#10B981", border: "rgba(16,185,129,0.25)" },
  Preparing: { bg: "rgba(173,198,255,0.10)",  color: "#ADC6FF", border: "rgba(173,198,255,0.20)" },
  Cancelled: { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", border: "rgba(239,68,68,0.25)" },
};

export default function ManagerDashboardPage() {
  const [selected, setSelected] = useState<OrderRow | null>(null);

  return (
    <div className="p-6 space-y-5 min-h-full" style={{ backgroundColor: "#0d1117" }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ringkasan Eksekutif</h1>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Analitik kinerja real-time cabang UNIKOM.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker iconSrc="/images/manager/icon-kalender.png" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Total Pendapatan */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-xl p-2.5 flex items-center justify-center" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/manager/icon-pendapatan.png" alt="" width={22} height={22} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#10B981" }}>
              <TrendingUp size={10} />12.5%
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#CBC3D7" }}>TOTAL PENDAPATAN HARIAN</p>
          <p className="text-xl font-bold" style={{ color: "#D0BCFF" }}>Rp4.520.000</p>
        </div>

        {/* Total Pesanan */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-xl p-2.5 flex items-center justify-center" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/manager/icon-totalpesanan.png" alt="" width={22} height={22} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#10B981" }}>
              <TrendingUp size={10} />8.2%
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#CBC3D7" }}>TOTAL PESANAN</p>
          <p className="text-xl font-bold" style={{ color: "#ADC6FF" }}>42</p>
        </div>

        {/* Rata-rata Nilai Belanja */}
        <div className="rounded-xl p-5 border" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-xl p-2.5 flex items-center justify-center" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/manager/icon-ratarata.png" alt="" width={22} height={22}
                style={{ filter: "brightness(0) saturate(100%) invert(74%) sepia(47%) saturate(627%) hue-rotate(105deg) brightness(103%)" }} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "#ef4444" }}>
              <TrendingDown size={10} />2.1%
            </span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#CBC3D7" }}>RATA-RATA NILAI BELANJA</p>
          <p className="text-xl font-bold" style={{ color: "#4EDEA3" }}>Rp107.600</p>
        </div>

        {/* Menu Terlaris */}
        <div className="rounded-xl p-5 border relative overflow-hidden" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
          <span className="absolute top-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981" }}>
            Top Pick
          </span>
          <div className="rounded-xl p-2.5 flex items-center justify-center mb-3 w-fit" style={{ backgroundColor: "rgba(139,92,246,0.15)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/manager/icon-menuterlaris.png" alt="" width={22} height={22} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#CBC3D7" }}>MENU TERLARIS</p>
          <p className="text-base font-bold text-white leading-tight">Ayam Bakar Madu</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 border-b flex items-start justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div>
            <h3 className="text-white font-bold">Aktivitas Pesanan Terbaru</h3>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Overview of last 10 transactions</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#10B981" }}>
            View All <ArrowRight size={13} />
          </button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["ID PESANAN", "WAKTU", "MENU", "TOTAL", "STATUS", "AKSI"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((row) => {
              const st = statusStyle[row.status];
              return (
                <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-4 text-white font-mono text-xs font-semibold">{row.id}</td>
                  <td className="px-5 py-4 text-white text-xs font-semibold whitespace-nowrap">
                    {row.time} <span style={{ color: "#64748b" }}>{row.period}</span>
                  </td>
                  <td className="px-5 py-4 text-white text-xs">{row.items}</td>
                  <td className="px-5 py-4 text-sm font-bold whitespace-nowrap" style={{ color: "#D0BCFF" }}>
                    Rp{row.amount}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                      style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setSelected(row)} className="text-slate-400 hover:text-white transition-colors p-1">
                      <MoreVertical size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (() => {
        const st = statusStyle[selected.status];
        const itemList = selected.items.split(", ");
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setSelected(null)}>
            <div className="w-[420px] rounded-2xl border p-6 space-y-5"
              style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.08)" }}
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-base font-mono">{selected.id}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{selected.time} {selected.period} · {selected.table}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

              {/* Info rows */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Tipe</span>
                  <span className="text-white font-medium">{selected.type}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Ditangani</span>
                  <span className="text-white font-medium">{selected.handler}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Status</span>
                  <span className="px-3 py-0.5 rounded-full text-[11px] font-semibold border"
                    style={{ backgroundColor: st.bg, color: st.color, borderColor: st.border }}>
                    {selected.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#64748b" }}>Total</span>
                  <span className="text-white font-bold">Rp{selected.amount}</span>
                </div>
              </div>

              <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

              {/* Items */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#CBC3D7" }}>Item Pesanan</p>
                <ul className="space-y-2">
                  {itemList.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#D0BCFF" }} />
                      {item}
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
