import type { StatusBahan } from "@prisma/client";

/** Threshold: jumlah > 0 dan < MENIPIS_THRESHOLD → MENIPIS */
const MENIPIS_THRESHOLD = 10;

export function computeStatusBahan(jumlah: number): StatusBahan {
  if (jumlah <= 0) return "HABIS";
  if (jumlah < MENIPIS_THRESHOLD) return "MENIPIS";
  return "TERSEDIA";
}

/** Label UI (mock pages memakai "HAMPIR HABIS") */
export function statusBahanLabel(status: StatusBahan): string {
  if (status === "MENIPIS") return "HAMPIR HABIS";
  return status;
}

export function parseStatusBahanFilter(
  raw: string | null
): StatusBahan | undefined {
  if (!raw) return undefined;
  if (raw === "HAMPIR HABIS" || raw === "MENIPIS") return "MENIPIS";
  if (raw === "TERSEDIA" || raw === "HABIS") return raw;
  return undefined;
}
