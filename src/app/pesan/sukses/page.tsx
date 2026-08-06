"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ChevronDown, ChevronUp } from "lucide-react";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

interface LastOrder {
  orderId: string;
  metode: string;
  nama: string;
  meja: number;
  items: { name: string; quantity: number; price: number; image: string | null }[];
  subtotal: number;
  tax: number;
  grandTotal: number;
}

const METODE_LABEL: Record<string, string> = {
  QRIS: "QRIS",
  EWALLET: "E-Wallet",
  DEBIT: "Kartu Debit / Kredit",
  NANTI: "Bayar di Kasir",
};

function SuksesContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") ?? "-";
  const metode = searchParams.get("metode") ?? "-";
  const nama = searchParams.get("nama") ?? "";

  const [order, setOrder] = useState<LastOrder | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pak-resto-last-order");
      if (raw) setOrder(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "#F8F9FF" }}>
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center">
            <CheckCircle size={36} className="text-green-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Judul */}
        <h1 className="font-playfair text-3xl font-bold text-stone-900 text-center mb-2">
          Pesanan Diterima!
        </h1>
        <p className="text-stone-500 text-sm text-center leading-relaxed mb-7">
          {nama ? (
            <>Terima kasih, <span className="text-amber-700 font-semibold">{nama}</span>. </>
          ) : ""}
          Pesanan Anda sedang diproses oleh dapur.
        </p>

        {/* Info singkat */}
        <div className="bg-stone-50 rounded-2xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-stone-400 tracking-widest uppercase">Order ID</span>
            <span className="font-bold text-stone-800">#{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-stone-400 tracking-widest uppercase">Metode</span>
            <div className="flex items-center gap-1.5">
              {metode === "QRIS" && <Image src="/images/bayar-langsung.png" alt="qris" width={14} height={14} />}
              <span className="font-bold text-stone-800">{METODE_LABEL[metode] ?? metode}</span>
            </div>
          </div>
          {order && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-stone-400 tracking-widest uppercase">Total</span>
              <span className="font-bold text-amber-800">{formatRupiah(order.grandTotal)}</span>
            </div>
          )}
        </div>

        {/* Lihat Detail Pesanan */}
        {order && (
          <div className="mb-5">
            <button
              onClick={() => setShowDetail((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-3.5 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#1C1C2E" }}
            >
              <span>Lihat Detail Pesanan</span>
              {showDetail ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {showDetail && (
              <div className="mt-3 bg-stone-50 rounded-2xl p-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-amber-700 shrink-0">{item.quantity}x</span>
                      <span className="text-stone-700 truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold text-stone-800 shrink-0 ml-2">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-stone-200 pt-3 space-y-1 text-xs text-stone-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span><span>{formatRupiah(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (11%)</span><span>{formatRupiah(order.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-stone-800 pt-1">
                    <span>Total</span><span>{formatRupiah(order.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kembali ke Beranda */}
        <Link
          href="/pesan"
          className="block text-center text-xs font-bold tracking-widest uppercase text-stone-400 hover:text-stone-600 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}

export default function SuksesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">Memuat...</div>}>
      <SuksesContent />
    </Suspense>
  );
}
