"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, CreditCard } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

type Metode = "QRIS" | "EWALLET" | "DEBIT" | "NANTI";

export default function BayarPage() {
  const router = useRouter();
  const { items, subtotal, tax, grandTotal, tableNumber, clearCart } = useCart();
  const [metode, setMetode] = useState<Metode>("QRIS");
  const [nama, setNama] = useState("");
  const [meja, setMeja] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMetode((params.get("metode") as Metode) ?? "QRIS");
    setNama(params.get("nama") ?? "");
    const m = params.get("meja");
    if (m) setMeja(parseInt(m, 10));
    setOrderId(params.get("order") ?? "");
  }, []);

  const mejaDisplay = tableNumber ?? meja;

  function handleSelesai() {
    clearCart();
    router.push(`/pesan/sukses?order=PRU-${orderId}&metode=${metode}&nama=${encodeURIComponent(nama)}`);
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F8F9FF" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-stone-100 shadow-sm" style={{ backgroundColor: "#F8F9FF" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between gap-3 sm:gap-6">
          <Link href="/pesan" className="font-playfair text-[15px] sm:text-lg font-bold text-amber-900 min-w-0 truncate">
            Pak Resto UNIKOM
          </Link>
          <div className="flex items-center gap-1.5 border border-stone-200 rounded-full px-3 py-1.5 text-sm text-stone-700">
            <Image
              src="/images/pelayan/sidebar/informasi-meja.png"
              alt="meja"
              width={16}
              height={16}
              style={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(600%) hue-rotate(15deg) brightness(90%)" }}
            />
            {mejaDisplay ?? "—"}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start">

          {/* Kiri: Konten per metode */}
          <div>
            {metode === "QRIS" && <QrisContent grandTotal={grandTotal} onSelesai={handleSelesai} />}
            {metode === "EWALLET" && <EwalletContent grandTotal={grandTotal} onSelesai={handleSelesai} />}
            {metode === "DEBIT" && <DebitContent grandTotal={grandTotal} onSelesai={handleSelesai} />}
            {metode === "NANTI" && <NantiContent onSelesai={handleSelesai} />}
          </div>

          {/* Kanan: Ringkasan */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="font-playfair text-lg font-bold text-stone-900 mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-amber-700 shrink-0">{item.quantity}x</span>
                    <span className="text-sm text-stone-700 truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-stone-800 shrink-0">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span><span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Pajak (11%)</span><span>{formatRupiah(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1">
                <span className="font-playfair text-stone-900">Total</span>
                <span className="font-playfair text-amber-800">{formatRupiah(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 space-y-1 text-xs text-stone-500">
              <div className="flex justify-between">
                <span>Nomor Meja</span>
                <span className="font-semibold text-stone-700">{mejaDisplay ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Nama Pemesan</span>
                <span className="font-semibold text-stone-700">{nama || <span className="italic text-stone-400">—</span>}</span>
              </div>
              {orderId && (
                <div className="flex justify-between">
                  <span>No. Pesanan</span>
                  <span className="font-semibold text-stone-700">#{orderId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── QRIS ── */
function QrisContent({ grandTotal, onSelesai }: { grandTotal: number; onSelesai: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-1">Bayar dengan QRIS</h1>
      <p className="text-stone-400 text-sm mb-6">Scan QR code di bawah menggunakan aplikasi pembayaran Anda.</p>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-52 h-52 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50">
          <Image src="/images/bayar-langsung.png" alt="qr" width={80} height={80} className="opacity-20" />
        </div>
        <p className="text-2xl font-playfair font-bold text-amber-800">{formatRupiah(grandTotal)}</p>
        <p className="text-xs text-stone-400">QR code akan tersedia setelah terhubung ke sistem</p>
      </div>

      <button
        onClick={onSelesai}
        className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 text-sm"
        style={{ backgroundColor: "#F97316" }}
      >
        Sudah Bayar
      </button>
    </div>
  );
}

/* ── E-Wallet ── */
function EwalletContent({ grandTotal, onSelesai }: { grandTotal: number; onSelesai: () => void }) {
  const wallets = [
    { name: "GoPay", color: "#00AED6" },
    { name: "OVO", color: "#4C3494" },
    { name: "Dana", color: "#108EE9" },
    { name: "ShopeePay", color: "#EE4D2D" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-1">Bayar dengan E-Wallet</h1>
      <p className="text-stone-400 text-sm mb-6">Pilih e-wallet Anda lalu tunjukkan bukti transfer ke kasir.</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {wallets.map((w) => (
          <div
            key={w.name}
            className="border border-stone-200 rounded-2xl p-4 flex items-center justify-center h-16 cursor-pointer hover:border-stone-300 transition-colors"
          >
            <span className="font-bold text-sm" style={{ color: w.color }}>{w.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 rounded-xl p-4 mb-6 text-sm text-amber-800">
        <p className="font-semibold mb-1">Total yang harus dibayar</p>
        <p className="font-playfair text-xl font-bold">{formatRupiah(grandTotal)}</p>
      </div>

      <button
        onClick={onSelesai}
        className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 text-sm"
        style={{ backgroundColor: "#F97316" }}
      >
        Sudah Bayar
      </button>
    </div>
  );
}

/* ── Debit/Kredit ── */
function DebitContent({ grandTotal, onSelesai }: { grandTotal: number; onSelesai: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-1">Bayar dengan Kartu</h1>
      <p className="text-stone-400 text-sm mb-6">Menuju kasir dan gesek kartu di mesin EDC yang tersedia.</p>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center">
          <CreditCard size={36} className="text-stone-300" />
        </div>
        <div className="text-center">
          <p className="text-2xl font-playfair font-bold text-amber-800">{formatRupiah(grandTotal)}</p>
          <p className="text-xs text-stone-400 mt-1">Tunjukkan halaman ini ke kasir</p>
        </div>
      </div>

      <div className="bg-stone-50 rounded-xl p-4 mb-6 text-sm text-stone-600 space-y-2">
        <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">1</span> Pergi ke meja kasir</p>
        <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">2</span> Tunjukkan pesanan ini</p>
        <p className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center shrink-0">3</span> Gesek kartu di mesin EDC</p>
      </div>

      <button
        onClick={onSelesai}
        className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 text-sm"
        style={{ backgroundColor: "#F97316" }}
      >
        Sudah Bayar
      </button>
    </div>
  );
}

/* ── Bayar di Kasir ── */
function NantiContent({ onSelesai }: { onSelesai: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
      <h1 className="font-playfair text-2xl font-bold text-stone-900 mb-1">Pesanan Diterima!</h1>
      <p className="text-stone-400 text-sm mb-8">Pesanan Anda sedang diproses. Silakan nikmati makanan dan bayar ke kasir setelah selesai.</p>

      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <p className="text-sm text-stone-500 text-center">Anda bisa membayar dengan metode apa saja<br />saat menyelesaikan tagihan di kasir.</p>
      </div>

      <button
        onClick={onSelesai}
        className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 text-sm"
        style={{ backgroundColor: "#F97316" }}
      >
        Selesai
      </button>
    </div>
  );
}
