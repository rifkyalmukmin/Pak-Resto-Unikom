"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Printer,
  ArrowLeft,
  Delete,
} from "lucide-react";

type PaymentMethod = "tunai" | "debit" | "qris" | "ewallet";

interface TableData {
  id: number;
  number: string;
  status: "pending" | "empty";
  invoice?: string;
  items?: number;
  method?: "tunai" | "transfer";
  total?: number;
}

const mockTables: TableData[] = [
  { id: 1, number: "08", status: "pending", invoice: "INV/2023/1029", items: 12, method: "tunai", total: 458000 },
  { id: 2, number: "12", status: "pending", invoice: "INV/2023/1031", items: 4, method: "transfer", total: 125500 },
  { id: 3, number: "03", status: "pending", invoice: "INV/2023/1032", items: 22, method: "tunai", total: 1120000 },
  { id: 4, number: "15", status: "pending", invoice: "INV/2023/1035", items: 7, method: "transfer", total: 289400 },
  { id: 5, number: "09", status: "empty" },
  { id: 6, number: "14", status: "empty" },
];

const mockOrderItems = [
  { qty: 2, name: "Nasi Goreng Spesial Unikom", note: "+ Telur Mata Sapi, Extra Pedas", price: 70000 },
  { qty: 1, name: "Sate Ayam Madura (10 Tusuk)", note: "Bumbu Kacang Terpisah", price: 35000 },
  { qty: 4, name: "Es Teh Manis Kristal", note: "Less Sugar", price: 40000 },
];

const numpadKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

const paymentMethods: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: "tunai", label: "Tunai", icon: "/images/kasir/pembayaran/tunai.png" },
  { key: "debit", label: "Debit/Kredit", icon: "/images/kasir/pembayaran/debit.png" },
  { key: "qris", label: "QRIS", icon: "/images/kasir/pembayaran/qris.png" },
  { key: "ewallet", label: "E-Wallet", icon: "/images/kasir/pembayaran/e-wallet.png" },
];

function formatRp(amount: number) {
  return "Rp " + amount.toLocaleString("id-ID");
}

