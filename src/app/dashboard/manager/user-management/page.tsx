"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, MoreVertical, ListFilter, ChevronDown, Trash2, AlertCircle, Check } from "lucide-react";
import { api } from "@/lib/api";
import { ROLE_LABEL } from "@/lib/user-helpers";
import type { ApiUser } from "@/types/api";
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

function roleLabel(role: string) {
  return ROLE_LABEL[role as Role] ?? role;
}

function UserCard({
  user,
  onDelete,
}: {
  user: ApiUser;
  onDelete: (u: ApiUser) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = roleLabel(user.role);
  const color = ROLE_COLORS[label] ?? "#94a3b8";

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4 relative"
      style={{ backgroundColor: "#161d2e", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div ref={menuRef} className="absolute top-4 right-4">
        <button
          onClick={() => setMenuOpen((p) => !p)}
          className="p-1 rounded transition-colors hover:bg-white/10"
          style={{ color: "#64748b" }}
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-40 rounded-xl border overflow-hidden z-50 shadow-xl"
            style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <button
              onClick={() => { setMenuOpen(false); onDelete(user); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
              style={{ color: "#ef4444" }}
            >
              <Trash2 size={13} />
              Hapus Akun
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pr-6">
        <div
          className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
          style={{ border: `2px solid ${color}40` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/manager/user-default.webp" alt={user.nama_lengkap} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">{user.nama_lengkap}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color }}>
            {label}
          </p>
        </div>
      </div>

      <div
        className="rounded-lg px-3.5 py-2.5 space-y-2.5"
        style={{ backgroundColor: "rgba(8,15,23,0.5)" }}
      >
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#64748b" }}>ID User</span>
          <span className="text-white font-mono font-semibold">{formatUserId(user.id_user)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#64748b" }}>Username</span>
          <span className="text-white">{user.username}</span>
        </div>
      </div>

      <Link
        href={`/dashboard/manager/user-management/edit?id=${user.id_user}`}
        className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5 text-center block"
        style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8" }}
      >
        Edit User
      </Link>
    </div>
  );
}

type FilterRole = "Semua" | "Pelayan" | "Koki" | "Kasir" | "Manager";

export default function UserManagementPage() {
  const [users, setUsers]               = useState<ApiUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiUser | null>(null);
  const [deleteError, setDeleteError]     = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [filterRole, setFilterRole]     = useState<FilterRole>("Semua");
  const [filterOpen, setFilterOpen]     = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter(
    (u) => filterRole === "Semua" || roleLabel(u.role) === filterRole
  );

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteUser(deleteTarget.id_user);
      setDeleteTarget(null);
      setShowDeleteSuccess(true);
      await loadUsers();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Gagal menghapus user");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen User</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
              style={{ backgroundColor: "rgba(208,188,255,0.10)", color: "#D0BCFF" }}>
              {loading ? "—" : `${users.length} Karyawan`}
            </span>
            <span style={{ color: "#64748b" }}>•</span>
            <span className="text-sm" style={{ color: "#94a3b8" }}>Kelola hak akses dan identitas tim operasional.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setFilterOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors hover:bg-white/5"
              style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "#151C25" }}
            >
              <ListFilter size={14} />
              <span>{filterRole === "Semua" ? "Filter Role" : filterRole}</span>
              <ChevronDown size={12} className={`transition-transform ${filterOpen ? "rotate-180" : ""}`} />
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border overflow-hidden z-50 shadow-xl"
                style={{ backgroundColor: "#0d1117", borderColor: "rgba(255,255,255,0.1)" }}>
                {(["Semua", ...roleOptions] as FilterRole[]).map((val) => (
                  <button key={val}
                    onClick={() => { setFilterRole(val); setFilterOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/5"
                    style={{ color: filterRole === val ? "#fff" : "#94a3b8" }}>
                    <span className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: val === "Semua" ? "rgba(255,255,255,0.2)" : ROLE_COLORS[val] }} />
                    <span className="flex-1 text-left font-medium">{val}</span>
                    {filterRole === val && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D0BCFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
                {filterRole !== "Semua" && (
                  <div className="px-4 py-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <button onClick={() => { setFilterRole("Semua"); setFilterOpen(false); }}
                      className="text-xs font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: "#D0BCFF" }}>
                      Reset filter
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <Link
            href="/dashboard/manager/user-management/tambah"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            <Plus size={15} />
            Tambah User
          </Link>
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
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((u) => (
            <UserCard key={u.id_user} user={u} onDelete={(target) => { setDeleteError(null); setDeleteTarget(target); }} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-4 py-12 text-center text-sm" style={{ color: "#64748b" }}>
              Tidak ada user dengan role ini.
            </div>
          )}
        </div>
      )}

      <div className="text-xs pt-2" style={{ color: "#64748b" }}>
        Menampilkan <span className="text-white font-semibold">{filtered.length}</span> karyawan
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,68,68,0.12)" }}>
              <AlertCircle size={28} style={{ color: "#ef4444" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Hapus Akun Pengguna?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Akun <span className="text-white font-semibold">{deleteTarget.nama_lengkap}</span> akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
              {deleteError && (
                <p className="text-sm font-medium" style={{ color: "#ef4444" }}>{deleteError}</p>
              )}
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Tidak
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "#494454" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Akun Berhasil Dihapus!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Akun pengguna telah dihapus dari sistem.
              </p>
            </div>
            <button onClick={() => setShowDeleteSuccess(false)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
