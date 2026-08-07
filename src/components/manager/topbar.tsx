"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

const ACCENT = "#D0BCFF";

const titleMap: Record<string, string> = {
  "/dashboard/manager/dashboard":           "Beranda",
  "/dashboard/manager/financial-reports":   "Laporan Keuangan",
  "/dashboard/manager/trend-analysis":      "Analisis Tren",
  "/dashboard/manager/kategori-management": "Manajemen Kategori",
  "/dashboard/manager/menu-management":     "Manajemen Menu",
  "/dashboard/manager/user-management":     "Manajemen Pengguna",
};

export function ManagerTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const title = Object.entries(titleMap).find(([key]) => pathname.startsWith(key))?.[1] ?? "Manager";

  return (
    <header className="h-14 bg-[#151C25] border-b border-white/5 flex items-center px-4 sm:px-6 gap-3 shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 -ml-1"
        aria-label="Buka menu navigasi"
      >
        <Menu size={20} />
      </button>
      <h2 className="font-semibold text-[15px]" style={{ color: ACCENT }}>{title}</h2>
    </header>
  );
}
