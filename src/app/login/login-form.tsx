"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import type { Role } from "@prisma/client";
import { getDashboardPath, QUICK_LOGIN_USERS } from "@/lib/auth-routes";

const ROLES = [
  {
    title: "Pelayan",
    subtitle: "Order & Layanan",
    icon: "/images/role-selection/icon-waiter.svg",
    iconClass: "h-7 w-5",
  },
  {
    title: "Koki",
    subtitle: "Manajemen Dapur",
    icon: "/images/role-selection/icon-chef.svg",
    iconClass: "h-6 w-7",
  },
  {
    title: "Kasir",
    subtitle: "Transaksi & Billing",
    icon: "/images/role-selection/icon-cashier.svg",
    iconClass: "h-6 w-7",
  },
  {
    title: "Manajer",
    subtitle: "Laporan & Staf",
    icon: "/images/role-selection/icon-manager.svg",
    iconClass: "h-7 w-6",
  },
];

const DEMO_PASSWORD = "password123";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function performLogin(loginUsername: string, loginPassword: string) {
    setError("");
    setLoading(true);

    // NextAuth login (sets shared cookie for middleware auth check)
    const result = await signIn("credentials", {
      username: loginUsername,
      password: loginPassword,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Username atau kata sandi salah.");
      return;
    }

    // Tab-specific JWT stored in sessionStorage — isolates role per browser tab
    try {
      const tabRes = await fetch("/api/auth/tab-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      });
      const tabData = (await tabRes.json()) as {
        token?: string;
        role?: string;
        name?: string;
        userId?: number;
      };
      if (tabData.token) {
        sessionStorage.setItem("tab-session", tabData.token);
        sessionStorage.setItem("tab-role", tabData.role ?? "");
        sessionStorage.setItem("tab-name", tabData.name ?? "");
      }
    } catch {
      // Tab session failed — will fall back to cookie auth for API calls
    }

    const updatedSession = await getSession();
    const role = (updatedSession?.user?.role ?? sessionStorage.getItem("tab-role")) as Role | null;

    setLoading(false);

    if (!role) {
      setError("Gagal memuat sesi. Silakan coba lagi.");
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl");
    const destination =
      callbackUrl && callbackUrl.startsWith("/dashboard")
        ? callbackUrl
        : getDashboardPath(role);

    router.push(destination);
    router.refresh();
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    void performLogin(username.trim(), password);
  }

  function handleQuickLogin(roleTitle: string) {
    const quickUsername = QUICK_LOGIN_USERS[roleTitle];
    if (!quickUsername) return;
    setUsername(quickUsername);
    setPassword(DEMO_PASSWORD);
    void performLogin(quickUsername, DEMO_PASSWORD);
  }

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: "#FAF9F6" }}>
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

      <div className="mx-auto w-full max-w-lg px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 px-5 sm:px-8 py-8">
          <h2 className="text-xl font-bold text-stone-900 mb-1">Masuk</h2>
          <p className="text-stone-400 text-sm mb-7">
            Masukkan kredensial akun Anda untuk melanjutkan.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 mb-1.5 uppercase tracking-wide">
                Username
              </label>
              <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden focus-within:border-orange-400 transition-colors">
                <div className="px-3 py-3 border-r border-stone-200">
                  <User size={15} className="text-stone-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="pelayan"
                  autoComplete="username"
                  className="flex-1 px-3 py-3 text-sm text-stone-700 placeholder-stone-300 bg-transparent focus:outline-none"
                  required
                />
              </div>
            </div>

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
                  autoComplete="current-password"
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

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

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

        <div className="mt-8 mb-10">
          <p className="text-center text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-4">
            Login Cepat
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <button
                key={role.title}
                type="button"
                disabled={loading}
                onClick={() => handleQuickLogin(role.title)}
                className="flex flex-col items-center gap-2 bg-white border border-stone-100 rounded-2xl py-4 px-2 hover:border-orange-200 hover:shadow-sm transition-all group disabled:opacity-60"
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
