import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthFailure, requireAuth } from "@/lib/api-auth";
import { computeStatusBahan, parseStatusBahanFilter } from "@/lib/bahan-status";

// GET /api/bahan-baku?status=TERSEDIA|MENIPIS|HABIS
export async function GET(request: Request) {
  const auth = await requireAuth(["PELAYAN", "CHEF", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const status = parseStatusBahanFilter(searchParams.get("status"));

    if (searchParams.get("status") && !status) {
      return NextResponse.json(
        { success: false, error: "status tidak valid (TERSEDIA, MENIPIS, HABIS)" },
        { status: 400 }
      );
    }

    const list = await prisma.bahan_baku.findMany({
      where: status ? { status } : undefined,
      orderBy: { nama_bahan: "asc" },
    });

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("GET /api/bahan-baku error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data bahan baku" },
      { status: 500 }
    );
  }
}

// POST /api/bahan-baku
export async function POST(request: Request) {
  const auth = await requireAuth(["PELAYAN", "MANAJER"]);
  if (isAuthFailure(auth)) return auth.error;

  try {
    const body = (await request.json()) as {
      nama_bahan?: string;
      jumlah?: number;
      satuan?: string;
    };

    const nama_bahan = body.nama_bahan?.trim();
    const satuan = body.satuan?.trim();
    const jumlah = Number(body.jumlah);

    if (!nama_bahan) {
      return NextResponse.json(
        { success: false, error: "nama_bahan wajib diisi" },
        { status: 400 }
      );
    }
    if (!satuan) {
      return NextResponse.json(
        { success: false, error: "satuan wajib diisi" },
        { status: 400 }
      );
    }
    if (Number.isNaN(jumlah) || jumlah < 0) {
      return NextResponse.json(
        { success: false, error: "jumlah harus angka >= 0" },
        { status: 400 }
      );
    }

    const created = await prisma.bahan_baku.create({
      data: {
        nama_bahan,
        jumlah,
        satuan,
        status: computeStatusBahan(jumlah),
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bahan-baku error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambah bahan baku" },
      { status: 500 }
    );
  }
}
