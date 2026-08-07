import type { Role, StatusPesanan, TipePesanan } from "@prisma/client";

const STATUS_FLOW: Record<StatusPesanan, StatusPesanan[]> = {
  MENUNGGU: ["DIPROSES", "DIBATALKAN"],
  DIPROSES: ["SIAP", "DIBATALKAN"],
  SIAP: ["DIANTAR", "SELESAI", "DIBATALKAN"],
  DIANTAR: ["SELESAI", "DIBATALKAN"],
  SELESAI: [],
  DIBATALKAN: [],
};

const TRANSITION_ROLES: Partial<Record<`${StatusPesanan}->${StatusPesanan}`, Role[]>> = {
  "MENUNGGU->DIPROSES": ["CHEF", "MANAJER"],
  "DIPROSES->SIAP": ["CHEF", "MANAJER"],
  "SIAP->DIANTAR": ["PELAYAN", "MANAJER"],
  "SIAP->SELESAI": ["PELAYAN", "KASIR", "MANAJER"],
  "DIANTAR->SELESAI": ["PELAYAN", "MANAJER"],
  "MENUNGGU->DIBATALKAN": ["PELAYAN", "KASIR", "MANAJER"],
  "DIPROSES->DIBATALKAN": ["PELAYAN", "KASIR", "MANAJER"],
  "SIAP->DIBATALKAN": ["PELAYAN", "KASIR", "MANAJER"],
  "DIANTAR->DIBATALKAN": ["PELAYAN", "KASIR", "MANAJER"],
};

export function canTransitionStatus(
  current: StatusPesanan,
  next: StatusPesanan,
  tipe: TipePesanan,
  role: Role
): string | null {
  if (current === next) return "Status pesanan sudah sama";

  const allowedNext = STATUS_FLOW[current];
  if (!allowedNext.includes(next)) {
    return `Tidak bisa mengubah status dari ${current} ke ${next}`;
  }

  if (next === "DIANTAR" && tipe === "TAKEAWAY") {
    return "Pesanan takeaway tidak melalui status DIANTAR";
  }

  const key = `${current}->${next}` as `${StatusPesanan}->${StatusPesanan}`;
  const allowedRoles = TRANSITION_ROLES[key];
  if (!allowedRoles?.includes(role)) {
    return `Role ${role} tidak boleh mengubah status dari ${current} ke ${next}`;
  }

  return null;
}

export const PAYABLE_ORDER_STATUSES: StatusPesanan[] = [
  "SIAP",
  "DIANTAR",
  "SELESAI",
];
