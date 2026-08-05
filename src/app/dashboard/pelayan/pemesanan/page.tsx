"use client";

import { useState } from "react";
import { Plus, Minus, FileText, ChefHat, ChevronDown, TableProperties, X, Check } from "lucide-react";

const mejaOptions = Array.from({ length: 20 }, (_, i) => i + 1);

type Category = "Semua" | "Appetizer" | "Main Course" | "Dessert" | "Beverage";
type OverlayType = "catatan" | "konfirmasi-dapur" | "sukses-dapur" | null;

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: Exclude<Category, "Semua">;
  tag?: string;
  image: string;
}

const categories: Category[] = ["Semua", "Appetizer", "Main Course", "Dessert", "Beverage"];

const menuItems: MenuItem[] = [
  { id: 1, name: "Signature Wagyu",  price: 185000, category: "Main Course", tag: "BEST SELLER", image: "/images/menu/rendang-sapi.png" },
  { id: 2, name: "Seafood Linguine", price: 95000,  category: "Main Course", image: "/images/menu/mix-dim-sum.png" },
  { id: 3, name: "Lava Fondant",     price: 45000,  category: "Dessert",     image: "/images/menu/chocolate-lava.png" },
  { id: 4, name: "Emerald Cooler",   price: 35000,  category: "Beverage",    image: "/images/menu/lychee-tea.png" },
  { id: 5, name: "Caesar Classic",   price: 55000,  category: "Appetizer",   image: "/images/menu/caesar-salad.png" },
  { id: 6, name: "Truffle Risotto",  price: 115000, category: "Main Course", image: "/images/menu/nasi-goreng.png" },
  { id: 7, name: "Ayam Goreng",      price: 65000,  category: "Main Course", image: "/images/menu/ayam-goreng.png" },
  { id: 8, name: "Iced Cappuccino",  price: 38000,  category: "Beverage",    image: "/images/menu/iced-cappucino.png" },
];

const TAX_RATE = 0.1;
const fmt = (n: number) => "Rp" + n.toLocaleString("id-ID").replace(/,/g, ".");

const InfoIcon = () => (
  <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}>
    <span className="text-[#10B981] font-bold text-lg leading-none select-none">i</span>
  </div>
);
const SuccessIcon = () => (
  <div className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}>
    <Check size={22} color="#10B981" strokeWidth={3} />
  </div>
);

