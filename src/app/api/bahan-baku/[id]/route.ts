import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { computeStatusBahan } from "@/lib/bahan-status";
import type { StatusBahan } from "@prisma/client";

type RouteContext = { params: Promise<{ id: string }> };

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PATCH /api/bahan-baku/[id]
export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["PELAYAN", "CHEF", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_bahan = parseId(id);
    if (!id_bahan) {
      return NextResponse.json(
        { success: false, error: "ID bahan tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.bahan_baku.findUnique({ where: { id_bahan } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      nama_bahan?: string;
      jumlah?: number;
      satuan?: string;
      status?: StatusBahan;
    };

    const data: {
      nama_bahan?: string;
      jumlah?: number;
      satuan?: string;
      status?: StatusBahan;
    } = {};

    if (body.nama_bahan !== undefined) {
      const nama = body.nama_bahan.trim();
      if (!nama) {
        return NextResponse.json(
          { success: false, error: "nama_bahan tidak boleh kosong" },
          { status: 400 }
        );
      }
      data.nama_bahan = nama;
    }

    if (body.satuan !== undefined) {
      const satuan = body.satuan.trim();
      if (!satuan) {
        return NextResponse.json(
          { success: false, error: "satuan tidak boleh kosong" },
          { status: 400 }
        );
      }
      data.satuan = satuan;
    }

    if (body.jumlah !== undefined) {
      const jumlah = Number(body.jumlah);
      if (Number.isNaN(jumlah) || jumlah < 0) {
        return NextResponse.json(
          { success: false, error: "jumlah harus angka >= 0" },
          { status: 400 }
        );
      }
      data.jumlah = jumlah;
      // Auto-update status dari jumlah kecuali status eksplisit dikirim
      if (body.status === undefined) {
        data.status = computeStatusBahan(jumlah);
      }
    }

    if (body.status !== undefined) {
      if (!["TERSEDIA", "MENIPIS", "HABIS"].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "status tidak valid" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada field yang diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.bahan_baku.update({
      where: { id_bahan },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/bahan-baku/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui bahan baku" },
      { status: 500 }
    );
  }
}

// DELETE /api/bahan-baku/[id]
export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth(["PELAYAN", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_bahan = parseId(id);
    if (!id_bahan) {
      return NextResponse.json(
        { success: false, error: "ID bahan tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.bahan_baku.findUnique({ where: { id_bahan } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Bahan baku tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.bahan_baku.delete({ where: { id_bahan } });

    return NextResponse.json({ success: true, data: { id_bahan } });
  } catch (error) {
    console.error("DELETE /api/bahan-baku/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus bahan baku" },
      { status: 500 }
    );
  }
}
