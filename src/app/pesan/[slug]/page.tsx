"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { findBySlug } from "@/lib/menu-data";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function ItemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { addItem, totalItems } = useCart();

  const item = findBySlug(slug);

  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!item || !item.isAvailable) return;
    addItem(
      { menuItemId: item.id, name: item.name, price: item.price, image: item.image },
      qty,
      notes
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 font-sans">
        <UtensilsCrossed size={40} className="text-stone-200" />
        <p className="text-stone-500">Menu tidak ditemukan.</p>
        <Link href="/pesan" className="text-amber-700 underline text-sm">
          Kembali ke menu
        </Link>
      </div>
    );
  }

  const subtotal = item.price * qty;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ArrowLeft size={18} className="text-stone-700" />
          </button>
          <Link href="/pesan" className="font-playfair text-lg font-bold text-amber-900">
            Pak Resto UNIKOM
          </Link>
          <Link
            href="/pesan/keranjang"
            className="relative p-2 hover:bg-stone-100 rounded-full transition-colors"
          >
            <ShoppingCart size={20} className="text-stone-700" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>


      {/* Hero Image */}
      <div className="relative w-full h-64 md:h-80 bg-stone-100">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="text-stone-300" size={48} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 pb-32">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-start gap-4 mb-1">
            <h1 className="font-playfair text-2xl font-bold text-stone-900">{item.name}</h1>
            <div className="text-right shrink-0">
              <p className="text-xs text-stone-400 uppercase tracking-wide">Harga</p>
              <p className="font-playfair text-2xl font-bold text-amber-800">
                {formatRupiah(item.price)}
              </p>
            </div>
          </div>
          <p className="text-xs text-stone-400 mb-6">{item.categoryName}</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Kiri: Deskripsi + Quantity */}
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                  Deskripsi Menu
                </p>
                <p className="text-stone-600 text-sm leading-relaxed italic">
                  &ldquo;{item.description}&rdquo;
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  Jumlah Pesanan
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:border-amber-700 hover:text-amber-700 disabled:opacity-30 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-semibold text-stone-800 text-lg">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center hover:border-amber-700 hover:text-amber-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Kanan: Catatan */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                Catatan (Opsional)
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Pisahkan sambalnya..."
                rows={5}
                className="w-full text-sm text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:border-amber-600 focus:outline-none resize-none bg-transparent leading-relaxed pt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wide">Subtotal</p>
            <p className="font-playfair text-lg font-bold text-stone-800">{formatRupiah(subtotal)}</p>
          </div>
          {item.isAvailable ? (
            <button
              onClick={handleAdd}
              className={`flex-1 max-w-xs py-3 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                added
                  ? "bg-green-600 text-white scale-95"
                  : "bg-amber-700 hover:bg-amber-800 text-white"
              }`}
            >
              <ShoppingCart size={16} />
              {added ? "Ditambahkan!" : "Tambah ke Keranjang"}
            </button>
          ) : (
            <button
              disabled
              className="flex-1 max-w-xs py-3 rounded-full font-semibold text-sm bg-stone-200 text-stone-400 cursor-not-allowed"
            >
              Tidak Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
