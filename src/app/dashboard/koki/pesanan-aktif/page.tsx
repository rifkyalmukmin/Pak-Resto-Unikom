"use client";

import { useState } from "react";
import { Check, CheckCircle2, Circle, PlusCircle, RefreshCw } from "lucide-react";

type OrderStatus = "active" | "urgent" | "done";
type OrderType = "dine-in" | "takeaway";

interface OrderItem {
  name: string;
  qty: number;
  done: boolean;
}

interface Order {
  id: number;
  type: OrderType;
  table?: string;
  status: OrderStatus;
  timer: string;
  items: OrderItem[];
  note?: string;
}

interface InventoryItem {
  name: string;
  category: string;
  stock: number;
  unit: string;
  stockStatus: "aman" | "menipis" | "habis";
}

const initialOrders: Order[] = [
  {
    id: 342,
    type: "dine-in",
    table: "08",
    status: "urgent",
    timer: "23:52",
    note: "Sambal pisah",
    items: [
      { name: "Ayam Bakar Madu", qty: 2, done: false },
      { name: "Es Teh Leci", qty: 1, done: false },
    ],
  },
  {
    id: 341,
    type: "takeaway",
    status: "active",
    timer: "31:07",
    items: [{ name: "Nasi Goreng Spesial", qty: 1, done: false }],
  },
  {
    id: 343,
    type: "dine-in",
    table: "12",
    status: "urgent",
    timer: "34:37",
    note: "Tanpa Gula",
    items: [
      { name: "Rendang Sapi", qty: 1, done: false },
      { name: "Jus Alpukat", qty: 2, done: false },
    ],
  },
  {
    id: 344,
    type: "dine-in",
    table: "01",
    status: "active",
    timer: "02:33",
    items: [
      { name: "Sate Ayam Madura", qty: 1, done: false },
      { name: "Soto Ayam", qty: 1, done: false },
    ],
  },
  {
    id: 345,
    type: "dine-in",
    table: "06",
    status: "active",
    timer: "01:15",
    note: "Tidak pakai MSG",
    items: [
      { name: "Nasi Goreng Spesial", qty: 2, done: false },
      { name: "Ayam Bakar Madu", qty: 1, done: false },
      { name: "Es Teh Leci", qty: 3, done: false },
    ],
  },
];

const initialInventory: InventoryItem[] = [
  { name: "Ayam Bakar Madu", category: "Main Course", stock: 42, unit: "Porsi", stockStatus: "aman" },
  { name: "Rendang Sapi", category: "Specialty", stock: 8, unit: "Porsi", stockStatus: "menipis" },
  { name: "Nasi Goreng Spesial", category: "Main Course", stock: 30, unit: "Porsi", stockStatus: "aman" },
  { name: "Sate Ayam Madura", category: "Appetizer", stock: 3, unit: "Porsi", stockStatus: "habis" },
];

const ACCENT = "#F59E0B";

function cardHeaderBg(status: OrderStatus, note?: string) {
  if (status === "done") return "#10B981";
  if (note) return "#EF4444";
  return "#F59E0B";
}

