"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, UtensilsCrossed, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

interface MenuFromDB {
  id_menu: number;
  nama_menu: string;
  deskripsi: string | null;
  harga: number;
  gambar: string | null;
  status: string;
}

interface CategoryFromDB {
  id_kategori: number;
  nama_kategori: string;
  deskripsi: string | null;
  menu: MenuFromDB[];
}

export default function PesanPage() {
  const router = useRouter();
  const { tableNumber, totalItems, grandTotal, setTable, addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState("semua");
  const menuRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<CategoryFromDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("meja");
    if (m) { const n = parseInt(m, 10); if (!isNaN(n)) setTable(null, n); }
  }, [setTable]);

  useEffect(() => {
    fetch("/api/menu/public")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setCategories(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const displayedCategories =
    activeCategory === "semua"
      ? categories
      : categories.filter((c) => c.id_kategori.toString() === activeCategory);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F8F9FF" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-stone-100 shadow-sm" style={{ backgroundColor: "#F8F9FF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/pesan" className="font-playfair text-[15px] sm:text-lg font-bold text-amber-900 min-w-0 truncate">
            Pak Resto UNIKOM
          </Link>

          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600">
            <Link href="/pesan" className="text-amber-800 border-b-2 border-amber-800 pb-0.5 leading-none">
              Home
            </Link>
            <button
              onClick={() => menuRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="hover:text-amber-800 transition-colors leading-none"
            >
              Menu
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 border border-stone-200 rounded-full px-3 py-1.5 text-sm text-stone-700">
              <Image
                src="/images/pelayan/sidebar/informasi-meja.png"
                alt="meja"
                width={16}
                height={16}
                style={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(600%) hue-rotate(15deg) brightness(90%)" }}
              />
              <Suspense fallback={tableNumber ?? "..."}><MejaNumber /></Suspense>
            </div>

            <Link
              href="/pesan/keranjang"
              className="relative p-1.5 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ShoppingCart size={20} className="text-stone-700" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-amber-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[400px] md:h-[480px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-section.png"
            alt="Pak Resto UNIKOM"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-stone-900/88 via-stone-900/55 to-transparent" />
        <div className="relative z-10 px-6 max-w-6xl mx-auto w-full">
          <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-3">
            Fine Dining Experience
          </p>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
            Cita Rasa yang Elegan.
          </h1>
          <p className="text-stone-300 text-sm max-w-xs leading-relaxed mb-8">
            Nikmati perpaduan rempah tradisional Indonesia dengan teknik kuliner modern dalam
            suasana yang hangat dan mewah.
          </p>
          <button
            onClick={() => menuRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="text-white font-semibold px-6 py-3 rounded-full transition-opacity hover:opacity-90 text-sm"
            style={{ backgroundColor: "#F97316" }}
          >
            Pesan Sekarang
          </button>
        </div>
      </section>

      {/* Category Filter */}
      <div ref={menuRef} className="sticky top-16 z-30 border-b border-stone-100" style={{ backgroundColor: "#F8F9FF" }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          <CategoryBtn
            label="Semua Menu"
            active={activeCategory === "semua"}
            onClick={() => setActiveCategory("semua")}
          />
          {categories.map((cat) => (
            <CategoryBtn
              key={cat.id_kategori}
              label={cat.nama_kategori}
              active={activeCategory === cat.id_kategori.toString()}
              onClick={() => setActiveCategory(cat.id_kategori.toString())}
            />
          ))}
        </div>
      </div>

      {/* Menu */}
      <main className="max-w-6xl mx-auto px-4 py-10 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-amber-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-400 text-sm">Memuat menu...</p>
          </div>
        ) : displayedCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <UtensilsCrossed size={40} className="text-stone-200" />
            <p className="text-stone-400 text-sm">Belum ada menu tersedia.</p>
          </div>
        ) : (
          displayedCategories.map((cat) => (
            <section key={cat.id_kategori} className="mb-14">
              <div className="mb-6">
                <h2 className="font-playfair text-2xl font-bold text-amber-900">{cat.nama_kategori}</h2>
                {cat.deskripsi && (
                  <p className="text-stone-500 text-sm mt-1">{cat.deskripsi}</p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {cat.menu.map((item) => (
                  <MenuCard
                    key={item.id_menu}
                    item={item}
                    categoryName={cat.nama_kategori}
                    onAdd={() =>
                      addItem(
                        {
                          menuItemId: item.id_menu.toString(),
                          name: item.nama_menu,
                          price: item.harga,
                          image: item.gambar,
                        },
                        1
                      )
                    }
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.push("/pesan/keranjang")}
              className="w-full text-white rounded-full px-5 py-3.5 flex items-center justify-between shadow-2xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#F97316" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#E06010" }}>
                  <Image src="/images/keranjang-icon.png" alt="keranjang" width={22} height={19} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-none mb-0.5">{totalItems} Item</p>
                  <p className="text-lg font-bold leading-none">{formatRupiah(grandTotal)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-bold tracking-widest uppercase">LIHAT PESANAN</span>
                <ArrowRight size={22} strokeWidth={2.5} className="text-white" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MejaNumber() {
  const searchParams = useSearchParams();
  const { tableNumber } = useCart();
  return <>{searchParams.get("meja") ?? tableNumber ?? "..."}</>;
}

function CategoryBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active ? "bg-amber-800 text-white" : "text-stone-600"
      }`}
      style={active ? {} : { backgroundColor: "#DEE9FC" }}
    >
      {label}
    </button>
  );
}

function MenuCard({
  item,
  categoryName,
  onAdd,
}: {
  item: MenuFromDB;
  categoryName: string;
  onAdd: () => void;
}) {
  const isAvailable = item.status === "AKTIF";
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
        {item.gambar ? (
          <Image
            src={item.gambar}
            alt={item.nama_menu}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UtensilsCrossed className="text-stone-300" size={32} />
          </div>
        )}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
              STOK HABIS
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-semibold text-stone-800 leading-snug text-sm">{item.nama_menu}</h3>
          <span className="text-amber-800 font-bold text-sm whitespace-nowrap">
            {formatRupiah(item.harga)}
          </span>
        </div>
        <p className="text-stone-400 text-xs leading-relaxed mb-4 line-clamp-2">
          {item.deskripsi ?? categoryName}
        </p>
        <div className="mt-auto">
          {isAvailable ? (
            <button
              onClick={onAdd}
              className="w-full border border-amber-700 text-amber-800 hover:bg-amber-700 hover:text-white text-xs font-semibold py-2 rounded-full transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingCart size={13} />
              Tambah ke Pesanan
            </button>
          ) : (
            <button
              disabled
              className="w-full text-stone-400 text-xs font-semibold py-2 rounded-full cursor-not-allowed"
              style={{ backgroundColor: "#DEE0E2" }}
            >
              Tidak Tersedia
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
