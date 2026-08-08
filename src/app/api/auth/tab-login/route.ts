import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const getSecret = () => new TextEncoder().encode(process.env.AUTH_SECRET!);

// POST /api/auth/tab-login — returns a tab-scoped JWT (stored in sessionStorage, not cookie)
export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      return NextResponse.json({ error: "Credentials required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({
      userId: user.id_user,
      role: user.role,
      name: user.nama_lengkap,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("12h")
      .sign(getSecret());

    return NextResponse.json({
      token,
      role: user.role,
      name: user.nama_lengkap,
      userId: user.id_user,
    });
  } catch (error) {
    console.error("POST /api/auth/tab-login error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
