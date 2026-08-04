"use client";

interface OrderItem {
  name: string;
  qty: number;
}

interface Order {
  meja: string;
  location: string;
  timeAgo: string;
  items: OrderItem[];
}

const orders: Order[] = [
  {
    meja: "MEJA 08",
    location: "Area Teras",
    timeAgo: "2m ago",
    items: [
      { name: "Ayam Bakar Madu", qty: 2 },
      { name: "Es Teh Leci", qty: 1 },
    ],
  },
  {
    meja: "MEJA 12",
    location: "V.I.P Room",
    timeAgo: "5m ago",
    items: [
      { name: "Wagyu Steak Medium", qty: 1 },
      { name: "Red Wine Glass", qty: 1 },
    ],
  },
  {
    meja: "MEJA 02",
    location: "Main Hall",
    timeAgo: "Just now",
    items: [{ name: "Nasi Goreng Spesial", qty: 3 }],
  },
];

const activities = [
  {
    icon: "/images/pelayan/konten/double-check.png",
    circleBg: "#0D2B22",
    iconFilter: "brightness(0) saturate(100%) invert(62%) sepia(60%) saturate(500%) hue-rotate(110deg) brightness(95%)",
    label: "Meja 05 telah Selesai",
    time: "10 menit yang lalu",
  },
  {
    icon: "/images/pelayan/konten/pembayaran-berhasil.png",
    circleBg: "#0D2535",
    iconFilter: "brightness(0) saturate(100%) invert(70%) sepia(80%) saturate(500%) hue-rotate(160deg) brightness(100%)",
    label: "Pembayaran Berhasil: Meja 07",
    time: "15 menit yang lalu",
  },
  {
    icon: "/images/pelayan/konten/stok-habis.png",
    circleBg: "#2E0D0D",
    iconFilter: "brightness(0) saturate(100%) invert(55%) sepia(60%) saturate(700%) hue-rotate(310deg) brightness(110%)",
    label: 'Stok "Es Teh" Habis',
    time: "32 menit yang lalu",
  },
];

export default function WaiterBerandaPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white">Selamat Datang Kembali</h1>
        <p className="text-slate-400 mt-1.5 text-sm leading-relaxed">
          Lantai restoran sedang sibuk. Ada 5 pesanan siap untuk
          <br />
          segera diantarkan ke pelanggan.
        </p>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-[1fr_320px] gap-5 items-start">
        {/* Left — Pesanan Siap Diantar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pelayan/konten/pesanan-siap-diantar.png"
                alt=""
                width={18}
                height={18}
                style={{ filter: "invert(56%) sepia(72%) saturate(400%) hue-rotate(110deg) brightness(95%)" }}
              />
              <h2 className="text-white font-bold text-base">Pesanan Siap Diantar</h2>
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-[11px] font-bold tracking-wider uppercase">
                Real-Time Kitchen Feed
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {orders.map((order, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 p-4 flex flex-col gap-3"
                style={{ backgroundColor: "#1E1E2E" }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md"
                    style={{ backgroundColor: "#10B981", color: "#000" }}
                  >
                    {order.meja}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/pelayan/konten/waktu.png" alt="" width={13} height={13} style={{ filter: "brightness(0) invert(0.4)" }} />
                    <span>{order.timeAgo}</span>
                  </div>
                </div>

                {/* Location */}
                <p className="text-white font-bold text-lg leading-tight">{order.location}</p>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm">
                        {item.qty}x {item.name}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/pelayan/konten/ceklis.png"
                        alt=""
                        width={16}
                        height={16}
                        style={{ filter: "invert(56%) sepia(72%) saturate(400%) hue-rotate(110deg) brightness(95%)" }}
                      />
                    </div>
                  ))}
                </div>

                {/* Button */}
                <button
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 mt-1"
                  style={{ backgroundColor: "#10B981", color: "#000" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/pelayan/konten/ambil-pesanan.png" alt="" width={15} height={15} style={{ filter: "brightness(0)" }} />
                  Ambil Pesanan
                </button>
              </div>
            ))}

            {/* Empty state card */}
            <div
              className="rounded-xl border border-white/5 p-4 flex flex-col items-center justify-center gap-2 min-h-[180px]"
              style={{ backgroundColor: "#1E1E2E" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/pelayan/konten/menunggu-pesanan.png" alt="" width={36} height={36} style={{ filter: "brightness(0) invert(0.4)" }} />
              <p className="text-slate-500 text-sm">Menunggu pesanan lain...</p>
            </div>
          </div>
        </div>

        {/* Right — Stats & Activity */}
        <div className="flex flex-col gap-4">
          {/* Kinerja Anda */}
          <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: "#1E1E2E" }}>
            <h3 className="text-white font-bold text-base mb-4">Kinerja Anda</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm">Pesanan Diantar</span>
              <span className="text-white font-bold text-xl">24</span>
            </div>
            <div className="w-full h-2 bg-[#2a2a3e] rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: "#10B981" }} />
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Anda 15% lebih cepat hari ini dibanding kemarin.
            </p>
          </div>

          {/* Aktivitas Terakhir */}
          <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: "#1E1E2E" }}>
            <h3 className="text-white font-bold text-base mb-4">Aktivitas Terakhir</h3>
            <div className="space-y-3.5">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: act.circleBg }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.icon}
                      alt=""
                      width={15}
                      height={15}
                      style={{ filter: act.iconFilter }}
                    />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold leading-tight">{act.label}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Butuh bantuan Manager */}
          <div
            className="rounded-xl border border-white/5 p-5 flex items-start justify-between gap-3"
            style={{ backgroundColor: "#1E1E2E" }}
          >
            <div className="flex-1">
              <p className="text-white font-semibold text-sm mb-3">Butuh bantuan Manager?</p>
              <button className="border border-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/5 transition-colors tracking-wider">
                PANGGIL SEKARANG
              </button>
            </div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
              style={{ backgroundColor: "#2a2a3e" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pelayan/konten/butuh-bantuan-manajer.png"
                alt=""
                width={22}
                height={22}
                style={{ filter: "brightness(0) invert(0.5)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
