import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth, ROLE_VALUES } from "@/lib/api-auth";
import { parseRole, userPublicSelect } from "@/lib/user-helpers";
import type { Role } from "@prisma/client";

// GET /api/users?role=PELAYAN
export async function GET(request: Request) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const roleRaw = searchParams.get("role");
    let role: Role | undefined;

    if (roleRaw) {
      const parsed = parseRole(roleRaw);
      if (!parsed || !ROLE_VALUES.includes(parsed)) {
        return NextResponse.json(
          { success: false, error: "role tidak valid" },
          { status: 400 }
        );
      }
      role = parsed;
    }

    const users = await prisma.user.findMany({
      where: role ? { role } : undefined,
      select: userPublicSelect,
      orderBy: { nama_lengkap: "asc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: Request) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const body = (await request.json()) as {
      nama_lengkap?: string;
      username?: string;
      password?: string;
      role?: string;
    };

    const nama_lengkap = body.nama_lengkap?.trim();
    const username = body.username?.trim().toLowerCase();
    const password = body.password ?? "";
    const role = parseRole(body.role ?? null);

    if (!nama_lengkap) {
      return NextResponse.json(
        { success: false, error: "nama_lengkap wajib diisi" },
        { status: 400 }
      );
    }
    if (!username || username.length < 3) {
      return NextResponse.json(
        { success: false, error: "username minimal 3 karakter" },
        { status: 400 }
      );
    }
    if (!/^[a-z0-9._-]+$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          error: "username hanya boleh huruf kecil, angka, titik, underscore, atau strip",
        },
        { status: 400 }
      );
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "password minimal 6 karakter" },
        { status: 400 }
      );
    }
    if (!role) {
      return NextResponse.json(
        { success: false, error: "role wajib diisi (PELAYAN|CHEF|KASIR|MANAJER)" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username sudah digunakan" },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        nama_lengkap,
        username,
        password: hash,
        role,
      },
      select: userPublicSelect,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah user" },
      { status: 500 }
    );
  }
}
