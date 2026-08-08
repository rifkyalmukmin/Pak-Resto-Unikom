"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Minus, Check, FileText } from "lucide-react";
import type { ApiKategori } from "@/types/api";
import { api } from "@/lib/api";

const fmt = (n: number) => "Rp" + n.toLocaleString("id-ID");

const PLACEHOLDER_IMAGE = "/images/menu/nasi-goreng.png";

export default function TambahPesananPage() {
  const [categories, setCategories] = useState<ApiKategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Semua Menu");
  const [qty, setQty] = useState<Record<number, number>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCatatan, setShowCatatan] = useState(false);
  const [catatan, setCatatan] = useState("");

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
        catatan: catatan || undefined,
        items: cartItems.map((m) => ({
          id_menu: m.id_menu,
          jumlah: qty[m.id_menu] ?? 0,
          catatan: catatan || undefined,
        })),
      });
      setQty({});
      setCatatan("");
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
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden p-4 sm:p-6">
        {error && (
          <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm mb-4">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
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
          <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-4">
            {filtered.map((item) => {
              const q = qty[item.id_menu] ?? 0;
              return (
                <div
                  key={item.id_menu}
                  className="rounded-xl border border-white/5 overflow-hidden flex flex-col"
                  style={{ backgroundColor: "#171F33" }}
                >
                  <div className="relative w-full aspect-[4/3] bg-[#0f172a] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.gambar || PLACEHOLDER_IMAGE}
                      alt={item.nama_menu}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    <p className="text-white text-sm font-semibold line-clamp-1">{item.nama_menu}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#22d3ee]">{fmt(item.harga)}</span>
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
                          className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white"
                          style={{ backgroundColor: "#131B2E" }}
                        >
                          <Minus size={11} />
                        </button>
                        <span className="text-white text-sm font-semibold w-5 text-center">{q}</span>
                        <button
                          onClick={() =>
                            setQty((p) => ({ ...p, [item.id_menu]: (p[item.id_menu] ?? 0) + 1 }))
                          }
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold bg-[#06B6D4]"
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
        )}
      </div>

      <div className="w-full lg:w-[360px] border-t lg:border-t-0 lg:border-l border-white/5 bg-[#121221] flex flex-col p-4 sm:p-5 max-h-[55vh] lg:max-h-none">
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
          <div className="flex gap-3">
            <button
              onClick={() => setShowCatatan(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold"
            >
              <FileText size={14} /> Catatan
            </button>
            <button
              onClick={() => cartItems.length > 0 && setShowConfirm(true)}
              disabled={cartItems.length === 0}
              className="flex-1 py-3 rounded-xl bg-[#06B6D4] text-black font-bold disabled:opacity-40 text-sm"
            >
              Buat Pesanan
            </button>
          </div>
          <Link
            href="/dashboard/kasir/take-away"
            className="block text-center text-slate-400 text-sm mt-3 hover:text-white"
          >
            Kembali ke daftar
          </Link>
        </div>
      </div>

      {showCatatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCatatan(false)} />
          <div
            className="relative w-full max-w-[500px] mx-4 rounded-2xl border border-white/10 p-6 z-10"
            style={{ backgroundColor: "#222A3D" }}
          >
            <h2 className="font-bold text-xl text-white mb-4">Catatan Pesanan</h2>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-white text-sm bg-[#060E20] resize-none"
              placeholder="Instruksi khusus untuk pesanan..."
            />
            <button
              onClick={() => setShowCatatan(false)}
              className="mt-4 w-full py-3 rounded-xl font-bold bg-[#06B6D4] text-black"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1E2235] rounded-2xl border border-white/10 p-8 w-full max-w-[380px] mx-4 text-center space-y-4">
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
          <div className="bg-[#1E2235] rounded-2xl p-8 w-full max-w-[360px] mx-4 text-center space-y-4">
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
