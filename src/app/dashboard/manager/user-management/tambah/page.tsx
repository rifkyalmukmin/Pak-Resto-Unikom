"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronDown, Eye, EyeOff, ImageIcon, AlertCircle, Check } from "lucide-react";
import { api } from "@/lib/api";
import { LABEL_TO_ROLE, initialsFromName, fileToDataUrl } from "@/lib/user-helpers";

const roleOptions = ["Pelayan", "Koki", "Kasir", "Manager"];

const ROLE_COLORS: Record<string, string> = {
  Pelayan: "#10B981",
  Koki:    "#F59E0B",
  Kasir:   "#00B954",
  Manager: "#D0BCFF",
};

export default function TambahUserPage() {
  const router = useRouter();
  const [form, setForm]           = useState({ nama: "", username: "", role: "", password: "" });
  const [showPass, setShowPass]   = useState(false);
  const [roleOpen, setRoleOpen]   = useState(false);
  const [preview, setPreview]     = useState<string | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(URL.createObjectURL(file));
      setPhotoData(dataUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat foto");
      setPreview(null);
      setPhotoData(null);
    }
  }

  const roleColor = form.role ? ROLE_COLORS[form.role] : "#64748b";
  const canSubmit = form.nama.trim() && form.username.trim() && form.role && form.password.trim();

  function handleSaveClick() {
    if (!canSubmit) {
      setError("Lengkapi semua field wajib: nama, username, role, dan password.");
      return;
    }
    setError(null);
    setShowConfirm(true);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.createUser({
        nama_lengkap: form.nama.trim(),
        username: form.username.trim(),
        password: form.password,
        role: LABEL_TO_ROLE[form.role],
        foto_profil: photoData,
      });
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan user");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
        <Link href="/dashboard/manager/user-management" className="hover:text-white transition-colors">
          Manajemen User
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium" style={{ color: "#D0BCFF" }}>Tambah User Baru</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tambah User Baru</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manager/user-management"
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94a3b8" }}
          >
            Batal
          </Link>
          <button
            onClick={handleSaveClick}
            disabled={!canSubmit || submitting}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            Simpan User
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

      <div className="grid gap-5 items-start" style={{ gridTemplateColumns: "1fr 440px" }}>

        <div className="rounded-xl p-6 border space-y-5" style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
          <h3 className="font-bold text-base" style={{ color: "#D0BCFF" }}>Informasi Akun</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>ID User (Otomatis)</label>
              <input
                type="text" value="" readOnly placeholder="Otomatis"
                className="w-full h-10 px-4 rounded-lg text-sm border"
                style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#64748b", cursor: "not-allowed" }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Nama Lengkap</label>
              <input
                type="text" placeholder="Contoh: Ahmad Suherman"
                value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })}
                className="w-full h-10 px-4 rounded-lg text-sm outline-none border transition-colors"
                style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Username</label>
              <input
                type="text" placeholder="Contoh: ahmad_24"
                value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full h-10 px-4 rounded-lg text-sm outline-none border transition-colors"
                style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
              />
            </div>
            <div ref={roleRef} className="relative">
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Role / Access Level</label>
              <button
                type="button"
                onClick={() => setRoleOpen((p) => !p)}
                className="w-full h-10 px-4 rounded-lg text-sm border flex items-center justify-between outline-none"
                style={{
                  backgroundColor: "#080F17",
                  borderColor: roleOpen ? "rgba(208,188,255,0.4)" : "#494454",
                  color: form.role ? "#fff" : "#64748b",
                }}
              >
                <div className="flex items-center gap-2">
                  {form.role && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: roleColor }} />}
                  <span>{form.role || "Pilih role..."}</span>
                </div>
                <ChevronDown
                  size={14} className="shrink-0 transition-transform"
                  style={{ transform: roleOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#64748b" }}
                />
              </button>
              {roleOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 shadow-xl"
                  style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
                >
                  {roleOptions.map((r) => (
                    <button
                      key={r} type="button"
                      onClick={() => { setForm({ ...form, role: r }); setRoleOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: form.role === r ? "#fff" : "#94a3b8" }}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ROLE_COLORS[r] }} />
                      <span className="flex-1 text-left">{r}</span>
                      {form.role === r && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D0BCFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Password Akun</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-10 pl-4 pr-10 rounded-lg text-sm outline-none border"
                style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
              />
              <button
                type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                style={{ color: "#64748b" }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color: "#64748b" }}>
              Gunakan minimal 8 karakter termasuk simbol untuk keamanan tinggi.
            </p>
          </div>
        </div>

        <div className="rounded-xl p-6 border space-y-5" style={{ backgroundColor: "#151C25", borderColor: "#494454" }}>
          <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#D0BCFF" }}>Foto Profil</h3>

          <label
            className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-white/20"
            style={{ borderColor: "#494454", minHeight: 180, backgroundColor: "#080F17" }}
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
                Rasio 1:1 direkomendasikan. Maksimal file 500KB (JPG, PNG, WebP).
              </p>
            </div>
          </label>
          <p className="text-xs text-center" style={{ color: "#64748b" }}>Rekomendasi ukuran: 1:1 (Min. 400×400px)</p>

          <div>
            <p className="text-sm font-semibold mb-3" style={{ color: "#D0BCFF" }}>Pratinjau Profil</p>
            <div
              className="rounded-xl border flex flex-col items-center gap-3 p-5"
              style={{ borderColor: "#494454", backgroundColor: "#080F17" }}
            >
              <div
                className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center text-2xl font-bold shrink-0"
                style={{ backgroundColor: roleColor + "25", color: roleColor, border: "2px solid " + roleColor + "40" }}
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="preview" className="w-full h-full object-cover" />
                ) : form.nama ? (
                  initialsFromName(form.nama)
                ) : (
                  <ImageIcon size={28} style={{ color: "#374151" }} />
                )}
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm">{form.nama || "Nama Lengkap"}</p>
                {form.role ? (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: roleColor }}>{form.role}</p>
                ) : (
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Role belum dipilih</p>
                )}
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>{form.username || "username"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <h3 className="text-white font-bold text-lg leading-snug">Apakah Anda Yakin Menyimpan User Ini?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Akun baru akan dibuat dan dapat langsung digunakan untuk login ke sistem.
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
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5" style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">User Berhasil Ditambahkan!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Akun <span className="text-white font-semibold">{form.nama || "baru"}</span> telah berhasil dibuat dan dapat digunakan untuk login.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard/manager/user-management")}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}
            >
              Kembali ke Manajemen User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
