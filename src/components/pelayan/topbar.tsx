"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const titleMap: Record<string, string> = {
  "/dashboard/pelayan": "Beranda",
  "/dashboard/pelayan/informasi-meja": "Informasi Meja",
  "/dashboard/pelayan/pemesanan": "Pemesanan Makanan",
  "/dashboard/pelayan/stok": "Stok Bahan Baku",
  "/dashboard/pelayan/menu": "Menu",
};

export function PelayanTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const title = titleMap[pathname] ?? "Pelayan";

  return (
    <header className="h-14 bg-[#1E1E2E] border-b border-white/5 flex items-center px-4 sm:px-6 gap-3 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 -ml-1"
        aria-label="Buka menu navigasi"
      >
        <Menu size={20} />
      </button>
      <h2 className="text-[#10B981] font-semibold text-[15px]">{title}</h2>
    </header>
  );
}