export default function KonfirmasiPembayaranPage() {
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [paymentInput, setPaymentInput] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [search, setSearch] = useState("");

  const handleNumpad = (val: string) => {
    if (val === "C") { setPaymentInput(""); return; }
    if (val === "DEL") { setPaymentInput((p) => p.slice(0, -1)); return; }
    setPaymentInput((p) => (p.length < 10 ? p + val : p));
  };

  const handleConfirm = () => {
    setShowVerifyModal(false);
    setSelectedTable(null);
    setPaymentInput("");
    setPaymentMethod("tunai");
  };

  // ── Detail / payment view ──────────────────────────────────────────────────
  if (selectedTable) {
    const total = selectedTable.total ?? 0;
    const paid = paymentInput ? parseInt(paymentInput) : 0;
    const change = paid - total;
    const methodLabel =
      paymentMethod === "tunai" ? "Tunai" :
      paymentMethod === "debit" ? "Debit/Kredit" :
      paymentMethod === "qris" ? "QRIS" : "E-Wallet";

    return (
      <div className="flex h-full relative">

        {/* ── LEFT: order detail ── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-auto p-6">
            <button
              onClick={() => setSelectedTable(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
            >
              <ArrowLeft size={15} />
              Kembali ke daftar meja
            </button>

            <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-white text-xl font-bold">
                    Meja {selectedTable.number} • 4 Pelanggan
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">Order dibuat pada 19:42 WIB</p>
                </div>
                <span className="bg-amber-500/15 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30 tracking-wide">
                  MENUNGGU PEMBAYARAN
                </span>
              </div>

              <div className="space-y-1.5">
                {mockOrderItems.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-3 py-3 rounded-xl"
                    style={{ backgroundColor: i % 2 === 0 ? "#1A1A2A" : "transparent" }}
                  >
                    <div className="w-10 h-10 bg-[#2a2a3e] rounded-lg flex items-center justify-center text-sm font-bold text-[#22d3ee] shrink-0">
                      {item.qty}x
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{item.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{item.note}</p>
                    </div>
                    <p className="text-slate-300 text-sm font-mono tabular-nums">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment method tabs — pinned to bottom of left panel */}
          <div className="border-t border-white/5 p-4 shrink-0">
            <div className="grid grid-cols-4 gap-3">
              {paymentMethods.map(({ key, label, icon }) => {
                const isActive = paymentMethod === key;
                return (
                  <button
                    key={key}
                    onClick={() => setPaymentMethod(key)}
                    className={`flex flex-col items-center gap-2 py-3.5 rounded-xl border transition-all ${
                      isActive
                        ? "border-[#4CD7F6] bg-[#4CD7F6]/10"
                        : "border-white/8 bg-[#1E1E2E] hover:border-white/15"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={icon}
                      alt={label}
                      width={22}
                      height={22}
                      style={{ filter: isActive ? "none" : "brightness(0) invert(1)" }}
                    />
                    <span className={`text-xs leading-tight ${isActive ? "text-white font-bold" : "text-slate-400"}`}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT: payment panel ── */}
        <div className="w-[300px] border-l border-white/5 flex flex-col bg-[#121221] shrink-0">
          <div className="px-5 pt-5 pb-4 border-b border-white/5">
            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1.5">
              Jumlah Tagihan
            </p>
            <p className="text-[#00B954] text-3xl font-bold tabular-nums">
              {formatRp(total)}
            </p>
          </div>

          <div className="px-5 pt-4 pb-3">
            <div className="bg-[#1E1E2E] rounded-xl border border-white/5 px-4 py-3">
              <p className="text-slate-400 text-xs mb-1">Dibayar ({methodLabel})</p>
              <p className="text-[#22d3ee] text-2xl font-bold tabular-nums">
                Rp {paid > 0 ? paid.toLocaleString("id-ID") : "0"}
              </p>
              {paymentMethod === "tunai" && paid >= total && paid > 0 && (
                <p className="text-[#00B954] text-xs mt-1.5">
                  Kembalian: Rp {change.toLocaleString("id-ID")}
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
                  className="h-[52px] bg-[#1E1E2E] hover:bg-[#2a2a3e] active:scale-95 text-white font-semibold rounded-xl border border-white/5 transition-all text-sm flex items-center justify-center"
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
              className="w-full bg-[#00B954] hover:bg-[#009944] active:scale-[0.98] text-black font-bold py-4 rounded-xl transition-all text-sm uppercase tracking-wider"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        </div>

        {/* ── Verification modal ── */}
        {showVerifyModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#1E1E2E] rounded-2xl border border-white/10 w-[400px] overflow-hidden shadow-2xl">
              <div className="h-1 bg-[#00B954]" />

              <div className="px-8 pt-8 pb-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="bg-[#22C55E]/10 rounded-2xl p-5 flex items-center justify-center mb-4">
                    <div className="w-11 h-11 bg-[#00B954] rounded-full flex items-center justify-center shadow-md shadow-[#00B954]/30">
                      <span className="text-black text-xl font-bold leading-none">?</span>
                    </div>
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">Konfirmasi Verifikasi</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Apakah Anda yakin ingin memverifikasi transaksi ini?
                  </p>
                </div>

                <div className="bg-[#2a2a3e] rounded-xl p-4 flex justify-between items-start mb-6">
                  <div>
                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">
                      Total Pembayaran
                    </p>
                    <p className="text-[#00B954] text-xl font-bold tabular-nums">
                      {formatRp(total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-1">
                      ID Transaksi
                    </p>
                    <p className="text-white font-semibold">TX-9021</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowVerifyModal(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 rounded-xl bg-[#00B954] hover:bg-[#009944] text-black font-bold transition-colors"
                  >
                    Ya, Verifikasi
                  </button>
                </div>
              </div>

              <div className="bg-[#333344] px-8 py-3 text-center">
                <p className="text-slate-500 text-[10px] tracking-[0.25em] font-medium uppercase">
                  Pak Resto Unikom Security Protocol
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Konfirmasi Pembayaran</h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kasir/konten/icon-jam.png" alt="" width={13} height={13} className="opacity-60" />
            Data diperbarui otomatis • 12 meja menunggu pembayaran
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor meja..."
              className="bg-[#1E1E2E] border border-white/10 text-white placeholder-slate-500 text-sm rounded-lg pl-9 pr-4 py-2.5 w-52 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 bg-[#1E1E2E] border border-white/10 text-slate-300 text-sm px-4 py-2.5 rounded-lg hover:bg-[#2a2a3e] transition-colors">
            <Filter size={14} />
            Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {mockTables.map((table) => {
          if (table.status === "empty") {
            return (
              <div key={table.id} className="bg-[#1E1E2E] rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center min-h-[228px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/kasir/konten/icon-meja.png" alt="" width={32} height={32} className="opacity-30 mb-3" />
                <p className="text-slate-600 text-sm text-center leading-relaxed">
                  Meja Kosong /<br />Pesanan Aktif
                </p>
              </div>
            );
          }

          return (
            <div key={table.id} className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex flex-col gap-3.5">
              <div className="flex items-start justify-between">
                <div className="bg-[#06B6D4]/10 border border-[#4CD7F6]/20 rounded-[4px] px-3 py-2">
                  <p className="text-[#4CD7F6] text-[9px] font-bold uppercase tracking-widest">MEJA</p>
                  <p className="text-white text-[32px] font-bold leading-none mt-0.5">
                    {table.number.padStart(2, "0")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 text-[9px] font-bold px-2.5 py-1 rounded-full border border-amber-500/25">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    PENDING
                  </span>
                  <p className="text-slate-600 text-[9px] mt-1.5 font-mono">{table.invoice}</p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Item Pesanan</span>
                  <span className="text-white font-semibold">{table.items} Items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Metode</span>
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={table.method === "tunai" ? "/images/kasir/konten/icon-tunai.png" : "/images/kasir/konten/icon-transfer.png"}
                      alt=""
                      width={13}
                      height={13}
                      className="opacity-60"
                    />
                    {table.method === "tunai" ? "Tunai" : "Transfer"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-slate-400 text-xs mb-0.5">Total Tagihan</p>
                <p className="text-[#00B954] text-xl font-bold tabular-nums">
                  {formatRp(table.total!)}
                </p>
              </div>

              <div className="space-y-2 mt-auto">
                <button
                  onClick={() => setSelectedTable(table)}
                  className="w-full bg-[#00B954] hover:bg-[#009944] text-black text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/kasir/konten/icon-konfirmasi.png" alt="" width={14} height={14} style={{ filter: "brightness(0)" }} />
                  Konfirmasi Bayar
                </button>
                <button className="w-full border border-white/10 text-slate-300 text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                  <Printer size={13} />
                  Cetak Struk
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0e7490]/20 rounded-xl flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kasir/konten/icon-estimasi.png" alt="" width={24} height={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Estimasi Pendapatan Pending</p>
            <p className="text-white text-xl font-bold tabular-nums">Rp 1.992.900</p>
          </div>
        </div>

        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00B954]/15 rounded-xl flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kasir/konten/icon-konfirmasi.png" alt="" width={24} height={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Meja Terkonfirmasi (Hari ini)</p>
            <p className="text-white text-xl font-bold">42 Meja</p>
          </div>
        </div>

        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kasir/konten/icon-rata-waktu.png" alt="" width={24} height={24} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Rata-rata Waktu Pembayaran</p>
            <p className="text-white text-xl font-bold">8.5 Menit</p>
          </div>
        </div>
      </div>
    </div>
  );
}
