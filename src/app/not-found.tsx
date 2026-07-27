import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 text-muted-foreground">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Kembali ke Beranda</Link>
      </Button>
    </div>
  );
}
