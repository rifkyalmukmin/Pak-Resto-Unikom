import type { Role } from "@prisma/client";

export const ROLE_DASHBOARD: Record<Role, string> = {
  PELAYAN: "/dashboard/pelayan",
  CHEF: "/dashboard/koki",
  KASIR: "/dashboard/kasir",
  MANAJER: "/dashboard/manager",
};

const DASHBOARD_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard/pelayan", role: "PELAYAN" },
  { prefix: "/dashboard/koki", role: "CHEF" },
  { prefix: "/dashboard/kasir", role: "KASIR" },
  { prefix: "/dashboard/manager", role: "MANAJER" },
];

export function getDashboardPath(role: Role): string {
  return ROLE_DASHBOARD[role];
}

export function getRoleForDashboardPath(pathname: string): Role | null {
  const match = DASHBOARD_PREFIXES.find(({ prefix }) => pathname.startsWith(prefix));
  return match?.role ?? null;
}

export const ROLE_LABEL: Record<Role, string> = {
  PELAYAN: "Pelayan",
  CHEF: "Koki",
  KASIR: "Kasir",
  MANAJER: "Manajer",
};

export const QUICK_LOGIN_USERS: Record<string, string> = {
  Pelayan: "pelayan",
  Koki: "chef",
  Kasir: "kasir",
  Manajer: "manajer",
};
