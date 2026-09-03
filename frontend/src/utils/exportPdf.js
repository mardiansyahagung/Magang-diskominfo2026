import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import diskominfoLogo from "../assets/logo-full-white.png";
import logoGarut from "../assets/logo-garut.png";
import { extractUrl, getBase64FromUrl, gambarKopSurat, gambarTandaTangan } from "./dashboardHelpers";

const muatLogo = () =>
  Promise.all([
    getBase64FromUrl(logoGarut).catch(() => null),
    getBase64FromUrl(diskominfoLogo).catch(() => null),
  ]);

// --- Export PDF: Daftar Aset (mengikuti filter kategori & status) ---
export async function buildAsetPdf(dataTersaring, filterKategori, filterPenanganan, profilUsername) {
  if (dataTersaring.length === 0) {
    return { error: "Tidak ada data untuk dicetak!" };
  }

  const doc = new jsPDF("landscape");
  const [logoGarutBase64, logoDiskominfoBase64] = await muatLogo();

  const startY = gambarKopSurat(
    doc,
    logoGarutBase64,
    logoDiskominfoBase64,
    "LAPORAN MONITORING ASET WEB KABUPATEN GARUT",
    `Kategori Filter: ${filterKategori.toUpperCase()}  |  Status: ${filterPenanganan.toUpperCase()}  |  Dicetak pada: ${new Date().toLocaleString("id-ID")}`
  );

  const tableColumn = ["No", "Nama Domain", "Kategori Aset", "Status", "Anomali", "Tanggal Kejadian", "Evidence", "Penanganan"];

  const tableRows = dataTersaring.map((item, index) => {
    const cleanUrl = extractUrl(item.catatan);
    return [
      index + 1,
      item.nama_domain || "-",
      item.jenis_aset || "Aset Utama",
      String(item.is_aktif) === "1" ? "Aktif" : "Down",
      item.jenis_anomali || "Aman",
      item.tanggal_insiden || "-",
      cleanUrl ? "Buka Bukti" : item.catatan || "-",
      item.status_perbaikan || "-",
    ];
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY,
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59] },
    styles: { cellPadding: 4, fontSize: 8, valign: "middle" },
  });

  gambarTandaTangan(doc, doc.lastAutoTable.finalY, profilUsername);

  return {
    doc,
    url: doc.output("bloburl"),
    filename: `Laporan_Aset_Web_Garut_${filterKategori}.pdf`,
  };
}

// --- Export PDF: Riwayat & Tanggal Insiden (mengikuti filter rentang tanggal) ---
export async function buildInsidenPdf(dataInsiden, tglMulai, tglAkhir, profilUsername) {
  if (dataInsiden.length === 0) {
    return { error: "Tidak ada data insiden untuk dicetak!" };
  }

  const doc = new jsPDF("landscape");
  const [logoGarutBase64, logoDiskominfoBase64] = await muatLogo();

  const rangeLabel =
    tglMulai || tglAkhir ? `Periode: ${tglMulai || "Awal"} s/d ${tglAkhir || "Sekarang"}` : "Periode: Semua Tanggal";

  const startY = gambarKopSurat(
    doc,
    logoGarutBase64,
    logoDiskominfoBase64,
    "LAPORAN RIWAYAT & TANGGAL KEJADIAN INSIDEN",
    `${rangeLabel}  |  Dicetak pada: ${new Date().toLocaleString("id-ID")}`
  );

  const tableColumn = ["No", "Nama Domain", "Aset / Kategori", "Jenis Anomali", "Tanggal Kejadian Insiden", "Status Penanganan", "Diinput oleh"];

  const tableRows = dataInsiden.map((item, index) => [
    index + 1,
    item.nama_domain || "-",
    item.jenis_aset || "Aset SKPD",
    item.jenis_anomali || "-",
    item.tanggal_insiden || "Belum tercatat",
    item.status_perbaikan || "Belum Ditangani",
    item.dibuat_oleh || "-",
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY,
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59] },
    styles: { cellPadding: 4, fontSize: 8, valign: "middle" },
  });

  gambarTandaTangan(doc, doc.lastAutoTable.finalY, profilUsername);

  return {
    doc,
    url: doc.output("bloburl"),
    filename: `Laporan_Insiden_${tglMulai || "semua"}_${tglAkhir || "semua"}.pdf`,
  };
}