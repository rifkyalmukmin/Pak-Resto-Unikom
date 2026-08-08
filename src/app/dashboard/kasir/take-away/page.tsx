"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, PlusCircle, XCircle, Check, RefreshCw, Delete } from "lucide-react";
import type { ApiPesanan } from "@/types/api";
import { api, mapPaymentMethodToApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { StatusPesanan } from "@prisma/client";

type PaymentMethod = "tunai" | "debit" | "qris" | "ewallet";

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "tunai", label: "Tunai", icon: "/images/kasir/pembayaran/tunai.png" },
  { key: "debit", label: "Debit/Kredit", icon: "/images/kasir/pembayaran/debit.png" },
  { key: "qris", label: "QRIS", icon: "/images/kasir/pembayaran/qris.png" },
  { key: "ewallet", label: "E-Wallet", icon: "/images/kasir/pembayaran/e-wallet.png" },
];

const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

function mapStatusLabel(order: ApiPesanan): string {
  if (order.status_pesanan === "DIBATALKAN") return "DIBATALKAN";
  if (order.status_pesanan === "SELESAI") return "SELESAI";
  if (!order.pembayaran || order.pembayaran.status_pembayaran !== "LUNAS") {
    if (["MENUNGGU", "DIPROSES"].includes(order.status_pesanan)) return "DIPROSES";
    if (order.status_pesanan === "SIAP") return "SIAP BAYAR";
  }
  return "SELESAI";
}

const statusStyles: Record<string, string> = {
  "SIAP BAYAR": "bg-green-500/15 text-green-400 border border-green-500/30",
  DIPROSES: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  SELESAI: "bg-[#00B954]/15 text-[#00B954] border border-[#00B954]/30",
  DIBATALKAN: "bg-red-500/15 text-red-400 border border-red-500/30",
};

