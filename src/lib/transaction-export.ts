import * as XLSX from "xlsx";
import type { ApiPembayaran } from "@/types/api";

const METHOD_LABEL: Record<string, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  TRANSFER: "Transfer",
};

export type TransaksiExportRow = {
  idPembayaran: number;
  idPesanan: number;
  waktu: string;
  waktuLabel: string;
  mejaTipe: string;
  tipe: string;
  total: number;
  metode: string;
  status: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function tableOrType(p: ApiPembayaran) {
  const pesanan = p.pesanan;
  if (!pesanan) return { label: `Pesanan #${p.id_pesanan}`, type: "-" };
  if (pesanan.tipe_pesanan === "DINE_IN") {
    return {
      label: `Meja ${pesanan.meja?.nomor_meja ?? "-"}`,
      type: "DINE-IN",
    };
  }
  return { label: `TA-${p.id_pesanan}`, type: "TAKEAWAY" };
}

export function mapPembayaranToExportRow(p: ApiPembayaran): TransaksiExportRow {
  const loc = tableOrType(p);
  return {
    idPembayaran: p.id_pembayaran,
    idPesanan: p.id_pesanan,
    waktu: formatDateTime(p.waktu_pembayaran),
    waktuLabel: formatTime(p.waktu_pembayaran),
    mejaTipe: loc.label,
    tipe: loc.type,
    total: p.total,
    metode: METHOD_LABEL[p.metode_pembayaran] ?? p.metode_pembayaran,
    status: p.status_pembayaran,
  };
}

function buildFilename() {
  const now = new Date();
  const y = now.getFullYear();
  const m = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  return `laporan-transaksi_${y}-${m}-${d}.xlsx`;
}

export function exportTransaksiExcel(
  rows: TransaksiExportRow[],
  summary: {
    totalPenjualanHariIni: number;
    jumlahTransaksiHariIni: number;
    filterLabel: string;
  }
) {
  const sheetData: (string | number)[][] = [
    ["Laporan Transaksi — Pak Resto UNIKOM"],
    ["Diekspor", new Date().toLocaleString("id-ID")],
    ["Filter Status", summary.filterLabel],
    [],
    ["Ringkasan Hari Ini"],
    ["Total Penjualan (Rp)", summary.totalPenjualanHariIni],
    ["Jumlah Transaksi Lunas", summary.jumlahTransaksiHariIni],
    [],
    [
      "ID Pembayaran",
      "ID Pesanan",
      "Waktu",
      "No. Meja / Tipe",
      "Tipe Pesanan",
      "Total (Rp)",
      "Metode Bayar",
      "Status",
    ],
    ...rows.map((r) => [
      r.idPembayaran,
      r.idPesanan,
      r.waktu,
      r.mejaTipe,
      r.tipe,
      r.total,
      r.metode,
      r.status,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 20 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Transaksi");
  XLSX.writeFile(wb, buildFilename());
}
