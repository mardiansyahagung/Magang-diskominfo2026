// --- Konfigurasi ---
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const INITIAL_FORM_DATA = {
  nama_domain: "",
  jenis_aset: "Web Dinas / SKPD",
  is_aktif: "1",
  jenis_anomali: "",
  tanggal_insiden: "",
  catatan: "",
  status_perbaikan: "Belum Ditangani",
};

// --- Helpers Umum ---
export const extractUrl = (text) => {
  if (!text) return null;
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  return urlMatch ? urlMatch[0] : null;
};

export const isAnomali = (jenisAnomali) => {
  if (!jenisAnomali) return false;
  const clean = jenisAnomali.toLowerCase().trim();
  return clean !== "aman" && clean !== "";
};

// --- Helper: Buang emoji dari teks sebelum dicetak ke PDF ---
// jsPDF (font helvetica bawaan) tidak bisa render emoji, hasilnya jadi karakter aneh
// (mis. "Ø>Þª"). Dipakai khusus untuk teks yang masuk ke PDF, bukan untuk tampilan di UI.
export const hapusEmoji = (text) => {
  if (!text) return text;
  return text
    .replace(
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\uFE0F]/gu,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
};

// --- Helper: Ubah gambar (import asset) menjadi base64 agar bisa dipakai jsPDF/ExcelJS ---
export const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- Helper: Kop Surat resmi di halaman PDF ---
export const gambarKopSurat = (doc, logoGarutBase64, logoDiskominfoBase64, judulLaporan, subJudul) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  if (logoGarutBase64) {
    doc.addImage(logoGarutBase64, "PNG", 14, 8, 18, 22);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text("PEMERINTAH KABUPATEN GARUT", pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(14);
  doc.text("DINAS KOMUNIKASI DAN INFORMATIKA", pageWidth / 2, 21, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text(
    "Jl. Pembangunan No. 181, Tarogong Kidul, (0262) 2808994 | Email: diskominfo@garutkab.go.id",
    pageWidth / 2,
    26,
    { align: "center" }
  );

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.line(14, 32, pageWidth - 14, 32);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(judulLaporan, pageWidth / 2, 40, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(subJudul, pageWidth / 2, 46, { align: "center" });

  return 52; // posisi Y untuk mulai tabel
};

// --- Helper: Blok tanda tangan di akhir laporan PDF ---
export const gambarTandaTangan = (doc, finalY, namaPenandaTangan) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let posY = finalY + 20;

  if (posY > pageHeight - 40) {
    doc.addPage();
    posY = 25;
  }

  const tanggalCetak = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(`Garut, ${tanggalCetak}`, pageWidth - 70, posY);
  doc.text("Dicetak oleh,", pageWidth - 70, posY + 5);

  doc.setFont("helvetica", "bold");
  doc.text(namaPenandaTangan || "-", pageWidth - 70, posY + 15);
};