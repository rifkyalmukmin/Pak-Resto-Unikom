"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, ChevronDown, Eye, EyeOff, AlertCircle, Check, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { LABEL_TO_ROLE, ROLE_LABEL, initialsFromName, fileToDataUrl, userPhotoSrc } from "@/lib/user-helpers";
import type { Role } from "@prisma/client";

const roleOptions = ["Pelayan", "Koki", "Kasir", "Manager"];

const ROLE_COLORS: Record<string, string> = {
  Pelayan: "#10B981",
  Koki:    "#F59E0B",
  Kasir:   "#00B954",
  Manager: "#D0BCFF",
};

function formatUserId(id: number) {
  return `USR-${String(id).padStart(3, "0")}`;
}

function EditUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = Number(searchParams.get("id"));

  const [form, setForm] = useState({
    nama:     "",
    username: "",
    role:     "",
    password: "",
  });
  const [showPass, setShowPass]       = useState(false);
  const [roleOpen, setRoleOpen]       = useState(false);
  const [preview, setPreview]         = useState<string | null>(null);
  const [photoData, setPhotoData]     = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hoverThumb, setHoverThumb]   = useState(false);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const roleRef    = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  const loadUser = useCallback(async () => {
    if (!userId || Number.isNaN(userId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await api.getUser(userId);
      setForm({
        nama:     user.nama_lengkap,
        username: user.username,
        role:     ROLE_LABEL[user.role as Role] ?? user.role,
        password: "",
      });
      setExistingPhoto(user.foto_profil);
      setPreview(null);
      setPhotoData(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

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

  const displayPhoto = preview ?? userPhotoSrc(existingPhoto);

  const roleColor = ROLE_COLORS[form.role] ?? "#64748b";
  const initials = form.nama ? initialsFromName(form.nama) : "??";
  const canSubmit = form.nama.trim() && form.username.trim() && form.role;

  async function handleSubmit() {
    if (!canSubmit || !userId || Number.isNaN(userId)) return;
    setSubmitting(true);
    setError(null);
    try {
      const body: {
        nama_lengkap: string;
        username: string;
        role: string;
        password?: string;
        foto_profil?: string;
      } = {
        nama_lengkap: form.nama.trim(),
        username: form.username.trim(),
        role: LABEL_TO_ROLE[form.role],
      };
      if (form.password.trim()) {
        body.password = form.password;
      }
      if (photoData) {
        body.foto_profil = photoData;
      }
      await api.updateUser(userId, body);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan perubahan");
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!userId || Number.isNaN(userId)) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-sm" style={{ color: "#ef4444" }}>ID user tidak valid atau tidak ditemukan.</p>
        <Link
          href="/dashboard/manager/user-management"
          className="inline-block text-sm font-semibold hover:opacity-80 transition-opacity"
          style={{ color: "#D0BCFF" }}
        >
          ← Kembali ke Manajemen User
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "#64748b" }}>
        <Link href="/dashboard/manager/user-management" className="hover:text-white transition-colors">
          Manajemen User
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium" style={{ color: "#D0BCFF" }}>Edit User</span>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Edit User</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/manager/user-management"
            className="px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "#94a3b8" }}
          >
            Batal
          </Link>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSubmit || loading || submitting}
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
        <div className="text-center py-12 text-sm" style={{ color: "#64748b" }}>Memuat data user...</div>
      ) : (
        <div className="grid grid-cols-[1fr_440px] gap-5 items-start">
          <div
            className="rounded-xl p-6 border space-y-5"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}
          >
            <h3 className="font-bold text-base" style={{ color: "#D0BCFF" }}>Informasi Akun</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>ID User</label>
                <input
                  type="text"
                  value={formatUserId(userId)}
                  readOnly
                  className="w-full h-10 px-4 rounded-lg text-sm border"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#64748b", cursor: "not-allowed" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg text-sm outline-none border transition-colors"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full h-10 px-4 rounded-lg text-sm outline-none border transition-colors"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Role / Access Level</label>
                <div className="relative" ref={roleRef}>
                  <button
                    type="button"
                    onClick={() => setRoleOpen((p) => !p)}
                    className="w-full h-10 px-4 rounded-lg text-sm border flex items-center justify-between outline-none"
                    style={{
                      backgroundColor: "#080F17",
                      borderColor: roleOpen ? "rgba(208,188,255,0.4)" : "#494454",
                      color: "#fff",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: roleColor }} />
                      <span>{form.role}</span>
                    </div>
                    <ChevronDown size={14} className="shrink-0 transition-transform" style={{ transform: roleOpen ? "rotate(180deg)" : "rotate(0deg)", color: "#64748b" }} />
                  </button>
                  {roleOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border overflow-hidden z-50 shadow-xl"
                      style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}>
                      {roleOptions.map((r) => (
                        <button key={r} type="button"
                          onClick={() => { setForm({ ...form, role: r }); setRoleOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                          style={{ color: form.role === r ? "#fff" : "#94a3b8" }}>
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
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#94a3b8" }}>Reset Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full h-10 pl-4 pr-10 rounded-lg text-sm outline-none border"
                  style={{ backgroundColor: "#080F17", borderColor: "#494454", color: "#fff" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-white"
                  style={{ color: "#64748b" }}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: "#64748b" }}>
                Kosongkan jika tidak ingin mengubah password.
              </p>
            </div>
          </div>

          <div
            className="rounded-xl p-6 border space-y-5"
            style={{ backgroundColor: "#151C25", borderColor: "#494454" }}
          >
            <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "#D0BCFF" }}>Foto Profil</h3>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <div
              className="relative rounded-xl overflow-hidden cursor-pointer mx-auto"
              style={{ width: 160, height: 160 }}
              onMouseEnter={() => setHoverThumb(true)}
              onMouseLeave={() => setHoverThumb(false)}
              onClick={() => fileRef.current?.click()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayPhoto} alt={form.nama} className="w-full h-full object-cover" />

              {hoverThumb && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                  style={{ backgroundColor: "rgba(0,0,0,0.55)" }}>
                  <Pencil size={22} className="text-white" />
                  <span className="text-white text-xs font-semibold">Ganti Foto</span>
                </div>
              )}
            </div>
            <p className="text-xs text-center" style={{ color: "#64748b" }}>
              Rekomendasi ukuran: 1:1 (Min. 400×400px)
            </p>

            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: "#D0BCFF" }}>Pratinjau Profil</p>
              <div
                className="rounded-xl border flex flex-col items-center gap-3 p-5"
                style={{ borderColor: "#494454", backgroundColor: "#080F17" }}
              >
                <div
                  className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center text-2xl font-bold shrink-0"
                  style={{ backgroundColor: roleColor + "25", color: roleColor, border: `2px solid ${roleColor}40` }}
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  ) : existingPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={existingPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">{form.nama || "Nama Lengkap"}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: roleColor }}>{form.role}</p>
                  <p className="text-xs mt-1" style={{ color: "#64748b" }}>{form.username || "username"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => !submitting && setShowConfirm(false)}>
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Apakah Anda Yakin Menyimpan Perubahan?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Data akun akan diperbarui sesuai dengan informasi yang telah diisi.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button onClick={() => setShowConfirm(false)} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Tidak
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
                {submitting ? "Menyimpan..." : "Ya"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">User Berhasil Diperbarui!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Data akun <span className="text-white font-semibold">{form.nama}</span> telah berhasil disimpan.
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

export default function EditUserPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm" style={{ color: "#64748b" }}>Memuat...</div>}>
      <EditUserContent />
    </Suspense>
  );
}
