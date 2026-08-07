"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, Pencil, Check, QrCode, ExternalLink, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import type { ApiMeja } from "@/types/api";

type MejaStatus = "TERSEDIA" | "TERISI";

interface Meja {
  id: number;
  nomor: string;
  kapasitas: number;
  status: MejaStatus;
}

const initialMeja: Meja[] = [];

function mapMeja(m: ApiMeja): Meja {
  return {
    id: m.id_meja,
    nomor: String(m.nomor_meja).padStart(2, "0"),
    kapasitas: m.kapasitas,
    status: m.status === "KOSONG" ? "TERSEDIA" : "TERISI",
  };
}

const capacityOptions = [
  { value: 2, icon: "/images/pelayan/meja/1orang.png" },
  { value: 4, icon: "/images/pelayan/meja/4orang.png" },
  { value: 6, icon: "/images/pelayan/meja/6orang.png" },
  { value: 8, icon: "/images/pelayan/meja/8orang.png" },
];

const GREEN_FILTER =
  "brightness(0) saturate(100%) invert(62%) sepia(60%) saturate(500%) hue-rotate(110deg) brightness(95%)";
const MINT_FILTER =
  "brightness(0) saturate(100%) invert(78%) sepia(35%) saturate(500%) hue-rotate(105deg) brightness(105%)";
const SLATE_FILTER = "brightness(0) invert(1) opacity(0.35)";

type ModalMode = "tambah" | "edit" | null;
type OverlayType = "konfirmasi" | "sukses-tambah" | "sukses-edit" | "konfirmasi-hapus" | "sukses-hapus" | "konfirmasi-toggle" | null;

