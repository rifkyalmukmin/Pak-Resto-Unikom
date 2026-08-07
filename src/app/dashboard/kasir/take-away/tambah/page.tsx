"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Minus, Check } from "lucide-react";
import type { ApiKategori } from "@/types/api";
import { api } from "@/lib/api";

const fmt = (n: number) => "Rp" + n.toLocaleString("id-ID");

export default function TambahPesananPage() {
  const [categories, setCategories] = useState<ApiKategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua Menu");
  const [qty, setQty] = useState<Record<number, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadMenu = useCallback(async () => {
    try {
      const data = await api.getMenu();
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const allMenu = categories.flatMap((c) =>
    (c.menu ?? []).map((m) => ({ ...m, kategori: c.nama_kategori }))
  );

  const filtered =
    activeCategory === "Semua Menu"
      ? allMenu
      : allMenu.filter((m) => m.kategori === activeCategory);

  const cartItems = allMenu.filter((m) => (qty[m.id_menu] ?? 0) > 0);
  const total = cartItems.reduce((s, m) => s + m.harga * (qty[m.id_menu] ?? 0), 0);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      await api.createOrder({
        tipe_pesanan: "TAKEAWAY",
        items: cartItems.map((m) => ({
          id_menu: m.id_menu,
          jumlah: qty[m.id_menu] ?? 0,
        })),
      });
      setQty({});
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pesanan");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  const categoryTabs = ["Semua Menu", ...categories.map((c) => c.nama_kategori)];

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden p-6">
        {error && (
          <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {categoryTabs.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#22d3ee] text-black"
                  : "bg-[#1E1E2E] text-slate-400 border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-500">Memuat menu...</p>
        ) : (
          <div className="grid grid-cols-3 gap-4 overflow-auto">
            {filtered.map((item) => (
              <div
                key={item.id_menu}
                className="bg-[#1E1E2E] rounded-xl border border-white/5 p-4"
              >
                <p className="text-white font-semibold text-sm mb-2">{item.nama_menu}</p>
                <p className="text-[#22d3ee] font-bold text-sm mb-3">{fmt(item.harga)}</p>
                <button
                  onClick={() =>
                    setQty((p) => ({ ...p, [item.id_menu]: (p[item.id_menu] ?? 0) + 1 }))
                  }
                  className="w-full py-2 rounded-lg bg-[#06B6D4] text-black text-sm font-bold"
                >
                  Tambah
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-[360px] border-l border-white/5 bg-[#121221] flex flex-col p-5">
        <h3 className="text-white font-bold mb-4">Pesanan Takeaway</h3>
        <div className="flex-1 space-y-2 overflow-auto">
          {cartItems.length === 0 ? (
            <p className="text-slate-500 text-sm">Belum ada item</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id_menu} className="flex items-center justify-between text-sm">
                <span className="text-white">{item.nama_menu}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setQty((p) => {
                        const n = (p[item.id_menu] ?? 0) - 1;
                        if (n <= 0) {
                          const next = { ...p };
                          delete next[item.id_menu];
                          return next;
                        }
                        return { ...p, [item.id_menu]: n };
                      })
                    }
                  >
                    <Minus size={14} className="text-slate-400" />
                  </button>
                  <span className="text-white w-4 text-center">{qty[item.id_menu]}</span>
                  <button
                    onClick={() =>
                      setQty((p) => ({ ...p, [item.id_menu]: (p[item.id_menu] ?? 0) + 1 }))
                    }
                  >
                    <Plus size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex justify-between text-white font-bold mb-4">
            <span>Total</span>
            <span>{fmt(total)}</span>
          </div>
          <button
            onClick={() => cartItems.length > 0 && setShowConfirm(true)}
            disabled={cartItems.length === 0}
            className="w-full py-3 rounded-xl bg-[#06B6D4] text-black font-bold disabled:opacity-40"
          >
            Buat Pesanan
          </button>
          <Link
            href="/dashboard/kasir/take-away"
            className="block text-center text-slate-400 text-sm mt-3 hover:text-white"
          >
            Kembali ke daftar
          </Link>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1E2235] rounded-2xl border border-white/10 p-8 w-[380px] text-center space-y-4">
            <h3 className="text-white font-bold text-lg">Buat Pesanan Takeaway?</h3>
            <p className="text-slate-400 text-sm">Total: {fmt(total)}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white"
              >
                Batal
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-[#06B6D4] text-black font-bold"
              >
                {submitting ? "..." : "Ya"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1E2235] rounded-2xl p-8 w-[360px] text-center space-y-4">
            <Check className="text-[#22C55E] mx-auto" size={32} />
            <h3 className="text-white font-bold">Pesanan Dibuat!</h3>
            <Link
              href="/dashboard/kasir/take-away"
              className="block w-full py-3 rounded-xl bg-[#22C55E] text-black font-bold"
            >
              Lihat Daftar
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
