import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { parsePositiveInt } from "@/lib/menu-helpers";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/kategori/[id]
export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_kategori = parsePositiveInt(id);
    if (!id_kategori) {
      return NextResponse.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.kategori.findUnique({ where: { id_kategori } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      nama_kategori?: string;
      deskripsi?: string | null;
      warna?: string | null;
      aktif?: boolean;
    };

    const data: {
      nama_kategori?: string;
      deskripsi?: string | null;
      warna?: string | null;
      aktif?: boolean;
    } = {};

    if (body.nama_kategori !== undefined) {
      const nama = body.nama_kategori.trim();
      if (!nama) {
        return NextResponse.json(
          { success: false, error: "nama_kategori tidak boleh kosong" },
          { status: 400 }
        );
      }
      data.nama_kategori = nama;
    }
    if (body.deskripsi !== undefined) data.deskripsi = body.deskripsi?.trim() || null;
    if (body.warna !== undefined) data.warna = body.warna?.trim() || null;
    if (body.aktif !== undefined) data.aktif = Boolean(body.aktif);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada field yang diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.kategori.update({
      where: { id_kategori },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/kategori/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui kategori" },
      { status: 500 }
    );
  }
}

// DELETE /api/kategori/[id]
export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_kategori = parsePositiveInt(id);
    if (!id_kategori) {
      return NextResponse.json(
        { success: false, error: "ID kategori tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.kategori.findUnique({ where: { id_kategori } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.kategori.delete({ where: { id_kategori } });

    return NextResponse.json({ success: true, data: { id_kategori } });
  } catch (error) {
    console.error("DELETE /api/kategori/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus kategori" },
      { status: 500 }
    );
  }
}
