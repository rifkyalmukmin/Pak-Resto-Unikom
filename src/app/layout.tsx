import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/styles/globals.css";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

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
      <body className={`${inter.className} ${playfair.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
