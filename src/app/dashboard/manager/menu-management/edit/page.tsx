"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Check, AlertCircle, Pencil } from "lucide-react";

const categories = ["Main Course", "Beverage", "Dessert", "Snack", "Appetizer"];

const EXISTING_IMAGE = "/images/menu/nasi-goreng.png";

export default function EditMenuPage() {
  const [available, setAvailable] = useState(true);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama: "Nasi Goreng Kambing Special",
    kategori: "Main Course",
    harga: "45000",
    deskripsi: "Daging kambing premium dengan bumbu rempah UNIKOM.",
  });

  const kategoriRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (kategoriRef.current && !kategoriRef.current.contains(e.target as Node)) {
        setKategoriOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
        <Link href="/dashboard/manager/menu-management" className="hover:text-white transition-colors">
          Kelola Menu
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium" style={{ color: "#D0BCFF" }}>Edit Menu</span>
      </div>

      {/* Header */}
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
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            Simpan Perubahan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_420px] gap-5 items-start">
        {/* Left column */}
        <div className="space-y-4">
          {/* Informasi Dasar */}
          <div className="rounded-xl p-6 border space-y-5"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
            <h3 className="font-bold text-base" style={{ color: "#D0BCFF" }}>Informasi Dasar</h3>

            {/* Nama Menu */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                Nama Menu
              </label>
              <input
                type="text"
                placeholder="Contoh: Wagyu Beef Steak with Truffle Oil"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full h-10 px-4 rounded-lg text-sm outline-none border transition-colors"
                style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
              />
            </div>

            {/* Kategori + Harga */}
            <div className="grid grid-cols-2 gap-4">
              {/* Kategori */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                  Kategori
                </label>
                <div className="relative" ref={kategoriRef}>
                  <button
                    type="button"
                    onClick={() => setKategoriOpen((p) => !p)}
                    className="w-full h-10 px-4 rounded-lg text-sm border flex items-center justify-between outline-none"
                    style={{
                      backgroundColor: "#080F17",
                      borderColor: kategoriOpen ? "rgba(208,188,255,0.4)" : "#494454",
                      color: form.kategori ? "#fff" : "#64748b",
                    }}
                  >
                    <span>{form.kategori || "Pilih kategori..."}</span>
                    <ChevronDown size={14} className="shrink-0 transition-transform"
                      style={{ transform: kategoriOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#64748b" }} />
                  </button>
                  {kategoriOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 shadow-xl"
                      style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}>
                      {categories.map((c) => (
                        <button key={c} type="button"
                          onClick={() => { setForm({ ...form, kategori: c }); setKategoriOpen(false); }}
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                          style={{ color: form.kategori === c ? "#D0BCFF" : "#94a3b8" }}>
                          <span>{c}</span>
                          {form.kategori === c && <Check size={13} style={{ color: "#D0BCFF" }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Harga */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                  Harga (IDR)
                </label>
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

            {/* Deskripsi */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>
                Deskripsi Menu
              </label>
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

          {/* Status Ketersediaan */}
          <div className="rounded-xl p-6 border"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
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
                  <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: available ? "translateX(24px)" : "translateX(0)" }} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="rounded-xl p-6 border space-y-5"
          style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
          <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#D0BCFF" }}>Thumbnail Menu</h3>

          {/* Thumbnail — foto asli, klik untuk upload (pratinjau yg berubah) */}
          <div className="relative rounded-xl overflow-hidden group cursor-pointer border"
            style={{ borderColor: "#494454" }}
            onClick={() => fileInputRef.current?.click()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EXISTING_IMAGE} alt="Thumbnail" className="w-full object-cover" style={{ height: 200 }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(208,188,255,0.2)", border: "1px solid #D0BCFF" }}>
                <Pencil size={16} style={{ color: "#D0BCFF" }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: "#D0BCFF" }}>Ganti Foto</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
          <p className="text-xs text-center" style={{ color: "#64748b" }}>
            Rekomendasi ukuran: 1:1 (Min. 800×800px)
          </p>

          {/* Pratinjau Menu */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "#D0BCFF" }}>Pratinjau Menu</p>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#494454" }}>
              <div className="relative w-full" style={{ height: 200, backgroundColor: "#080F17" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview ?? EXISTING_IMAGE} alt="Preview" className="w-full h-full object-cover" />
                {form.kategori && (
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide"
                    style={{ backgroundColor: "#10B981", color: "#fff" }}>
                    {form.kategori}
                  </span>
                )}
              </div>
              <div className="p-4" style={{ backgroundColor: "#2E353F" }}>
                <p className="text-white font-bold text-base leading-tight">
                  {form.nama || "Nama Menu Anda"}
                </p>
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

      {/* Modal Konfirmasi */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowConfirm(false)}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
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
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Tidak
              </button>
              <button
                onClick={() => { setShowConfirm(false); setShowSuccess(true); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Berhasil */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">
                Menu Berhasil Diperbarui!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Perubahan pada menu <span className="text-white font-semibold">{form.nama || "ini"}</span> telah berhasil disimpan.
              </p>
            </div>
            <Link href="/dashboard/manager/menu-management"
              className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
              Kembali ke Kelola Menu
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
