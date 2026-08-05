"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, History } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENT = "#F59E0B";

const navItems = [
  { label: "Pesanan Aktif",   href: "/dashboard/koki/pesanan-aktif",   imgSrc: "/images/koki/pesanan-aktif.png" },
  { label: "Inventaris Stok", href: "/dashboard/koki/inventaris-stok", imgSrc: "/images/koki/inventaris-stok.png" },
  { label: "Riwayat Pesanan", href: "/dashboard/koki/riwayat-pesanan", imgSrc: null },
];

export function KokiSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[240px] min-h-screen bg-[#1E1E2E] border-r border-white/5 shrink-0">
      {/* Logo */}
      <Link href="/dashboard/koki" className="px-5 pt-7 pb-5 block hover:opacity-80 transition-opacity">
        <h1 className="text-[22px] font-bold leading-tight" style={{ color: ACCENT }}>
          Pak Resto
          <br />
          UNIKOM
        </h1>
        <p className="text-xs text-slate-500 mt-1.5">Management System</p>
      </Link>

      <div className="mx-5 border-t border-white/5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2.5">
        {navItems.map(({ label, href, imgSrc }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive ? "text-black" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={
                isActive
                  ? { backgroundColor: ACCENT, boxShadow: `0 4px 14px ${ACCENT}40` }
                  : undefined
              }
            >
              {imgSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgSrc}
                  alt=""
                  width={17}
                  height={17}
                  className="shrink-0"
                  style={{ filter: isActive ? "brightness(0)" : "brightness(0) invert(1) opacity(0.5)" }}
                />
              ) : (
                <History size={17} className="shrink-0" />
              )}
              <span className="leading-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: `${ACCENT}28`, color: ACCENT }}
          >
            J
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Chef Jatmiko</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: ACCENT }}>
              Head of Station
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
