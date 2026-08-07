import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMenu } from "@prisma/client";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import {
  menuAdminInclude,
  parsePositiveInt,
  refreshKategoriMenuCount,
} from "@/lib/menu-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const id_menu = parsePositiveInt(id);
    if (!id_menu) {
      return NextResponse.json(
        { success: false, error: "ID menu tidak valid" },
        { status: 400 }
      );
    }

    const item = await prisma.menu.findUnique({
      where: { id_menu },
      include: menuAdminInclude,
    });
    if (!item) {
      return NextResponse.json(
        { success: false, error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data menu" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_menu = parsePositiveInt(id);
    if (!id_menu) {
      return NextResponse.json(
        { success: false, error: "ID menu tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.menu.findUnique({ where: { id_menu } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      nama_menu?: string;
      id_kategori?: number;
      harga?: number;
      deskripsi?: string | null;
      status?: StatusMenu;
      gambar?: string | null;
      bahan?: Array<{ id_bahan: number; jumlah_pakai?: number }>;
    };

    const data: {
      nama_menu?: string;
      id_kategori?: number;
      harga?: number;
      deskripsi?: string | null;
      status?: StatusMenu;
      gambar?: string | null;
    } = {};

    if (body.nama_menu !== undefined) {
      const nama = body.nama_menu.trim();
      if (!nama) {
        return NextResponse.json(
          { success: false, error: "nama_menu tidak boleh kosong" },
          { status: 400 }
        );
      }
      data.nama_menu = nama;
    }

    if (body.id_kategori !== undefined) {
      const id_kategori = Number(body.id_kategori);
      if (!id_kategori || Number.isNaN(id_kategori)) {
        return NextResponse.json(
          { success: false, error: "id_kategori tidak valid" },
          { status: 400 }
        );
      }
      const kategori = await prisma.kategori.findUnique({ where: { id_kategori } });
      if (!kategori) {
        return NextResponse.json(
          { success: false, error: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }
      data.id_kategori = id_kategori;
    }

    if (body.harga !== undefined) {
      const harga = Number(body.harga);
      if (Number.isNaN(harga) || harga <= 0) {
        return NextResponse.json(
          { success: false, error: "harga harus angka > 0" },
          { status: 400 }
        );
      }
      data.harga = harga;
    }

    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi?.trim() || null;
    if (body.gambar !== undefined) data.gambar = body.gambar?.trim() || null;
    if (body.status !== undefined) {
      if (body.status !== "AKTIF" && body.status !== "NONAKTIF") {
        return NextResponse.json(
          { success: false, error: "status tidak valid (AKTIF|NONAKTIF)" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (Array.isArray(body.bahan)) {
        await tx.menu_bahan.deleteMany({ where: { id_menu } });
        if (body.bahan.length > 0) {
          await tx.menu_bahan.createMany({
            data: body.bahan.map((b) => ({
              id_menu,
              id_bahan: Number(b.id_bahan),
              jumlah_pakai: Number(b.jumlah_pakai) > 0 ? Number(b.jumlah_pakai) : 1,
            })),
          });
        }
      }

      const menu = await tx.menu.update({
        where: { id_menu },
        data,
        include: menuAdminInclude,
      });

      if (data.id_kategori && data.id_kategori !== existing.id_kategori) {
        const oldCount = await tx.menu.count({ where: { id_kategori: existing.id_kategori } });
        await tx.kategori.update({
          where: { id_kategori: existing.id_kategori },
          data: { jumlah_menu: oldCount },
        });
        const newCount = await tx.menu.count({ where: { id_kategori: data.id_kategori } });
        await tx.kategori.update({
          where: { id_kategori: data.id_kategori },
          data: { jumlah_menu: newCount },
        });
      }

      return menu;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui menu" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_menu = parsePositiveInt(id);
    if (!id_menu) {
      return NextResponse.json(
        { success: false, error: "ID menu tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.menu.findUnique({ where: { id_menu } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Menu tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.menu.delete({ where: { id_menu } });
    await refreshKategoriMenuCount(existing.id_kategori);

    return NextResponse.json({ success: true, data: { id_menu } });
  } catch (error) {
    console.error("DELETE /api/menu/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus menu (mungkin masih dipakai di pesanan)" },
      { status: 500 }
    );
  }
}
