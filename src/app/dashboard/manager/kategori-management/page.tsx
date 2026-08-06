"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle, Check } from "lucide-react";

interface Kategori {
  id: string;
  nama: string;
  deskripsi: string;
  warna: string;
  jumlahMenu: number;
  aktif: boolean;
}

const WARNA_OPTIONS = [
  { label: "Hijau",  value: "#10B981" },
  { label: "Ungu",   value: "#8b5cf6" },
  { label: "Kuning", value: "#f59e0b" },
  { label: "Biru",   value: "#60a5fa" },
  { label: "Abu",    value: "#94a3b8" },
  { label: "Merah",  value: "#ef4444" },
];

const initialKategori: Kategori[] = [
  { id: "K001", nama: "Main Course", deskripsi: "Menu utama berbahan daging, ayam, atau ikan.",       warna: "#10B981", jumlahMenu: 52, aktif: true  },
  { id: "K002", nama: "Beverage",    deskripsi: "Minuman segar, kopi, teh, dan jus buah pilihan.",    warna: "#8b5cf6", jumlahMenu: 28, aktif: true  },
  { id: "K003", nama: "Dessert",     deskripsi: "Hidangan penutup manis dan menyegarkan.",            warna: "#f59e0b", jumlahMenu: 18, aktif: true  },
  { id: "K004", nama: "Appetizer",   deskripsi: "Hidangan pembuka ringan untuk membuka selera.",      warna: "#60a5fa", jumlahMenu: 15, aktif: true  },
  { id: "K005", nama: "Snack",       deskripsi: "Camilan dan makanan ringan untuk santai.",           warna: "#94a3b8", jumlahMenu: 10, aktif: false },
  { id: "K006", nama: "Spesial",     deskripsi: "Menu terbatas edisi spesial setiap bulannya.",       warna: "#ef4444", jumlahMenu: 5,  aktif: true  },
];

type ModalMode = "tambah" | "edit" | "hapus" | null;

const BG    = "#151C25";
const PAGE  = "#0d1117";
const BORD  = "rgba(255,255,255,0.07)";
const ACCENT = "#D0BCFF";

