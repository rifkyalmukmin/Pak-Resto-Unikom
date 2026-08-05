"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, XCircle } from "lucide-react";

type OrderStatus = "MENUNGGU BAYAR" | "DIPROSES" | "SELESAI";

interface TakeAwayOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
}

const mockOrders: TakeAwayOrder[] = [
  { id: "#TKW-9821", customer: "Andi Wijaya", items: 4, total: 152000, status: "MENUNGGU BAYAR" },
  { id: "#TKW-9820", customer: "Siti Aminah", items: 2, total: 85500, status: "DIPROSES" },
  { id: "#TKW-9819", customer: "Bambang Hero", items: 7, total: 243000, status: "SELESAI" },
  { id: "#TKW-9818", customer: "Ratna Sari", items: 1, total: 32000, status: "SELESAI" },
  { id: "#TKW-9817", customer: "Doni Tata", items: 3, total: 112000, status: "DIPROSES" },
  { id: "#TKW-9816", customer: "Eka Putra", items: 5, total: 198500, status: "MENUNGGU BAYAR" },
];

const statusStyles: Record<OrderStatus, string> = {
  "MENUNGGU BAYAR": "bg-red-500/15 text-red-400 border border-red-500/30",
  DIPROSES: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  SELESAI: "bg-[#00B954]/15 text-[#00B954] border border-[#00B954]/30",
};

const statuses = ["Semua Status", "MENUNGGU BAYAR", "DIPROSES", "SELESAI"] as const;

export default function TakeAwayPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Semua Status");

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua Status" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { total: 124, menunggu: 12, diproses: 8, selesai: 104 };

  return (
    <div className="p-6 space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pesanan Hari Ini", value: counts.total, color: "text-white" },
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

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Pesanan atau Nama..."
            className="w-full bg-[#1E1E2E] border border-white/10 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1E1E2E] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-white/25 transition-colors cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <Link
          href="/dashboard/kasir/take-away/tambah"
          className="ml-auto flex items-center gap-2 bg-[#06B6D4] hover:bg-[#0597B0] text-black text-sm font-bold px-4 py-2.5 rounded-lg transition-colors"
        >
          <PlusCircle size={16} strokeWidth={2} />
          Tambah Pesanan
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_0.5fr] gap-4 px-5 py-3 bg-[#292839]">
          {["NO. PESANAN", "NAMA PELANGGAN", "JUMLAH ITEM", "TOTAL (IDR)", "STATUS", "AKSI"].map((h) => (
            <p key={h} className="text-white text-sm font-bold uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {filtered.map((order, i) => (
          <div
            key={order.id}
            className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_0.5fr] gap-4 px-5 py-4 transition-colors"
            style={{ backgroundColor: i % 2 === 0 ? "#1E1E2E" : "#252538" }}
          >
            <p className="text-sm font-normal self-center" style={{ color: "#E3E0F7" }}>{order.id}</p>
            <p className="text-sm font-normal self-center" style={{ color: "#E3E0F7" }}>{order.customer}</p>
            <p className="text-sm font-normal self-center" style={{ color: "#E3E0F7" }}>{order.items} Item</p>
            <p className="text-sm font-normal tabular-nums self-center" style={{ color: "#E3E0F7" }}>
              {order.total.toLocaleString("id-ID")}
            </p>
            <div className="self-center">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${statusStyles[order.status]}`}>
                {order.status}
              </span>
            </div>
            <div className="self-center flex justify-center">
              <button className="text-white hover:text-red-400 transition-colors p-1 rounded-full hover:bg-red-500/10">
                <XCircle size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <p>Menampilkan 1-6 dari {counts.total} pesanan</p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-lg bg-[#1E1E2E] border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
            Sebelumnya
          </button>
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                p === 1
                  ? "bg-[#06B6D4] text-black"
                  : "bg-[#1E1E2E] border border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
          <button className="px-3 py-1.5 rounded-lg bg-[#1E1E2E] border border-white/10 text-slate-300 hover:bg-white/10 transition-colors">
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}
