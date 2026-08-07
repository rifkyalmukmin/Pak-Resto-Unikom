import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { ApiLaporanHarian, ApiLaporanPendapatan } from "@/types/api";

function buildFilename(periode: { from: string; to: string }, ext: "pdf" | "xlsx") {
  return `laporan-keuangan_${periode.from}_${periode.to}.${ext}`;
}

function formatNumber(n: number) {
  return n.toLocaleString("id-ID");
}

export function exportLaporanPdf(
  laporan: ApiLaporanPendapatan,
  rows: ApiLaporanHarian[]
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { periode, ringkasan } = laporan;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Laporan Keuangan", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Pak Resto UNIKOM", 14, 25);
  doc.text(`Periode: ${periode.from} s/d ${periode.to}`, 14, 32);
  doc.text(`Diekspor: ${new Date().toLocaleString("id-ID")}`, 14, 38);

  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan", 14, 48);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Pendapatan: Rp ${formatNumber(ringkasan.total_pendapatan)}`, 14, 55);
  doc.text(`Total Transaksi: ${formatNumber(ringkasan.total_transaksi)}`, 14, 61);
  doc.text(`Rata-rata per Transaksi: Rp ${formatNumber(ringkasan.rata_rata)}`, 14, 67);

  autoTable(doc, {
    startY: 74,
    head: [["Tanggal", "Transaksi", "Pendapatan (Rp)", "Rata-rata (Rp)", "Status"]],
    body:
      rows.length > 0
        ? rows.map((r) => [
            r.tanggal_label,
            String(r.transaksi),
            formatNumber(r.pendapatan),
            formatNumber(r.rata_rata),
            r.status,
          ])
        : [["—", "0", "0", "0", "—"]],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [88, 28, 135], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  doc.save(buildFilename(periode, "pdf"));
}

export function exportLaporanExcel(
  laporan: ApiLaporanPendapatan,
  rows: ApiLaporanHarian[]
) {
  const { periode, ringkasan } = laporan;

  const sheetData: (string | number)[][] = [
    ["Laporan Keuangan — Pak Resto UNIKOM"],
    ["Periode", `${periode.from} s/d ${periode.to}`],
    ["Diekspor", new Date().toLocaleString("id-ID")],
    [],
    ["Ringkasan"],
    ["Total Pendapatan (Rp)", ringkasan.total_pendapatan],
    ["Total Transaksi", ringkasan.total_transaksi],
    ["Rata-rata per Transaksi (Rp)", ringkasan.rata_rata],
    [],
    ["Tanggal", "Total Transaksi", "Total Pendapatan (Rp)", "Rata-rata (Rp)", "Status"],
    ...rows.map((r) => [
      r.tanggal_label,
      r.transaksi,
      r.pendapatan,
      r.rata_rata,
      r.status,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = [{ wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 12 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");
  XLSX.writeFile(wb, buildFilename(periode, "xlsx"));
}
