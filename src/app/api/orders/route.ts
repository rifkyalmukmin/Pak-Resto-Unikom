import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders - Ambil semua pesanan
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pesanan" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Buat pesanan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, tableId, customerName, customerPhone, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Items pesanan wajib diisi" },
        { status: 400 }
      );
    }

    // Ambil harga menu dari database (hindari manipulasi harga dari client)
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
    });

    const orderItems = items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      if (!menuItem) throw new Error(`Menu ${item.menuItemId} tidak ditemukan`);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        notes: item.notes,
      };
    });

    const subtotal = orderItems.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + item.price * item.quantity;
    }, 0);
    const tax = Math.round(subtotal * 0.11); // PPN 11%
    const serviceCharge = 0;
    const total = subtotal + tax + serviceCharge;

    const orderNumber = `ORD-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tableId: tableId || null,
        customerName,
        customerPhone,
        notes,
        subtotal,
        tax,
        serviceCharge,
        total,
        orderItems: { create: orderItems },
      },
      include: { orderItems: { include: { menuItem: true } } },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat pesanan" },
      { status: 500 }
    );
  }
}
