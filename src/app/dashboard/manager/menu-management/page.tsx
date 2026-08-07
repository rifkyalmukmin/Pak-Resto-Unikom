"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, AlertCircle, Check, Eye, X } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  harga: string;
  available: boolean;
  image: string;
  bahanBaku: string[];
}

const initialItems: MenuItem[] = [
  { id: "M001", name: "Nasi Goreng Kambing Special", description: "Daging kambing premium dengan bumbu rempah UNIKOM.",   category: "Main Course", harga: "Rp 45.000", available: true,  image: "/images/menu/nasi-goreng.png",      bahanBaku: ["Nasi", "Daging Kambing", "Bawang Merah", "Bawang Putih", "Kecap Manis", "Minyak Goreng"] },
  { id: "M002", name: "Lava Cake Gold Dust",          description: "Cokelat Belgia 70% dengan taburan emas 24k edible.", category: "Dessert",     harga: "Rp 75.000", available: false, image: "/images/menu/chocolate-lava.png",   bahanBaku: ["Cokelat", "Tepung Terigu", "Telur", "Mentega", "Susu", "Gula"] },
  { id: "M003", name: "Signature UNIKOM Coffee",      description: "Perpaduan biji kopi pilihan dengan sirup rahasia.",  category: "Beverage",    harga: "Rp 32.000", available: true,  image: "/images/menu/iced-cappucino.png",   bahanBaku: ["Susu", "Gula", "Mentega"] },
  { id: "M004", name: "Ayam Bakar Madu UNIKOM",       description: "Ayam pejantan bakar dengan olesan madu hutan asli.", category: "Main Course", harga: "Rp 52.000", available: true,  image: "/images/menu/ayam-goreng.png",      bahanBaku: ["Ayam", "Madu", "Bawang Putih", "Jahe", "Kecap Manis", "Garam"] },
];

const categoryColor: Record<string, { bg: string; color: string }> = {
  "Main Course": { bg: "rgba(16,185,129,0.15)",  color: "#10B981" },
  "Beverage":    { bg: "rgba(139,92,246,0.15)",  color: "#8b5cf6" },
  "Dessert":     { bg: "rgba(245,158,11,0.15)",  color: "#f59e0b" },
  "Snack":       { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
  "Appetizer":   { bg: "rgba(59,130,246,0.15)",  color: "#60a5fa" },
};

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="relative inline-flex w-10 h-5 rounded-full transition-colors shrink-0"
      style={{ backgroundColor: on ? "#10B981" : "#374151" }}>
      <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ transform: on ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );
}

const BG    = "#151C25";
const PAGE  = "#0d1117";
const BORD  = "rgba(255,255,255,0.07)";

