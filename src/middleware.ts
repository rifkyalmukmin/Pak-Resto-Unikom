import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getDashboardPath, getRoleForDashboardPath } from "@/lib/auth-routes";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/dashboard")) {
    if (!session?.user?.role) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const requiredRole = getRoleForDashboardPath(pathname);
    if (requiredRole && session.user.role !== requiredRole) {
      return NextResponse.redirect(
        new URL(getDashboardPath(session.user.role as Role), req.url)
      );
    }
  }

  if (pathname === "/login" && session?.user?.role) {
    return NextResponse.redirect(
      new URL(getDashboardPath(session.user.role as Role), req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
