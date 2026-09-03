import ExcelJS from "exceljs";
import diskominfoLogo from "../assets/logo-full-white.png";
import logoGarut from "../assets/logo-garut.png";
import { extractUrl, getBase64FromUrl } from "./dashboardHelpers";

const KOLOM_TERAKHIR = 8; // jumlah kolom tabel (A..H)

const tulisJudulBaris = (sheet, rowIdx, text, size, bold) => {
  sheet.mergeCells(rowIdx, 1, rowIdx, KOLOM_TERAKHIR);
  const cell = sheet.getCell(rowIdx, 1);
  cell.value = text;
  cell.font = { size, bold };
  cell.alignment = { horizontal: "center" };
};

// --- Export Excel (dengan logo & kop surat, memakai ExcelJS) ---
export async function exportAsetExcel(dataTersaring, filterKategori, filterPenanganan) {
  if (dataTersaring.length === 0) {
    return { success: false, message: "Tidak ada data untuk diexport!" };
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan Aset");

  sheet.columns = [{ width: 5 }, { width: 28 }, { width: 20 }, { width: 12 }, { width: 18 }, { width: 15 }, { width: 14 }, { width: 18 }];

  // --- Baris kosong untuk ruang logo (baris 1-4) ---
  sheet.mergeCells(1, 1, 4, KOLOM_TERAKHIR);
  [1, 2, 3, 4].forEach((r) => (sheet.getRow(r).height = 20));

  // --- Sisipkan logo Garut (kiri) & logo Diskominfo (kanan) ---
  try {
    const [logoGarutBase64, logoDiskominfoBase64] = await Promise.all([
      getBase64FromUrl(logoGarut).catch(() => null),
      getBase64FromUrl(diskominfoLogo).catch(() => null),
    ]);

    if (logoGarutBase64) {
      const imgId = workbook.addImage({ base64: logoGarutBase64, extension: "png" });
      sheet.addImage(imgId, { tl: { col: 0.1, row: 0.1 }, ext: { width: 60, height: 70 } });
    }
    if (logoDiskominfoBase64) {
      const imgId2 = workbook.addImage({ base64: logoDiskominfoBase64, extension: "jpeg" });
      sheet.addImage(imgId2, { tl: { col: 1.15, row: 0.15 }, ext: { width: 55, height: 55 } });
    }
  } catch (err) {
    console.error("Gagal memuat logo untuk Excel:", err);
  }

  // --- Teks Kop Surat (baris 5-7) ---
  tulisJudulBaris(sheet, 5, "PEMERINTAH KABUPATEN GARUT", 13, true);
  tulisJudulBaris(sheet, 6, "DINAS KOMUNIKASI DAN INFORMATIKA", 14, true);
  tulisJudulBaris(sheet, 7, "Jl. Pembangunan No. 181, Tarogong Kidul, (0262) 2808994 | Email: diskominfo@garutkab.go.id", 9, false);

  // --- Garis pembatas (baris 8) ---
  for (let c = 1; c <= KOLOM_TERAKHIR; c++) {
    sheet.getCell(8, c).border = { bottom: { style: "medium" } };
  }

  const tanggalCetak = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  tulisJudulBaris(sheet, 9, "LAPORAN MONITORING ASET WEB KABUPATEN GARUT", 12, true);
  tulisJudulBaris(
    sheet,
    10,
    `Kategori Filter: ${filterKategori.toUpperCase()} | Status: ${filterPenanganan.toUpperCase()} | Dicetak pada: ${tanggalCetak}`,
    9,
    false
  );

  // --- Header Tabel (baris 12) ---
  const headerRowIdx = 12;
  const headerRow = sheet.getRow(headerRowIdx);
  headerRow.values = ["No", "Nama Domain", "Kategori Aset", "Status Server", "Jenis Anomali", "Tanggal Insiden", "Evidence", "Status Penanganan"];
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E293B" } };
    cell.alignment = { horizontal: "center" };
    cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
  });

  // --- Isi Data ---
  dataTersaring.forEach((item, index) => {
    const cleanUrl = extractUrl(item.catatan);
    const rowIdx = headerRowIdx + 1 + index;
    const row = sheet.getRow(rowIdx);
    row.values = [
      index + 1,
      item.nama_domain || "-",
      item.jenis_aset || "Aset Utama",
      String(item.is_aktif) === "1" ? "Aktif" : "Down",
      item.jenis_anomali || "Aman",
      item.tanggal_insiden || "-",
      cleanUrl ? "Buka Bukti" : item.catatan || "-",
      item.status_perbaikan || "-",
    ];
    row.eachCell((cell) => {
      cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });
    if (cleanUrl) {
      const evidenceCell = sheet.getCell(rowIdx, 7);
      evidenceCell.value = { text: "Buka Bukti", hyperlink: cleanUrl };
      evidenceCell.font = { color: { argb: "FF2563EB" }, underline: true };
    }
  });

  // --- Blok Tanda Tangan ---
  let ttdRow = headerRowIdx + dataTersaring.length + 3;
  tulisJudulBaris(sheet, ttdRow, `Garut, ${tanggalCetak}`, 10, false);
  sheet.getCell(ttdRow, 1).alignment = { horizontal: "right" };
  ttdRow += 1;
  tulisJudulBaris(sheet, ttdRow, "Kepala Dinas,", 10, false);
  sheet.getCell(ttdRow, 1).alignment = { horizontal: "right" };
  ttdRow += 5;
  tulisJudulBaris(sheet, ttdRow, "AGUS KURNIAWAN, S.Si., M.E.", 10, true);
  sheet.getCell(ttdRow, 1).alignment = { horizontal: "right" };
  ttdRow += 1;
  tulisJudulBaris(sheet, ttdRow, "Pembina Tingkat I, IV/b", 10, false);
  sheet.getCell(ttdRow, 1).alignment = { horizontal: "right" };
  ttdRow += 1;
  tulisJudulBaris(sheet, ttdRow, "NIP. 197408012005011007", 10, false);
  sheet.getCell(ttdRow, 1).alignment = { horizontal: "right" };

  // --- Simpan file ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Laporan_Aset_Web_Garut_${filterKategori}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);

  return { success: true, message: "Laporan Excel berhasil diunduh!" };
}