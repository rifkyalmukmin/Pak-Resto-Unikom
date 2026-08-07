import type {
  ApiBahanBaku,
  ApiKategori,
  ApiLaporanPendapatan,
  ApiLaporanTren,
  ApiMeja,
  ApiMenu,
  ApiPembayaran,
  ApiPesanan,
  ApiResponse,
  ApiUser,
  CreateOrderItem,
} from "@/types/api";
import type {
  MetodePembayaran,
  Role,
  StatusBahan,
  StatusMenu,
  StatusPesanan,
  TipePesanan,
} from "@prisma/client";

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

  getMenuAdmin: () => request<ApiMenu[]>("/api/menu?all=true"),

  getMenuById: (id: number) => request<ApiMenu>(`/api/menu/${id}`),

  createMenu: (body: {
    nama_menu: string;
    id_kategori: number;
    harga: number;
    deskripsi?: string | null;
    status?: StatusMenu;
    gambar?: string | null;
    bahan?: Array<{ id_bahan: number; jumlah_pakai?: number }>;
  }) =>
    request<ApiMenu>("/api/menu", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateMenu: (
    id: number,
    body: {
      nama_menu?: string;
      id_kategori?: number;
      harga?: number;
      deskripsi?: string | null;
      status?: StatusMenu;
      gambar?: string | null;
      bahan?: Array<{ id_bahan: number; jumlah_pakai?: number }>;
    }
  ) =>
    request<ApiMenu>(`/api/menu/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteMenu: (id: number) =>
    request<{ id_menu: number }>(`/api/menu/${id}`, { method: "DELETE" }),

  getKategori: () => request<ApiKategori[]>("/api/kategori"),

  createKategori: (body: {
    nama_kategori: string;
    deskripsi?: string | null;
    warna?: string | null;
    aktif?: boolean;
  }) =>
    request<ApiKategori>("/api/kategori", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateKategori: (
    id: number,
    body: {
      nama_kategori?: string;
      deskripsi?: string | null;
      warna?: string | null;
      aktif?: boolean;
    }
  ) =>
    request<ApiKategori>(`/api/kategori/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteKategori: (id: number) =>
    request<{ id_kategori: number }>(`/api/kategori/${id}`, { method: "DELETE" }),

  getLaporanPendapatan: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    const qs = q.toString();
    return request<ApiLaporanPendapatan>(
      `/api/reports/pendapatan${qs ? `?${qs}` : ""}`
    );
  },

  getLaporanTren: (params?: {
    period?: "mingguan" | "bulanan" | "kuartalan";
    from?: string;
    to?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.period) q.set("period", params.period);
    if (params?.from) q.set("from", params.from);
    if (params?.to) q.set("to", params.to);
    const qs = q.toString();
    return request<ApiLaporanTren>(`/api/reports/tren${qs ? `?${qs}` : ""}`);
  },

  getUsers: (params?: { role?: Role | string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", String(params.role));
    const qs = q.toString();
    return request<ApiUser[]>(`/api/users${qs ? `?${qs}` : ""}`);
  },

  getUser: (id: number) => request<ApiUser>(`/api/users/${id}`),

  createUser: (body: {
    nama_lengkap: string;
    username: string;
    password: string;
    role: Role | string;
    foto_profil?: string | null;
  }) =>
    request<ApiUser>("/api/users", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateUser: (
    id: number,
    body: {
      nama_lengkap?: string;
      username?: string;
      password?: string;
      role?: Role | string;
      foto_profil?: string | null;
    }
  ) =>
    request<ApiUser>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteUser: (id: number) =>
    request<{ id_user: number }>(`/api/users/${id}`, { method: "DELETE" }),

  getTables: () => request<ApiMeja[]>("/api/tables"),

  getTable: (id: number) => request<ApiMeja>(`/api/tables/${id}`),

  createTable: (body: {
    nomor_meja: number;
    kapasitas: number;
    status?: "KOSONG" | "TERISI" | "RESERVED";
    kode_qr?: string;
  }) =>
    request<ApiMeja>("/api/tables", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateTable: (
    id: number,
    body: {
      nomor_meja?: number;
      kapasitas?: number;
      status?: "KOSONG" | "TERISI" | "RESERVED";
      kode_qr?: string;
    }
  ) =>
    request<ApiMeja>(`/api/tables/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteTable: (id: number) =>
    request<{ id_meja: number }>(`/api/tables/${id}`, { method: "DELETE" }),

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

  getBahanBaku: (params?: { status?: StatusBahan }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    const qs = q.toString();
    return request<ApiBahanBaku[]>(`/api/bahan-baku${qs ? `?${qs}` : ""}`);
  },

  createBahanBaku: (body: { nama_bahan: string; jumlah: number; satuan: string }) =>
    request<ApiBahanBaku>("/api/bahan-baku", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  updateBahanBaku: (
    id: number,
    body: { nama_bahan?: string; jumlah?: number; satuan?: string; status?: StatusBahan }
  ) =>
    request<ApiBahanBaku>(`/api/bahan-baku/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  deleteBahanBaku: (id: number) =>
    request<{ id_bahan: number }>(`/api/bahan-baku/${id}`, {
      method: "DELETE",
    }),
};

export function formatRp(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

export function orderElapsed(waktu_pesanan: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(waktu_pesanan).getTime());
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