export default function PesananAktifPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [filter, setFilter] = useState<"all" | "dine-in" | "takeaway">("all");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);
  const [updateValue, setUpdateValue] = useState("");

  const dineInCount = orders.filter((o) => o.type === "dine-in" && o.status !== "done").length;
  const takeawayCount = orders.filter((o) => o.type === "takeaway" && o.status !== "done").length;

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.type === filter);

  function toggleItem(orderId: number, itemIdx: number) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const items = o.items.map((it, i) =>
          i === itemIdx ? { ...it, done: !it.done } : it
        );
        const allDone = items.every((it) => it.done);
        return { ...o, items, status: allDone ? "done" : o.status === "done" ? "active" : o.status };
      })
    );
  }

  function markDone(orderId: number) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "done", items: o.items.map((it) => ({ ...it, done: true })) }
          : o
      )
    );
    setConfirmId(null);
    setSuccessId(orderId);
  }

  function handleUpdateStock() {
    if (!updateItem || !updateValue) return;
    const val = parseInt(updateValue);
    if (isNaN(val) || val < 0) return;
    setInventory((prev) =>
      prev.map((it) => {
        if (it.name !== updateItem.name) return it;
        const stockStatus: InventoryItem["stockStatus"] =
          val === 0 ? "habis" : val <= 10 ? "menipis" : "aman";
        return { ...it, stock: val, stockStatus };
      })
    );
    setUpdateItem(null);
    setUpdateValue("");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Antrean Pesanan</h1>
        <div className="flex items-center gap-2">
          {(["all", "dine-in", "takeaway"] as const).map((f) => {
            const label =
              f === "all"
                ? "Semua"
                : f === "dine-in"
                ? `Dine-in (${dineInCount})`
                : `Takeaway (${takeawayCount})`;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
                style={
                  filter === f
                    ? { backgroundColor: ACCENT, color: "#000" }
                    : { backgroundColor: "#1E1E2E", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Order grid */}
      <div className="grid grid-cols-3 gap-4">
        {filtered.map((order) => {
          const headerBg = cardHeaderBg(order.status, order.note);
          const headerText = headerBg === "#F59E0B" ? "#000" : "#fff";
          const allDone = order.items.every((i) => i.done);
          const doneCount = order.items.filter((i) => i.done).length;
          const isDone = order.status === "done";

          return (
            <div
              key={order.id}
              className="rounded-xl overflow-hidden flex flex-col"
              style={{
                backgroundColor: "#1E1E2E",
                border: "1px solid #45464C",
              }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: headerBg }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold" style={{ color: headerText }}>#{order.id}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: headerText, opacity: 0.8 }}>
                      {order.type === "takeaway" ? "Takeaway" : `Table ${order.table}`}
                    </p>
                    <p className="text-xs" style={{ color: headerText, opacity: 0.6 }}>
                      {doneCount}/{order.items.length} {order.items.length === 1 ? "Item" : "Items"}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-lg font-bold" style={{ color: headerText }}>{order.timer}</span>
              </div>

              {/* Items */}
              <div className="flex-1 px-4 py-3 space-y-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3">
                    <span className={`text-sm ${item.done ? "line-through text-slate-500" : "text-white"}`}>
                      {item.qty}x {item.name}
                    </span>
                    <button
                      onClick={() => !isDone && toggleItem(order.id, idx)}
                      className="shrink-0 transition-colors"
                      disabled={isDone}
                    >
                      {item.done ? (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#10B981" }}>
                          <Check size={12} className="text-black" strokeWidth={3} />
                        </div>
                      ) : (
                        <Circle size={20} className="text-slate-600 hover:text-slate-400 transition-colors" />
                      )}
                    </button>
                  </div>
                ))}

                {/* Placeholder rows agar tinggi card minimal = 3 item */}
                {Array.from({ length: Math.max(0, 3 - order.items.length) }).map((_, i) => (
                  <div key={`pad-${i}`} className="flex items-center gap-3 invisible pointer-events-none">
                    <Circle size={20} />
                    <span className="text-sm">placeholder</span>
                  </div>
                ))}

                {order.note && (
                  <div className="mt-2 px-2 py-1.5 rounded text-[11px] font-medium text-red-300 bg-red-900/30 border border-red-700/30">
                    CATATAN: {order.note}
                  </div>
                )}

              </div>

              {/* Button */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => !allDone && setConfirmId(order.id)}
                  disabled={allDone}
                  className="w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
                  style={
                    allDone
                      ? { backgroundColor: "rgba(49,53,63,0.30)", color: "#6b7280", cursor: "default" }
                      : { backgroundColor: ACCENT, color: "#000" }
                  }
                >
                  {allDone ? "Sudah Selesai" : "Tandai Selesai"}
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty slot */}
        <div className="rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center min-h-[200px] gap-3 bg-[#1E1E2E]/40">
          <PlusCircle size={48} className="text-slate-700" strokeWidth={1.5} />
          <p className="text-slate-600 text-xs font-bold tracking-widest uppercase text-center">
            Siap Terima
            <br />
            Pesanan
          </p>
        </div>
      </div>

      {/* Inventory status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-lg font-bold">Status Inventaris</h2>
          <button className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: ACCENT }}>
            <RefreshCw size={14} />
            Refresh Stok
          </button>
        </div>

        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["NAMA ITEM", "KATEGORI", "STOK TERSEDIA", "STATUS", "AKSI"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, i) => (
                <tr key={item.name} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
                  <td className="px-5 py-3 text-white font-medium">{item.name}</td>
                  <td className="px-5 py-3 text-slate-400">{item.category}</td>
                  <td className="px-5 py-3 font-mono font-bold"
                    style={{ color: item.stockStatus === "aman" ? "#10B981" : item.stockStatus === "menipis" ? ACCENT : "#EF4444" }}>
                    {item.stock} {item.unit}
                  </td>
                  <td className="px-5 py-3">
                    {item.stockStatus === "aman" && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide"
                        style={{ color: "#10B981", backgroundColor: "#10B98115", borderColor: "#10B98130" }}>
                        STOK AMAN
                      </span>
                    )}
                    {item.stockStatus === "menipis" && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide"
                        style={{ color: ACCENT, backgroundColor: `${ACCENT}15`, borderColor: `${ACCENT}30` }}>
                        STOK MENIPIS
                      </span>
                    )}
                    {item.stockStatus === "habis" && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide"
                        style={{ color: "#EF4444", backgroundColor: "#EF444415", borderColor: "#EF444430" }}>
                        STOK HABIS
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setUpdateItem(item); setUpdateValue(String(item.stock)); }}
                      className="text-xs font-bold uppercase tracking-wide transition-colors hover:opacity-80"
                      style={{ color: ACCENT }}
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm done modal */}
      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl border border-white/10 bg-[#1E2235] px-8 py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${ACCENT}20` }}>
                <CheckCircle2 size={28} style={{ color: ACCENT }} />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Tandai Selesai?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Konfirmasi bahwa pesanan <span className="text-white font-semibold">#{confirmId}</span> sudah
                selesai dimasak dan siap disajikan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => markDone(confirmId)}
                className="flex-1 py-3 rounded-xl font-bold text-black transition-colors"
                style={{ backgroundColor: ACCENT }}
              >
                Ya, Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success modal */}
      {successId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl border border-white/10 bg-[#1E2235] px-8 py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/15 flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-[#10B981]" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Pesanan Selesai!</h3>
            <p className="text-slate-400 text-sm mb-6">
              Pesanan <span className="text-white font-semibold">#{successId}</span> berhasil ditandai selesai.
            </p>
            <button
              onClick={() => setSuccessId(null)}
              className="w-full py-3 rounded-xl font-bold text-black transition-colors"
              style={{ backgroundColor: "#10B981" }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Update stock modal */}
      {updateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl border border-white/10 bg-[#1E2235] px-8 py-8">
            <h3 className="text-white text-lg font-bold mb-1">Update Stok</h3>
            <p className="text-slate-400 text-sm mb-5">{updateItem.name}</p>
            <div className="mb-5">
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wide block mb-2">
                Jumlah Stok ({updateItem.unit})
              </label>
              <input
                type="number"
                min={0}
                value={updateValue}
                onChange={(e) => setUpdateValue(e.target.value)}
                className="w-full bg-[#121221] border border-white/15 text-white rounded-xl px-4 py-3 text-lg font-bold focus:outline-none focus:border-[#F59E0B]/50 transition-colors"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setUpdateItem(null); setUpdateValue(""); }}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateStock}
                className="flex-1 py-3 rounded-xl font-bold text-black transition-colors"
                style={{ backgroundColor: ACCENT }}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
