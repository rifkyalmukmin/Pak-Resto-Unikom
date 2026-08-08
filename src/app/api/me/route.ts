import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth, STAFF_ROLES } from "@/lib/api-auth";
import { userPublicSelect } from "@/lib/user-helpers";

export async function GET() {
  const auth = await requireAuth(STAFF_ROLES);
  if (isAuthFailure(auth)) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id_user: auth.userId },
    select: userPublicSelect,
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}
