import Link from "next/link";
import { RoleCard } from "@/components/role/role-card";

export default function RoleSelectionPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#faf9f6]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#f8f9ff]/90 px-10 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] backdrop-blur-[6px]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-2xl font-bold leading-8 text-[#9d4300]"
            aria-label="Pak Resto UNIKOM - Beranda"
          >
            Pak Resto UNIKOM
          </Link>
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="flex size-[19px] items-center justify-center"
              aria-label="Bantuan"
            >
              <img
                src="/images/role-selection/icon-help.svg"
                alt=""
                className="size-full"
              />
            </button>
            <div className="size-8 overflow-hidden rounded-full border-2 border-[#ffdbca]/30 bg-[#e5eeff] p-0.5">
              <img
                src="/images/role-selection/avatar.jpg"
                alt="Profil pengguna"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 pb-[117.5px] pt-[197.5px]">
        <div className="mx-auto flex w-full max-w-[896px] flex-col gap-12">
          <div className="flex w-full flex-col items-center gap-1 text-center">
            <h1 className="font-[family-name:var(--font-playfair)] text-[48px] font-bold leading-[56px] tracking-[-0.96px] text-[#9d4300]">
              Pilih Peran Anda
            </h1>
            <div className="max-w-[512px] text-center text-lg font-normal leading-7 text-[#5c5f60]">
              <p>Silakan pilih akses ruang kerja Anda untuk memulai</p>
              <p>manajemen operasional restoran hari ini.</p>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-12 py-6 sm:grid-cols-2 lg:grid-cols-4">
            <RoleCard
              title="Pelayan"
              subtitleLines={["Order &", "Layanan"]}
              href="/dashboard/pelayan"
              iconSrc="/images/role-selection/icon-waiter.svg"
              iconAlt="Ikon pelayan"
              iconClassName="h-[29.25px] w-[21px] object-contain"
            />
            <RoleCard
              title="Koki"
              subtitleLines={["Manajemen", "Dapur"]}
              href="/dashboard/koki"
              iconSrc="/images/role-selection/icon-chef.svg"
              iconAlt="Ikon koki"
              iconClassName="h-6 w-[30.35px] object-contain"
            />
            <RoleCard
              title="Kasir"
              subtitleLines={["Transaksi", "& Billing"]}
              href="/dashboard/kasir"
              iconSrc="/images/role-selection/icon-cashier.svg"
              iconAlt="Ikon kasir"
              iconClassName="h-[22.04px] w-[30.46px] object-contain"
            />
            <RoleCard
              title="Manajer"
              subtitleLines={["Laporan", "& Staf"]}
              href="/dashboard/manager"
              iconSrc="/images/role-selection/icon-manager.svg"
              iconAlt="Ikon manajer"
              iconClassName="h-[28.44px] w-[25.5px] object-contain"
            />
          </div>

          <div className="w-full pt-6 text-center opacity-70">
            <p className="text-sm font-semibold leading-5 tracking-[0.7px] text-[#5c5f60]">
              Butuh bantuan? Hubungi admin IT UNIKOM.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#e0c0b1] bg-[#d9e3f4] px-10 pb-6 pt-[25px]">
        <div className="mx-auto max-w-[1200px]">
          <div className="flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
            <p className="text-sm font-semibold leading-5 tracking-[0.7px] text-[#584237]">
              © 2024 Pak Resto UNIKOM. Effortless Elegance in Dining.
            </p>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm font-semibold leading-5 tracking-[0.7px] text-[#584237] transition-colors hover:text-[#9d4300]"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm font-semibold leading-5 tracking-[0.7px] text-[#584237] transition-colors hover:text-[#9d4300]"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm font-semibold leading-5 tracking-[0.7px] text-[#584237] transition-colors hover:text-[#9d4300]"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
