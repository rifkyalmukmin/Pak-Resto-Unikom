"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Printer,
  ArrowLeft,
  Delete,
  RefreshCw,
} from "lucide-react";
import type { ApiPesanan } from "@/types/api";
import { api, mapPaymentMethodToApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

type PaymentMethod = "tunai" | "debit" | "qris" | "ewallet";

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "tunai", label: "Tunai", icon: "/images/kasir/pembayaran/tunai.png" },
  { key: "debit", label: "Debit/Kredit", icon: "/images/kasir/pembayaran/debit.png" },
  { key: "qris", label: "QRIS", icon: "/images/kasir/pembayaran/qris.png" },
  { key: "ewallet", label: "E-Wallet", icon: "/images/kasir/pembayaran/e-wallet.png" },
];

const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

export default function KonfirmasiPembayaranPage() {
  const [orders, setOrders] = useState<ApiPesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ApiPesanan | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [paymentInput, setPaymentInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = useCallback(async () => {
    setError("");
    try {
      const data = await api.getOrders({
        tipe_pesanan: "DINE_IN",
        belum_bayar: true,
      });
      setOrders(
        data.filter((o) =>
          ["SIAP", "DIANTAR", "SELESAI"].includes(o.status_pesanan)
        )
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

  const filtered = orders.filter((o) =>
    String(o.meja?.nomor_meja ?? "").includes(search) ||
    String(o.id_pesanan).includes(search)
  );

  const pendingTotal = orders.reduce((s, o) => s + o.total_harga, 0);

  const handleNumpad = (val: string) => {
    if (val === "C") {
      setPaymentInput("");
      return;
    }
    if (val === "DEL") {
      setPaymentInput((p) => p.slice(0, -1));
      return;
    }
    setPaymentInput((p) => (p.length < 10 ? p + val : p));
  };

  async function handleConfirm() {
    if (!selectedOrder) return;
    setSubmitting(true);
    setError("");
    try {
      await api.createPayment({
        id_pesanan: selectedOrder.id_pesanan,
        metode_pembayaran: mapPaymentMethodToApi(paymentMethod),
      });
      setShowVerifyModal(false);
      setShowPaymentSuccess(true);
      await loadOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mencatat pembayaran");
      setShowVerifyModal(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (selectedOrder) {
    const total = selectedOrder.total_harga;
    const paid = paymentInput ? parseInt(paymentInput, 10) : 0;
    const change = paid - total;
    const methodLabel =
      paymentMethod === "tunai"
        ? "Tunai"
        : paymentMethod === "debit"
          ? "Debit/Kredit"
          : paymentMethod === "qris"
            ? "QRIS"
            : "E-Wallet";

    return (
      <div className="flex h-full relative">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto p-6">
            <button
              onClick={() => {
                setSelectedOrder(null);
                setPaymentInput("");
              }}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5"
            >
              <ArrowLeft size={15} />
              Kembali ke daftar meja
            </button>

            {error && (
              <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm mb-4">
                {error}
              </p>
            )}

            <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white text-xl font-bold">
                    Meja {selectedOrder.meja?.nomor_meja ?? "-"} • Pesanan #
                    {selectedOrder.id_pesanan}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {formatDate(selectedOrder.waktu_pesanan)}
                  </p>
                </div>
                <span className="bg-amber-500/15 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30">
                  MENUNGGU PEMBAYARAN
                </span>
              </div>

              <div className="space-y-1.5">
                {selectedOrder.detail_pesanan.map((item, i) => (
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
                      {item.catatan && (
                        <p className="text-slate-500 text-xs mt-0.5">{item.catatan}</p>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm font-mono">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 p-4 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              {paymentMethods.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(key)}
                  className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border ${
                    paymentMethod === key
                      ? "border-[#4CD7F6] bg-[#4CD7F6]/10"
                      : "border-white/8 bg-[#1E1E2E]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt={label} width={22} height={22} />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-[300px] border-l border-white/5 flex flex-col bg-[#121221] shrink-0">
          <div className="px-5 pt-5 pb-4 border-b border-white/5">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
              Jumlah Tagihan
            </p>
            <p className="text-[#00B954] text-3xl font-bold">{formatCurrency(total)}</p>
          </div>

          <div className="px-5 pt-4 pb-3">
            <div className="bg-[#1E1E2E] rounded-xl border border-white/5 px-4 py-3">
              <p className="text-slate-400 text-xs mb-1">Dibayar ({methodLabel})</p>
              <p className="text-[#22d3ee] text-2xl font-bold">
                Rp {paid > 0 ? paid.toLocaleString("id-ID") : "0"}
              </p>
              {paymentMethod === "tunai" && paid >= total && paid > 0 && (
                <p className="text-[#00B954] text-xs mt-1.5">
                  Kembalian: {formatCurrency(change)}
                </p>
              )}
            </div>
          </div>

          <div className="px-5 pt-1">
            <div className="grid grid-cols-3 gap-2">
              {numpadKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => handleNumpad(k)}
                  className="h-[52px] bg-[#1E1E2E] text-white font-semibold rounded-xl border border-white/5 text-sm flex items-center justify-center"
                >
                  {k === "DEL" ? <Delete size={17} /> : k}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1" />

          <div className="px-5 pb-5">
            <button
              onClick={() => setShowVerifyModal(true)}
              disabled={paymentMethod === "tunai" && paid < total}
              className="w-full bg-[#00B954] text-black font-bold py-4 rounded-xl disabled:opacity-40"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        </div>

        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1E1E2E] rounded-2xl border border-white/10 w-[400px] p-8">
              <h3 className="text-white text-xl font-bold mb-4 text-center">
                Konfirmasi Pembayaran?
              </h3>
              <p className="text-[#00B954] text-2xl font-bold text-center mb-6">
                {formatCurrency(total)}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white"
                >
                  Batal
                </button>
                <button
                  onClick={() => void handleConfirm()}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-[#00B954] text-black font-bold"
                >
                  {submitting ? "Memproses..." : "Ya, Verifikasi"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showPaymentSuccess && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1E1E2E] rounded-2xl border border-white/10 w-[380px] p-8 text-center space-y-5">
              <Printer size={30} className="text-[#22C55E] mx-auto" />
              <h3 className="text-white font-bold text-xl">Pembayaran Berhasil!</h3>
              <p className="text-slate-400 text-sm">
                Meja {selectedOrder.meja?.nomor_meja} telah lunas.
              </p>
              <button
                onClick={() => {
                  setShowPaymentSuccess(false);
                  setSelectedOrder(null);
                  setPaymentInput("");
                  setPaymentMethod("tunai");
                }}
                className="w-full py-3 rounded-xl bg-[#22C55E] text-black font-bold"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Konfirmasi Pembayaran</h1>
          <p className="text-slate-400 text-sm mt-1">
            {orders.length} pesanan menunggu pembayaran
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadOrders()}
            className="p-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor meja..."
              className="bg-[#1E1E2E] border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2.5 w-52"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      {loading && orders.length === 0 ? (
        <p className="text-slate-500 text-center py-12">Memuat pesanan...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500 text-center py-12">Tidak ada pesanan menunggu pembayaran</p>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filtered.map((order) => (
            <div
              key={order.id_pesanan}
              className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex flex-col gap-3.5"
            >
              <div className="flex items-start justify-between">
                <div className="bg-[#06B6D4]/10 border border-[#4CD7F6]/20 rounded px-3 py-2">
                  <p className="text-[#4CD7F6] text-[9px] font-bold uppercase">MEJA</p>
                  <p className="text-white text-[32px] font-bold leading-none">
                    {String(order.meja?.nomor_meja ?? "-").padStart(2, "0")}
                  </p>
                </div>
                <span className="bg-amber-500/15 text-amber-400 text-[9px] font-bold px-2.5 py-1 rounded-full">
                  {order.status_pesanan}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Item</span>
                  <span className="text-white font-semibold">
                    {order.detail_pesanan.length} Items
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pesanan</span>
                  <span className="text-white font-semibold">#{order.id_pesanan}</span>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-0.5">Total Tagihan</p>
                <p className="text-[#00B954] text-xl font-bold">
                  {formatCurrency(order.total_harga)}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(order)}
                className="w-full bg-[#00B954] text-black text-sm font-semibold py-2.5 rounded-lg mt-auto"
              >
                Konfirmasi Bayar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5">
        <p className="text-slate-400 text-xs mb-1">Estimasi Pendapatan Pending</p>
        <p className="text-white text-xl font-bold">{formatCurrency(pendingTotal)}</p>
      </div>
    </div>
  );
}
