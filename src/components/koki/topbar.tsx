"use client";

import { usePathname } from "next/navigation";

const titleMap: Record<string, string> = {
  "/dashboard/koki/pesanan-aktif": "Pesanan Aktif",
  "/dashboard/koki/inventaris-stok": "Inventaris Stok",
  "/dashboard/koki/riwayat-pesanan": "Riwayat Pesanan",
};

export function KokiTopbar() {
  const pathname = usePathname();
  const title = titleMap[pathname] ?? "Chef";

  return (
    <header className="h-14 bg-[#1E1E2E] border-b border-white/5 flex items-center px-6 shrink-0">
      <h2 className="text-[#F59E0B] font-semibold text-[15px]">{title}</h2>
    </header>
  );
}
