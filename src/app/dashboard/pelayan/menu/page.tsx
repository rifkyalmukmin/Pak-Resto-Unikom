"use client";

import { useState } from "react";
import { XCircle, Check, X, Info } from "lucide-react";

type Category = "Semua" | "Makanan" | "Minuman" | "Dessert";
type MenuStatus = "Tersedia" | "Habis";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: Exclude<Category, "Semua">;
  status: MenuStatus;
  image: string;
}

const categories: Category[] = ["Semua", "Makanan", "Minuman", "Dessert"];

const initialMenu: MenuItem[] = [
  { id: 1, name: "Nasi Goreng Kambing",   description: "Spesial bumbu rempah UNIKOM",    price: 45000,  category: "Makanan",  status: "Tersedia", image: "/images/menu/nasi-goreng.png" },
  { id: 2, name: "Matcha Creamy Latte",   description: "Premium Uji Matcha Grade",         price: 29000,  category: "Minuman",  status: "Tersedia", image: "/images/menu/iced-cappucino.png" },
  { id: 3, name: "Wagyu MB7 Steak",       description: "Truffle Mashed Potato Side",       price: 185000, category: "Makanan",  status: "Habis",    image: "/images/menu/rendang-sapi.png" },
  { id: 4, name: "Classic Tiramisu",      description: "Authentic Italian Recipe",          price: 35000,  category: "Dessert",  status: "Tersedia", image: "/images/menu/chocolate-lava.png" },
  { id: 5, name: "Salmon Poke Bowl",      description: "Fresh Norwegian Salmon",            price: 65000,  category: "Makanan",  status: "Tersedia", image: "/images/menu/caesar-salad.png" },
  { id: 6, name: "Lychee Mojito",         description: "Cold Pressed Fresh Lime",           price: 32000,  category: "Minuman",  status: "Tersedia", image: "/images/menu/lychee-tea.png" },
  { id: 7, name: "Sate Maranggi",         description: "Authentic Purwakarta Beef",         price: 52000,  category: "Makanan",  status: "Habis",    image: "/images/menu/mix-dim-sum.png" },
  { id: 8, name: "Jus Alpukat Spesial",   description: "Drip Chocolate Garnish",           price: 22000,  category: "Minuman",  status: "Tersedia", image: "/images/menu/ayam-goreng.png" },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className="relative w-10 h-[22px] rounded-full transition-colors shrink-0 overflow-hidden"
    style={{ backgroundColor: checked ? "#10B981" : "#374151" }}
  >
    <span
      className="absolute top-[3px] w-4 h-4 bg-white rounded-full shadow"
      style={{ left: checked ? "21px" : "3px", transition: "left 0.2s ease" }}
    />
  </button>
);

