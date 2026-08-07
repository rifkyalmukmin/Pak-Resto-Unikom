import type { Role } from "@prisma/client";

export const userPublicSelect = {
  id_user: true,
  nama_lengkap: true,
  username: true,
  role: true,
  foto_profil: true,
} as const;

export const DEFAULT_USER_PHOTO = "/images/manager/user-default.webp";
export const MAX_PROFILE_PHOTO_BYTES = 500 * 1024;

export function userPhotoSrc(foto_profil?: string | null): string {
  return foto_profil || DEFAULT_USER_PHOTO;
}

export async function fileToDataUrl(
  file: File,
  maxBytes = MAX_PROFILE_PHOTO_BYTES
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("File harus berupa gambar (JPG, PNG, WebP)");
  }
  if (file.size > maxBytes) {
    throw new Error(`Ukuran foto maksimal ${Math.round(maxBytes / 1024)}KB`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file foto"));
    reader.readAsDataURL(file);
  });
}

export function parseFotoProfil(
  raw: string | null | undefined
): string | null | undefined {
  if (raw === undefined) return undefined;
  if (raw === null || raw.trim() === "") return null;

  const value = raw.trim();
  if (value.startsWith("/")) {
    if (value.length > 500) {
      throw new Error("Path foto profil tidak valid");
    }
    return value;
  }

  if (!value.startsWith("data:image/")) {
    throw new Error("Format foto profil tidak valid");
  }
  if (value.length > 700_000) {
    throw new Error("Foto profil terlalu besar (maks. 500KB)");
  }

  return value;
}

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