export default function KategoriManagementPage() {
  const [list, setList]           = useState<Kategori[]>(initialKategori);
  const [mode, setMode]           = useState<ModalMode>(null);
  const [target, setTarget]       = useState<Kategori | null>(null);
  const [namaInput, setNamaInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [warnaPick, setWarnaPick] = useState(WARNA_OPTIONS[0].value);
  const [showConfirm, setShowConfirm] = useState<"simpan" | "hapus" | null>(null);
  const [showSuccess, setShowSuccess] = useState<"simpan" | "hapus" | null>(null);
  const [pendingMode, setPendingMode] = useState<ModalMode>(null);
  const [toggleTarget, setToggleTarget] = useState<Kategori | null>(null);
  const [showToggleSuccess, setShowToggleSuccess] = useState<Kategori | null>(null);

  function openTambah() {
    setNamaInput(""); setDescInput(""); setWarnaPick(WARNA_OPTIONS[0].value);
    setTarget(null); setMode("tambah");
  }

  function openEdit(k: Kategori) {
    setNamaInput(k.nama); setDescInput(k.deskripsi); setWarnaPick(k.warna);
    setTarget(k); setMode("edit");
  }

  function openHapus(k: Kategori) { setTarget(k); setMode("hapus"); }
  function closeModal() { setMode(null); setTarget(null); }

  function handleSimpan() {
    if (!namaInput.trim()) return;
    setPendingMode(mode);
    setMode(null);
    setShowConfirm("simpan");
  }

  function confirmSimpan() {
    if (pendingMode === "tambah") {
      setList((p) => [...p, {
        id: `K${String(p.length + 1).padStart(3, "0")}`,
        nama: namaInput.trim(), deskripsi: descInput.trim(),
        warna: warnaPick, jumlahMenu: 0, aktif: true,
      }]);
    } else if (pendingMode === "edit" && target) {
      setList((p) => p.map((k) => k.id === target.id
        ? { ...k, nama: namaInput.trim(), deskripsi: descInput.trim(), warna: warnaPick }
        : k));
    }
    setShowConfirm(null);
    setShowSuccess("simpan");
    setTarget(null);
  }

  function handleHapus() {
    setShowConfirm("hapus");
    setMode(null);
  }

  function confirmHapus() {
    if (target) setList((p) => p.filter((k) => k.id !== target.id));
    setShowConfirm(null);
    setShowSuccess("hapus");
  }

  function toggleAktif(id: string) {
    setList((p) => p.map((k) => k.id === id ? { ...k, aktif: !k.aktif } : k));
  }

  const totalAktif = list.filter((k) => k.aktif).length;

  return (
    <div className="p-6 space-y-5 min-h-full" style={{ backgroundColor: PAGE }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Kategori Management</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            Kelola kategori master sebagai acuan daftar menu restoran.
          </p>
        </div>
        <button onClick={openTambah}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
          <Plus size={15} />
          Tambah Kategori
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "TOTAL KATEGORI", value: list.length,   color: "#fff" },
          { label: "AKTIF",          value: totalAktif,    color: "#10B981" },
          { label: "NONAKTIF",       value: list.length - totalAktif, color: "#ef4444" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
            <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#CBC3D7" }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: BG, borderColor: BORD }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["NAMA KATEGORI", "DESKRIPSI", "JUMLAH MENU", "STATUS", "AKSI"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((k) => (
              <tr key={k.id} className="hover:bg-white/[0.02] transition-colors"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {/* Nama */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: k.warna }} />
                    <span className="text-white font-semibold">{k.nama}</span>
                  </div>
                </td>
                {/* Deskripsi */}
                <td className="px-5 py-4 max-w-[280px]">
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{k.deskripsi}</p>
                </td>
                {/* Jumlah Menu */}
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{ backgroundColor: `${k.warna}18`, color: k.warna }}>
                    {k.jumlahMenu} menu
                  </span>
                </td>
                {/* Status */}
                <td className="px-5 py-4">
                  <button onClick={() => setToggleTarget(k)}
                    className="relative inline-flex w-10 h-5 rounded-full transition-colors"
                    style={{ backgroundColor: k.aktif ? "#10B981" : "#374151" }}>
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      style={{ transform: k.aktif ? "translateX(20px)" : "translateX(0)" }} />
                  </button>
                  <span className="ml-2 text-xs font-semibold" style={{ color: k.aktif ? "#10B981" : "#64748b" }}>
                    {k.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                {/* Aksi */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(k)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                      style={{ color: "#94a3b8" }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => openHapus(k)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors"
                      style={{ color: "#64748b" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3.5 border-t text-xs" style={{ borderColor: "rgba(255,255,255,0.06)", color: "#64748b" }}>
          Menampilkan {list.length} kategori
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {(mode === "tambah" || mode === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={closeModal}>
          <div className="w-[420px] rounded-2xl border p-6 space-y-5"
            style={{ backgroundColor: "#161d2e", borderColor: "rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">{mode === "tambah" ? "Tambah Kategori" : "Edit Kategori"}</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>

            <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>Nama Kategori</label>
              <input value={namaInput} onChange={(e) => setNamaInput(e.target.value)}
                placeholder="Contoh: Main Course"
                className="w-full border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>Deskripsi</label>
              <textarea value={descInput} onChange={(e) => setDescInput(e.target.value)}
                placeholder="Deskripsi singkat kategori..."
                rows={3}
                className="w-full border rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none"
                style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Warna */}
            <div className="space-y-2">
              <label className="text-xs font-semibold" style={{ color: "#CBC3D7" }}>Warna Badge</label>
              <div className="flex items-center gap-2 flex-wrap">
                {WARNA_OPTIONS.map((w) => (
                  <button key={w.value} onClick={() => setWarnaPick(w.value)}
                    className="w-7 h-7 rounded-full transition-all"
                    style={{
                      backgroundColor: w.value,
                      outline: warnaPick === w.value ? `3px solid ${ACCENT}` : "3px solid transparent",
                      outlineOffset: "2px",
                    }} />
                ))}
                <span className="text-xs ml-1" style={{ color: "#64748b" }}>
                  {WARNA_OPTIONS.find((w) => w.value === warnaPick)?.label}
                </span>
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
              <span className="text-xs" style={{ color: "#64748b" }}>Preview:</span>
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: `${warnaPick}18`, color: warnaPick }}>
                {namaInput || "Nama Kategori"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button onClick={closeModal}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors hover:bg-white/5"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#64748b" }}>
                Batal
              </button>
              <button onClick={handleSimpan} disabled={!namaInput.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-opacity disabled:opacity-40"
                style={{ backgroundColor: ACCENT, color: "#000" }}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Hapus */}
      {mode === "hapus" && target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={closeModal}>
          <div className="w-[380px] rounded-2xl border p-6 space-y-4"
            style={{ backgroundColor: "#161d2e", borderColor: "rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Hapus Kategori</h3>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
            </div>
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Yakin ingin menghapus kategori{" "}
              <span className="font-bold text-white">{target.nama}</span>?{" "}
              Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi{" "}
              <span className="font-bold" style={{ color: "#ef4444" }}>{target.jumlahMenu} menu</span> yang terdaftar.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={closeModal}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "#64748b" }}>
                Batal
              </button>
              <button onClick={handleHapus}
                className="flex-1 py-2 rounded-xl text-sm font-bold"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Simpan */}
      {showConfirm === "simpan" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowConfirm(null)}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <AlertCircle size={28} style={{ color: ACCENT }} />
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
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Tidak
              </button>
              <button onClick={confirmSimpan}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: "#000" }}>
                Ya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showConfirm === "hapus" && target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setShowConfirm(null)}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#ef4444" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">
                Hapus Kategori Ini?
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Kategori <span className="text-white font-semibold">{target.nama}</span> akan dihapus permanen dan mempengaruhi{" "}
                <span className="font-semibold" style={{ color: "#ef4444" }}>{target.jumlahMenu} menu</span> yang terdaftar.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Tidak
              </button>
              <button onClick={confirmHapus}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Toggle Aktif */}
      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setToggleTarget(null)}>
          <div className="w-[380px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <AlertCircle size={28} style={{ color: ACCENT }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Ubah Status Kategori?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Kategori <span className="text-white font-semibold">{toggleTarget.nama}</span> akan diubah menjadi{" "}
                <span className="font-semibold" style={{ color: ACCENT }}>
                  {toggleTarget.aktif ? "Nonaktif" : "Aktif"}
                </span>.
                {toggleTarget.aktif && (
                  <span className="block mt-1 text-xs" style={{ color: "#ef4444" }}>
                    Ini akan mempengaruhi {toggleTarget.jumlahMenu} menu yang terdaftar.
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button onClick={() => setToggleTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Batal
              </button>
              <button
                onClick={() => {
                  const prev = toggleTarget;
                  toggleAktif(prev.id);
                  setToggleTarget(null);
                  setShowToggleSuccess(prev);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT, color: "#000" }}>
                Ya, Ubah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sukses Toggle Aktif */}
      {showToggleSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: ACCENT }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Status Berhasil Diubah!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Kategori <span className="text-white font-semibold">{showToggleSuccess.nama}</span> kini berstatus{" "}
                <span className="font-semibold" style={{ color: ACCENT }}>
                  {showToggleSuccess.aktif ? "Nonaktif" : "Aktif"}
                </span>.
              </p>
            </div>
            <button onClick={() => setShowToggleSuccess(null)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: "#000" }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Berhasil */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: ACCENT }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">
                {showSuccess === "simpan" ? "Kategori Berhasil Disimpan!" : "Kategori Berhasil Dihapus!"}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {showSuccess === "simpan"
                  ? "Data kategori telah berhasil diperbarui pada portal manajemen."
                  : "Kategori telah dihapus dari daftar dan tidak akan muncul di portal."}
              </p>
            </div>
            <button onClick={() => { setShowSuccess(null); setTarget(null); }}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: "#000" }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
