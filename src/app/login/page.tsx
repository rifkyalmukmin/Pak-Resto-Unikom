"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const ROLES = [
  {
    title: "Pelayan",
    subtitle: "Order & Layanan",
    icon: "/images/role-selection/icon-waiter.svg",
    href: "/dashboard/pelayan",
    iconClass: "h-7 w-5",
  },
  {
    title: "Koki",
    subtitle: "Manajemen Dapur",
    icon: "/images/role-selection/icon-chef.svg",
    href: "/dashboard/koki",
    iconClass: "h-6 w-7",
  },
  {
    title: "Kasir",
    subtitle: "Transaksi & Billing",
    icon: "/images/role-selection/icon-cashier.svg",
    href: "/dashboard/kasir",
    iconClass: "h-6 w-7",
  },
  {
    title: "Manajer",
    subtitle: "Laporan & Staf",
    icon: "/images/role-selection/icon-manager.svg",
    href: "/dashboard/manager",
    iconClass: "h-7 w-6",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // TODO: connect to auth API
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 800);
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#FAF9F6" }}>
      {/* Header */}
      <div className="pt-12 pb-6 text-center">
        <h1
          className="text-3xl font-bold leading-tight"
          style={{ fontFamily: "var(--font-playfair)", color: "#9D4300" }}
        >
          Pak Resto UNIKOM
        </h1>
        <p className="text-xs font-bold tracking-[0.2em] text-stone-400 mt-1 uppercase">
          Management Portal
        </p>
      </div>

      {/* Login Card */}
      <div className="mx-auto w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 px-8 py-8">
          <h2 className="text-xl font-bold text-stone-900 mb-1">Masuk</h2>
          <p className="text-stone-400 text-sm mb-7">
            Masukkan kredensial akun Anda untuk melanjutkan.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                Email / Username
              </label>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
                <div className="px-3 py-3 border-r border-stone-200">
                  <Mail size={15} className="text-stone-400" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="nama.karyawan@unikom.ac.id"
                  className="flex-1 px-3 py-3 text-sm text-stone-700 placeholder-stone-300 bg-transparent focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                Kata Sandi
              </label>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
                <div className="px-3 py-3 border-r border-stone-200">
                  <Lock size={15} className="text-stone-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 px-3 py-3 text-sm text-stone-700 placeholder-stone-300 bg-transparent focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="px-3 py-3 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-white font-bold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: "#F97316" }}
            >
              {loading ? "Memproses..." : "Masuk ke Portal"}
            </button>
          </form>

        </div>

        {/* Quick Login */}
        <div className="mt-8 mb-10">
          <p className="text-center text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-4">
            Login Cepat
          </p>
          <div className="grid grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.title}
                onClick={() => router.push(role.href)}
                className="flex flex-col items-center gap-2 bg-white border border-stone-100 rounded-2xl py-4 px-2 hover:border-orange-200 hover:shadow-sm transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                  style={{ backgroundColor: "#FFF3EC" }}
                >
                  <Image
                    src={role.icon}
                    alt={role.title}
                    width={22}
                    height={22}
                    className={role.iconClass + " object-contain"}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-stone-700 group-hover:text-orange-600 transition-colors leading-tight">
                    {role.title}
                  </p>
                  <p className="text-[9px] text-stone-400 leading-tight mt-0.5">
                    {role.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