export default function PemesananMakananPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [qty, setQty]                       = useState<Record<number, number>>({});
  const [selectedMeja, setSelectedMeja]     = useState<number | null>(null);
  const [mejaOpen, setMejaOpen]             = useState(false);
  const [overlay, setOverlay]               = useState<OverlayType>(null);
  const [catatan, setCatatan]               = useState("");

  const filtered = activeCategory === "Semua"
    ? menuItems
    : menuItems.filter((m) => m.category === activeCategory);

  const cartItems   = menuItems.filter((m) => (qty[m.id] ?? 0) > 0);
  const totalItems  = cartItems.reduce((s, m) => s + (qty[m.id] ?? 0), 0);
  const subtotal    = cartItems.reduce((s, m) => s + m.price * (qty[m.id] ?? 0), 0);
  const pajak       = Math.round(subtotal * TAX_RATE);
  const grandTotal  = subtotal + pajak;

  const increment = (id: number) => setQty((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  const decrement = (id: number) =>
    setQty((p) => {
      const next = (p[id] ?? 0) - 1;
      if (next <= 0) { const { [id]: _, ...rest } = p; return rest; }
      return { ...p, [id]: next };
    });

  function handleKirimKeDapur() {
    setQty({});
    setSelectedMeja(null);
    setCatatan("");
    setOverlay("sukses-dapur");
  }

  return (
    <div className="flex h-full">
      {/* ── Menu catalog ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Category tabs */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
                style={activeCategory === cat
                  ? { backgroundColor: "#10B981", color: "#000" }
                  : { backgroundColor: "#1E293B", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)" }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-auto px-6 pb-6 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((item) => {
              const q = qty[item.id] ?? 0;
              return (
                <div key={item.id} className="rounded-xl border border-white/5 overflow-hidden flex flex-col" style={{ backgroundColor: "#171F33" }}>
                  {/* Image */}
                  <div className="w-full aspect-[4/3] relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    {item.tag && (
                      <span className="absolute top-2 right-2 text-black text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "#10B981" }}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4 flex flex-col gap-3">
                    <p className="text-white text-sm font-semibold line-clamp-1">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold" style={{ color: "#10B981" }}>
                        {fmt(item.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decrement(item.id)}
                          className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                          style={{ backgroundColor: "#131B2E" }}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-white text-sm font-semibold w-5 text-center tabular-nums">{q}</span>
                        <button
                          onClick={() => increment(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: "#10B981" }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Keranjang Pesanan ─────────────────────── */}
      <div className="w-[400px] border-l border-white/5 flex flex-col shrink-0" style={{ backgroundColor: "#1E293B" }}>
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Keranjang Pesanan</h3>
          {totalItems > 0 && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#10B981", color: "#000" }}>
              {totalItems} ITEM
            </span>
          )}
        </div>

        {/* Pilih Meja */}
        <div className="px-5 py-4 border-b border-white/5 relative">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Pilih Meja</p>
          <button
            onClick={() => setMejaOpen((p) => !p)}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10 hover:border-white/20 transition-colors"
            style={{ backgroundColor: "#131B2E" }}
          >
            <TableProperties size={15} className="text-slate-400 shrink-0" />
            <span className={`flex-1 text-left text-sm ${selectedMeja ? "text-white font-semibold" : "text-slate-500"}`}>
              {selectedMeja ? `Meja ${selectedMeja}` : "Pilih nomor meja..."}
            </span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${mejaOpen ? "rotate-180" : ""}`} />
          </button>

          {mejaOpen && (
            <div className="absolute left-5 right-5 top-full mt-1 rounded-xl border border-white/10 p-3 z-50 shadow-xl" style={{ backgroundColor: "#0D1625" }}>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2.5 px-1">Nomor Meja</p>
              <div className="grid grid-cols-5 gap-1.5">
                {mejaOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => { setSelectedMeja(m); setMejaOpen(false); }}
                    className="h-9 rounded-lg text-sm font-bold transition-all"
                    style={selectedMeja === m
                      ? { backgroundColor: "#10B981", color: "#000" }
                      : { backgroundColor: "#1E293B", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)" }
                    }
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Order items */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-2.5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
          {cartItems.length === 0 ? (
            <p className="text-slate-600 text-sm text-center mt-10">Belum ada item ditambahkan</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ backgroundColor: "#0B1326" }}
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold leading-snug line-clamp-1 mb-2">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => decrement(item.id)}
                      className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      style={{ backgroundColor: "#1E293B" }}
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-white font-bold text-sm w-5 text-center tabular-nums">{qty[item.id]}</span>
                    <button
                      onClick={() => increment(item.id)}
                      className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      style={{ backgroundColor: "#1E293B" }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => setQty((p) => { const { [item.id]: _, ...rest } = p; return rest; })}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X size={11} />
                  </button>
                  <p className="text-white text-sm font-bold tabular-nums">
                    {fmt(item.price * (qty[item.id] ?? 0))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + Actions */}
        <div className="px-5 pt-4 pb-5 space-y-2.5 border-t border-white/5" style={{ backgroundColor: "#2D3449" }}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-slate-300 tabular-nums">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Pajak &amp; Layanan (10%)</span>
            <span className="text-slate-300 tabular-nums">{fmt(pajak)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-white font-bold text-sm">Grand Total</span>
            <span className="font-bold text-2xl tabular-nums" style={{ color: "#10B981" }}>
              {fmt(grandTotal)}
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setOverlay("catatan")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              <FileText size={14} /> Catatan
            </button>
            <button
              onClick={() => cartItems.length > 0 && setOverlay("konfirmasi-dapur")}
              disabled={cartItems.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              <ChefHat size={14} /> Kirim ke Dapur
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Catatan ─────────────────────────── */}
      {overlay === "catatan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10">
            {/* Header */}
            <div className="px-7 pt-6 pb-5 border-b border-white/5 flex items-start justify-between" style={{ backgroundColor: "#2D3449" }}>
              <div>
                <h2 className="font-bold text-xl text-white">Catatan Pesanan</h2>
                <p className="text-slate-400 text-sm mt-1">Tambahkan instruksi khusus untuk dapur.</p>
              </div>
              <button onClick={() => setOverlay(null)} className="text-slate-500 hover:text-white transition-colors p-1 mt-0.5">
                <X size={18} />
              </button>
            </div>
            {/* Body */}
            <div className="px-7 py-6" style={{ backgroundColor: "#222A3D" }}>
              <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Catatan untuk Dapur</label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={4}
                placeholder="Contoh: tidak pakai pedas, alergi kacang, porsi lebih sedikit..."
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#10B981]/50 transition-colors resize-none"
                style={{ backgroundColor: "#060E20" }}
              />
            </div>
            {/* Footer */}
            <div className="px-7 py-5 flex items-center justify-end gap-3" style={{ backgroundColor: "#2D3449" }}>
              <button onClick={() => setOverlay(null)} className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                Batal
              </button>
              <button
                onClick={() => setOverlay(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Konfirmasi Kirim ke Dapur ──────── */}
      {overlay === "konfirmasi-dapur" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Kirim ke Dapur</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Apakah anda yakin ingin mengirim pesanan {selectedMeja ? `Meja ${selectedMeja}` : "ini"} ke dapur?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setOverlay(null)} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: "#10B981", color: "#10B981" }}>Batal</button>
              <button onClick={handleKirimKeDapur} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Ya, Kirim</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Sukses Kirim ke Dapur ───────────── */}
      {overlay === "sukses-dapur" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Pesanan Terkirim ke Dapur!</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Pesanan telah berhasil dikirimkan ke dapur dan sedang diproses.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}
    </div>
  );
}
