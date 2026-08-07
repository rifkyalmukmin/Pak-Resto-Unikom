import type {
  MetodePembayaran,
  StatusBahan,
  StatusMeja,
  StatusPesanan,
  TipePesanan,
} from "@prisma/client";

export interface ApiBahanBaku {
  id_bahan: number;
  nama_bahan: string;
  jumlah: number;
  satuan: string;
  status: StatusBahan;
}

export interface ApiMenu {
  id_menu: number;
  id_kategori: number;
  nama_menu: string;
  deskripsi: string | null;
  harga: number;
  status: string;
  gambar: string | null;
  kategori?: ApiKategori;
  menu_bahan?: ApiMenuBahan[];
}

export interface ApiMenuBahan {
  id_bahan: number;
  id_menu: number;
  jumlah_pakai: number;
  bahan_baku?: ApiBahanBaku;
}

export interface ApiKategori {
  id_kategori: number;
  nama_kategori: string;
  deskripsi: string | null;
  warna: string | null;
  jumlah_menu: number;
  aktif: boolean;
  menu?: ApiMenu[];
}

export interface ApiLaporanHarian {
  tanggal: string;
  tanggal_label: string;
  transaksi: number;
  pendapatan: number;
  rata_rata: number;
  status: "Finalized";
}

export interface ApiLaporanPendapatan {
  periode: { from: string; to: string };
  ringkasan: {
    total_pendapatan: number;
    total_transaksi: number;
    rata_rata: number;
    perubahan_pendapatan_pct: number | null;
    perubahan_transaksi_pct: number | null;
    perubahan_rata_pct: number | null;
  };
  harian: ApiLaporanHarian[];
}

export interface ApiMeja {
  id_meja: number;
  nomor_meja: number;
  kapasitas: number;
  kode_qr: string;
  status: StatusMeja;
}

export interface ApiDetailPesanan {
  id_detail: number;
  id_menu: number;
  id_pesanan: number;
  jumlah: number;
  catatan: string | null;
  subtotal: number;
  menu: ApiMenu;
}

export interface ApiPesanan {
  id_pesanan: number;
  id_user: number;
  id_meja: number | null;
  tipe_pesanan: TipePesanan;
  waktu_pesanan: string;
  status_pesanan: StatusPesanan;
  total_harga: number;
  detail_pesanan: ApiDetailPesanan[];
  meja: ApiMeja | null;
  user: {
    id_user: number;
    nama_lengkap: string;
    username: string;
    role: string;
  };
  pembayaran: ApiPembayaran | null;
}

export interface ApiPembayaran {
  id_pembayaran: number;
  id_user: number;
  id_pesanan: number;
  metode_pembayaran: MetodePembayaran;
  waktu_pembayaran: string;
  total: number;
  status_pembayaran: string;
  pesanan?: ApiPesanan;
}

export interface ApiUser {
  id_user: number;
  nama_lengkap: string;
  username: string;
  role: string;
}

export interface ApiUser {
  id_user: number;
  nama_lengkap: string;
  username: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateOrderItem {
  id_menu: number;
  jumlah: number;
  catatan?: string;
}
