import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Pak Resto Unikom - Sistem Restoran Digital",
    template: "%s | Pak Resto Unikom",
  },
  description:
    "Sistem restoran digital untuk lingkungan kampus Universitas Komputer Indonesia. Pemesanan online, manajemen menu, dan layanan pelanggan.",
  keywords: ["restoran", "unikom", "pemesanan", "kampus", "bandung"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
