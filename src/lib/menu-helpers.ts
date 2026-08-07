import { prisma } from "@/lib/prisma";

export async function refreshKategoriMenuCount(id_kategori: number) {
  const jumlah_menu = await prisma.menu.count({ where: { id_kategori } });
  await prisma.kategori.update({
    where: { id_kategori },
    data: { jumlah_menu },
  });
}

export const menuAdminInclude = {
  kategori: true,
  menu_bahan: {
    include: {
      bahan_baku: true,
    },
  },
} as const;

export function parsePositiveInt(raw: string | undefined | null): number | null {
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}
