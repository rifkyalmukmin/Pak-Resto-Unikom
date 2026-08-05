"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Konfirmasi Pembayaran",
    href: "/dashboard/kasir/konfirmasi-pembayaran",
    icon: "/images/kasir/sidebar/icon-card.png",
  },
  {
    label: "Pesanan Take Away",
    href: "/dashboard/kasir/take-away",
    icon: "/images/kasir/sidebar/icon-takeaway.png",
  },
  {
    label: "Laporan Transaksi",
    href: "/dashboard/kasir/laporan-transaksi",
    icon: "/images/kasir/sidebar/icon-laporan.png",
  },
];

export function KasirSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[240px] min-h-screen bg-[#1E1E2E] border-r border-white/5 shrink-0">
      {/* Logo */}
      <Link href="/dashboard/kasir" className="px-5 pt-7 pb-5 block hover:opacity-80 transition-opacity">
        <h1 className="text-[22px] font-bold leading-tight text-[#22d3ee]">
          Pak Resto
          <br />
          UNIKOM
        </h1>
        <p className="text-xs text-slate-500 mt-1.5">Management System</p>
      </Link>

      <div className="mx-5 border-t border-white/5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#00B954] text-black shadow-lg shadow-[#00B954]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.icon}
                alt=""
                width={17}
                height={17}
                className="shrink-0"
                style={{ filter: isActive ? "brightness(0)" : "brightness(0) invert(1)" }}
              />
              <span className="leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0e7490] flex items-center justify-center text-white text-xs font-bold shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Admin Utama</p>
            <p className="text-[10px] text-[#00B954] font-semibold uppercase tracking-wide">
              Superuser
            </p>
          </div>
          <button className="text-slate-500 hover:text-white transition-colors p-1">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
