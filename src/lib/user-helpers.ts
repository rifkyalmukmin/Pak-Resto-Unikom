import type { Role } from "@prisma/client";

export const userPublicSelect = {
  id_user: true,
  nama_lengkap: true,
  username: true,
  role: true,
} as const;

export const ROLE_LABEL: Record<Role, string> = {
  PELAYAN: "Pelayan",
  CHEF: "Koki",
  KASIR: "Kasir",
  MANAJER: "Manager",
};

export const LABEL_TO_ROLE: Record<string, Role> = {
  Pelayan: "PELAYAN",
  Koki: "CHEF",
  Kasir: "KASIR",
  Manager: "MANAJER",
  PELAYAN: "PELAYAN",
  CHEF: "CHEF",
  KASIR: "KASIR",
  MANAJER: "MANAJER",
};

export function parseRole(raw: string | undefined | null): Role | null {
  if (!raw) return null;
  return LABEL_TO_ROLE[raw] ?? null;
}

export function initialsFromName(nama: string): string {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
