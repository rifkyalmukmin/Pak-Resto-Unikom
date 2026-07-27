import Link from "next/link";
import { ArrowRight, UtensilsCrossed, ShoppingCart, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: ShoppingCart,
    title: "Pemesanan Digital",
    description: "Pesan menu favorit Anda dengan mudah melalui sistem digital yang cepat dan praktis.",
  },
  {
    icon: UtensilsCrossed,
    title: "Manajemen Menu",
    description: "Kelola menu restoran dengan kategori yang terorganisir dan update real-time.",
  },
  {
    icon: Clock,
    title: "Reservasi Meja",
    description: "Reservasi meja makan sebelumnya untuk menghindari antrean di jam sibuk.",
  },
  {
    icon: Star,
    title: "Layanan Pelanggan",
    description: "Sistem rating dan feedback untuk meningkatkan kualitas layanan restoran.",
  },
];

const popularMenus = [
  { name: "Nasi Goreng Spesial", price: 25000, category: "Makanan", emoji: "🍛" },
  { name: "Ayam Geprek", price: 28000, category: "Makanan", emoji: "🍗" },
  { name: "Es Teh Manis", price: 5000, category: "Minuman", emoji: "🧋" },
  { name: "Pisang Goreng", price: 12000, category: "Snack", emoji: "🍌" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              🎓 Kampus Universitas Komputer Indonesia
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Sistem Restoran Digital{" "}
              <span className="text-primary">Pak Resto Unikom</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Solusi digital untuk pengelolaan restoran kampus — pemesanan online,
              manajemen menu, dan layanan pelanggan dalam satu platform.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/menu">
                  Lihat Menu <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/order">Pesan Sekarang</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-16 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Fitur Unggulan
          </h2>
          <p className="mt-4 text-muted-foreground">
            Semua yang Anda butuhkan untuk pengelolaan restoran modern
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Popular Menu Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Menu Populer
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pilihan favorit para mahasiswa dan dosen Unikom
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularMenus.map((menu) => (
              <Card key={menu.name} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-accent to-muted text-6xl">
                  {menu.emoji}
                </div>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {menu.category}
                  </Badge>
                  <CardTitle className="text-lg">{menu.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      Rp {menu.price.toLocaleString("id-ID")}
                    </span>
                    <Button size="sm">Pesan</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/menu">
                Lihat Semua Menu <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16 md:py-24">
        <div className="rounded-2xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Siap Memulai?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Bergabunglah dengan Pak Resto Unikom dan nikmati pengalaman pemesanan
            restoran yang modern dan efisien.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