export default function TakeAwayPage() {
  const [orders, setOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [error, setError] = useState("");

  // payment state
  const [payOrder, setPayOrder] = useState<ApiPesanan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [paymentInput, setPaymentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPaySuccess, setShowPaySuccess] = useState(false);

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const data = await api.getOrders({ tipe_pesanan: "TAKEAWAY" });
      setOrders(data);
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

  const filtered = orders.filter((o) => {
    const label = mapStatusLabel(o);
    const matchSearch =
      String(o.id_pesanan).includes(search) ||
      o.user.nama_lengkap.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Semua Status" || label === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: orders.length,
    siapBayar: orders.filter((o) => mapStatusLabel(o) === "SIAP BAYAR").length,
    diproses: orders.filter((o) => mapStatusLabel(o) === "DIPROSES").length,
    selesai: orders.filter((o) => mapStatusLabel(o) === "SELESAI").length,
  };

  async function handleCancel(id: number) {
    try {
      await api.updateOrderStatus(id, "DIBATALKAN" as StatusPesanan);
      setCancelTarget(null);
      setShowCancelSuccess(true);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membatalkan pesanan");
      setCancelTarget(null);
    }
  }

  const handleNumpad = (val: string) => {
    if (val === "C") { setPaymentInput(""); return; }
    if (val === "DEL") { setPaymentInput((p) => p.slice(0, -1)); return; }
    setPaymentInput((p) => (p.length < 10 ? p + val : p));
  };

  async function handleConfirmPayment() {
    if (!payOrder) return;
    setSubmitting(true);
    setError("");
    try {
      await api.createPayment({
        id_pesanan: payOrder.id_pesanan,
        metode_pembayaran: mapPaymentMethodToApi(paymentMethod),
      });
      setPayOrder(null);
      setPaymentInput("");
      setPaymentMethod("tunai");
      setShowPaySuccess(true);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mencatat pembayaran");
    } finally {
      setSubmitting(false);
    }
  }

  const paid = paymentInput ? parseInt(paymentInput, 10) : 0;
  const total = payOrder?.total_harga ?? 0;
  const change = paid - total;

  return (
    <div className="p-6 space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pesanan", value: counts.total, color: "text-white" },
          { label: "Siap Dibayar", value: counts.siapBayar, color: "text-[#4AE176]" },
          { label: "Sedang Diproses", value: counts.diproses, color: "text-[#FFB873]" },
          { label: "Selesai", value: counts.selesai, color: "text-[#4CD7F6]" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1E1E2E] rounded-xl border border-white/5 px-5 py-4">
            <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={() => void loadOrders()}
          className="p-2.5 rounded-lg border border-white/10 text-slate-400"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Pesanan..."
            className="w-full bg-[#1E1E2E] border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2.5"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1E1E2E] border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2.5"
        >
          {["Semua Status", "SIAP BAYAR", "DIPROSES", "SELESAI", "DIBATALKAN"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <Link
          href="/dashboard/kasir/take-away/tambah"
          className="ml-auto flex items-center gap-2 bg-[#06B6D4] text-black text-sm font-bold px-4 py-2.5 rounded-lg"
        >
          <PlusCircle size={16} />
          Tambah Pesanan
        </Link>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_auto] gap-4 px-5 py-3 bg-[#292839]">
          {["NO. PESANAN", "PELAYAN", "JUMLAH ITEM", "TOTAL", "STATUS", "AKSI"].map((h) => (
            <p key={h} className="text-white text-sm font-bold uppercase tracking-wider">
              {h}
            </p>
          ))}
        </div>

        {loading && orders.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Memuat pesanan...</p>
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-10">Tidak ada pesanan takeaway</p>
        ) : (
          filtered.map((order, i) => {
            const label = mapStatusLabel(order);
            const canPay = label === "SIAP BAYAR";
            const canCancel =
              order.status_pesanan !== "DIBATALKAN" && order.status_pesanan !== "SELESAI" && !canPay;
            return (
              <div
                key={order.id_pesanan}
                className="grid grid-cols-[1fr_1.5fr_1fr_1.2fr_1.2fr_auto] gap-4 px-5 py-4 items-center"
                style={{ backgroundColor: i % 2 === 0 ? "#1E1E2E" : "#252538" }}
              >
                <p className="text-sm text-[#E3E0F7]">#{order.id_pesanan}</p>
                <p className="text-sm text-[#E3E0F7]">{order.user.nama_lengkap}</p>
                <p className="text-sm text-[#E3E0F7]">{order.detail_pesanan.length} Item</p>
                <p className="text-sm text-[#E3E0F7]">{formatCurrency(order.total_harga)}</p>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                      statusStyles[label] ?? "bg-slate-500/15 text-slate-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {canPay && (
                    <button
                      onClick={() => {
                        setPayOrder(order);
                        setPaymentInput("");
                        setPaymentMethod("tunai");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#00B954] text-black"
                    >
                      Bayar
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => setCancelTarget(order.id_pesanan)}
                      className="text-white hover:text-red-400 p-1"
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Payment Modal */}
      {payOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1E1E2E] rounded-2xl border border-white/10 w-full max-w-[860px] mx-4 flex flex-col lg:flex-row overflow-hidden max-h-[90vh]">
            {/* Left: order detail + payment method */}
            <div className="flex-1 p-6 overflow-auto space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-lg font-bold">
                    Takeaway · Pesanan #{payOrder.id_pesanan}
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">{payOrder.user.nama_lengkap}</p>
                </div>
                <span className="bg-green-500/15 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-500/30">
                  SIAP BAYAR
                </span>
              </div>

              <div className="space-y-1.5">
                {payOrder.detail_pesanan.map((item, i) => (
                  <div
                    key={item.id_detail}
                    className="flex items-center gap-4 px-3 py-3 rounded-xl"
                    style={{ backgroundColor: i % 2 === 0 ? "#1A1A2A" : "transparent" }}
                  >
                    <div className="w-10 h-10 bg-[#2a2a3e] rounded-lg flex items-center justify-center text-sm font-bold text-[#22d3ee] shrink-0">
                      {item.jumlah}x
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.menu.nama_menu}</p>
                    </div>
                    <p className="text-slate-300 text-sm font-mono">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {paymentMethods.map(({ key, label, icon }) => {
                  const active = paymentMethod === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setPaymentMethod(key)}
                      className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border transition-colors ${
                        active
                          ? "border-[#4CD7F6] bg-[#4CD7F6]/10"
                          : "border-white/10 bg-[#252538] hover:border-white/20"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={icon} alt={label} width={22} height={22} className={active ? "opacity-100" : "opacity-70"} />
                      <span className={`text-xs font-semibold ${active ? "text-[#4CD7F6]" : "text-slate-300"}`}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: numpad */}
            <div className="w-full lg:w-[280px] border-t lg:border-t-0 lg:border-l border-white/5 flex flex-col bg-[#121221] p-5 gap-4">
              <div>
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">
                  Jumlah Tagihan
                </p>
                <p className="text-[#00B954] text-3xl font-bold">{formatCurrency(total)}</p>
              </div>

              <div className="bg-[#1E1E2E] rounded-xl border border-white/5 px-4 py-3">
                <p className="text-slate-400 text-xs mb-1">Dibayar</p>
                <p className="text-[#22d3ee] text-2xl font-bold">
                  Rp {paid > 0 ? paid.toLocaleString("id-ID") : "0"}
                </p>
                {paymentMethod === "tunai" && paid >= total && paid > 0 && (
                  <p className="text-[#00B954] text-xs mt-1.5">
                    Kembalian: {formatCurrency(change)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {numpadKeys.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleNumpad(k)}
                    className="h-[48px] bg-[#1E1E2E] text-white font-semibold rounded-xl border border-white/5 text-sm flex items-center justify-center"
                  >
                    {k === "DEL" ? <Delete size={16} /> : k}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => void handleConfirmPayment()}
                  disabled={submitting || (paymentMethod === "tunai" && paid < total)}
                  className="w-full py-3 rounded-xl bg-[#00B954] text-black font-bold disabled:opacity-40"
                >
                  {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
                </button>
                <button
                  onClick={() => { setPayOrder(null); setPaymentInput(""); }}
                  className="w-full py-2.5 rounded-xl border border-white/10 text-slate-400 text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[380px] mx-4 rounded-2xl border border-white/10 bg-[#1E2235] p-8 text-center space-y-5">
            <XCircle size={28} className="text-red-400 mx-auto" />
            <h3 className="text-white font-bold text-lg">Batalkan Pesanan?</h3>
            <p className="text-slate-400 text-sm">Pesanan #{cancelTarget} akan dibatalkan.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white"
              >
                Kembali
              </button>
              <button
                onClick={() => void handleCancel(cancelTarget)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold"
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-white/10 bg-[#1E2235] p-8 text-center space-y-5">
            <Check size={28} className="text-[#22C55E] mx-auto" />
            <h3 className="text-white font-bold text-lg">Pesanan Dibatalkan</h3>
            <button
              onClick={() => setShowCancelSuccess(false)}
              className="w-full py-2.5 rounded-xl bg-[#22C55E] text-black font-bold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showPaySuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-white/10 bg-[#1E2235] p-8 text-center space-y-5">
            <Check size={28} className="text-[#22C55E] mx-auto" />
            <h3 className="text-white font-bold text-lg">Pembayaran Berhasil!</h3>
            <p className="text-slate-400 text-sm">Pesanan takeaway telah lunas.</p>
            <button
              onClick={() => setShowPaySuccess(false)}
              className="w-full py-2.5 rounded-xl bg-[#22C55E] text-black font-bold"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
