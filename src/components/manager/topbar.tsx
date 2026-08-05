"use client";

import { usePathname } from "next/navigation";

const ACCENT = "#D0BCFF";

const titleMap: Record<string, string> = {
  "/dashboard/manager/dashboard":           "Beranda",
  "/dashboard/manager/financial-reports":   "Laporan Keuangan",
  "/dashboard/manager/trend-analysis":      "Analisis Tren",
  "/dashboard/manager/kategori-management": "Manajemen Kategori",
  "/dashboard/manager/menu-management":     "Manajemen Menu",
  "/dashboard/manager/user-management":     "Manajemen Pengguna",
};

export function ManagerTopbar() {
  const pathname = usePathname();
  const title = Object.entries(titleMap).find(([key]) => pathname.startsWith(key))?.[1] ?? "Manager";

  return (
    <header className="h-14 bg-[#151C25] border-b border-white/5 flex items-center px-6 shrink-0">
      <h2 className="font-semibold text-[15px]" style={{ color: ACCENT }}>{title}</h2>
    </header>
  );
}
