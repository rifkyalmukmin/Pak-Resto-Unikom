import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Menu Restoran" };

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await prisma.category.findMany({
    include: {
      menuItems: {
        where: { isAvailable: true },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Menu Restoran
        </h1>
        <p className="mt-2 text-muted-foreground">
          Pilih menu favorit Anda dari berbagai kategori
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.id} className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            <Badge variant="secondary">{category.menuItems.length} menu</Badge>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {category.menuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-accent to-muted text-6xl">
                  🍽️
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(item.price)}
                    </span>
                    <Button size="sm">Tambah</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
