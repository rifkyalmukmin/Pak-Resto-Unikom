import type {
  ApiKategori,
  ApiMeja,
  ApiPembayaran,
  ApiPesanan,
  ApiResponse,
  CreateOrderItem,
} from "@/types/api";
import type { MetodePembayaran, StatusPesanan, TipePesanan } from "@prisma/client";

class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new ApiError(json.error ?? "Permintaan gagal");
  }
  return json.data as T;
}

export const api = {
  getMenu: () => request<ApiKategori[]>("/api/menu"),

  getTables: () => request<ApiMeja[]>("/api/tables"),

  getOrders: (params?: {
    status?: StatusPesanan;
    tipe_pesanan?: TipePesanan;
    id_meja?: number;
    belum_bayar?: boolean;
  }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.tipe_pesanan) q.set("tipe_pesanan", params.tipe_pesanan);
    if (params?.id_meja) q.set("id_meja", String(params.id_meja));
    if (params?.belum_bayar) q.set("belum_bayar", "true");
    const qs = q.toString();
    return request<ApiPesanan[]>(`/api/orders${qs ? `?${qs}` : ""}`);
  },

  getOrder: (id: number) => request<ApiPesanan>(`/api/orders/${id}`),

  createOrder: (body: {
    items: CreateOrderItem[];
    id_meja?: number | null;
    tipe_pesanan?: TipePesanan;
    catatan?: string;
  }) =>
    request<ApiPesanan>("/api/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateOrderStatus: (id: number, status_pesanan: StatusPesanan) =>
    request<ApiPesanan>(`/api/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status_pesanan }),
    }),

  getPayments: (params?: { status?: string; id_pesanan?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.id_pesanan) q.set("id_pesanan", String(params.id_pesanan));
    const qs = q.toString();
    return request<ApiPembayaran[]>(`/api/payments${qs ? `?${qs}` : ""}`);
  },

  createPayment: (body: { id_pesanan: number; metode_pembayaran: MetodePembayaran }) =>
    request<ApiPembayaran>("/api/payments", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export function orderElapsed(waktu_pesanan: string): string {
  const diff = Date.now() - new Date(waktu_pesanan).getTime();
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function mapPaymentMethodToApi(
  method: "tunai" | "debit" | "qris" | "ewallet"
): MetodePembayaran {
  if (method === "qris") return "QRIS";
  if (method === "debit" || method === "ewallet") return "TRANSFER";
  return "CASH";
}
