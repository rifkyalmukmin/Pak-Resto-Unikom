"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/dashboard/pelayan", icon: "/images/pelayan/sidebar/home.png", exact: true },
  { label: "Informasi Meja", href: "/dashboard/pelayan/informasi-meja", icon: "/images/pelayan/sidebar/informasi-meja.png" },
  { label: "Pemesanan Makanan", href: "/dashboard/pelayan/pemesanan", icon: "/images/pelayan/sidebar/pemesanan-makanan.png" },
  { label: "Stok Bahan Baku", href: "/dashboard/pelayan/stok", icon: "/images/pelayan/sidebar/stok-bahan-baku.png" },
  { label: "Menu", href: "/dashboard/pelayan/menu", icon: "/images/pelayan/sidebar/menu.png" },
];

export function PelayanSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[240px] min-h-screen bg-[#1E1E2E] border-r border-white/5 shrink-0">
      {/* Logo */}
      <Link href="/dashboard/pelayan" className="px-5 pt-7 pb-5 block hover:opacity-80 transition-opacity">
        <h1 className="text-[22px] font-bold leading-tight text-[#10B981]">
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
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#10B981] text-black shadow-lg shadow-[#10B981]/20"
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
          <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/manager/user-default.webp" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">Budi Santoso</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#10B981" }}>
              Pelayan
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
