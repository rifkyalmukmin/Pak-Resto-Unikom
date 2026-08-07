import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth, ROLE_VALUES } from "@/lib/api-auth";
import { parseRole, userPublicSelect } from "@/lib/user-helpers";
import { parsePositiveInt } from "@/lib/menu-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_user = parsePositiveInt(id);
    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "ID user tidak valid" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id_user },
      select: userPublicSelect,
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_user = parsePositiveInt(id);
    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "ID user tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id_user } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      nama_lengkap?: string;
      username?: string;
      password?: string;
      role?: string;
    };

    const data: {
      nama_lengkap?: string;
      username?: string;
      password?: string;
      role?: (typeof ROLE_VALUES)[number];
    } = {};

    if (body.nama_lengkap !== undefined) {
      const nama = body.nama_lengkap.trim();
      if (!nama) {
        return NextResponse.json(
          { success: false, error: "nama_lengkap tidak boleh kosong" },
          { status: 400 }
        );
      }
      data.nama_lengkap = nama;
    }

    if (body.username !== undefined) {
      const username = body.username.trim().toLowerCase();
      if (username.length < 3) {
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
      if (username !== existing.username) {
        const taken = await prisma.user.findUnique({ where: { username } });
        if (taken) {
          return NextResponse.json(
            { success: false, error: "Username sudah digunakan" },
            { status: 409 }
          );
        }
      }
      data.username = username;
    }

    if (body.password !== undefined && body.password !== "") {
      if (body.password.length < 6) {
        return NextResponse.json(
          { success: false, error: "password minimal 6 karakter" },
          { status: 400 }
        );
      }
      data.password = await bcrypt.hash(body.password, 10);
    }

    if (body.role !== undefined) {
      const role = parseRole(body.role);
      if (!role) {
        return NextResponse.json(
          { success: false, error: "role tidak valid" },
          { status: 400 }
        );
      }

      // Jangan turunkan role diri sendiri dari MANAJER jika jadi satu-satunya manajer
      if (
        existing.id_user === auth.userId &&
        existing.role === "MANAJER" &&
        role !== "MANAJER"
      ) {
        const manajerCount = await prisma.user.count({ where: { role: "MANAJER" } });
        if (manajerCount <= 1) {
          return NextResponse.json(
            { success: false, error: "Tidak bisa mengubah role manajer terakhir" },
            { status: 400 }
          );
        }
      }
      data.role = role;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada field yang diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id_user },
      data,
      select: userPublicSelect,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_user = parsePositiveInt(id);
    if (!id_user) {
      return NextResponse.json(
        { success: false, error: "ID user tidak valid" },
        { status: 400 }
      );
    }

    if (id_user === auth.userId) {
      return NextResponse.json(
        { success: false, error: "Tidak bisa menghapus akun sendiri" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id_user } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.role === "MANAJER") {
      const manajerCount = await prisma.user.count({ where: { role: "MANAJER" } });
      if (manajerCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Tidak bisa menghapus manajer terakhir" },
          { status: 400 }
        );
      }
    }

    // Cek relasi pesanan/pembayaran — soft-block jika masih punya data
    const [orderCount, paymentCount] = await Promise.all([
      prisma.pesanan.count({ where: { id_user } }),
      prisma.pembayaran.count({ where: { id_user } }),
    ]);
    if (orderCount > 0 || paymentCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User tidak bisa dihapus karena masih terkait pesanan/pembayaran. Nonaktifkan dengan mengganti role jika perlu.",
        },
        { status: 409 }
      );
    }

    await prisma.user.delete({ where: { id_user } });

    return NextResponse.json({ success: true, data: { id_user } });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}
