"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/auth-routes";
import type { Role } from "@prisma/client";
import type { LucideIcon } from "lucide-react";

const ACCENT = "#D0BCFF";

const navItems: { label: string; href: string; img?: string; Icon?: LucideIcon }[] = [
  { label: "Beranda",               href: "/dashboard/manager/dashboard",            img: "/images/manager/dashboard.png" },
  { label: "Laporan Keuangan",      href: "/dashboard/manager/financial-reports",    img: "/images/manager/financial.png" },
  { label: "Analisis Tren",         href: "/dashboard/manager/trend-analysis",       img: "/images/manager/trend.png" },
  { label: "Manajemen Kategori",    href: "/dashboard/manager/kategori-management",  Icon: Tag },
  { label: "Manajemen Menu",        href: "/dashboard/manager/menu-management",      img: "/images/manager/menu-management.png" },
  { label: "Manajemen Pengguna",    href: "/dashboard/manager/user-management",      img: "/images/manager/user-management.png" },
];

export function ManagerSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showLogout, setShowLogout] = useState(false);
  const role = session?.user?.role as Role | undefined;

  const content = (
    <>
      {/* Logo */}
      <Link href="/dashboard/manager" onClick={onClose} className="px-5 pt-7 pb-5 block hover:opacity-80 transition-opacity">
        <h1 className="text-[22px] font-bold leading-tight" style={{ color: ACCENT }}>
          Pak Resto
          <br />
          UNIKOM
        </h1>
        <p className="text-xs text-slate-500 mt-1.5">Management Portal</p>
      </Link>

      <div className="mx-5 border-t border-white/5" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2.5">
        {navItems.map(({ label, href, img, Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive ? "text-black" : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
              style={isActive ? { backgroundColor: ACCENT, boxShadow: `0 4px 14px ${ACCENT}40` } : undefined}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt="" width={17} height={17} className="shrink-0"
                  style={{ filter: isActive ? "brightness(0)" : "brightness(0) invert(1) opacity(0.5)" }} />
              ) : Icon ? (
                <Icon size={17} className="shrink-0" style={{ opacity: isActive ? 1 : 0.5 }} />
              ) : null}
              <span className="leading-tight">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-sm font-bold text-black" style={{ backgroundColor: ACCENT }}>
            {session?.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.foto_profil} alt="" className="w-full h-full object-cover" />
            ) : (
              (session?.user?.name ?? "S").charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">
              {session?.user?.name ?? "Staff"}
            </p>
            <span
              className="inline-block mt-0.5 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT }}
            >
              {role ? ROLE_LABEL[role] : "Manajer"}
            </span>
          </div>
          <button onClick={() => setShowLogout(true)} className="text-slate-500 hover:text-white transition-colors p-1 shrink-0">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {showLogout && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-[360px] mx-4 rounded-2xl border border-white/10 bg-[#1E2235] p-8 flex flex-col items-center text-center space-y-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(208,188,255,0.15)" }}>
              <LogOut size={26} style={{ color: ACCENT }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">Keluar dari Sistem?</h3>
              <p className="text-slate-400 text-sm">Anda akan keluar dari sesi manager ini.</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => void signOut({ callbackUrl: "/login" })}
                className="flex-1 py-2.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] min-h-screen bg-[#151C25] border-r border-white/5 shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-[270px] max-w-[85vw] bg-[#151C25] flex flex-col overflow-y-auto shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
