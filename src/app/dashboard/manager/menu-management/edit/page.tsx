"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, Check, AlertCircle, Pencil, Search, X, ImageIcon } from "lucide-react";
import { api } from "@/lib/api";
import { fileToDataUrl } from "@/lib/user-helpers";
import type { ApiBahanBaku, ApiKategori } from "@/types/api";

const PLACEHOLDER_IMAGE = "/images/menu/nasi-goreng.png";

function EditMenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = Number(searchParams.get("id"));

  const [available, setAvailable] = useState(true);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedBahan, setSelectedBahan] = useState<number[]>([]);
  const [bahanSearch, setBahanSearch] = useState("");
  const [kategoriList, setKategoriList] = useState<ApiKategori[]>([]);
  const [bahanList, setBahanList] = useState<ApiBahanBaku[]>([]);
  const [existingGambar, setExistingGambar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    id_kategori: 0,
    harga: "",
    deskripsi: "",
    gambar: "",
  });

  const kategoriRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = useCallback(async () => {
    if (!menuId || Number.isNaN(menuId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [menu, kategori, bahan] = await Promise.all([
        api.getMenuById(menuId),
        api.getKategori(),
        api.getBahanBaku(),
      ]);
      setKategoriList(kategori);
      setBahanList(bahan);
      setForm({
        nama: menu.nama_menu,
        id_kategori: menu.id_kategori,
        harga: String(menu.harga),
        deskripsi: menu.deskripsi ?? "",
        gambar: menu.gambar ?? "",
      });
      setAvailable(menu.status === "AKTIF");
      setExistingGambar(menu.gambar ?? null);
      setSelectedBahan((menu.menu_bahan ?? []).map((mb) => mb.id_bahan));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, [menuId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedKategori = kategoriList.find((k) => k.id_kategori === form.id_kategori);

  const filteredBahan = bahanList.filter((b) =>
    b.nama_bahan.toLowerCase().includes(bahanSearch.toLowerCase())
  );

  function toggleBahan(id: number) {
    setSelectedBahan((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file, 2 * 1024 * 1024);
      setPreview(dataUrl);
      setForm((prev) => ({ ...prev, gambar: dataUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membaca file");
    }
  }

  const displayImage = preview ?? existingGambar ?? PLACEHOLDER_IMAGE;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (kategoriRef.current && !kategoriRef.current.contains(e.target as Node)) {
        setKategoriOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSubmit() {
    if (!menuId || !form.nama.trim() || !form.id_kategori || !form.harga) return;
    setSubmitting(true);
    setError(null);
    try {
      // form.gambar already contains the data URL if a new file was picked,
      // or the original path if unchanged, so send it directly.
      const gambarValue = form.gambar.trim() || existingGambar || null;
      await api.updateMenu(menuId, {
        nama_menu: form.nama.trim(),
        id_kategori: form.id_kategori,
        harga: Number(form.harga),
        deskripsi: form.deskripsi.trim() || null,
        status: available ? "AKTIF" : "NONAKTIF",
        gambar: gambarValue,
        bahan: selectedBahan.map((id_bahan) => ({ id_bahan })),
      });
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui menu");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = form.nama.trim() && form.id_kategori > 0 && form.harga;

  if (!menuId || Number.isNaN(menuId)) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm" style={{ color: "#ef4444" }}>ID menu tidak valid.</p>
        <Link href="/dashboard/manager/menu-management" className="text-sm font-semibold" style={{ color: "#D0BCFF" }}>
          Kembali ke Kelola Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
        <Link href="/dashboard/manager/menu-management" className="hover:text-white transition-colors">
          Kelola Menu
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium" style={{ color: "#D0BCFF" }}>Edit Menu</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Edit Menu</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manager/menu-management"
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94a3b8" }}
          >
            Batal
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSubmit || loading}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm border"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm" style={{ color: "#64748b" }}>Memuat menu...</div>
      ) : (
        <div className="grid grid-cols-[1fr_420px] gap-5 items-start">
          <div className="space-y-4">
            <div className="rounded-xl p-6 border space-y-5" style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
              <h3 className="font-bold text-base" style={{ color: "#D0BCFF" }}>Informasi Dasar</h3>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Nama Menu</label>
                <input
                  type="text"
                  placeholder="Contoh: Wagyu Beef Steak with Truffle Oil"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg text-sm outline-none border transition-colors"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Kategori</label>
                  <div className="relative" ref={kategoriRef}>
                    <button
                      type="button"
                      onClick={() => setKategoriOpen((p) => !p)}
                      className="w-full h-10 px-4 rounded-lg text-sm border flex items-center justify-between outline-none"
                      style={{
                        backgroundColor: "#080F17",
                        borderColor: kategoriOpen ? "rgba(208,188,255,0.4)" : "#494454",
                        color: selectedKategori ? "#fff" : "#64748b",
                      }}
                    >
                      <span>{selectedKategori?.nama_kategori ?? "Pilih kategori..."}</span>
                      <ChevronDown
                        size={14}
                        className="shrink-0 transition-transform"
                        style={{ transform: kategoriOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#64748b" }}
                      />
                    </button>
                    {kategoriOpen && (
                      <div
                        className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 shadow-xl"
                        style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
                      >
                        {kategoriList.map((c) => (
                          <button
                            key={c.id_kategori}
                            type="button"
                            onClick={() => {
                              setForm({ ...form, id_kategori: c.id_kategori });
                              setKategoriOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                            style={{ color: form.id_kategori === c.id_kategori ? "#D0BCFF" : "#94a3b8" }}
                          >
                            <span>{c.nama_kategori}</span>
                            {form.id_kategori === c.id_kategori && <Check size={13} style={{ color: "#D0BCFF" }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Harga (IDR)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "#64748b" }}>
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={form.harga}
                      onChange={(e) => setForm({ ...form, harga: e.target.value.replace(/[^0-9]/g, "") })}
                      className="w-full h-10 pl-9 pr-4 rounded-lg text-sm outline-none border"
                      style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Deskripsi Menu</label>
                <textarea
                  placeholder="Jelaskan bahan-bahan, cita rasa, dan penyajian menu ini..."
                  rows={4}
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none border resize-none"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                />
              </div>
            </div>

            <div className="rounded-xl p-6 border space-y-4" style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: "#D0BCFF" }}>Bahan Baku</h3>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Pilih bahan baku yang digunakan dalam menu ini.</p>
              </div>

              {selectedBahan.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedBahan.map((id) => {
                    const b = bahanList.find((bb) => bb.id_bahan === id);
                    if (!b) return null;
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: "rgba(208,188,255,0.15)",
                          color: "#D0BCFF",
                          border: "1px solid rgba(208,188,255,0.3)",
                        }}
                      >
                        {b.nama_bahan}
                        <button onClick={() => toggleBahan(id)} className="hover:opacity-70 transition-opacity">
                          <X size={11} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
                <input
                  type="text"
                  placeholder="Cari bahan baku..."
                  value={bahanSearch}
                  onChange={(e) => setBahanSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 rounded-lg text-sm outline-none border"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {filteredBahan.map((b) => {
                  const active = selectedBahan.includes(b.id_bahan);
                  return (
                    <button
                      key={b.id_bahan}
                      onClick={() => toggleBahan(b.id_bahan)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left"
                      style={{
                        backgroundColor: active ? "rgba(208,188,255,0.12)" : "#080F17",
                        borderColor: active ? "rgba(208,188,255,0.4)" : "#494454",
                        color: active ? "#D0BCFF" : "#94a3b8",
                      }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: active ? "#D0BCFF" : "transparent",
                          borderColor: active ? "#D0BCFF" : "#494454",
                        }}
                      >
                        {active && <Check size={9} color="#000" />}
                      </span>
                      {b.nama_bahan}
                    </button>
                  );
                })}
                {filteredBahan.length === 0 && (
                  <p className="col-span-3 text-center text-xs py-4" style={{ color: "#64748b" }}>Bahan tidak ditemukan.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl p-6 border" style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-base" style={{ color: "#D0BCFF" }}>Status Ketersediaan</p>
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Tentukan apakah menu ini aktif dan dapat dipesan oleh pelanggan.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold" style={{ color: available ? "#4EDEA3" : "#64748b" }}>
                    {available ? "Tersedia" : "Habis"}
                  </span>
                  <button
                    onClick={() => setAvailable(!available)}
                    className="relative inline-flex w-12 h-6 rounded-full cursor-pointer transition-colors"
                    style={{ backgroundColor: available ? "#10B981" : "#374151" }}
                  >
                    <span
                      className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      style={{ transform: available ? "translateX(24px)" : "translateX(0)" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border space-y-5" style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
            <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#D0BCFF" }}>Thumbnail Menu</h3>

            <div
              className="relative rounded-xl overflow-hidden group cursor-pointer border"
              style={{ borderColor: "#494454" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayImage} alt="Thumbnail" className="w-full object-cover" style={{ height: 200 }} />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(208,188,255,0.2)", border: "1px solid #D0BCFF" }}
                >
                  <Pencil size={16} style={{ color: "#D0BCFF" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "#D0BCFF" }}>Ganti Foto</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>atau Path Gambar</label>
              <input
                type="text"
                placeholder="/images/menu/nasi-goreng.png"
                value={preview ? "" : form.gambar}
                disabled={!!preview}
                onChange={(e) => setForm({ ...form, gambar: e.target.value })}
                className="w-full h-9 px-3 rounded-lg text-sm outline-none border disabled:opacity-40"
                style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
              />
            </div>

            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: "#D0BCFF" }}>Pratinjau Menu</p>
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#494454" }}>
                <div className="relative w-full" style={{ height: 200, backgroundColor: "#080F17" }}>
                  {displayImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={displayImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon size={40} style={{ color: "#374151" }} />
                    </div>
                  )}
                  {selectedKategori && (
                    <span
                      className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide"
                      style={{ backgroundColor: selectedKategori.warna ?? "#10B981", color: "#fff" }}
                    >
                      {selectedKategori.nama_kategori}
                    </span>
                  )}
                </div>
                <div className="p-4" style={{ backgroundColor: "#2E353F" }}>
                  <p className="text-white font-bold text-base leading-tight">{form.nama || "Nama Menu Anda"}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: "#94a3b8" }}>
                    {form.deskripsi || "Deskripsi menu akan tampil di sini."}
                  </p>
                  <div className="mt-3">
                    <span className="text-sm font-bold" style={{ color: "#D0BCFF" }}>
                      Rp {form.harga ? Number(form.harga).toLocaleString("id-ID") : "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => !submitting && setShowConfirm(false)}
        >
          <div
            className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">
                Apakah Anda Yakin Dengan Perubahan Yang Akan Anda Lakukan?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Tindakan ini bersifat permanen dan akan segera memperbarui data pada portal manajemen.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                Tidak
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#D0BCFF", color: "#000" }}
              >
                {submitting ? "Menyimpan..." : "Ya"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Menu Berhasil Diperbarui!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Perubahan pada menu <span className="text-white font-semibold">{form.nama || "ini"}</span> telah berhasil disimpan.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/manager/menu-management")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}
            >
              Kembali ke Kelola Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditMenuPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "#64748b" }}>Memuat...</div>}>
      <EditMenuContent />
    </Suspense>
  );
}
