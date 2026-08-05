"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard/pelayan": "Beranda",
  "/dashboard/pelayan/informasi-meja": "Informasi Meja",
  "/dashboard/pelayan/pemesanan": "Pemesanan Makanan",
  "/dashboard/pelayan/stok": "Stok Bahan Baku",
  "/dashboard/pelayan/menu": "Menu",
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
