import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusMeja } from "@prisma/client";
import { isAuthFailure, requireAuth, STAFF_ROLES } from "@/lib/api-auth";

const WRITE_ROLES = ["PELAYAN", "MANAJER"] as const;
const STATUS_VALUES = ["KOSONG", "TERISI", "RESERVED"] as const;

function makeKodeQr(nomor_meja: number) {
  return `MEJA-${String(nomor_meja).padStart(2, "0")}`;
}

export async function GET() {
  const auth = await requireAuth(STAFF_ROLES);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const tables = await prisma.meja.findMany({
      orderBy: { nomor_meja: "asc" },
    });
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error("GET /api/tables error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data meja" },
      { status: 500 }
    );
  }
}

// POST /api/tables
export async function POST(request: Request) {
  const auth = await requireAuth([...WRITE_ROLES]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const body = (await request.json()) as {
      nomor_meja?: number;
      kapasitas?: number;
      status?: StatusMeja;
      kode_qr?: string;
    };

    const nomor_meja = Number(body.nomor_meja);
    const kapasitas = Number(body.kapasitas);

    if (!Number.isInteger(nomor_meja) || nomor_meja < 1) {
      return NextResponse.json(
        { success: false, error: "nomor_meja harus bilangan bulat >= 1" },
        { status: 400 }
      );
    }
    if (!Number.isInteger(kapasitas) || kapasitas < 1 || kapasitas > 50) {
      return NextResponse.json(
        { success: false, error: "kapasitas harus bilangan 1–50" },
        { status: 400 }
      );
    }

    const status =
      body.status && STATUS_VALUES.includes(body.status) ? body.status : StatusMeja.KOSONG;

    const existing = await prisma.meja.findUnique({ where: { nomor_meja } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Nomor meja ${nomor_meja} sudah terdaftar` },
        { status: 409 }
      );
    }

    const kode_qr = body.kode_qr?.trim() || makeKodeQr(nomor_meja);
    const qrTaken = await prisma.meja.findUnique({ where: { kode_qr } });
    if (qrTaken) {
      return NextResponse.json(
        { success: false, error: "kode_qr sudah dipakai" },
        { status: 409 }
      );
    }

    const created = await prisma.meja.create({
      data: { nomor_meja, kapasitas, status, kode_qr },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tables error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah meja" },
      { status: 500 }
    );
  }
}
