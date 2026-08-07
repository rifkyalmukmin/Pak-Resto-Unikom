import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMeja } from "@prisma/client";
import { isAuthFailure, requireAuth, STAFF_ROLES } from "@/lib/api-auth";
import { parsePositiveInt } from "@/lib/menu-helpers";

const WRITE_ROLES = ["PELAYAN", "MANAJER"] as const;
const STATUS_VALUES = ["KOSONG", "TERISI", "RESERVED"] as const;

type RouteContext = { params: Promise<{ id: string }> };

function makeKodeQr(nomor_meja: number) {
  return `MEJA-${String(nomor_meja).padStart(2, "0")}`;
}

export async function GET(_req: Request, { params }: RouteContext) {
  const auth = await requireAuth(STAFF_ROLES);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_meja = parsePositiveInt(id);
    if (!id_meja) {
      return NextResponse.json(
        { success: false, error: "ID meja tidak valid" },
        { status: 400 }
      );
    }

    const table = await prisma.meja.findUnique({ where: { id_meja } });
    if (!table) {
      return NextResponse.json(
        { success: false, error: "Meja tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    console.error("GET /api/tables/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data meja" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth([...WRITE_ROLES]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_meja = parsePositiveInt(id);
    if (!id_meja) {
      return NextResponse.json(
        { success: false, error: "ID meja tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.meja.findUnique({ where: { id_meja } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Meja tidak ditemukan" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as {
      nomor_meja?: number;
      kapasitas?: number;
      status?: StatusMeja;
      kode_qr?: string;
    };

    const data: {
      nomor_meja?: number;
      kapasitas?: number;
      status?: StatusMeja;
      kode_qr?: string;
    } = {};

    if (body.nomor_meja !== undefined) {
      const nomor_meja = Number(body.nomor_meja);
      if (!Number.isInteger(nomor_meja) || nomor_meja < 1) {
        return NextResponse.json(
          { success: false, error: "nomor_meja harus bilangan bulat >= 1" },
          { status: 400 }
        );
      }
      if (nomor_meja !== existing.nomor_meja) {
        const taken = await prisma.meja.findUnique({ where: { nomor_meja } });
        if (taken) {
          return NextResponse.json(
            { success: false, error: `Nomor meja ${nomor_meja} sudah terdaftar` },
            { status: 409 }
          );
        }
        data.nomor_meja = nomor_meja;
        // Sinkronkan kode_qr default jika tidak dikirim eksplisit
        if (body.kode_qr === undefined) {
          data.kode_qr = makeKodeQr(nomor_meja);
        }
      }
    }

    if (body.kapasitas !== undefined) {
      const kapasitas = Number(body.kapasitas);
      if (!Number.isInteger(kapasitas) || kapasitas < 1 || kapasitas > 50) {
        return NextResponse.json(
          { success: false, error: "kapasitas harus bilangan 1–50" },
          { status: 400 }
        );
      }
      data.kapasitas = kapasitas;
    }

    if (body.status !== undefined) {
      if (!STATUS_VALUES.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: "status tidak valid (KOSONG|TERISI|RESERVED)" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }

    if (body.kode_qr !== undefined) {
      const kode_qr = body.kode_qr.trim();
      if (!kode_qr) {
        return NextResponse.json(
          { success: false, error: "kode_qr tidak boleh kosong" },
          { status: 400 }
        );
      }
      if (kode_qr !== existing.kode_qr) {
        const taken = await prisma.meja.findUnique({ where: { kode_qr } });
        if (taken) {
          return NextResponse.json(
            { success: false, error: "kode_qr sudah dipakai" },
            { status: 409 }
          );
        }
      }
      data.kode_qr = kode_qr;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada field yang diubah" },
        { status: 400 }
      );
    }

    const updated = await prisma.meja.update({
      where: { id_meja },
      data,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/tables/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui meja" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth([...WRITE_ROLES]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { id } = await params;
    const id_meja = parsePositiveInt(id);
    if (!id_meja) {
      return NextResponse.json(
        { success: false, error: "ID meja tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.meja.findUnique({ where: { id_meja } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Meja tidak ditemukan" },
        { status: 404 }
      );
    }

    const activeOrders = await prisma.pesanan.count({
      where: {
        id_meja,
        status_pesanan: { notIn: ["SELESAI", "DIBATALKAN"] },
      },
    });
    if (activeOrders > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Meja tidak bisa dihapus karena masih ada pesanan aktif",
        },
        { status: 409 }
      );
    }

    await prisma.meja.delete({ where: { id_meja } });

    return NextResponse.json({ success: true, data: { id_meja } });
  } catch (error) {
    console.error("DELETE /api/tables/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Gagal menghapus meja (mungkin masih terkait riwayat pesanan)",
      },
      { status: 500 }
    );
  }
}
