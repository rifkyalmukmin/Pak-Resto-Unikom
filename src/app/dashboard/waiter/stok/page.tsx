"use client";

import { useState } from "react";
import { Search, Filter, Download, X, Check, AlertTriangle, Pencil, Trash2, BellRing, BellOff, ChevronDown } from "lucide-react";

type StokStatus = "TERSEDIA" | "HAMPIR HABIS" | "HABIS";
type Satuan = "KG" | "PCS" | "GR" | "Ltr" | "ML";

interface Bahan {
  id: number;
  nama: string;
  jumlah: number;
  satuan: Satuan;
  status: StokStatus;
  thumbColor: string;
}

const initialBahan: Bahan[] = [
  { id: 1, nama: "Salmon Fresh Fillet", jumlah: 12.5, satuan: "KG", status: "TERSEDIA", thumbColor: "#e05c3a" },
  { id: 2, nama: "Telur Ayam Organik", jumlah: 45, satuan: "PCS", status: "HAMPIR HABIS", thumbColor: "#c9a84c" },
  { id: 3, nama: "Tepung Terigu Pro-Tinggi", jumlah: 0, satuan: "KG", status: "HABIS", thumbColor: "#8a7560" },
  { id: 4, nama: "Bawang Putih (Garlic)", jumlah: 800, satuan: "GR", status: "TERSEDIA", thumbColor: "#6b8a60" },
  { id: 5, nama: "Susu Cair Full Cream", jumlah: 3, satuan: "Ltr", status: "HAMPIR HABIS", thumbColor: "#4a7fa8" },
];

const peringatanKritis = [
  { nama: "Beras Jasmine Thai", sisa: "2.5 kg" },
  { nama: "Susu Cair Full Cream", sisa: "3 Ltr" },
];

const statusStyle: Record<StokStatus, string> = {
  "TERSEDIA":     "bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981]",
  "HAMPIR HABIS": "bg-amber-500/15 border border-amber-500/30 text-amber-400",
  "HABIS":        "bg-red-500/15 border border-red-500/30 text-red-400",
};
const statusDot: Record<StokStatus, string> = {
  "TERSEDIA":     "bg-[#10B981]",
  "HAMPIR HABIS": "bg-amber-400",
  "HABIS":        "bg-red-500",
};

const satuanOptions: Satuan[] = ["KG", "PCS", "GR", "Ltr", "ML"];

const GREEN_FILTER =
  "brightness(0) saturate(100%) invert(62%) sepia(60%) saturate(500%) hue-rotate(110deg) brightness(95%)";

type ModalMode = "tambah" | "edit" | null;
type OverlayType = "konfirmasi" | "sukses-tambah" | "sukses-edit" | "konfirmasi-hapus" | "sukses-hapus" | null;

