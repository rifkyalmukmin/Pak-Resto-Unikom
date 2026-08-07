import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";

export const STAFF_ROLES: Role[] = ["PELAYAN", "CHEF", "KASIR", "MANAJER"];

export const ROLE_VALUES: Role[] = ["PELAYAN", "CHEF", "KASIR", "MANAJER"];

type AuthSuccess = {
  session: Session;
  userId: number;
  role: Role;
};

type AuthFailure = {
  error: NextResponse;
};

export async function requireAuth(
  allowedRoles?: Role[]
): Promise<AuthSuccess | AuthFailure> {
  const session = await auth();

  if (!session?.user?.id || !session.user.role) {
    return {
      error: NextResponse.json(
        { success: false, error: "Autentikasi diperlukan" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      error: NextResponse.json(
        { success: false, error: "Akses ditolak untuk role ini" },
        { status: 403 }
      ),
    };
  }

  return {
    session,
    userId: Number(session.user.id),
    role: session.user.role,
  };
}

export function isAuthFailure(
  result: AuthSuccess | AuthFailure
): result is AuthFailure {
  return "error" in result;
}
