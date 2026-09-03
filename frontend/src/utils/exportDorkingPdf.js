import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import diskominfoLogo from "../assets/logo-full-white.png";
import logoGarut from "../assets/logo-garut.png";
import { getBase64FromUrl, gambarKopSurat, gambarTandaTangan, hapusEmoji } from "./dashboardHelpers";

const LABEL_STATUS = {
  aman: "Aman",
  temuan: "Ada Temuan",
  belum: "Belum Dicek",
};

const WARNA_STATUS = {
  aman: [22, 101, 52], // hijau tua
  temuan: [153, 27, 27], // merah tua
  belum: [100, 116, 139], // abu
};

// --- Export PDF: Hasil Google Dorking (daftar query + status hasil pengecekan manual) ---
export async function buildDorkingPdf(hasilQuery, profilUsername) {
  if (!hasilQuery || hasilQuery.length === 0) {
    return { error: "Belum ada query untuk dicetak. Jalankan minimal satu query dulu." };
  }

  const doc = new jsPDF("landscape");
  const [logoGarutBase64, logoDiskominfoBase64] = await Promise.all([
    getBase64FromUrl(logoGarut).catch(() => null),
    getBase64FromUrl(diskominfoLogo).catch(() => null),
  ]);

  const jumlahAman = hasilQuery.filter((q) => q.status === "aman").length;
  const jumlahTemuan = hasilQuery.filter((q) => q.status === "temuan").length;
  const jumlahBelum = hasilQuery.filter((q) => !q.status || q.status === "belum").length;

  const startY = gambarKopSurat(
    doc,
    logoGarutBase64,
    logoDiskominfoBase64,
    "LAPORAN HASIL GOOGLE DORKING",
    `Jumlah Query: ${hasilQuery.length}  |  Aman: ${jumlahAman}  |  Ada Temuan: ${jumlahTemuan}  |  Belum Dicek: ${jumlahBelum}  |  Dicetak pada: ${new Date().toLocaleString("id-ID")}`
  );

  const tableColumn = ["No", "Kategori", "Query Dork", "Waktu Dijalankan", "Status"];

  const tableRows = hasilQuery.map((item, index) => [
    index + 1,
    hapusEmoji(item.label),
    item.query,
    item.tanggal ? new Date(item.tanggal).toLocaleString("id-ID") : "-",
    LABEL_STATUS[item.status] || LABEL_STATUS.belum,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY,
    theme: "grid",
    headStyles: { fillColor: [30, 41, 59] },
    styles: { cellPadding: 4, fontSize: 8, valign: "middle" },
    columnStyles: { 2: { cellWidth: 120 } },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const rawStatus = hasilQuery[data.row.index]?.status || "belum";
        data.cell.styles.textColor = WARNA_STATUS[rawStatus] || WARNA_STATUS.belum;
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  gambarTandaTangan(doc, doc.lastAutoTable.finalY, profilUsername);

  return {
    doc,
    url: doc.output("bloburl"),
    filename: `Laporan_Dorking_${new Date().toISOString().slice(0, 10)}.pdf`,
  };
}