export default function InformasiMejaPage() {
  const [mejaList, setMejaList] = useState<Meja[]>(initialMeja);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Meja | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const [qrTarget, setQrTarget] = useState<Meja | null>(null);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<Meja | null>(null);

  const BASE_URL = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  function mejaUrl(nomor: string) { return `${BASE_URL}/pesan?meja=${nomor}`; }

  const [nomorInput, setNomorInput] = useState("");
  const [kapasitasSelected, setKapasitasSelected] = useState<number | null>(4);
  const [kapasitasManual, setKapasitasManual] = useState("");
  const [useManual, setUseManual] = useState(false);

  const loadTables = useCallback(async () => {
    try {
      const data = await api.getTables();
      setMejaList(data.map(mapMeja));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat meja");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTables();
    const interval = setInterval(() => void loadTables(), 15000);
    return () => clearInterval(interval);
  }, [loadTables]);

  const tersedia = mejaList.filter((m) => m.status === "TERSEDIA").length;
  const terisi = mejaList.filter((m) => m.status === "TERISI").length;

  function openTambah() {
    setNomorInput("");
    setKapasitasSelected(4);
    setKapasitasManual("");
    setUseManual(false);
    setModalMode("tambah");
  }

  function openEdit(meja: Meja) {
    setEditTarget(meja);
    setNomorInput(meja.nomor);
    const preset = capacityOptions.find((c) => c.value === meja.kapasitas);
    if (preset) {
      setKapasitasSelected(meja.kapasitas);
      setUseManual(false);
      setKapasitasManual("");
    } else {
      setKapasitasSelected(null);
      setUseManual(true);
      setKapasitasManual(String(meja.kapasitas));
    }
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditTarget(null);
    setOverlay(null);
  }

  function handleHapusDraft() {
    setNomorInput("");
    setKapasitasSelected(4);
    setKapasitasManual("");
    setUseManual(false);
  }

  function getKapasitas(): number {
    if (useManual) return parseInt(kapasitasManual) || 0;
    return kapasitasSelected ?? 0;
  }

  function handleSimpanClick() {
    const kap = getKapasitas();
    if (!nomorInput.trim() || kap < 1) return;
    setOverlay("konfirmasi");
  }

  async function handleKonfirmasiYes() {
    const kap = getKapasitas();
    const nomor_meja = parseInt(nomorInput.trim(), 10);
    if (!Number.isInteger(nomor_meja) || nomor_meja < 1 || kap < 1) {
      setError("Nomor meja dan kapasitas tidak valid");
      setOverlay(null);
      return;
    }

    setSubmitting(true);
    try {
      if (modalMode === "tambah") {
        await api.createTable({ nomor_meja, kapasitas: kap, status: "KOSONG" });
        setOverlay("sukses-tambah");
      } else if (modalMode === "edit" && editTarget) {
        await api.updateTable(editTarget.id, {
          nomor_meja,
          kapasitas: kap,
        });
        setOverlay("sukses-edit");
      }
      setModalMode(null);
      setEditTarget(null);
      await loadTables();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan meja");
      setOverlay(null);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteClick(id: number) {
    setDeleteTarget(id);
    setOverlay("konfirmasi-hapus");
  }

  async function handleKonfirmasiHapusYes() {
    if (deleteTarget === null) return;
    setSubmitting(true);
    try {
      await api.deleteTable(deleteTarget);
      setDeleteTarget(null);
      setOverlay("sukses-hapus");
      await loadTables();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus meja");
      setOverlay(null);
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleKonfirmasiToggleYes() {
    if (!toggleStatusTarget) return;
    const nextStatus =
      toggleStatusTarget.status === "TERSEDIA" ? "TERISI" : "KOSONG";
    setSubmitting(true);
    try {
      await api.updateTable(toggleStatusTarget.id, { status: nextStatus });
      setToggleStatusTarget(null);
      setOverlay(null);
      await loadTables();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah status meja");
      setOverlay(null);
      setToggleStatusTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  const isFormOpen = modalMode !== null;

  /* ─── Info icon (teal circle "i") ─────────────────────────── */
  const InfoIcon = () => (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
      style={{ borderColor: "#10B981", backgroundColor: "#10B981" + "18" }}
    >
      <span className="text-[#10B981] font-bold text-lg leading-none select-none">i</span>
    </div>
  );

  /* ─── Success icon (plain checkmark) ──────────────────────── */
  const SuccessIcon = () => (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
      style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}
    >
      <Check size={22} color="#10B981" strokeWidth={3} />
    </div>
  );

  return (
    <div className="p-6">
      {error && (
        <p className="mb-4 text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
          <button
            type="button"
            className="ml-3 underline text-red-300"
            onClick={() => setError("")}
          >
            Tutup
          </button>
        </p>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-slate-400 text-sm">Tersedia: <span className="text-white font-semibold">{tersedia}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-400 text-sm">Terisi: <span className="text-white font-semibold">{terisi}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadTables()}
            className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openTambah}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#10B981", color: "#000" }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Tambah Meja
          </button>
        </div>
      </div>

      {/* Grid meja */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading && mejaList.length === 0 ? (
          <p className="text-slate-500 col-span-full py-10 text-center text-sm">Memuat meja...</p>
        ) : mejaList.length === 0 ? (
          <p className="text-slate-500 col-span-full py-10 text-center text-sm">Belum ada meja. Tambah meja baru.</p>
        ) : mejaList.map((meja) => (
          <div
            key={meja.id}
            className="rounded-2xl border border-white/5 p-4 flex flex-col items-center relative"
            style={{ backgroundColor: "#1E1E2E" }}
          >
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <button
                onClick={() => openEdit(meja)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 transition-colors hover:border-white/20 hover:bg-white/10 text-white"
                style={{ backgroundColor: "#2a2a3e" }}
              >
                <Pencil size={13} color="white" />
              </button>
              <button
                onClick={() => setQrTarget(meja)}
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 transition-colors hover:border-[#10B981]/50 hover:bg-[#10B981]/10"
                style={{ backgroundColor: "#2a2a3e", color: "#10B981" }}
                title="Lihat QR Meja"
              >
                <QrCode size={13} />
              </button>
            </div>
            <div className="absolute top-3 right-3">
              <button
                onClick={() => handleDeleteClick(meja.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/pelayan/meja/hapus-draft.png"
                  alt="hapus"
                  width={14}
                  height={14}
                  style={{ filter: "brightness(0) saturate(100%) invert(40%) sepia(80%) saturate(500%) hue-rotate(310deg)" }}
                />
              </button>
            </div>

            <p className="font-bold mt-6 mb-1.5" style={{ fontSize: "48px", lineHeight: 1, color: "#DAE2FD" }}>
              {meja.nomor}
            </p>
            <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase mb-4">
              {meja.kapasitas} KURSI
            </p>

            <button
              onClick={() => { setToggleStatusTarget(meja); setOverlay("konfirmasi-toggle"); }}
              className="transition-opacity hover:opacity-75"
              title="Klik untuk ubah status"
            >
              {meja.status === "TERSEDIA" ? (
                <span className="flex items-center gap-1.5 bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-bold px-3 py-1 rounded-md cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  TERSEDIA
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold px-3 py-1 rounded-md cursor-pointer">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  TERISI
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* ── Form Modal (Tambah / Edit) ───────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-[540px] rounded-2xl overflow-hidden border shadow-2xl z-10" style={{ borderColor: "#3C4A42" }}>
            {/* Header */}
            <div className="px-7 pt-7 pb-5 border-b" style={{ backgroundColor: "#2D3449", borderBottomColor: "#3C4A42" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-white font-bold text-xl">
                    {modalMode === "tambah" ? "Tambah Meja Baru" : "Edit Informasi Meja"}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {modalMode === "tambah"
                      ? "Konfigurasi meja baru ke sistem operasional."
                      : "Perbarui konfigurasi meja yang sudah terdaftar."}
                  </p>
                </div>
                <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors p-1 mt-0.5">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6 space-y-6" style={{ backgroundColor: "#222A3D" }}>
              <div>
                <label className="text-white text-sm font-semibold block mb-2">Nomor Meja</label>
                <div className="flex items-center rounded-xl overflow-hidden border" style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}>
                  <div className="px-4 py-3 border-r flex items-center" style={{ borderRightColor: "#3C4A42" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/pelayan/meja/no-meja.png" alt="" width={16} height={16} style={{ filter: GREEN_FILTER }} />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={nomorInput}
                    onChange={(e) => setNomorInput(e.target.value.replace(/\D/g, ""))}
                    placeholder="Contoh: 12"
                    className="flex-1 bg-transparent text-sm px-4 py-3 focus:outline-none text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-white text-sm font-semibold block mb-3">Kapasitas Kursi</label>
                <div className="grid grid-cols-5 gap-3">
                  {capacityOptions.map((opt) => {
                    const isActive = !useManual && kapasitasSelected === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setKapasitasSelected(opt.value); setUseManual(false); setKapasitasManual(""); }}
                        className="flex flex-col items-center gap-2 py-3 rounded-xl border transition-all"
                        style={{
                          backgroundColor: isActive ? "#10B98118" : "#131B2E",
                          borderColor: isActive ? "#10B981" : "#3C4A42",
                        }}
                      >
                        {/* container ketat agar semua icon ukurannya seragam */}
                        <div className="w-5 h-5 flex items-center justify-center overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={opt.icon} alt="" width={20} height={20} className="w-5 h-5 object-contain" style={{ filter: isActive ? GREEN_FILTER : MINT_FILTER }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: isActive ? "#10B981" : "#94a3b8" }}>{opt.value}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => { setUseManual(true); setKapasitasSelected(null); }}
                    className="flex flex-col items-center gap-2 py-3 rounded-xl border transition-all"
                    style={{
                      backgroundColor: useManual ? "#10B98118" : "#131B2E",
                      borderColor: useManual ? "#10B981" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-base font-bold leading-none tracking-tight" style={{ color: useManual ? "#10B981" : "#94a3b8" }}>···</span>
                    </div>
                    <span className="text-[11px] font-semibold" style={{ color: useManual ? "#10B981" : "#94a3b8" }}>Lainnya</span>
                  </button>
                </div>
                {useManual && (
                  <div className="mt-3">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={kapasitasManual}
                      onChange={(e) => setKapasitasManual(e.target.value.replace(/\D/g, ""))}
                      placeholder="Masukkan jumlah kursi..."
                      className="w-full rounded-xl border px-4 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none transition-colors"
                      style={{ backgroundColor: "#060E20", borderColor: "#3C4A42" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 flex items-center justify-between border-t" style={{ backgroundColor: "#2D3449", borderTopColor: "#3C4A42" }}>
              <button onClick={handleHapusDraft} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/pelayan/meja/hapus-draft.png" alt="" width={14} height={14} style={{ filter: SLATE_FILTER }} />
                Hapus Draft
              </button>
              <div className="flex items-center gap-3">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border text-white text-sm font-semibold hover:bg-white/5 transition-colors" style={{ borderColor: "#3C4A42" }}>
                  Batal
                </button>
                <button
                  onClick={handleSimpanClick}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#10B981", color: "#000" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/pelayan/meja/simpan-perubahan.png" alt="" width={14} height={14} style={{ filter: "brightness(0)" }} />
                  {modalMode === "tambah" ? "Simpan Meja" : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Simpan ────────────────────────────────────── */}
      {overlay === "konfirmasi" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Perubahan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Apakah anda yakin dengan perubahan yang akan dilakukan?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOverlay(null)}
                className="flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors hover:bg-[#10B981]/5"
                style={{ borderColor: "#10B981", color: "#10B981" }}
              >
                No
              </button>
              <button
                onClick={() => void handleKonfirmasiYes()}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                {submitting ? "..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Hapus ─────────────────────────────────────── */}
      {overlay === "konfirmasi-hapus" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Konfirmasi Hapus Meja</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Apakah anda yakin ingin menghapus meja ini dari sistem?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setOverlay(null); setDeleteTarget(null); }}
                className="flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors hover:bg-[#10B981]/5"
                style={{ borderColor: "#10B981", color: "#10B981" }}
              >
                No
              </button>
              <button
                onClick={() => void handleKonfirmasiHapusYes()}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                {submitting ? "..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sukses Tambah ────────────────────────────────────────── */}
      {overlay === "sukses-tambah" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Meja Berhasil Ditambahkan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Meja baru telah berhasil dikonfigurasi dan siap digunakan.
            </p>
            <button
              onClick={() => setOverlay(null)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              Oke
            </button>
          </div>
        </div>
      )}

      {/* ── Modal QR Code ───────────────────────────────────────── */}
      {qrTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setQrTarget(null)} />
          <div className="relative w-[360px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-10" style={{ backgroundColor: "#1E2235" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: "#10B981" }}>QR Code</p>
                <h3 className="text-white font-bold text-lg">Meja {qrTarget.nomor}</h3>
              </div>
              <button onClick={() => setQrTarget(null)} className="text-slate-500 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* QR */}
            <div className="flex justify-center px-6 pb-5">
              <div className="p-4 rounded-2xl" style={{ backgroundColor: "#fff" }}>
                <QRCodeSVG value={mejaUrl(qrTarget.nomor)} size={200} />
              </div>
            </div>

            {/* Link */}
            <div className="px-6 pb-6 space-y-3">
              <p className="text-xs font-semibold" style={{ color: "#64748b" }}>Link Customer</p>
              <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ backgroundColor: "#080F17", borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="flex-1 text-xs truncate font-mono" style={{ color: "#94a3b8" }}>
                  {mejaUrl(qrTarget.nomor)}
                </span>
                <a
                  href={mejaUrl(qrTarget.nomor)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-opacity hover:opacity-80"
                  style={{ backgroundColor: "#10B981", color: "#000" }}
                >
                  <ExternalLink size={11} />
                  Coba
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sukses Hapus ─────────────────────────────────────────── */}
      {overlay === "sukses-hapus" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Meja Berhasil Dihapus</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Meja telah dihapus dari sistem dan tidak akan muncul di daftar.
            </p>
            <button
              onClick={() => setOverlay(null)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#10B981", color: "#000" }}
            >
              Oke
            </button>
          </div>
        </div>
      )}

      {/* ── Konfirmasi Toggle Status Meja ────────────────────────── */}
      {overlay === "konfirmasi-toggle" && toggleStatusTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">Ubah Status Meja?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Status meja <span className="text-white font-semibold">{toggleStatusTarget.nomor}</span> akan diubah menjadi{" "}
              <span className="font-semibold" style={{ color: "#10B981" }}>
                {toggleStatusTarget.status === "TERSEDIA" ? "TERISI" : "TERSEDIA"}
              </span>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setOverlay(null); setToggleStatusTarget(null); }}
                className="flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-colors hover:bg-[#10B981]/5"
                style={{ borderColor: "#10B981", color: "#10B981" }}
              >
                Batal
              </button>
              <button
                onClick={() => void handleKonfirmasiToggleYes()}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                {submitting ? "..." : "Ya, Ubah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sukses Edit ──────────────────────────────────────────── */}
      {overlay === "sukses-edit" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOverlay(null)} />
          <div className="relative w-[420px] rounded-2xl border border-white/10 shadow-2xl px-8 py-8 z-10" style={{ backgroundColor: "#1E2235" }}>
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">Perubahan Berhasil Disimpan</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-7">
              Informasi meja telah berhasil diperbarui dalam sistem.
            </p>
            <button
              onClick={() => setOverlay(null)}
              className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
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
