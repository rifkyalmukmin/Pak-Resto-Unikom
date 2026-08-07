"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle2, Circle, PlusCircle, RefreshCw } from "lucide-react";
import type { ApiPesanan } from "@/types/api";
import { api, orderElapsed } from "@/lib/api";
import { useLiveClock } from "@/hooks/use-live-clock";
import type { StatusPesanan, TipePesanan } from "@prisma/client";

const ACCENT = "#F59E0B";
const ACTIVE_STATUSES: StatusPesanan[] = ["MENUNGGU", "DIPROSES"];

function cardHeaderBg(order: ApiPesanan) {
  const hasNote = order.detail_pesanan.some((d) => d.catatan);
  if (hasNote) return "#EF4444";
  if (order.status_pesanan === "DIPROSES") return "#F59E0B";
  return "#64748B";
}

export default function PesananAktifPage() {
  const [orders, setOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "DINE_IN" | "TAKEAWAY">("all");
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<number | null>(null);
  const now = useLiveClock();

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const data = await api.getOrders();
      setOrders(
        data.filter((o) => ACTIVE_STATUSES.includes(o.status_pesanan))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
    const interval = setInterval(() => void loadOrders(), 15000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => o.tipe_pesanan === filter);

  const dineInCount = orders.filter((o) => o.tipe_pesanan === "DINE_IN").length;
  const takeawayCount = orders.filter((o) => o.tipe_pesanan === "TAKEAWAY").length;

  function toggleItem(orderId: number, detailId: number) {
    const key = `${orderId}-${detailId}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function isItemDone(orderId: number, detailId: number) {
    return !!checkedItems[`${orderId}-${detailId}`];
  }

  async function handleStart(order: ApiPesanan) {
    setUpdating(order.id_pesanan);
    try {
      await api.updateOrderStatus(order.id_pesanan, "DIPROSES");
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memproses pesanan");
    } finally {
      setUpdating(null);
    }
  }

  async function markSiap(orderId: number) {
    setUpdating(orderId);
    try {
      await api.updateOrderStatus(orderId, "SIAP");
      setConfirmId(null);
      setSuccessId(orderId);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menandai selesai");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-2xl font-bold">Antrean Pesanan</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadOrders()}
            className="p-2 rounded-lg text-slate-400 hover:text-white border border-white/10"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          {(
            [
              ["all", "Semua"],
              ["DINE_IN", `Dine-in (${dineInCount})`],
              ["TAKEAWAY", `Takeaway (${takeawayCount})`],
            ] as const
          ).map(([f, label]) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
              style={
                filter === f
                  ? { backgroundColor: ACCENT, color: "#000" }
                  : {
                      backgroundColor: "#1E1E2E",
                      color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      {loading && orders.length === 0 ? (
        <p className="text-slate-500 text-center py-12">Memuat antrean...</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((order) => {
            const headerBg = cardHeaderBg(order);
            const headerText = headerBg === "#F59E0B" ? "#000" : "#fff";
            const doneCount = order.detail_pesanan.filter((d) =>
              isItemDone(order.id_pesanan, d.id_detail)
            ).length;
            const allDone = doneCount === order.detail_pesanan.length;
            const note = order.detail_pesanan.find((d) => d.catatan)?.catatan;

            return (
              <div
                key={order.id_pesanan}
                className="rounded-xl overflow-hidden flex flex-col"
                style={{ backgroundColor: "#1E1E2E", border: "1px solid #45464C" }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ backgroundColor: headerBg }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: headerText }}>
                      #{order.id_pesanan}
                    </span>
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: headerText, opacity: 0.8 }}
                      >
                        {order.tipe_pesanan === "TAKEAWAY"
                          ? "Takeaway"
                          : `Meja ${order.meja?.nomor_meja ?? "-"}`}
                      </p>
                      <p className="text-xs" style={{ color: headerText, opacity: 0.6 }}>
                        {doneCount}/{order.detail_pesanan.length} Item • {order.status_pesanan}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-bold" style={{ color: headerText }}>
                    {orderElapsed(order.waktu_pesanan, now)}
                  </span>
                </div>

                <div className="flex-1 px-4 py-3 space-y-2">
                  {order.detail_pesanan.map((item) => (
                    <div key={item.id_detail} className="flex items-center justify-between gap-3">
                      <span
                        className={`text-sm ${
                          isItemDone(order.id_pesanan, item.id_detail)
                            ? "line-through text-slate-500"
                            : "text-white"
                        }`}
                      >
                        {item.jumlah}x {item.menu.nama_menu}
                      </span>
                      <button
                        onClick={() => toggleItem(order.id_pesanan, item.id_detail)}
                        className="shrink-0"
                        disabled={order.status_pesanan === "MENUNGGU"}
                      >
                        {isItemDone(order.id_pesanan, item.id_detail) ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#10B981" }}
                          >
                            <Check size={12} className="text-black" strokeWidth={3} />
                          </div>
                        ) : (
                          <Circle size={20} className="text-slate-600" />
                        )}
                      </button>
                    </div>
                  ))}

                  {note && (
                    <div className="mt-2 px-2 py-1.5 rounded text-[11px] font-medium text-red-300 bg-red-900/30 border border-red-700/30">
                      CATATAN: {note}
                    </div>
                  )}
                </div>

                <div className="px-4 pb-4">
                  {order.status_pesanan === "MENUNGGU" ? (
                    <button
                      onClick={() => void handleStart(order)}
                      disabled={updating === order.id_pesanan}
                      className="w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider"
                      style={{ backgroundColor: ACCENT, color: "#000" }}
                    >
                      {updating === order.id_pesanan ? "Memproses..." : "Mulai Masak"}
                    </button>
                  ) : (
                    <button
                      onClick={() => allDone && setConfirmId(order.id_pesanan)}
                      disabled={!allDone || updating === order.id_pesanan}
                      className="w-full py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all"
                      style={
                        allDone
                          ? { backgroundColor: ACCENT, color: "#000" }
                          : {
                              backgroundColor: "rgba(49,53,63,0.30)",
                              color: "#6b7280",
                              cursor: "not-allowed",
                            }
                      }
                    >
                      {allDone ? "Tandai Siap" : "Centang semua item"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center min-h-[200px] gap-3 bg-[#1E1E2E]/40">
            <PlusCircle size={48} className="text-slate-700" strokeWidth={1.5} />
            <p className="text-slate-600 text-xs font-bold tracking-widest uppercase text-center">
              Siap Terima
              <br />
              Pesanan
            </p>
          </div>
        </div>
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[420px] rounded-2xl border border-white/10 bg-[#1E2235] px-8 py-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${ACCENT}20` }}
              >
                <CheckCircle2 size={28} style={{ color: ACCENT }} />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">Tandai Siap?</h3>
              <p className="text-slate-400 text-sm">
                Pesanan <span className="text-white font-semibold">#{confirmId}</span> siap
                diantar ke pelanggan.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold"
              >
                Batal
              </button>
              <button
                onClick={() => void markSiap(confirmId)}
                className="flex-1 py-3 rounded-xl font-bold text-black"
                style={{ backgroundColor: ACCENT }}
              >
                Ya, Siap
              </button>
            </div>
          </div>
        </div>
      )}

      {successId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[380px] rounded-2xl border border-white/10 bg-[#1E2235] px-8 py-8 flex flex-col items-center text-center">
            <CheckCircle2 size={32} className="text-[#10B981] mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Pesanan Siap!</h3>
            <p className="text-slate-400 text-sm mb-6">
              Pesanan #{successId} berhasil ditandai siap.
            </p>
            <button
              onClick={() => setSuccessId(null)}
              className="w-full py-3 rounded-xl font-bold text-black bg-[#10B981]"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
