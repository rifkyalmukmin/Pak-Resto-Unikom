"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Minus, User } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  tag?: string;
  image: string;
}

interface OrderItem {
  item: MenuItem;
  qty: number;
}

const categories = ["Semua Menu", "Main Course", "Appetizers", "Minuman", "Dessert"];

const mockMenu: MenuItem[] = [
  { id: 1, name: "Nasi Goreng Spesial", price: 35000, category: "Main Course", tag: "BEST SELLER", image: "/images/menu/nasi-goreng.png" },
  { id: 2, name: "Ayam Goreng", price: 28000, category: "Main Course", image: "/images/menu/ayam-goreng.png" },
  { id: 3, name: "Es Teh Lychee", price: 15000, category: "Minuman", image: "/images/menu/lychee-tea.png" },
  { id: 4, name: "Rendang Sapi", price: 45000, category: "Main Course", image: "/images/menu/rendang-sapi.png" },
  { id: 5, name: "Caesar Salad", price: 32000, category: "Appetizers", image: "/images/menu/caesar-salad.png" },
  { id: 6, name: "Iced Cappuccino", price: 22000, category: "Minuman", image: "/images/menu/iced-cappucino.png" },
  { id: 7, name: "Mix Dim Sum", price: 25000, category: "Appetizers", image: "/images/menu/mix-dim-sum.png" },
  { id: 8, name: "Chocolate Lava", price: 30000, category: "Dessert", image: "/images/menu/chocolate-lava.png" },
];

const TAX_RATE = 0.1;

export default function TambahPesananPage() {
  const [activeCategory, setActiveCategory] = useState("Semua Menu");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  const filteredMenu =
    activeCategory === "Semua Menu"
      ? mockMenu
      : mockMenu.filter((m) => m.category === activeCategory);

  const addItem = (item: MenuItem) => {
    setOrderItems((prev) => {
      const existing = prev.find((o) => o.item.id === item.id);
      if (existing) return prev.map((o) => (o.item.id === item.id ? { ...o, qty: o.qty + 1 } : o));
      return [...prev, { item, qty: 1 }];
    });
  };

  const changeQty = (id: number, delta: number) => {
    setOrderItems((prev) =>
      prev.map((o) => (o.item.id === id ? { ...o, qty: o.qty + delta } : o)).filter((o) => o.qty > 0)
    );
  };

  const subtotal = orderItems.reduce((sum, o) => sum + o.item.price * o.qty, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  return (
    <div className="flex h-full">
      {/* Left — menu catalog */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Category tabs */}
        <div className="flex gap-2 px-6 pt-5 pb-3 shrink-0 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-[#22d3ee] text-black"
                  : "bg-[#1E1E2E] text-slate-400 border border-white/5 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-auto px-6 pb-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-3 gap-4">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="bg-[#1E1E2E] rounded-xl border border-white/5 p-4 text-left hover:border-white/15 hover:bg-[#2a2a3e] transition-all group"
              >
                <div className="w-full aspect-[4/3] bg-[#2a2a3e] rounded-lg mb-3 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  {item.tag && (
                    <span className="absolute top-2 right-2 bg-[#00B954] text-black text-[11px] font-bold px-2.5 py-1 rounded-full">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="text-white text-sm font-semibold line-clamp-1 group-hover:text-[#22d3ee] transition-colors">
                  {item.name}
                </p>
                <p className="text-[#22d3ee] text-sm font-bold mt-0.5">
                  IDR {item.price.toLocaleString("id-ID")}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — order summary */}
      <div className="w-[440px] border-l border-white/5 flex flex-col bg-[#1E1E2E] shrink-0">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Order Summary</h3>
          <span className="bg-[#22d3ee]/15 text-[#22d3ee] text-xs font-bold px-2.5 py-1 rounded-full">
            Take Away
          </span>
        </div>

        {/* Customer name */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10 bg-[#1A1A2A]">
            <User size={16} className="text-slate-400 shrink-0" />
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1 bg-transparent text-white text-sm font-medium focus:outline-none placeholder-slate-500"
              placeholder="Nama pelanggan..."
            />
          </div>
        </div>

        {/* Order items */}
        <div className="flex-1 overflow-auto px-3 py-2 space-y-1.5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {orderItems.length === 0 ? (
            <p className="text-slate-600 text-sm text-center mt-10">Belum ada item ditambahkan</p>
          ) : (
            orderItems.map((o, i) => (
              <div
                key={o.item.id}
                className="flex items-center gap-5 px-5 py-4 rounded-xl"
                style={{ backgroundColor: i % 2 === 0 ? "#1A1A2A" : "#292839" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold leading-snug">{o.item.name}</p>
                  <p className="text-slate-500 text-xs mt-1">IDR {o.item.price.toLocaleString("id-ID")}</p>
                </div>
                <div className="flex items-center shrink-0 border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => changeQty(o.item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-white font-bold text-sm w-7 text-center tabular-nums border-x border-white/10">{o.qty}</span>
                  <button
                    onClick={() => changeQty(o.item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-white/10 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <p className="text-white text-sm font-semibold font-mono tabular-nums shrink-0 text-right w-28">
                  IDR {(o.item.price * o.qty).toLocaleString("id-ID")}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Totals + Actions */}
        <div className="bg-[#292839] px-5 pt-4 pb-5 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-slate-300 tabular-nums">IDR {subtotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pajak (10%)</span>
            <span className="text-slate-300 tabular-nums">IDR {tax.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-white font-bold text-sm">Total Biaya</span>
            <span className="text-[#22d3ee] font-bold text-2xl tabular-nums">
              IDR {total.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <Link
              href="/dashboard/cashier/take-away"
              className="flex-1 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold text-center hover:bg-white/5 transition-colors"
            >
              Batal
            </Link>
            <button
              disabled={orderItems.length === 0}
              className="flex-1 py-3 rounded-xl bg-[#00B954] hover:bg-[#009944] disabled:opacity-40 disabled:cursor-not-allowed text-black text-sm font-bold transition-colors"
            >
              Simpan Pesanan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
