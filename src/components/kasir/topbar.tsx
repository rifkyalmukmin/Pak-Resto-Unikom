"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard/kasir/konfirmasi-pembayaran": "Konfirmasi Pembayaran",
  "/dashboard/kasir/take-away": "Pesanan Take Away",
  "/dashboard/kasir/take-away/tambah": "Tambah Pesanan Take Away",
  "/dashboard/kasir/laporan-transaksi": "Laporan Transaksi",
};

export function KasirTopbar() {
  const pathname = usePathname();
  const title = titleMap[pathname] ?? "Kasir";

  return (
    <header className="h-14 bg-[#121221] border-b border-white/5 flex items-center px-6 shrink-0">
      <h2 className="text-white font-semibold text-[15px]">{title}</h2>
    </header>
  );
}
