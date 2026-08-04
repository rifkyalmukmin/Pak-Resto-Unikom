"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard/waiter": "Beranda",
  "/dashboard/waiter/informasi-meja": "Informasi Meja",
  "/dashboard/waiter/pemesanan": "Pemesanan Makanan",
  "/dashboard/waiter/stok": "Stok Bahan Baku",
  "/dashboard/waiter/menu": "Menu",
};

export function PelayanTopbar() {
  const pathname = usePathname();
  const title = titleMap[pathname] ?? "Pelayan";

  return (
    <header className="h-14 bg-[#121221] border-b border-white/5 flex items-center px-6 shrink-0">
      <h2 className="text-[#10B981] font-semibold text-[15px]">{title}</h2>
    </header>
  );
}
