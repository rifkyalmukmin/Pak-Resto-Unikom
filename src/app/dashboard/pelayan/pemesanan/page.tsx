"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Minus,
  FileText,
  ChefHat,
  ChevronDown,
  TableProperties,
  Check,
} from "lucide-react";
import type { ApiKategori, ApiMeja } from "@/types/api";
import { api } from "@/lib/api";

type OverlayType = "catatan" | "konfirmasi-dapur" | "sukses-dapur" | null;

const fmt = (n: number) => "Rp" + n.toLocaleString("id-ID").replace(/,/g, ".");

const PLACEHOLDER_IMAGE = "/images/menu/nasi-goreng.png";

const InfoIcon = () => (
  <div
    className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}
  >
    <span className="text-[#10B981] font-bold text-lg leading-none select-none">i</span>
  </div>
);

const SuccessIcon = () => (
  <div
    className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}
  >
    <Check size={22} color="#10B981" strokeWidth={3} />
  </div>
);

export default function PemesananMakananPage() {
  const [categories, setCategories] = useState<ApiKategori[]>([]);
  const [tables, setTables] = useState<ApiMeja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [qty, setQty] = useState<Record<number, number>>({});
  const [selectedMejaId, setSelectedMejaId] = useState<number | null>(null);
  const [mejaOpen, setMejaOpen] = useState(false);
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const [catatan, setCatatan] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [menuData, tableData] = await Promise.all([
        api.getMenu(),
        api.getTables(),
      ]);
      setCategories(menuData);
      setTables(tableData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allMenu = categories.flatMap((c) =>
    (c.menu ?? []).map((m) => ({ ...m, kategori: c.nama_kategori }))
  );

  const filtered =
    activeCategory === "Semua"
      ? allMenu
      : allMenu.filter((m) => m.kategori === activeCategory);

  const cartItems = allMenu.filter((m) => (qty[m.id_menu] ?? 0) > 0);
  const totalItems = cartItems.reduce((s, m) => s + (qty[m.id_menu] ?? 0), 0);
  const grandTotal = cartItems.reduce(
    (s, m) => s + m.harga * (qty[m.id_menu] ?? 0),
    0
  );

  const selectedMeja = tables.find((t) => t.id_meja === selectedMejaId);
  const availableTables = tables.filter((t) => t.status === "KOSONG");

  const increment = (id: number) =>
    setQty((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  const decrement = (id: number) =>
    setQty((p) => {
      const next = (p[id] ?? 0) - 1;
      if (next <= 0) {
        const updated = { ...p };
        delete updated[id];
        return updated;
      }
      return { ...p, [id]: next };
    });

  async function handleKirimKeDapur() {
    if (!selectedMejaId) {
      setError("Pilih meja terlebih dahulu");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.createOrder({
        tipe_pesanan: "DINE_IN",
        id_meja: selectedMejaId,
        catatan: catatan || undefined,
        items: cartItems.map((m) => ({
          id_menu: m.id_menu,
          jumlah: qty[m.id_menu] ?? 0,
          catatan: catatan || undefined,
        })),
      });
      setQty({});
      setSelectedMejaId(null);
      setCatatan("");
      setOverlay("sukses-dapur");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim pesanan");
      setOverlay(null);
    } finally {
      setSubmitting(false);
    }
  }

  const categoryTabs = ["Semua", ...categories.map((c) => c.nama_kategori)];

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {error && (
          <div className="mx-6 mt-4 text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="px-6 pt-5 pb-3 shrink-0">
          <div
            className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {categoryTabs.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors"
                style={
                  activeCategory === cat
                    ? { backgroundColor: "#10B981", color: "#000" }
                    : {
                        backgroundColor: "#1E293B",
                        color: "#94a3b8",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 overflow-auto px-6 pb-6"
          style={{ scrollbarWidth: "none" }}
        >
          {loading ? (
            <p className="text-slate-500 text-center py-12">Memuat menu...</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
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
                      <p className="text-white text-sm font-semibold line-clamp-1">
                        {item.nama_menu}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold" style={{ color: "#10B981" }}>
                          {fmt(item.harga)}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrement(item.id_menu)}
                            className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center text-white"
                            style={{ backgroundColor: "#131B2E" }}
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-white text-sm font-semibold w-5 text-center">
                            {q}
                          </span>
                          <button
                            onClick={() => increment(item.id_menu)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-black font-bold"
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
          )}
        </div>
      </div>

      <div
        className="w-[400px] border-l border-white/5 flex flex-col shrink-0"
        style={{ backgroundColor: "#1E293B" }}
      >
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Keranjang Pesanan</h3>
          {totalItems > 0 && (
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              {totalItems} ITEM
            </span>
          )}
        </div>

        <div className="px-5 py-4 border-b border-white/5 relative">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Pilih Meja
          </p>
          <button
            onClick={() => setMejaOpen((p) => !p)}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-3 border border-white/10"
            style={{ backgroundColor: "#131B2E" }}
          >
            <TableProperties size={15} className="text-slate-400 shrink-0" />
            <span
              className={`flex-1 text-left text-sm ${
                selectedMeja ? "text-white font-semibold" : "text-slate-500"
              }`}
            >
              {selectedMeja
                ? `Meja ${selectedMeja.nomor_meja} (${selectedMeja.kapasitas} org)`
                : "Pilih meja kosong..."}
            </span>
            <ChevronDown size={14} className={`text-slate-400 ${mejaOpen ? "rotate-180" : ""}`} />
          </button>

          {mejaOpen && (
            <div
              className="absolute left-5 right-5 top-full mt-1 rounded-xl border border-white/10 p-3 z-50 shadow-xl"
              style={{ backgroundColor: "#0D1625" }}
            >
              <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-auto">
                {availableTables.map((m) => (
                  <button
                    key={m.id_meja}
                    onClick={() => {
                      setSelectedMejaId(m.id_meja);
                      setMejaOpen(false);
                    }}
                    className="h-9 rounded-lg text-sm font-bold"
                    style={
                      selectedMejaId === m.id_meja
                        ? { backgroundColor: "#10B981", color: "#000" }
                        : {
                            backgroundColor: "#1E293B",
                            color: "#94a3b8",
                            border: "1px solid rgba(255,255,255,0.07)",
                          }
                    }
                  >
                    {m.nomor_meja}
                  </button>
                ))}
              </div>
              {availableTables.length === 0 && (
                <p className="text-slate-500 text-xs text-center py-2">Tidak ada meja kosong</p>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto px-4 py-3 space-y-2.5">
          {cartItems.length === 0 ? (
            <p className="text-slate-600 text-sm text-center mt-10">Belum ada item</p>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id_menu}
                className="flex items-center justify-between gap-3 rounded-xl p-3"
                style={{ backgroundColor: "#0B1326" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold line-clamp-1">
                    {item.nama_menu}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {qty[item.id_menu]}x {fmt(item.harga)}
                  </p>
                </div>
                <p className="text-white text-sm font-bold">
                  {fmt(item.harga * (qty[item.id_menu] ?? 0))}
                </p>
              </div>
            ))
          )}
        </div>

        <div
          className="px-5 pt-4 pb-5 space-y-2.5 border-t border-white/5"
          style={{ backgroundColor: "#2D3449" }}
        >
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-sm">Total</span>
            <span className="font-bold text-2xl" style={{ color: "#10B981" }}>
              {fmt(grandTotal)}
            </span>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setOverlay("catatan")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/15 text-white text-sm font-semibold"
            >
              <FileText size={14} /> Catatan
            </button>
            <button
              onClick={() =>
                cartItems.length > 0 && selectedMejaId && setOverlay("konfirmasi-dapur")
              }
              disabled={cartItems.length === 0 || !selectedMejaId || submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold disabled:opacity-40"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              <ChefHat size={14} /> Kirim ke Dapur
            </button>
          </div>
        </div>
      </div>

      {overlay === "catatan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOverlay(null)}
          />
          <div
            className="relative w-[500px] rounded-2xl border border-white/10 p-6 z-10"
            style={{ backgroundColor: "#222A3D" }}
          >
            <h2 className="font-bold text-xl text-white mb-4">Catatan Pesanan</h2>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 px-4 py-3 text-white text-sm bg-[#060E20] resize-none"
              placeholder="Instruksi khusus untuk dapur..."
            />
            <button
              onClick={() => setOverlay(null)}
              className="mt-4 w-full py-3 rounded-xl font-bold"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      {overlay === "konfirmasi-dapur" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="relative w-[420px] rounded-2xl border border-white/10 px-8 py-8 z-10 bg-[#1E2235]">
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Kirim ke Dapur?</h3>
            <p className="text-slate-400 text-sm mb-7">
              Pesanan Meja {selectedMeja?.nomor_meja} akan dikirim ke dapur.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOverlay(null)}
                className="flex-1 py-3 rounded-xl border-2 font-bold text-sm"
                style={{ borderColor: "#10B981", color: "#10B981" }}
              >
                Batal
              </button>
              <button
                onClick={() => void handleKirimKeDapur()}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                {submitting ? "Mengirim..." : "Ya, Kirim"}
              </button>
            </div>
          </div>
        </div>
      )}

      {overlay === "sukses-dapur" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="relative w-[420px] rounded-2xl border border-white/10 px-8 py-8 z-10 bg-[#1E2235]">
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Pesanan Terkirim!</h3>
            <p className="text-slate-400 text-sm mb-7">
              Pesanan telah masuk antrean dapur.
            </p>
            <button
              onClick={() => setOverlay(null)}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              Oke
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
