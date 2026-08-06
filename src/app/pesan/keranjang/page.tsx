"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, UtensilsCrossed, CreditCard, Smartphone } from "lucide-react";
import { useCart } from "@/lib/cart-context";

function formatRupiah(n: number) {
  return "Rp" + n.toLocaleString("id-ID");
}

export default function KeranjangPage() {
  const router = useRouter();
  const {
    items,
    tableNumber,
    subtotal,
    tax,
    grandTotal,
    updateQty,
    updateNotes,
    removeItem,
    clearCart,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentCategory, setPaymentCategory] = useState<"LANGSUNG" | "NANTI">("LANGSUNG");
  const [paymentMethod, setPaymentMethod] = useState<"QRIS" | "EWALLET" | "DEBIT">("QRIS");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit() {
    if (items.length === 0) return;
    setShowConfirm(false);
    const metode = paymentCategory === "NANTI" ? "NANTI" : paymentMethod;
    router.push(`/pesan/bayar?metode=${metode}&meja=${tableNumber ?? 12}&nama=${encodeURIComponent(customerName)}`);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen font-sans" style={{ backgroundColor: "#F8F9FF" }}>
        <nav className="sticky top-0 z-40 border-b border-stone-100 shadow-sm" style={{ backgroundColor: "#F8F9FF" }}>
          <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-1.5 hover:bg-stone-100 rounded-full transition-colors">
                <ArrowLeft size={18} className="text-stone-700" />
              </button>
              <Link href="/pesan" className="font-playfair text-lg font-bold text-amber-900">
                Pak Resto UNIKOM
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600">
              <Link href="/pesan" className="hover:text-amber-800 transition-colors leading-none">Home</Link>
              <Link href="/pesan" className="hover:text-amber-800 transition-colors leading-none">Menu</Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 border border-stone-200 rounded-full px-3 py-1.5 text-sm text-stone-700">
                <Image src="/images/pelayan/sidebar/informasi-meja.png" alt="meja" width={16} height={16}
                  style={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(600%) hue-rotate(15deg) brightness(90%)" }} />
                {tableNumber ?? 12}
              </div>
            </div>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center py-32 gap-4 px-4">
          <UtensilsCrossed size={48} className="text-stone-200" />
          <p className="text-stone-500 text-center">Keranjang pesanan Anda masih kosong.</p>
          <Link
            href="/pesan"
            className="bg-amber-700 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-amber-800 transition-colors"
          >
            Lihat Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#F8F9FF" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-stone-100 shadow-sm" style={{ backgroundColor: "#F8F9FF" }}>
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1.5 hover:bg-stone-100 rounded-full transition-colors">
              <ArrowLeft size={18} className="text-stone-700" />
            </button>
            <Link href="/pesan" className="font-playfair text-lg font-bold text-amber-900">
              Pak Resto UNIKOM
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600">
            <Link href="/pesan" className="hover:text-amber-800 transition-colors leading-none">Home</Link>
            <Link href="/pesan" className="hover:text-amber-800 transition-colors leading-none">Menu</Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-stone-200 rounded-full px-3 py-1.5 text-sm text-stone-700">
              <Image src="/images/pelayan/sidebar/informasi-meja.png" alt="meja" width={16} height={16}
                style={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(600%) hue-rotate(15deg) brightness(90%)" }} />
              {tableNumber ?? 12}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-8">
        <h1 className="font-playfair text-3xl font-bold text-stone-900 mb-8">Pesanan Anda</h1>

        <div className="grid md:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Left: Items + Meta */}
          <div className="space-y-4">
            {/* Items */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              {items.map((item, idx) => (
                <div
                  key={item.menuItemId}
                  className={`p-4 flex gap-4 ${
                    idx !== items.length - 1 ? "border-b border-stone-100" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-stone-100">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed size={20} className="text-stone-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-800 text-sm">{item.name}</p>
                        {item.notes && (
                          <p className="text-xs text-stone-400 mt-0.5 truncate">{item.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItemId)}
                        className="p-1 ml-2 opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <Image src="/images/hapus-pesanan.png" alt="hapus" width={15} height={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center hover:border-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-stone-700">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-stone-200 flex items-center justify-center hover:border-amber-600 hover:text-amber-700 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <p className="font-bold text-amber-800 text-sm">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Nama Pemesan */}
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Nama Pemesan
              </p>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi"
                className="w-full text-sm text-stone-700 placeholder-stone-300 border-b border-stone-200 focus:border-amber-600 focus:outline-none bg-transparent pb-1"
              />
            </div>

            {/* Table + Notes */}
            <div className="grid sm:grid-cols-2 gap-4 items-start">
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 min-h-24">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  Nomor Meja
                </p>
                <div className="flex items-center gap-2 text-stone-700">
                  <Image src="/images/no-meja.png" alt="meja" width={18} height={18}
                    style={{ filter: "brightness(0) saturate(100%) invert(35%) sepia(60%) saturate(600%) hue-rotate(15deg) brightness(90%)" }} />
                  <span className="font-bold text-xl">
                    {tableNumber ?? <span className="text-stone-400 text-sm font-normal">-</span>}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4 min-h-24">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  Catatan Pesanan
                </p>
                <div className="flex gap-2">
                  <Image src="/images/catatan-pesanan.png" alt="catatan" width={10} height={10} className="mt-1 flex-shrink-0 opacity-40" style={{ width: 10, height: 10 }} />
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = el.scrollHeight + "px";
                    }}
                    placeholder="Contoh: Sambal dipisah"
                    rows={1}
                    className="flex-1 text-sm text-stone-600 placeholder-stone-300 border-0 border-b border-stone-200 focus:border-amber-600 focus:outline-none resize-none bg-transparent overflow-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary + Payment */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
              <h2 className="font-playfair text-xl font-bold text-stone-900 mb-5">
                Ringkasan Pembayaran
              </h2>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Pajak (11%)</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
                <div className="border-t border-stone-100 pt-3 flex justify-between font-bold">
                  <span className="font-playfair text-lg text-stone-900">Grand Total</span>
                  <span className="font-playfair text-lg text-amber-800">{formatRupiah(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                  Metode Pembayaran
                </p>
                <div className="space-y-2">
                  {/* Bayar Langsung */}
                  <button
                    onClick={() => setPaymentCategory("LANGSUNG")}
                    className="w-full flex items-center gap-3 p-3 rounded-full border transition-colors text-left border-stone-200 hover:border-stone-300"
                    style={paymentCategory === "LANGSUNG" ? { backgroundColor: "rgba(255,182,144,0.1)", borderColor: "#9D4300" } : {}}
                  >
                    <Image src="/images/bayar-langsung.png" alt="langsung" width={20} height={20} className="flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-800">Bayar Langsung</p>
                      <p className="text-xs text-stone-400">QRIS, E-Wallet, Debit, Tunai</p>
                    </div>
                    {paymentCategory === "LANGSUNG" && (
                      <Image src="/images/ceklis-metode.png" alt="dipilih" width={20} height={20} className="flex-shrink-0" />
                    )}
                  </button>

                  {/* Sub-opsi Bayar Langsung */}
                  {paymentCategory === "LANGSUNG" && (
                    <div className="pl-4 space-y-1.5">
                      {[
                        { id: "QRIS" as const, label: "QRIS", desc: "Scan QR code", icon: <Image src="/images/bayar-langsung.png" alt="qris" width={16} height={16} className="flex-shrink-0" /> },
                        { id: "EWALLET" as const, label: "E-Wallet", desc: "GoPay, OVO, Dana", icon: <Smartphone size={16} className="flex-shrink-0 text-stone-400" /> },
                        { id: "DEBIT" as const, label: "Kartu Debit / Kredit", desc: "Visa, Mastercard", icon: <CreditCard size={16} className="flex-shrink-0 text-stone-400" /> },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-full border transition-colors text-left border-stone-200 hover:border-stone-300"
                          style={paymentMethod === m.id ? { backgroundColor: "rgba(255,182,144,0.1)", borderColor: "#9D4300" } : {}}
                        >
                          {m.icon}
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-stone-700">{m.label}</p>
                            <p className="text-[10px] text-stone-400">{m.desc}</p>
                          </div>
                          {paymentMethod === m.id && (
                            <Image src="/images/ceklis-metode.png" alt="dipilih" width={16} height={16} className="flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bayar Setelah Makan */}
                  <button
                    onClick={() => setPaymentCategory("NANTI")}
                    className="w-full flex items-center gap-3 p-3 rounded-full border transition-colors text-left border-stone-200 hover:border-stone-300"
                    style={paymentCategory === "NANTI" ? { backgroundColor: "rgba(255,182,144,0.1)", borderColor: "#9D4300" } : {}}
                  >
                    <Image src="/images/bayar-di-kasir.png" alt="nanti" width={20} height={20} className="flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-stone-800">Bayar di Kasir</p>
                      <p className="text-xs text-stone-400">Bayar setelah selesai makan, metode apa saja</p>
                    </div>
                    {paymentCategory === "NANTI" && (
                      <Image src="/images/ceklis-metode.png" alt="dipilih" width={20} height={20} className="flex-shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                className="w-full text-white font-semibold py-3.5 rounded-full transition-opacity hover:opacity-90 text-sm flex items-center justify-center gap-2"
                style={{ backgroundColor: "#F97316" }}
              >
                Konfirmasi &amp; Bayar
                <Image src="/images/arrow-konfirmasi-bayar.png" alt="→" width={16} height={16}
                  style={{ filter: "brightness(0) invert(1)" }} />
              </button>
              <p className="text-xs text-stone-400 text-center mt-3 leading-relaxed">
                Dengan menekan tombol di atas, Anda setuju dengan Syarat &amp; Ketentuan Pak Resto UNIKOM.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="font-playfair text-xl font-bold text-stone-900 mb-1">
              Konfirmasi Pesanan
            </h2>
            <p className="text-stone-400 text-xs mb-5">Pastikan pesanan Anda sudah benar sebelum melanjutkan.</p>

            {/* Ringkasan */}
            <div className="bg-stone-50 rounded-2xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Total Item</span>
                <span className="font-semibold text-stone-800">{items.reduce((s, i) => s + i.quantity, 0)} item</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Grand Total</span>
                <span className="font-bold text-amber-800">{formatRupiah(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Nomor Meja</span>
                <span className="font-semibold text-stone-800">{tableNumber ?? 12}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Nama Pemesan</span>
                <span className="font-semibold text-stone-800">{customerName || <span className="text-stone-400 font-normal italic">Tidak diisi</span>}</span>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="rounded-2xl border border-stone-200 p-4 mb-5">
              {paymentCategory === "NANTI" ? (
                <div className="flex items-center gap-3">
                  <Image src="/images/bayar-di-kasir.png" alt="nanti" width={20} height={20} />
                  <div>
                    <p className="text-sm font-semibold text-stone-800">Bayar di Kasir</p>
                    <p className="text-xs text-stone-400">Bayar setelah selesai makan, metode apa saja</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {paymentMethod === "QRIS" && <Image src="/images/bayar-langsung.png" alt="qris" width={20} height={20} />}
                  {paymentMethod === "EWALLET" && <Smartphone size={20} className="text-stone-500" />}
                  {paymentMethod === "DEBIT" && <CreditCard size={20} className="text-stone-500" />}
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {paymentMethod === "QRIS" && "QRIS"}
                      {paymentMethod === "EWALLET" && "E-Wallet"}
                      {paymentMethod === "DEBIT" && "Kartu Debit / Kredit"}
                    </p>
                    <p className="text-xs text-stone-400">
                      {paymentMethod === "QRIS" && "Scan QR code di kasir"}
                      {paymentMethod === "EWALLET" && "Tunjukkan bukti transfer ke kasir"}
                      {paymentMethod === "DEBIT" && "Gesek kartu di mesin EDC kasir"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 border border-stone-200 text-stone-600 font-semibold py-3 rounded-full hover:bg-stone-50 transition-colors text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 text-white font-semibold py-3 rounded-full transition-opacity hover:opacity-90 disabled:opacity-60 text-sm"
                style={{ backgroundColor: "#F97316" }}
              >
                {submitting ? "Memproses..." : "Pesan Sekarang"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
