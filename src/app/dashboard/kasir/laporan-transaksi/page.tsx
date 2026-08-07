"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ListFilter, Download, Check, X } from "lucide-react";
import type { ApiPembayaran } from "@/types/api";
import { api, formatRp } from "@/lib/api";

const methodLabel: Record<string, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

const paymentMethodIcon: Record<string, string> = {
  Cash: "/images/kasir/laporan/icon-tunai.png",
  QRIS: "/images/kasir/laporan/icon-qris.png",
  Transfer: "/images/kasir/laporan/icon-debit.png",
};

const statusStyles: Record<string, string> = {
  LUNAS: "bg-[#00B954]/15 text-[#00B954] border border-[#00B954]/30",
  BELUM_BAYAR: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  DIBATALKAN: "bg-red-500/15 text-red-400 border border-red-500/30",
};

type FilterStatus = "SEMUA" | "LUNAS" | "BELUM_BAYAR" | "DIBATALKAN";

const filterOptions: { value: FilterStatus; label: string; dot: string }[] = [
  { value: "SEMUA", label: "Semua Status", dot: "#94a3b8" },
  { value: "LUNAS", label: "Lunas", dot: "#00B954" },
  { value: "BELUM_BAYAR", label: "Belum Bayar", dot: "#f59e0b" },
  { value: "DIBATALKAN", label: "Dibatalkan", dot: "#ef4444" },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function LaporanTransaksiPage() {
  const [payments, setPayments] = useState<ApiPembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("SEMUA");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<ApiPembayaran | null>(null);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      const data = await api.getPayments();
      setPayments(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat transaksi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const todayPayments = useMemo(
    () => payments.filter((p) => isToday(p.waktu_pembayaran)),
    [payments]
  );

  const todayLunas = useMemo(
    () => todayPayments.filter((p) => p.status_pembayaran === "LUNAS"),
    [todayPayments]
  );

  const totalHariIni = todayLunas.reduce((s, p) => s + p.total, 0);

  const filtered = useMemo(() => {
    const list = filterStatus === "SEMUA" ? payments : payments.filter((p) => p.status_pembayaran === filterStatus);
    return list;
  }, [payments, filterStatus]);

  function tableOrType(p: ApiPembayaran) {
    const pesanan = p.pesanan;
    if (!pesanan) return { label: `Pesanan #${p.id_pesanan}`, type: "-" };
    if (pesanan.tipe_pesanan === "DINE_IN") {
      return {
        label: `Meja ${pesanan.meja?.nomor_meja ?? "-"}`,
        type: "DINE-IN",
      };
    }
    return { label: `TA-${p.id_pesanan}`, type: "TAKEAWAY" };
  }

  return (
    <div className="p-6 space-y-5">
      {error && (
        <p className="text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-4 py-2 text-sm">
          {error}
        </p>
      )}

      <div className="grid grid-cols-[3fr_1fr] gap-4">
        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Total Penjualan Hari Ini
            </p>
            <p className="text-[#4CD7F6] font-bold tabular-nums flex items-baseline gap-1.5">
              <span className="text-sm">IDR</span>
              <span className="text-3xl">
                {loading ? "—" : totalHariIni.toLocaleString("id-ID")}
              </span>
            </p>
            <p className="text-xs mt-1.5 text-slate-400">
              Dari pembayaran berstatus LUNAS hari ini
            </p>
          </div>
          <div className="w-14 h-14 bg-[#22d3ee]/10 rounded-xl flex items-center justify-center shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/kasir/laporan/icon-total.png" alt="" width={28} height={28} />
          </div>
        </div>

        <div className="bg-[#1E1E2E] rounded-xl border border-white/5 p-5 relative">
          <div className="flex items-start justify-between mb-2">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              Jumlah Transaksi
            </p>
            <div className="w-14 h-14 bg-[#00B954]/10 rounded-xl flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/kasir/laporan/icon-jumlah.png" alt="" width={28} height={28} />
            </div>
          </div>
          <p className="text-white text-3xl font-bold mb-3">
            {loading ? "—" : todayLunas.length}
          </p>
          <p className="text-slate-400 text-xs">Transaksi lunas hari ini</p>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ backgroundColor: "#292839" }}
        >
          <h3 className="text-white font-semibold text-base">Riwayat Transaksi Terkini</h3>
          <div className="flex items-center gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className="flex items-center gap-2 border border-white/10 text-slate-300 text-sm px-3.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ backgroundColor: "#333344" }}
              >
                <ListFilter size={13} />
                Filter
              </button>
              {filterOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-44 rounded-xl border overflow-hidden z-50 shadow-xl"
                  style={{ backgroundColor: "#1A1A2A", borderColor: "#333344" }}
                >
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterStatus(opt.value);
                        setFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors"
                      style={{ color: filterStatus === opt.value ? "#4CD7F6" : "#94a3b8" }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: opt.dot }}
                        />
                        <span>{opt.label}</span>
                      </div>
                      {filterStatus === opt.value && (
                        <Check size={13} style={{ color: "#4CD7F6" }} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowExportSuccess(true)}
              className="flex items-center gap-2 bg-[#4CD7F6] text-black text-sm px-3.5 py-2 rounded-lg hover:bg-[#3bc5e3] transition-colors font-semibold"
            >
              <Download size={13} />
              Ekspor CSV
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-[1fr_1.5fr_1.2fr_1.5fr_1fr_0.5fr] gap-4 px-5 py-3"
          style={{ backgroundColor: "#1E1E2E" }}
        >
          {["Waktu", "No. Meja / Tipe", "Total (IDR)", "Metode Bayar", "Status", "Aksi"].map(
            (h) => (
              <p key={h} className="text-white text-sm font-bold uppercase tracking-wider">
                {h}
              </p>
            )
          )}
        </div>

        {loading ? (
          <div className="px-5 py-10 text-center text-slate-500 text-sm" style={{ backgroundColor: "#1A1A2A" }}>
            Memuat transaksi...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-500 text-sm" style={{ backgroundColor: "#1A1A2A" }}>
            Belum ada transaksi
          </div>
        ) : (
          filtered.map((tx) => {
            const loc = tableOrType(tx);
            const method = methodLabel[tx.metode_pembayaran] ?? tx.metode_pembayaran;
            const icon = paymentMethodIcon[method] ?? paymentMethodIcon.Cash;
            return (
              <div
                key={tx.id_pembayaran}
                className="grid grid-cols-[1fr_1.5fr_1.2fr_1.5fr_1fr_0.5fr] gap-4 px-5 py-4 border-t border-white/[0.04]"
                style={{ backgroundColor: "#1A1A2A" }}
              >
                <p className="text-sm font-normal self-center" style={{ color: "#E3E0F7" }}>
                  {formatTime(tx.waktu_pembayaran)}
                </p>
                <div className="self-center">
                  <p className="text-sm font-normal" style={{ color: "#E3E0F7" }}>
                    {loc.label}
                  </p>
                  <p className="text-slate-500 text-[10px] tracking-wide">{loc.type}</p>
                </div>
                <p className="text-[#4CD7F6] text-sm font-bold font-mono tabular-nums self-center">
                  {tx.total.toLocaleString("id-ID")}
                </p>
                <div className="self-center flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={icon} alt={method} width={16} height={16} />
                  <span className="text-sm font-normal" style={{ color: "#E3E0F7" }}>
                    {method}
                  </span>
                </div>
                <div className="self-center">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                      statusStyles[tx.status_pembayaran] ?? statusStyles.LUNAS
                    }`}
                  >
                    {tx.status_pembayaran}
                  </span>
                </div>
                <div className="self-center flex justify-center">
                  <button
                    onClick={() => setDetail(tx)}
                    className="p-1 transition-opacity hover:opacity-80"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/kasir/laporan/icon-eye.png"
                      alt="view"
                      width={16}
                      height={16}
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </button>
                </div>
              </div>
            );
          })
        )}

        <div
          style={{ backgroundColor: "#292839" }}
          className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between text-sm text-slate-400"
        >
          <p>
            Menampilkan{" "}
            <span className="text-white font-semibold">{filtered.length}</span> transaksi
          </p>
        </div>
      </div>

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-[440px] rounded-2xl border border-white/10 bg-[#1E1E2E] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-1 bg-[#22C55E]" />
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-1">
                  Detail Transaksi
                </p>
                <h3 className="text-white font-bold text-lg">#{detail.id_pembayaran}</h3>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {[
                { label: "Waktu Transaksi", value: formatTime(detail.waktu_pembayaran) },
                {
                  label: "No. Meja / Tipe",
                  value: `${tableOrType(detail).label} — ${tableOrType(detail).type}`,
                },
                {
                  label: "Metode Pembayaran",
                  value: methodLabel[detail.metode_pembayaran] ?? detail.metode_pembayaran,
                },
                {
                  label: "Total",
                  value: formatRp(detail.total),
                  highlight: true,
                },
                { label: "Status", value: detail.status_pembayaran },
                { label: "ID Pesanan", value: `#${detail.id_pesanan}` },
              ].map(({ label, value, highlight }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0"
                >
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      highlight ? "text-[#22C55E] font-bold text-base tabular-nums" : "text-white"
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setDetail(null)}
                className="w-full py-2.5 rounded-xl font-bold text-black text-sm"
                style={{ backgroundColor: "#22C55E" }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showExportSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[360px] rounded-2xl border border-white/10 bg-[#1E1E2E] p-8 flex flex-col items-center text-center space-y-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
            >
              <Download size={26} style={{ color: "#22C55E" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Export (demo)</h3>
              <p className="text-slate-400 text-sm">
                Unduhan CSV belum diimplementasikan. Data tabel sudah dari database.
              </p>
            </div>
            <button
              onClick={() => setShowExportSuccess(false)}
              className="w-full py-2.5 rounded-xl font-bold text-black"
              style={{ backgroundColor: "#22C55E" }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
