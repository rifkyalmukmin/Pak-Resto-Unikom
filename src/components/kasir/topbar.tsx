"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard/cashier/konfirmasi-pembayaran": "Konfirmasi Pembayaran",
  "/dashboard/cashier/take-away": "Pesanan Take Away",
  "/dashboard/cashier/take-away/tambah": "Tambah Pesanan Take Away",
  "/dashboard/cashier/laporan-transaksi": "Laporan Transaksi",
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
