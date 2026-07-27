import Link from "next/link";
import { UtensilsCrossed, Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <Link href="/" className="text-xl font-bold">
            Pak Resto Unikom
          </Link>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/menu" className="text-sm font-medium hover:text-primary">
            Menu
          </Link>
          <Link href="/order" className="text-sm font-medium hover:text-primary">
            Pesan
          </Link>
          <Link href="/tables" className="text-sm font-medium hover:text-primary">
            Meja
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            Tentang
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart" aria-label="Keranjang">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Daftar</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
