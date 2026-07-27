import { UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              <span className="font-bold">Pak Resto Unikom</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Sistem restoran digital untuk lingkungan kampus Universitas Komputer
              Indonesia.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Menu</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Makanan</li>
              <li>Minuman</li>
              <li>Snack</li>
              <li>Paket Hemat</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Layanan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Pemesanan Online</li>
              <li>Reservasi Meja</li>
              <li>Catering Kampus</li>
              <li>Delivery</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Kontak</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Universitas Komputer Indonesia</li>
              <li>Bandung, Jawa Barat</li>
              <li>+62 812-3456-7890</li>
              <li>admin@pakresto.unikom</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Pak Resto Unikom. Dibuat dengan ❤️
            untuk kampus Unikom.
          </p>
        </div>
      </div>
    </footer>
  );
}
