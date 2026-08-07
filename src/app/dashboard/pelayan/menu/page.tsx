"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { XCircle, Check, X, Info } from "lucide-react";
import type { ApiMenu } from "@/types/api";
import { api, formatRp } from "@/lib/api";

type FlatMenu = ApiMenu & { kategoriNama: string };

const PLACEHOLDER = "/images/menu/nasi-goreng.png";

export default function KatalogMenuPage() {
  const [menuList, setMenuList] = useState<FlatMenu[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [viewItem, setViewItem] = useState<FlatMenu | null>(null);

  const loadMenu = useCallback(async () => {
    try {
      const data = await api.getMenu();
      const flat: FlatMenu[] = data.flatMap((c) =>
        (c.menu ?? []).map((m) => ({
          ...m,
          kategoriNama: c.nama_kategori,
        }))
      );
      setMenuList(flat);
      setCategories(["Semua", ...data.map((c) => c.nama_kategori)]);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMenu();
  }, [loadMenu]);

  const filtered = useMemo(
    () =>
      menuList.filter(
        (m) => activeCategory === "Semua" || m.kategoriNama === activeCategory
      ),
    [menuList, activeCategory]
  );

  const viewLive = viewItem
    ? (menuList.find((m) => m.id_menu === viewItem.id_menu) ?? null)
    : null;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Katalog Menu</h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-lg leading-relaxed">
              Lihat ketersediaan hidangan. Ubah status dilakukan oleh manajer di Menu Management.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-6">
            <span
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "#10B98118",
                color: "#4EDEA3",
                border: "1px solid #10B98130",
              }}
            >
              <Check size={11} strokeWidth={3} />
              {menuList.length} Menu aktif
            </span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
            {error}
          </p>
        )}

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors"
              style={
                activeCategory === cat
                  ? { backgroundColor: "#10B981", color: "#000" }
                  : {
                      backgroundColor: "#1E293B",
                      color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Memuat menu...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-sm py-10 text-center">Tidak ada menu di kategori ini</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => {
              const tersedia = item.status === "AKTIF";
              return (
                <div
                  key={item.id_menu}
                  className="rounded-xl overflow-hidden flex flex-col border"
                  style={{ backgroundColor: "#1E293B", borderColor: "#3C4A42" }}
                >
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.gambar || PLACEHOLDER}
                      alt={item.nama_menu}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-2 left-2 text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: "#0B1326", color: "#4EDEA3" }}
                    >
                      {formatRp(item.harga)}
                    </span>
                    <button
                      onClick={() => setViewItem(item)}
                      className="absolute top-2 right-2 z-10 w-7 h-7 rounded-xl flex items-center justify-center hover:opacity-80"
                      style={{ backgroundColor: "#0B132680", backdropFilter: "blur(4px)" }}
                    >
                      <Info size={12} style={{ color: "#94a3b8" }} />
                    </button>
                    {!tersedia && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span
                          className="text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400/60"
                          style={{ backgroundColor: "#ef444480" }}
                        >
                          NONAKTIF
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div>
                      <p className="text-white text-sm font-bold leading-tight line-clamp-1">
                        {item.nama_menu}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5 line-clamp-1">
                        {item.deskripsi || item.kategoriNama}
                      </p>
                    </div>
                    <div
                      className="flex items-center justify-between mt-auto py-2 border-t"
                      style={{ borderColor: "#3C4A42" }}
                    >
                      <div className="flex items-center gap-1.5">
                        {tersedia ? (
                          <Check size={13} strokeWidth={3} style={{ color: "#4EDEA3" }} />
                        ) : (
                          <XCircle size={13} style={{ color: "#FFB4AB" }} strokeWidth={2} />
                        )}
                        <span
                          className="text-xs font-semibold"
                          style={{ color: tersedia ? "#4EDEA3" : "#FFB4AB" }}
                        >
                          {tersedia ? "Tersedia" : "Nonaktif"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.kategoriNama}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewLive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewItem(null)}
          />
          <div
            className="relative w-[480px] rounded-2xl overflow-hidden border shadow-2xl z-10"
            style={{ borderColor: "#3C4A42" }}
          >
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewLive.gambar || PLACEHOLDER}
                alt={viewLive.nama_menu}
                className="w-full h-full object-cover"
              />
              {viewLive.status !== "AKTIF" && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span
                    className="text-white text-xs font-bold px-3 py-1 rounded-full border border-red-400/60"
                    style={{ backgroundColor: "#ef444480" }}
                  >
                    NONAKTIF
                  </span>
                </div>
              )}
              <button
                onClick={() => setViewItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#0B132690", backdropFilter: "blur(4px)" }}
              >
                <X size={15} color="#fff" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4" style={{ backgroundColor: "#1E293B" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-white text-lg font-bold">{viewLive.nama_menu}</h2>
                  <p className="text-slate-400 text-sm mt-0.5">
                    {viewLive.deskripsi || "Tidak ada deskripsi"}
                  </p>
                </div>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "#0B1326", color: "#4EDEA3" }}
                >
                  {formatRp(viewLive.harga)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-md"
                  style={{
                    backgroundColor: "#10B98115",
                    color: "#4EDEA3",
                    border: "1px solid #10B98130",
                  }}
                >
                  {viewLive.kategoriNama}
                </span>
                <span
                  className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md"
                  style={
                    viewLive.status === "AKTIF"
                      ? {
                          backgroundColor: "#10B98115",
                          color: "#4EDEA3",
                          border: "1px solid #10B98130",
                        }
                      : {
                          backgroundColor: "#ef444415",
                          color: "#FFB4AB",
                          border: "1px solid #ef444430",
                        }
                  }
                >
                  {viewLive.status === "AKTIF" ? (
                    <Check size={10} strokeWidth={3} />
                  ) : (
                    <XCircle size={10} strokeWidth={2} />
                  )}
                  {viewLive.status === "AKTIF" ? "Tersedia" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
