"use client";

import { useCallback, useEffect, useState } from "react";
import { Check } from "lucide-react";
import type { ApiPesanan } from "@/types/api";
import { api, orderElapsed } from "@/lib/api";

type OverlayType = "konfirmasi-ambil" | "konfirmasi-selesai" | "sukses-ambil" | "sukses-selesai" | null;
type ActionKind = "ambil" | "selesai";

const InfoIcon = () => (
  <div
    className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}
  >
    <span className="text-[#10B981] font-bold text-lg leading-none select-none">i</span>
  </div>
);

const SuccessIcon = () => (
  <div
    className="w-11 h-11 rounded-full flex items-center justify-center border-2 mb-5"
    style={{ borderColor: "#10B981", backgroundColor: "#10B98118" }}
  >
    <Check size={22} color="#10B981" strokeWidth={3} />
  </div>
);

export default function WaiterBerandaPage() {
  const [siapOrders, setSiapOrders] = useState<ApiPesanan[]>([]);
  const [diantarOrders, setDiantarOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overlay, setOverlay] = useState<OverlayType>(null);
  const [targetOrder, setTargetOrder] = useState<ApiPesanan | null>(null);
  const [action, setAction] = useState<ActionKind>("ambil");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const [siap, diantar] = await Promise.all([
        api.getOrders({ status: "SIAP", tipe_pesanan: "DINE_IN" }),
        api.getOrders({ status: "DIANTAR", tipe_pesanan: "DINE_IN" }),
      ]);
      setSiapOrders(siap);
      setDiantarOrders(diantar);
      setError("");
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

  function openConfirm(order: ApiPesanan, kind: ActionKind) {
    setTargetOrder(order);
    setAction(kind);
    setOverlay(kind === "ambil" ? "konfirmasi-ambil" : "konfirmasi-selesai");
  }

  async function handleConfirmYes() {
    if (!targetOrder) return;
    setSubmitting(true);
    try {
      const next = action === "ambil" ? "DIANTAR" : "SELESAI";
      await api.updateOrderStatus(targetOrder.id_pesanan, next);
      setOverlay(action === "ambil" ? "sukses-ambil" : "sukses-selesai");
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memperbarui status");
      setOverlay(null);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOverlay(null);
    setTargetOrder(null);
  }

  function renderOrderCard(order: ApiPesanan, kind: ActionKind) {
    return (
      <div
        key={order.id_pesanan}
        className="rounded-xl border border-white/5 p-4 flex flex-col gap-3 bg-[#1E1E2E]"
      >
        <div className="flex items-center justify-between">
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded-md"
            style={{ backgroundColor: "#10B981", color: "#000" }}
          >
            MEJA {order.meja?.nomor_meja ?? "-"}
          </span>
          <span className="text-slate-500 text-xs font-mono">
            {orderElapsed(order.waktu_pesanan)}
          </span>
        </div>

        <div className="space-y-2">
          {order.detail_pesanan.map((item) => (
            <div key={item.id_detail} className="flex justify-between text-sm">
              <span className="text-slate-300">
                {item.jumlah}x {item.menu.nama_menu}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => openConfirm(order, kind)}
          className="w-full py-2.5 rounded-lg text-sm font-bold mt-1"
          style={
            kind === "ambil"
              ? { backgroundColor: "#10B981", color: "#000" }
              : { backgroundColor: "#3B82F6", color: "#fff" }
          }
        >
          {kind === "ambil" ? "Ambil Pesanan" : "Tandai Selesai"}
        </button>
      </div>
    );
  }

  const totalAktif = siapOrders.length + diantarOrders.length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Selamat Datang Kembali</h1>
        <p className="text-slate-400 mt-1.5 text-sm">
          {siapOrders.length} siap diantar · {diantarOrders.length} sedang diantar.
        </p>
      </div>

      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-5 items-start">
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-base">Pesanan Siap Diantar</h2>
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-red-400 text-[11px] font-bold uppercase">Live</span>
              </div>
            </div>

            {loading && siapOrders.length === 0 && diantarOrders.length === 0 ? (
              <p className="text-slate-500">Memuat pesanan...</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {siapOrders.map((order) => renderOrderCard(order, "ambil"))}
                {siapOrders.length === 0 && (
                  <div className="rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center min-h-[140px] bg-[#1E1E2E] col-span-2">
                    <p className="text-slate-500 text-sm">Tidak ada pesanan siap diantar</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-base">Sedang Diantar</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {diantarOrders.map((order) => renderOrderCard(order, "selesai"))}
              {diantarOrders.length === 0 && (
                <div className="rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center min-h-[140px] bg-[#1E1E2E] col-span-2">
                  <p className="text-slate-500 text-sm">Tidak ada pesanan sedang diantar</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="rounded-xl border border-white/5 p-5 bg-[#1E1E2E]">
          <h3 className="text-white font-bold text-base mb-4">Ringkasan</h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Siap diantar</span>
            <span className="text-white font-bold">{siapOrders.length}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Sedang diantar</span>
            <span className="text-white font-bold">{diantarOrders.length}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-white/5">
            <span className="text-slate-400">Total aktif</span>
            <span className="text-white font-bold">{totalAktif}</span>
          </div>
        </div>
      </div>

      {(overlay === "konfirmasi-ambil" || overlay === "konfirmasi-selesai") && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-2xl border border-white/10 px-8 py-8 bg-[#1E2235]">
            <InfoIcon />
            <h3 className="text-white font-bold text-lg mb-2">
              {action === "ambil" ? "Konfirmasi Ambil Pesanan" : "Konfirmasi Selesai"}
            </h3>
            <p className="text-slate-400 text-sm mb-7">
              {action === "ambil"
                ? `Ambil pesanan Meja ${targetOrder?.meja?.nomor_meja} (#${targetOrder?.id_pesanan})?`
                : `Tandai pesanan Meja ${targetOrder?.meja?.nomor_meja} (#${targetOrder?.id_pesanan}) sebagai SELESAI?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 rounded-xl border-2 font-bold text-sm"
                style={{ borderColor: "#10B981", color: "#10B981" }}
              >
                Batal
              </button>
              <button
                onClick={() => void handleConfirmYes()}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ backgroundColor: "#10B981", color: "#000" }}
              >
                {submitting ? "..." : "Ya"}
              </button>
            </div>
          </div>
        </div>
      )}

      {(overlay === "sukses-ambil" || overlay === "sukses-selesai") && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="w-[420px] rounded-2xl border border-white/10 px-8 py-8 bg-[#1E2235]">
            <SuccessIcon />
            <h3 className="text-white font-bold text-lg mb-2">
              {overlay === "sukses-ambil" ? "Pesanan Diambil!" : "Pesanan Selesai!"}
            </h3>
            <p className="text-slate-400 text-sm mb-7">
              {overlay === "sukses-ambil"
                ? "Status diperbarui menjadi DIANTAR."
                : "Status diperbarui menjadi SELESAI. Meja dibebaskan jika tidak ada pesanan aktif."}
            </p>
            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold text-sm"
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