export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [detailTarget, setDetailTarget] = useState<MenuItem | null>(null);
  const [toggleTarget, setToggleTarget] = useState<MenuItem | null>(null);
  const [showToggleSuccess, setShowToggleSuccess] = useState(false);
  const [toggledItem, setToggledItem] = useState<MenuItem | null>(null);

  function toggleAvailability(id: string) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, available: !it.available } : it));
  }

  function confirmHapus() {
    if (deleteTarget) setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
    setDeleteTarget(null);
    setShowSuccess(true);
  }

  const totalAktif   = items.filter((i) => i.available).length;
  const totalHabis   = items.filter((i) => !i.available).length;

  return (
    <div className="flex flex-col min-h-full" style={{ backgroundColor: PAGE }}>
      <div className="flex-1 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Menu Management</h1>
            <p className="text-sm mt-1" style={{ color: "#64748b" }}>
              Kelola penawaran menu, harga, dan ketersediaan restoran.
            </p>
          </div>
          <Link href="/dashboard/manager/menu-management/tambah"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
            <Plus size={15} />
            Tambah Menu
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "TOTAL MENU",  value: "128", color: "#fff" },
            { label: "AKTIF",       value: "115",                                                    color: "#4EDEA3" },
            { label: "STOK HABIS",  value: "13",                                                     color: "#FFB4AB" },
            { label: "KATEGORI",    value: "8",                                                      color: "#ADC6FF" },
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
                {["THUMBNAIL", "NAMA MENU", "BAHAN BAKU", "KATEGORI", "HARGA", "STATUS", "AKSI"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold tracking-widest" style={{ color: "#CBC3D7" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cat = categoryColor[item.category] ?? { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" };
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    {/* Thumbnail */}
                    <td className="px-5 py-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
                    </td>
                    {/* Nama */}
                    <td className="px-5 py-4">
                      <p className="text-white font-semibold leading-tight">{item.name}</p>
                      <p className="text-xs mt-0.5 max-w-[240px]" style={{ color: "#64748b" }}>{item.description}</p>
                    </td>
                    {/* Bahan Baku */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {item.bahanBaku.slice(0, 3).map((b) => (
                          <span key={b} className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{ backgroundColor: "rgba(208,188,255,0.12)", color: "#CBC3D7" }}>
                            {b}
                          </span>
                        ))}
                        {item.bahanBaku.length > 3 && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#64748b" }}>
                            +{item.bahanBaku.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Kategori */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={{ backgroundColor: cat.bg, color: cat.color }}>
                        {item.category}
                      </span>
                    </td>
                    {/* Harga */}
                    <td className="px-5 py-4">
                      <p className="text-white font-bold whitespace-nowrap">{item.harga}</p>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Toggle on={item.available} onToggle={() => setToggleTarget(item)} />
                        <span className="text-xs font-semibold"
                          style={{ color: item.available ? "#10B981" : "#64748b" }}>
                          {item.available ? "Tersedia" : "Habis"}
                        </span>
                      </div>
                    </td>
                    {/* Aksi */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDetailTarget(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ color: "#94a3b8" }}>
                          <Eye size={14} />
                        </button>
                        <Link href="/dashboard/manager/menu-management/edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ color: "#94a3b8" }}>
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => setDeleteTarget(item)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-500/10"
                          style={{ color: "#64748b" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-5 py-3.5 flex items-center justify-between border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)", color: "#64748b" }}>
            <span className="text-xs">Menampilkan 1-10 dari 128 menu</span>
            <div className="flex items-center gap-1.5">
              <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-slate-500">
                <ChevronLeft size={14} />
              </button>
              {[1, 2, 3].map((n) => (
                <button key={n}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors"
                  style={n === 1 ? { backgroundColor: "#10B981", color: "#000" } : { color: "#64748b" }}>
                  {n}
                </button>
              ))}
              <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors text-slate-500">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {detailTarget && (() => {
        const cat = categoryColor[detailTarget.category] ?? { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setDetailTarget(null)}>
            <div className="w-[420px] rounded-2xl border overflow-hidden"
              style={{ backgroundColor: "#151C25", borderColor: "rgba(255,255,255,0.08)" }}
              onClick={(e) => e.stopPropagation()}>
              {/* Thumbnail */}
              <div className="relative w-full" style={{ height: 200 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={detailTarget.image} alt={detailTarget.name} className="w-full h-full object-cover" />
                <button onClick={() => setDetailTarget(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "rgba(0,0,0,0.5)", color: "#fff" }}>
                  <X size={15} />
                </button>
                <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide"
                  style={{ backgroundColor: cat.bg, color: cat.color, backdropFilter: "blur(4px)" }}>
                  {detailTarget.category}
                </span>
              </div>
              {/* Info */}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-white font-bold text-lg leading-tight">{detailTarget.name}</p>
                  <p className="text-sm mt-1" style={{ color: "#64748b" }}>{detailTarget.description}</p>
                </div>
                <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "#CBC3D7" }}>HARGA</p>
                    <p className="font-bold" style={{ color: "#D0BCFF" }}>{detailTarget.harga}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest mb-1" style={{ color: "#CBC3D7" }}>STATUS</p>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={detailTarget.available
                        ? { backgroundColor: "rgba(16,185,129,0.12)", color: "#10B981" }
                        : { backgroundColor: "rgba(100,116,139,0.12)", color: "#94a3b8" }}>
                      {detailTarget.available ? "Tersedia" : "Habis"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest mb-2" style={{ color: "#CBC3D7" }}>BAHAN BAKU</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailTarget.bahanBaku.map((b) => (
                      <span key={b} className="px-2.5 py-1 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: "rgba(208,188,255,0.12)", color: "#D0BCFF", border: "1px solid rgba(208,188,255,0.2)" }}>
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

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setDeleteTarget(null)}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#ef4444" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Hapus Menu Ini?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Menu <span className="text-white font-semibold">{deleteTarget.name}</span> akan dihapus secara permanen dari daftar.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full pt-1">
              <button onClick={() => setDeleteTarget(null)}
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

      {/* Modal Konfirmasi Toggle Ketersediaan */}
      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setToggleTarget(null)}>
          <div className="w-[380px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <AlertCircle size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Ubah Status Menu?</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Status <span className="text-white font-semibold">{toggleTarget.name}</span> akan diubah menjadi{" "}
                <span className="font-semibold" style={{ color: "#D0BCFF" }}>
                  {toggleTarget.available ? "Stok Habis" : "Tersedia"}
                </span>.
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
                  toggleAvailability(toggleTarget.id);
                  setToggledItem(toggleTarget);
                  setToggleTarget(null);
                  setShowToggleSuccess(true);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
                Ya, Ubah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Berhasil Ubah Status */}
      {showToggleSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Status Berhasil Diubah!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                {toggledItem ? (
                  <>Menu <span className="text-white font-semibold">{toggledItem.name}</span> kini berstatus <span className="font-semibold" style={{ color: "#D0BCFF" }}>{toggledItem.available ? "Stok Habis" : "Tersedia"}</span>.</>
                ) : "Status menu telah berhasil diperbarui."}
              </p>
            </div>
            <button onClick={() => { setShowToggleSuccess(false); setToggledItem(null); }}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal Berhasil Hapus */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-[360px] rounded-2xl border p-8 flex flex-col items-center text-center space-y-5"
            style={{ backgroundColor: "#1E2530", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <Check size={28} style={{ color: "#D0BCFF" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg leading-snug">Menu Berhasil Dihapus!</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
                Menu telah dihapus dari daftar dan tidak akan muncul di portal.
              </p>
            </div>
            <button onClick={() => setShowSuccess(false)}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#D0BCFF", color: "#000" }}>
              Tutup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
