"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@prisma/client";

interface TabRoleGuardProps {
  requiredRole: Role;
  children: React.ReactNode;
}

// Guards a dashboard to the expected role stored in this tab's sessionStorage.
// Allows through if no tab-session exists yet (cookie-only auth, legacy flow).
export function TabRoleGuard({ requiredRole, children }: TabRoleGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const tabRole = sessionStorage.getItem("tab-role");

    if (!tabRole) {
      // No tab session — allow through (cookie session handles auth via middleware)
      setAllowed(true);
      return;
    }

    if (tabRole === requiredRole) {
      setAllowed(true);
    } else {
      // Wrong role for this tab — redirect to the correct dashboard for this tab
      const dashboardMap: Record<string, string> = {
        PELAYAN: "/dashboard/pelayan",
        CHEF: "/dashboard/koki",
        KASIR: "/dashboard/kasir",
        MANAJER: "/dashboard/manager",
      };
      const target = dashboardMap[tabRole] ?? "/login";
      router.replace(target);
    }
  }, [requiredRole, router]);

  if (allowed === null) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