export default function StokBahanBakuPage() {
  const [bahanList, setBahanList] = useState<Bahan[]>(initialBahan);
  const [search, setSearch]       = useState("");
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget]   = useState<Bahan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [overlay, setOverlay]     = useState<OverlayType>(null);

  const [namaInput,   setNamaInput]   = useState("");
  const [jumlahInput, setJumlahInput] = useState("");
  const [satuanInput, setSatuanInput] = useState<Satuan>("KG");

  const filtered      = bahanList.filter((b) => b.nama.toLowerCase().includes(search.toLowerCase()));
  const totalItem     = bahanList.length;
  const stokTersedia  = bahanList.filter((b) => b.status === "TERSEDIA").length;
  const hampirHabis   = bahanList.filter((b) => b.status === "HAMPIR HABIS").length;
  const outOfStock    = bahanList.filter((b) => b.status === "HABIS").length;

  function openTambah() {
    setNamaInput(""); setJumlahInput(""); setSatuanInput("KG");
    setModalMode("tambah");
  }
  function openEdit(b: Bahan) {
    setEditTarget(b); setNamaInput(b.nama);
    setJumlahInput(String(b.jumlah)); setSatuanInput(b.satuan);
    setModalMode("edit");
  }
  function closeModal() { setModalMode(null); setEditTarget(null); setOverlay(null); }

  function computeStatus(j: number): StokStatus {
    if (j <= 0) return "HABIS";
    if (j < 10) return "HAMPIR HABIS";
    return "TERSEDIA";
  }

  function handleSimpanClick() {
    if (!namaInput.trim() || jumlahInput === "") return;
    setOverlay("konfirmasi");
  }
  function handleKonfirmasiYes() {
    const jumlah = parseFloat(jumlahInput) || 0;
    if (modalMode === "tambah") {
      const newId = Math.max(...bahanList.map((b) => b.id)) + 1;
      setBahanList((p) => [...p, { id: newId, nama: namaInput.trim(), jumlah, satuan: satuanInput, status: computeStatus(jumlah), thumbColor: "#6b7fa8" }]);
      setOverlay("sukses-tambah");
    } else if (modalMode === "edit" && editTarget) {
      setBahanList((p) => p.map((b) => b.id === editTarget.id ? { ...b, jumlah, satuan: satuanInput, status: computeStatus(jumlah) } : b));
      setOverlay("sukses-edit");
    }
    setModalMode(null);
  }
  function handleDeleteClick(id: number) { setDeleteTarget(id); setOverlay("konfirmasi-hapus"); }
  function handleKonfirmasiHapusYes() {
    if (deleteTarget !== null) setBahanList((p) => p.filter((b) => b.id !== deleteTarget));
    setDeleteTarget(null); setOverlay("sukses-hapus");
  }

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

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-5">

        {/* Page header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Kelola Bahan Baku</h1>
            <p className="text-slate-400 text-sm mt-1.5 leading-relaxed max-w-lg">
              Pantau ketersediaan bahan baku secara real-time untuk optimalisasi operasional dapur UNIKOM.
            </p>
          </div>
          <button
            onClick={openTambah}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 shrink-0 ml-6"
            style={{ backgroundColor: "#10B981", color: "#000" }}
          >
            <span className="text-base font-bold leading-none">+</span>
            Tambah Bahan Baru
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {/* Total */}
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Total Item Terdaftar</p>
              <p className="text-white text-4xl font-bold tabular-nums">{totalItem}</p>
            </div>
          </div>
          {/* Stok Tersedia */}
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Stok Tersedia</p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: "#4EDEA3" }}>{stokTersedia}</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}>
              <Check size={26} color="#10B981" strokeWidth={2.5} />
            </div>
          </div>
          {/* Hampir Habis */}
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Hampir Habis (Low)</p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: "#F59E0B" }}>{hampirHabis}</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: "#f59e0b", backgroundColor: "#f59e0b18" }}>
              <AlertTriangle size={24} color="#f59e0b" strokeWidth={2.5} />
            </div>
          </div>
          {/* Out of Stock */}
          <div className="rounded-xl border border-white/5 p-5 flex items-center justify-between" style={{ backgroundColor: "#1E293B" }}>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Out of Stock</p>
              <p className="text-4xl font-bold tabular-nums" style={{ color: "#FFB4AB" }}>{outOfStock}</p>
            </div>
            <div className="w-14 h-14 rounded-full flex items-center justify-center border-2 shrink-0" style={{ borderColor: "#FFB4AB", backgroundColor: "#FFB4AB18" }}>
              <X size={26} color="#FFB4AB" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "#1E293B", borderColor: "#3C4A42" }}>
          {/* Toolbar */}
          <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ backgroundColor: "#131B2E80", borderColor: "#3C4A4240" }}>
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari bahan baku (nama, kategori...)"
                className="w-full border border-white/10 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-white/25"
                style={{ backgroundColor: "#0D1625" }}
              />
            </div>
            <div className="flex-1" />
            <button className="flex items-center gap-2 border border-white/10 text-slate-300 text-sm px-3.5 py-2.5 rounded-lg hover:bg-white/5 transition-colors" style={{ backgroundColor: "#1E293B" }}>
              <Filter size={13} /> Filter Kategori
            </button>
            <button className="flex items-center gap-2 border border-white/10 text-sm px-3.5 py-2.5 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "#1E293B", color: "#cbd5e1" }}>
              <Download size={13} /> Export CSV/PDF
            </button>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2.5fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-5 py-3 border-b" style={{ backgroundColor: "#131B2E4D", borderColor: "#3C4A4240" }}>
            {[
              { label: "Nama Bahan" },
              { label: "Jumlah\nTersisa" },
              { label: "Satuan" },
              { label: "Status\nInventaris" },
              { label: "Aksi" },
            ].map((h) => (
              <p key={h.label} className="text-white text-[10px] font-bold uppercase tracking-wider whitespace-pre-line leading-tight">{h.label}</p>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((b, i) => (
            <div
              key={b.id}
              className="grid grid-cols-[2.5fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-5 py-3.5 border-b last:border-0 items-center"
              style={{ backgroundColor: "#1E293B", borderColor: "#3C4A4230" }}
            >
              <span className="text-sm font-normal" style={{ color: "#E3E0F7" }}>{b.nama}</span>
              <p className="text-sm font-mono tabular-nums font-normal" style={{ color: "#E3E0F7" }}>
                {b.jumlah % 1 === 0 ? b.jumlah.toFixed(0) : b.jumlah.toFixed(2)}
              </p>
              <p className="text-sm font-normal" style={{ color: "#E3E0F7" }}>{b.satuan}</p>
              <div>
                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md w-fit ${statusStyle[b.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[b.status]}`} />
                  {b.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => openEdit(b)} className="text-white hover:opacity-70 transition-opacity p-1">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDeleteClick(b.id)} className="text-white hover:opacity-70 transition-opacity p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="px-5 py-3 flex items-center justify-between" style={{ backgroundColor: "#131B2E4D" }}>
            <p className="text-slate-400 text-sm">
              Menampilkan <span className="text-white font-semibold">{filtered.length}</span> dari{" "}
              <span className="text-white font-semibold">{bahanList.length}</span> bahan baku yang terdata
            </p>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 border border-white/10 hover:text-white transition-colors" style={{ backgroundColor: "#1E293B" }}>‹</button>
              {[1, 2, 3].map((p) => (
                <button key={p} className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors"
                  style={p === 1
                    ? { backgroundColor: "#4EDEA3", color: "#0f1a14" }
                    : { backgroundColor: "transparent", color: "#94a3b8" }}>
                  {p}
                </button>
              ))}
              <span className="w-8 h-8 flex items-center justify-center text-slate-500 text-sm">···</span>
              <button className="w-8 h-8 rounded-lg text-sm font-semibold transition-colors" style={{ backgroundColor: "transparent", color: "#94a3b8" }}>25</button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 border border-white/10 hover:text-white transition-colors" style={{ backgroundColor: "#1E293B" }}>›</button>
            </div>
          </div>
        </div>

        {/* Bottom cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Peringatan Stok Kritis */}
          <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: "#1E293B" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-base">Peringatan Stok Kritis</h3>
                <p className="text-slate-400 text-sm mt-0.5">Bahan baku berikut memerlukan pengadaan ulang segera.</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#f59e0b18" }}>
                <BellRing size={16} color="#f59e0b" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-2">
              {peringatanKritis.map((item) => (
                <div key={item.nama} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "#1A1A2A" }}>
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={14} color="#f59e0b" />
                    <span className="text-white text-sm font-medium">{item.nama}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#F59E0B" }}>Sisa {item.sisa}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Peringatan Stok Habis */}
          <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: "#1E293B" }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-white font-bold text-base">Peringatan Stok Habis</h3>
                <p className="text-slate-400 text-sm mt-0.5">Bahan baku berikut telah kehabisan stok.</p>
              </div>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFB4AB18" }}>
                <BellOff size={16} color="#FFB4AB" strokeWidth={2} />
              </div>
            </div>
            <div className="space-y-2">
              {bahanList.filter((b) => b.status === "HABIS").map((item) => (
                <div key={item.nama} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: "#1A1A2A" }}>
                  <div className="flex items-center gap-2.5">
                    <X size={14} color="#FFB4AB" />
                    <span className="text-white text-sm font-medium">{item.nama}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: "#FFB4AB" }}>Stok Habis</span>
                </div>
              ))}
              {bahanList.filter((b) => b.status === "HABIS").length === 0 && (
                <p className="text-slate-500 text-sm text-center py-3">Semua stok tersedia</p>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ── Modal Tambah / Edit ──────────────────────────────── */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-[580px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl z-10">
            {/* Header */}
            <div className="px-7 pt-6 pb-5 border-b border-white/5" style={{ backgroundColor: "#2D3449" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-xl text-white">
                    {modalMode === "tambah" ? "Tambah Bahan Baru" : "Edit Stok Bahan Baku"}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {modalMode === "tambah"
                      ? "Input data bahan baku baru ke dalam sistem inventaris."
                      : "Perbarui jumlah stok bahan baku yang tersedia."}
                  </p>
                </div>
                <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1 mt-0.5">
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="px-7 py-6 space-y-5" style={{ backgroundColor: "#222A3D" }}>
              <div>
                <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Nama Bahan</label>
                <input
                  type="text" value={namaInput}
                  onChange={(e) => setNamaInput(e.target.value)}
                  placeholder="Contoh: Daging Sapi Wagyu"
                  className="w-full rounded-xl border border-white/10 px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#10B981]/50 transition-colors"
                  style={{ backgroundColor: "#060E20" }}
                />
              </div>
              <div>
                <label className="text-white text-xs font-bold uppercase tracking-wider block mb-2">Jumlah Stok</label>
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center rounded-xl border border-white/10 overflow-hidden" style={{ backgroundColor: "#060E20" }}>
                    <input
                      type="text" inputMode="decimal"
                      value={jumlahInput}
                      onChange={(e) => setJumlahInput(e.target.value.replace(/[^0-9.]/g, ""))}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-sm px-4 py-3 focus:outline-none text-white"
                    />
                    {modalMode === "edit" && (
                      <span className="px-4 text-slate-400 text-sm font-semibold">{editTarget?.satuan}</span>
                    )}
                  </div>
                  {modalMode === "tambah" && (
                    <div className="relative shrink-0">
                      <select value={satuanInput}
                        onChange={(e) => setSatuanInput(e.target.value as Satuan)}
                        className="appearance-none rounded-xl border border-white/10 pl-3 pr-7 py-3 text-white text-sm focus:outline-none cursor-pointer w-[76px]"
                        style={{ backgroundColor: "#060E20" }}>
                        {satuanOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-7 py-5 flex items-center justify-end gap-3" style={{ backgroundColor: "#2D3449" }}>
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-colors">
                Batal
              </button>
              <button onClick={handleSimpanClick}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#10B981", color: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/pelayan/meja/simpan-perubahan.png" alt="" width={14} height={14} style={{ filter: "brightness(0)" }} />
                {modalMode === "tambah" ? "Simpan Bahan" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Simpan */}
      {overlay === "konfirmasi" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Perubahan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Apakah anda yakin dengan perubahan yang akan dilakukan?</p>
            <div className="flex gap-3">
              <button onClick={() => setOverlay(null)} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: "#10B981", color: "#10B981" }}>No</button>
              <button onClick={handleKonfirmasiYes} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus */}
      {overlay === "konfirmasi-hapus" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Hapus Bahan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Apakah anda yakin ingin menghapus bahan baku ini dari sistem inventaris?</p>
            <div className="flex gap-3">
              <button onClick={() => { setOverlay(null); setDeleteTarget(null); }} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm" style={{ borderColor: "#10B981", color: "#10B981" }}>No</button>
              <button onClick={handleKonfirmasiHapusYes} className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Yes</button>
            </div>
          </div>
        </div>
      )}

      {/* Sukses Tambah */}
      {overlay === "sukses-tambah" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Bahan Berhasil Ditambahkan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Bahan baku baru telah berhasil dicatat ke dalam sistem inventaris.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}

      {/* Sukses Edit */}
      {overlay === "sukses-edit" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Stok Berhasil Diperbarui</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Jumlah stok bahan baku telah berhasil diperbarui dalam sistem.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}

      {/* Sukses Hapus */}
      {overlay === "sukses-hapus" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Bahan Berhasil Dihapus</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">Bahan baku telah berhasil dihapus dari sistem inventaris.</p>
            <button onClick={() => setOverlay(null)} className="w-full py-3 rounded-xl font-bold text-sm" style={{ backgroundColor: "#10B981", color: "#000" }}>Oke</button>
          </div>
        </div>
      )}
    </div>
  );
}
