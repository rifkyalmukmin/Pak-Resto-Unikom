import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { jwtVerify } from "jose";
import type { Session } from "next-auth";
import type { Role } from "@prisma/client";

export const STAFF_ROLES: Role[] = ["PELAYAN", "CHEF", "KASIR", "MANAJER"];

export const ROLE_VALUES: Role[] = ["PELAYAN", "CHEF", "KASIR", "MANAJER"];

type AuthSuccess = {
  session: Session | null;
  userId: number;
  role: Role;
};

type AuthFailure = {
  error: NextResponse;
};

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET!);

export async function requireAuth(
  allowedRoles?: Role[]
): Promise<AuthSuccess | AuthFailure> {
  // Check tab-specific Bearer token first (supports multi-tab multi-role)
  const headersList = await headers();
  const authHeader = headersList.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const { payload } = await jwtVerify(token, getSecret());
      const role = payload.role as Role;
      const userId = payload.userId as number;

      if (allowedRoles && !allowedRoles.includes(role)) {
        return {
          error: NextResponse.json(
            { success: false, error: "Akses ditolak untuk role ini" },
            { status: 403 }
          ),
        };
      }

      return { session: null, userId, role };
    } catch {
      // Invalid bearer token — fall through to cookie session
    }
  }

  // Fall back to cookie-based NextAuth session
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
