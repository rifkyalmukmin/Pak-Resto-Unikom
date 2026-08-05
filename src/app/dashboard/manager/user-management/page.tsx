"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreVertical, ChevronLeft, ChevronRight, ListFilter, ChevronDown, Trash2, AlertCircle, Check } from "lucide-react";

interface UserData {
  id: string;
  nama: string;
  role: string;
  username: string;
  password: string;
  initials: string;
}

const users: UserData[] = [
  { id: "USR-001", nama: "Dewi Sartika",  role: "Koki",    username: "dewi.sartika",  password: "dewipass123",  initials: "DS" },
  { id: "USR-002", nama: "Budi Handoko",  role: "Pelayan", username: "budi.handoko",  password: "budipass456",  initials: "BH" },
  { id: "USR-003", nama: "Rizky Pratama", role: "Pelayan", username: "rizky.pratama", password: "rizkypass789", initials: "RP" },
  { id: "USR-004", nama: "Lina Wijaya",   role: "Kasir",   username: "lina.wijaya",   password: "linapass321",  initials: "LW" },
  { id: "USR-005", nama: "Arif Rahman",   role: "Koki",    username: "arif.rahman",   password: "arifpass654",  initials: "AR" },
  { id: "USR-006", nama: "Siti Aminah",   role: "Pelayan", username: "siti.aminah",   password: "sitipass987",  initials: "SA" },
];

const roleOptions = ["Pelayan", "Koki", "Kasir", "Manager"];

const ROLE_COLORS: Record<string, string> = {
  Pelayan: "#10B981",
  Koki:    "#F59E0B",
  Kasir:   "#00B954",
  Manager: "#D0BCFF",
};

function UserCard({
  user,
  onDelete,
}: {
  user: UserData;
  onDelete: (u: UserData) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const color = ROLE_COLORS[user.role] ?? "#94a3b8";

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-4 relative"
      style={{ backgroundColor: "#161d2e", borderColor: "rgba(255,255,255,0.08)" }}
    >
      {/* 3-dot dropdown */}
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

      {/* Avatar + name */}
      <div className="flex items-center gap-3 pr-6">
        <div
          className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
          style={{ border: `2px solid ${color}40` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/manager/user-default.webp" alt={user.nama} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">{user.nama}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color }}>
            {user.role}
          </p>
        </div>
      </div>

      {/* Info rows */}
      <div
        className="rounded-lg px-3.5 py-2.5 space-y-2.5"
        style={{ backgroundColor: "rgba(8,15,23,0.5)" }}
      >
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#64748b" }}>ID User</span>
          <span className="text-white font-mono font-semibold">{user.id}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#64748b" }}>Username</span>
          <span className="text-white">{user.username}</span>
        </div>
      </div>

      {/* Edit button */}
      <Link
        href="/dashboard/manager/user-management/edit"
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
  const [deleteTarget, setDeleteTarget]   = useState<UserData | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [filterRole, setFilterRole]       = useState<FilterRole>("Semua");
  const [filterOpen, setFilterOpen]       = useState(false);

  const filtered = users.filter((u) => filterRole === "Semua" || u.role === filterRole);

  function confirmDelete() {
    setDeleteTarget(null);
    setShowDeleteSuccess(true);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen User</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
              style={{ backgroundColor: "rgba(208,188,255,0.10)", color: "#D0BCFF" }}>
              32 Karyawan
            </span>
            <span style={{ color: "#64748b" }}>•</span>
            <span className="text-sm" style={{ color: "#94a3b8" }}>Kelola hak akses dan identitas tim operasional.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Filter Role Dropdown */}
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

      {/* User Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filtered.map((u) => (
          <UserCard key={u.id} user={u} onDelete={setDeleteTarget} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 py-12 text-center text-sm" style={{ color: "#64748b" }}>
            Tidak ada user dengan role ini.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs pt-2" style={{ color: "#64748b" }}>
        <span>Menampilkan <span className="text-white font-semibold">{filtered.length}</span> dari <span className="text-white font-semibold">{users.length}</span> Karyawan</span>
        <div className="flex items-center gap-2">
          <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n}
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold transition-colors"
              style={n === 1 ? { backgroundColor: "#D0BCFF", color: "#000" } : { color: "#64748b" }}>
              {n}
            </button>
          ))}
          <button className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/5 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setDeleteTarget(null)}>
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
                Akun <span className="text-white font-semibold">{deleteTarget.nama}</span> akan dihapus secara permanen dan tidak dapat dikembalikan.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}>
                Tidak
              </button>
              <button onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Berhasil Hapus */}
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
