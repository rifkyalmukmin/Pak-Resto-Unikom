"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, ImageIcon, Check, AlertCircle, Search, X } from "lucide-react";

const categories = ["Main Course", "Beverage", "Dessert", "Snack", "Appetizer"];

const allBahanBaku = [
  "Nasi", "Ayam", "Daging Sapi", "Daging Kambing", "Udang", "Ikan",
  "Telur", "Tahu", "Tempe", "Mie",
  "Bawang Merah", "Bawang Putih", "Cabai Merah", "Cabai Rawit", "Jahe", "Kunyit",
  "Minyak Goreng", "Mentega", "Santan", "Kecap Manis",
  "Garam", "Gula", "Merica", "Tepung Terigu", "Tepung Beras",
  "Susu", "Keju", "Cokelat", "Sayuran Segar", "Tomat",
];

export default function TambahMenuPage() {
  const [available, setAvailable] = useState(true);
  const [kategoriOpen, setKategoriOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedBahan, setSelectedBahan] = useState<string[]>([]);
  const [bahanSearch, setBahanSearch] = useState("");
  const kategoriRef = useRef<HTMLDivElement>(null);

  const filteredBahan = allBahanBaku.filter((b) =>
    b.toLowerCase().includes(bahanSearch.toLowerCase())
  );

  function toggleBahan(bahan: string) {
    setSelectedBahan((prev) =>
      prev.includes(bahan) ? prev.filter((b) => b !== bahan) : [...prev, bahan]
    );
  }

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (kategoriRef.current && !kategoriRef.current.contains(e.target as Node)) {
        setKategoriOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    harga: "",
    deskripsi: "",
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
        <Link href="/dashboard/manager/menu-management" className="hover:text-white transition-colors">
          Kelola Menu
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium" style={{ color: "#D0BCFF" }}>Tambah Menu Baru</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tambah Menu Baru</h1>
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
            Simpan Menu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_420px] gap-5 items-start">
        {/* Left column */}
        <div className="space-y-4">
          {/* Informasi Dasar */}
          <div
            className="rounded-xl p-6 border space-y-5"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}
          >
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
                style={{
                  backgroundColor: "#080F17",
                  borderColor: "#494454",
                  color: "#fff",
                }}
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
                    <ChevronDown size={14} className="shrink-0 transition-transform" style={{ transform: kategoriOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#64748b" }} />
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
                    style={{
                      backgroundColor: "#080F17",
                      borderColor: "#494454",
                      color: "#fff",
                    }}
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
                style={{
                  backgroundColor: "#080F17",
                  borderColor: "#494454",
                  color: "#fff",
                }}
              />
            </div>
          </div>

          {/* Bahan Baku */}
          <div className="rounded-xl p-6 border space-y-4"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
            <div>
              <h3 className="font-bold text-base" style={{ color: "#D0BCFF" }}>Bahan Baku</h3>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Pilih bahan baku yang digunakan dalam menu ini.</p>
            </div>

            {/* Selected pills */}
            {selectedBahan.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedBahan.map((b) => (
                  <span key={b} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: "rgba(208,188,255,0.15)", color: "#D0BCFF", border: "1px solid rgba(208,188,255,0.3)" }}>
                    {b}
                    <button onClick={() => toggleBahan(b)} className="hover:opacity-70 transition-opacity">
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search */}
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

            {/* Grid list */}
            <div className="grid grid-cols-3 gap-2">
              {filteredBahan.map((b) => {
                const active = selectedBahan.includes(b);
                return (
                  <button key={b} onClick={() => toggleBahan(b)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left"
                    style={{
                      backgroundColor: active ? "rgba(208,188,255,0.12)" : "#080F17",
                      borderColor: active ? "rgba(208,188,255,0.4)" : "#494454",
                      color: active ? "#D0BCFF" : "#94a3b8",
                    }}>
                    <span className="w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 border"
                      style={{ backgroundColor: active ? "#D0BCFF" : "transparent", borderColor: active ? "#D0BCFF" : "#494454" }}>
                      {active && <Check size={9} color="#000" />}
                    </span>
                    {b}
                  </button>
                );
              })}
              {filteredBahan.length === 0 && (
                <p className="col-span-3 text-center text-xs py-4" style={{ color: "#64748b" }}>Bahan tidak ditemukan.</p>
              )}
            </div>
          </div>

          {/* Status Ketersediaan */}
          <div
            className="rounded-xl p-6 border"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}
          >
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

        {/* Right column */}
        <div
          className="rounded-xl p-6 border space-y-5"
          style={{ backgroundColor: "#151C25", borderColor: "#494454" }}
        >
          <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#D0BCFF" }}>Thumbnail Menu</h3>

          {/* Upload area */}
          <label
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-white/20"
            style={{ borderColor: "#494454", minHeight: 200, backgroundColor: "#080F17" }}
          >
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#494454" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
              <line x1="18" y1="5" x2="21" y2="5"/>
              <line x1="19.5" y1="3.5" x2="19.5" y2="6.5"/>
            </svg>
            <div className="text-center px-4">
              <p className="text-white font-bold text-base">Klik untuk unggah foto</p>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: "#64748b" }}>
                Rasio 1:1 direkomendasikan.<br />Maksimal file 5MB (JPG, PNG).
              </p>
            </div>
          </label>
          <p className="text-xs text-center" style={{ color: "#64748b" }}>
            Rekomendasi ukuran: 1:1 (Min. 800×800px)
          </p>

          {/* Preview */}
          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "#D0BCFF" }}>Pratinjau Menu</p>
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#494454" }}>
              {/* Image with category badge overlay */}
              <div className="relative w-full" style={{ height: 200, backgroundColor: "#080F17" }}>
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={40} style={{ color: "#374151" }} />
                  </div>
                )}
                {form.kategori && (
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide"
                    style={{ backgroundColor: "#10B981", color: "#fff" }}>
                    {form.kategori}
                  </span>
                )}
              </div>
              {/* Card body */}
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
                Apakah Anda Yakin Menyimpan Menu Ini?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Tindakan ini akan menambahkan menu baru ke dalam daftar dan dapat dipesan oleh pelanggan.
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
                Menu Berhasil Ditambahkan!
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Menu <span className="text-white font-semibold">{form.nama || "baru"}</span> telah berhasil disimpan ke dalam daftar menu restoran.
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
