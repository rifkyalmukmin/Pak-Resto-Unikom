import { CartProvider } from "@/lib/cart-context";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pesan - Pak Resto UNIKOM",
  description: "Pesan makanan dan minuman dari Pak Resto UNIKOM",
};

export default function PesanLayout({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
