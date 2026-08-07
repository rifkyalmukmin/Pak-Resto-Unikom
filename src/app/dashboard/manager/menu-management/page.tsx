"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, AlertCircle, Check, Eye, X } from "lucide-react";
import { api, formatRp } from "@/lib/api";
import type { ApiMenu } from "@/types/api";

const PLACEHOLDER_IMAGE = "/images/menu/nasi-goreng.png";
const BG = "#151C25";
const PAGE = "#0d1117";
const BORD = "rgba(255,255,255,0.07)";

function categoryStyle(warna: string | null | undefined) {
  const color = warna ?? "#94a3b8";
  return { bg: `${color}26`, color };
}

function isAktif(item: ApiMenu) {
  return item.status === "AKTIF";
}

function getBahanNames(item: ApiMenu): string[] {
  return (item.menu_bahan ?? [])
    .map((mb) => mb.bahan_baku?.nama_bahan)
    .filter((n): n is string => Boolean(n));
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: on ? "#10B981" : "#374151" }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

export default function MenuManagementPage() {
  const [items, setItems] = useState<ApiMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiMenu | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detailTarget, setDetailTarget] = useState<ApiMenu | null>(null);
  const [toggleTarget, setToggleTarget] = useState<ApiMenu | null>(null);
  const [showToggleSuccess, setShowToggleSuccess] = useState(false);
  const [newToggleStatus, setNewToggleStatus] = useState<"AKTIF" | "NONAKTIF" | null>(null);
  const [toggledItemName, setToggledItemName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMenuAdmin();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const totalAktif = items.filter((i) => isAktif(i)).length;
  const totalHabis = items.length - totalAktif;
  const uniqueKategori = new Set(items.map((i) => i.id_kategori)).size;

  async function confirmHapus() {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await api.deleteMenu(deleteTarget.id_menu);
      setDeleteTarget(null);
      setShowSuccess(true);
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus menu");
      setDeleteTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmToggle() {
    if (!toggleTarget) return;
    const newStatus = isAktif(toggleTarget) ? "NONAKTIF" : "AKTIF";
    setSubmitting(true);
    try {
      await api.updateMenu(toggleTarget.id_menu, { status: newStatus });
      setToggledItemName(toggleTarget.nama_menu);
      setNewToggleStatus(newStatus);
      setToggleTarget(null);
      setShowToggleSuccess(true);
      await loadMenu();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengubah status");
      setToggleTarget(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: PAGE }}>
      <div className="flex-1 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Menu Management</h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Kelola penawaran menu, harga, dan ketersediaan restoran.
            </p>
          </div>
          <Link
            href="/dashboard/manager/menu-management/tambah"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}
          >
            <Plus size={15} />
            Tambah Menu
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "TOTAL MENU", value: loading ? "—" : String(items.length), color: "#fff" },
            { label: "AKTIF", value: loading ? "—" : String(totalAktif), color: "#4EDEA3" },
            { label: "STOK HABIS", value: loading ? "—" : String(totalHabis), color: "#FFB4AB" },
            { label: "KATEGORI", value: loading ? "—" : String(uniqueKategori), color: "#ADC6FF" },
          ].map((s, i) => (
            <div key={i} className="rounded-xl px-5 py-4 border" style={{ backgroundColor: BG, borderColor: BORD }}>
              <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#CBC3D7" }}>{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm border" style={{ backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        <div className="rounded-xl border overflow-x-auto" style={{ backgroundColor: BG, borderColor: BORD }}>
          {loading ? (
            <div className="px-5 py-12 text-center text-sm" style={{ color: "#64748b" }}>Memuat menu...</div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["THUMBNAIL", "NAMA MENU", "BAHAN BAKU", "KATEGORI", "HARGA", "STATUS", "AKSI"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-8 text-center text-sm" style={{ color: "#64748b" }}>
                        Belum ada menu.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => {
                      const aktif = isAktif(item);
                      const cat = categoryStyle(item.kategori?.warna);
                      const bahanBaku = getBahanNames(item);
                      const image = item.gambar || PLACEHOLDER_IMAGE;
                      const kategoriNama = item.kategori?.nama_kategori ?? "—";

                      return (
                        <tr
                          key={item.id_menu}
                          className="hover:bg-white/[0.02] transition-colors"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                        >
                          <td className="px-5 py-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt={item.nama_menu}
                              className="w-20 h-20 rounded-xl object-cover shrink-0"
                              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-white font-semibold leading-tight">{item.nama_menu}</p>
                            <p className="text-xs mt-0.5 max-w-[240px]" style={{ color: "#64748b" }}>
                              {item.deskripsi ?? ""}
                            </p>
                          </td>
                          <td className="px-5 py-4 max-w-[200px]">
                            <div className="flex flex-wrap gap-1">
                              {bahanBaku.slice(0, 3).map((b) => (
                                <span
                                  key={b}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                  style={{ backgroundColor: "rgba(208,188,255,0.12)", color: "#CBC3D7" }}
                                >
                                  {b}
                                </span>
                              ))}
                              {bahanBaku.length > 3 && (
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                  style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#64748b" }}
                                >
                                  +{bahanBaku.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ backgroundColor: cat.bg, color: cat.color }}
                            >
                              {kategoriNama}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-white font-bold whitespace-nowrap">{formatRp(item.harga)}</p>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Toggle on={aktif} onToggle={() => setToggleTarget(item)} />
                              <span className="text-xs font-semibold" style={{ color: aktif ? "#10B981" : "#64748b" }}>
                                {aktif ? "Tersedia" : "Habis"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setDetailTarget(item)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                                style={{ color: "#94a3b8" }}
                              >
                                <Eye size={14} />
                              </button>
                              <Link
                                href={`/dashboard/manager/menu-management/edit?id=${item.id_menu}`}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                                style={{ color: "#94a3b8" }}
                              >
                                <Pencil size={14} />
                              </Link>
                              <button
                                onClick={() => setDeleteTarget(item)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
                                style={{ color: "#64748b" }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              <div
                className="px-5 py-3.5 flex items-center justify-between border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "#64748b" }}
              >
                <span className="text-xs">Menampilkan {items.length} menu</span>
              </div>
            </>
          )}
        </div>
      </div>

      {detailTarget && (() => {
        const aktif = isAktif(detailTarget);
        const cat = categoryStyle(detailTarget.kategori?.warna);
        const bahanBaku = getBahanNames(detailTarget);
        const image = detailTarget.gambar || PLACEHOLDER_IMAGE;
        const kategoriNama = detailTarget.kategori?.nama_kategori ?? "—";

        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setDetailTarget(null)}
          >
            <div
              className="w-full max-w-[420px] mx-4 rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.08)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full" style={{ height: 200 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={detailTarget.nama_menu} className="w-full h-full object-cover" />
                <button
                  onClick={() => setDetailTarget(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}
                >
                  <X size={15} />
                </button>
                <span
                  className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide"
                  style={{ backgroundColor: cat.bg, color: cat.color, backdropFilter: "blur(4px)" }}
                >
                  {kategoriNama}
                </span>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-white font-bold text-lg leading-tight">{detailTarget.nama_menu}</p>
                  <p className="text-sm mt-1" style={{ color: "#64748b" }}>{detailTarget.deskripsi ?? ""}</p>
                </div>
                <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "#CBC3D7" }}>HARGA</p>
                    <p className="font-bold" style={{ color: "#D0BCFF" }}>{formatRp(detailTarget.harga)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "#CBC3D7" }}>STATUS</p>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        aktif
                          ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" }
                          : { backgroundColor: "rgba(100,116,139,0.12)", color: "#94a3b8" }
                      }
                    >
                      {aktif ? "Tersedia" : "Habis"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#CBC3D7" }}>BAHAN BAKU</p>
                  <div className="flex flex-wrap gap-1.5">
                    {bahanBaku.map((b) => (
                      <span
                        key={b}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: "rgba(208,188,255,0.12)",
                          color: "#D0BCFF",
                          border: "1px solid rgba(208,188,255,0.2)",
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => !submitting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#ef4444" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Hapus Menu Ini?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Menu <span className="text-white font-semibold">{deleteTarget.nama_menu}</span> akan dihapus secara permanen dari daftar.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                Tidak
              </button>
              <button
                onClick={confirmHapus}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toggleTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => !submitting && setToggleTarget(null)}
        >
          <div
            className="w-full max-w-[380px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Ubah Status Menu?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Status <span className="text-white font-semibold">{toggleTarget.nama_menu}</span> akan diubah menjadi{" "}
                <span className="font-semibold" style={{ color: "#D0BCFF" }}>
                  {isAktif(toggleTarget) ? "Stok Habis" : "Tersedia"}
                </span>.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button
                onClick={() => setToggleTarget(null)}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ borderColor: "rgba(255,255,255,0.12)", color: "#94a3b8", backgroundColor: "rgba(255,255,255,0.05)" }}
              >
                Batal
              </button>
              <button
                onClick={confirmToggle}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#D0BCFF", color: "#000" }}
              >
                {submitting ? "Menyimpan..." : "Ya, Ubah"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showToggleSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Status Berhasil Diubah!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {toggledItemName ? (
                  <>
                    Menu <span className="text-white font-semibold">{toggledItemName}</span> kini berstatus{" "}
                    <span className="font-semibold" style={{ color: "#D0BCFF" }}>
                      {newToggleStatus === "AKTIF" ? "Tersedia" : "Stok Habis"}
                    </span>.
                  </>
                ) : (
                  "Status menu telah berhasil diperbarui."
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setShowToggleSuccess(false);
                setToggledItemName(null);
                setNewToggleStatus(null);
              }}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="w-full max-w-[360px] mx-4 rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Menu Berhasil Dihapus!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Menu telah dihapus dari daftar dan tidak akan muncul di portal.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