export default function KatalogMenuPage() {
  const [menuList, setMenuList]             = useState<MenuItem[]>(initialMenu);
  const [activeCategory, setActiveCategory] = useState<Category>("Semua");
  const [viewItem, setViewItem]             = useState<MenuItem | null>(null);

  const filtered = menuList.filter((m) =>
    activeCategory === "Semua" || m.category === activeCategory
  );

  const tersediaCount = menuList.filter((m) => m.status === "Tersedia").length;
  const habisCount    = menuList.filter((m) => m.status === "Habis").length;

  function toggleStatus(id: number) {
    setMenuList((p) => p.map((m) =>
      m.id === id ? { ...m, status: m.status === "Tersedia" ? "Habis" : "Tersedia" } : m
    ));
  }

  // Keep viewItem in sync if status changes while modal is open
  const viewItemLive = viewItem ? (menuList.find((m) => m.id === viewItem.id) ?? null) : null;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-5">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Katalog Menu</h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-lg leading-relaxed">
              Perbarui ketersediaan hidangan secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-6">
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#10B98118", color: "#4EDEA3", border: "1px solid #10B98130" }}>
              <Check size={11} strokeWidth={3} />
              {tersediaCount} Tersedia
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#ef444418", color: "#FFB4AB", border: "1px solid #ef444430" }}>
              <XCircle size={11} strokeWidth={2} />
              {habisCount} Habis
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
              style={activeCategory === cat
                ? { backgroundColor: "#10B981", color: "#000" }
                : { backgroundColor: "#1E293B", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.07)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu grid */}
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden flex flex-col border" style={{ backgroundColor: "#1E293B", borderColor: "#3C4A42" }}>
              {/* Image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 text-[11px] font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "#0B1326", color: "#4EDEA3" }}>
                  {fmt(item.price)}
                </span>
                {/* View detail button */}
                <button
                  onClick={() => setViewItem(item)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#0B132680", backdropFilter: "blur(4px)" }}
                >
                  <Info size={12} style={{ color: "#94a3b8" }} />
                </button>
                {item.status === "Habis" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400/60" style={{ backgroundColor: "#ef444480" }}>
                      HABIS
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <div>
                  <p className="text-white text-sm font-bold leading-tight line-clamp-1">{item.name}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto py-2 border-t" style={{ borderColor: "#3C4A42" }}>
                  <div className="flex items-center gap-1.5">
                    {item.status === "Tersedia" ? (
                      <Check size={13} strokeWidth={3} style={{ color: "#4EDEA3" }} />
                    ) : (
                      <XCircle size={13} style={{ color: "#FFB4AB" }} strokeWidth={2} />
                    )}
                    <span className="text-xs font-semibold" style={{ color: item.status === "Tersedia" ? "#4EDEA3" : "#FFB4AB" }}>
                      {item.status === "Tersedia" ? "Tersedia" : "Habis"}
                    </span>
                  </div>
                  <Toggle checked={item.status === "Tersedia"} onChange={() => toggleStatus(item.id)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View detail popup */}
      {viewItemLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewItem(null)} />
          <div className="relative w-[480px] rounded-2xl overflow-hidden border shadow-2xl z-10" style={{ borderColor: "#3C4A42" }}>
            {/* Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={viewItemLive.image} alt={viewItemLive.name} className="w-full h-full object-cover" />
              {viewItemLive.status === "Habis" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400/60" style={{ backgroundColor: "#ef444480" }}>
                    HABIS
                  </span>
                </div>
              )}
              <button
                onClick={() => setViewItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#0B132690", backdropFilter: "blur(4px)" }}
              >
                <X size={15} color="#fff" />
              </button>
            </div>

            {/* Detail */}
            <div className="px-6 py-5 space-y-4" style={{ backgroundColor: "#1E293B" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-white text-lg font-bold">{viewItemLive.name}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">{viewItemLive.description}</p>
                </div>
                <span className="text-sm font-bold px-3 py-1.5 rounded-full shrink-0" style={{ backgroundColor: "#0B1326", color: "#4EDEA3" }}>
                  {fmt(viewItemLive.price)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: "#10B98115", color: "#4EDEA3", border: "1px solid #10B98130" }}>
                  {viewItemLive.category}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md"
                  style={viewItemLive.status === "Tersedia"
                    ? { backgroundColor: "#10B98115", color: "#4EDEA3", border: "1px solid #10B98130" }
                    : { backgroundColor: "#ef444415", color: "#FFB4AB", border: "1px solid #ef444430" }
                  }>
                  {viewItemLive.status === "Tersedia"
                    ? <Check size={10} strokeWidth={3} />
                    : <XCircle size={10} strokeWidth={2} />
                  }
                  {viewItemLive.status}
                </span>
              </div>

              {/* Toggle status inside popup */}
              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#3C4A42" }}>
                <span className="text-slate-400 text-sm">Ubah ketersediaan</span>
                <Toggle
                  checked={viewItemLive.status === "Tersedia"}
                  onChange={() => toggleStatus(viewItemLive.id)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
