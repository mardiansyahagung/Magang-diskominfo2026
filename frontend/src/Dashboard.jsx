import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import diskominfoLogoFull from "./assets/logo-full-white.png";

import ToolsDorking from "./components/ToolsDorking";
import ManajemenUser from "./components/ManajemenUser";
import LogAktivitas from "./components/LogAktivitas";
import ModalTambah from "./components/ModalTambah";
import ModalEdit from "./components/ModalEdit";
import ModalHapus from "./components/ModalHapus";
import Toast from "./components/Toast";

import Sidebar from "./components/dashboard/Sidebar";
import TopBar from "./components/dashboard/TopBar";
import DashboardHome from "./components/dashboard/DashboardHome";
import Persuratan from "./components/dashboard/Persuratan";
import RiwayatInsiden from "./components/dashboard/RiwayatInsiden";
import ModalPulihkan from "./components/dashboard/ModalPulihkan";
import ModalPreviewPDF from "./components/dashboard/ModalPreviewPDF";
import ModalPreviewBukti from "./components/dashboard/ModalPreviewBukti";

import { API_BASE_URL, INITIAL_FORM_DATA, isAnomali } from "./utils/dashboardHelpers";
import { exportAsetExcel } from "./utils/exportExcel";
import { buildAsetPdf, buildInsidenPdf } from "./utils/exportPdf";

export default function Dashboard() {
  const navigate = useNavigate();

  // --- State Sidebar Navigation & Toggle ---
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- State Data Utama & Filter ---
  const [semuaDataAset, setSemuaDataAset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kataKunci, setKataKunci] = useState("");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [filterPenanganan, setFilterPenanganan] = useState("semua");

  // --- State Filter Tanggal (Halaman Tanggal Insiden) ---
  const [tglMulai, setTglMulai] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");

  // --- State Pagination khusus Halaman Tanggal Insiden ---
  const [currentPageInsiden, setCurrentPageInsiden] = useState(1);

  // --- State System UI ---
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [darkMode, setDarkMode] = useState(false);
  const [profilUsername, setProfilUsername] = useState("");
  const [profilRole, setProfilRole] = useState("");
  const [profilBuka, setProfilBuka] = useState(false);

  // --- State Preview PDF & Bukti sebelum benar-benar dibuka/diunduh ---
  const [previewPDF, setPreviewPDF] = useState(null); // { url, filename, doc }
  const [previewBukti, setPreviewBukti] = useState(null); // url string

  // --- State Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // --- State Form Modals ---
  const [modalTambahBuka, setModalTambahBuka] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [modalPulihkanBuka, setModalPulihkanBuka] = useState(false);
  const [dataPulihkanTarget, setDataPulihkanTarget] = useState({ id: null, nama_domain: "" });

  const [modalEditBuka, setModalEditBuka] = useState(false);
  const [editData, setEditData] = useState({ id: "", ...INITIAL_FORM_DATA });

  const [modalHapusBuka, setModalHapusBuka] = useState(false);
  const [dataHapusTarget, setDataHapusTarget] = useState({ id: null, nama_domain: "" });

  const isAdmin = profilRole === "admin";

  // --- Fungsi Logout ---
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, { credentials: "include" });
    } catch (err) {
      console.error("Error logout:", err);
    } finally {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  // --- Muat Data Utama ---
  const muatDataDashboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/aset`, { credentials: "include" });
      if (!response.ok) throw new Error(`Server status: ${response.status}`);

      const data = await response.json();
      setSemuaDataAset(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal menarik data:", error);
      setSemuaDataAset([]);
      setToast({ message: "Gagal memuat data dari server (Error 500/Koneksi).", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatDataDashboard();

    // Ambil info user yang sedang login untuk menu profil
    fetch(`${API_BASE_URL}/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.username) setProfilUsername(data.username);
        if (data?.role) setProfilRole(data.role);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [kataKunci, filterKategori, filterPenanganan]);

  useEffect(() => {
    setCurrentPageInsiden(1);
  }, [tglMulai, tglAkhir]);

  // --- Handlers CRUD ---
  const handleSimpanTambah = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/aset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalTambahBuka(false);
        setFormData(INITIAL_FORM_DATA);
        muatDataDashboard();
        setToast({ message: "Aset web berhasil ditambahkan!", type: "success" });
      } else {
        setToast({ message: "Gagal menyimpan data aset.", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  const handleBukaEdit = (baris) => {
    setEditData({
      id: baris.id,
      nama_domain: baris.nama_domain || "",
      jenis_aset: baris.jenis_aset || "Web Dinas / SKPD",
      is_aktif: baris.is_aktif ?? "1",
      jenis_anomali: baris.jenis_anomali || "Aman",
      tanggal_insiden: baris.tanggal_insiden || "",
      catatan: baris.catatan || "",
      status_perbaikan: baris.status_perbaikan || "Belum Ditangani",
    });
    setModalEditBuka(true);
  };

  const handleSimpanEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/aset/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setModalEditBuka(false);
        muatDataDashboard();
        setToast({ message: "Aset web berhasil diperbarui!", type: "success" });
      } else {
        setToast({ message: "Gagal memperbarui data aset.", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  const handleBukaPulihkan = (id, namaDomain) => {
    setDataPulihkanTarget({ id, nama_domain: namaDomain });
    setModalPulihkanBuka(true);
  };

  const handleKonfirmasiPulihkan = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/aset/pulihkan/${dataPulihkanTarget.id}`, {
        method: "PUT",
        credentials: "include",
      });

      if (res.ok) {
        setModalPulihkanBuka(false);
        muatDataDashboard();
        setToast({ message: `Aset "${dataPulihkanTarget.nama_domain}" berhasil dipulihkan menjadi Aman!`, type: "success" });
      } else {
        setToast({ message: "Gagal memulihkan aset.", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  const handleBukaHapus = (id, domain) => {
    setDataHapusTarget({ id, nama_domain: domain });
    setModalHapusBuka(true);
  };

  const handleKonfirmasiHapus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/aset/${dataHapusTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setModalHapusBuka(false);
        muatDataDashboard();
        setToast({ message: `Aset "${dataHapusTarget.nama_domain}" berhasil dihapus permanen!`, type: "success" });
      } else {
        setToast({ message: "Gagal menghapus data.", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  // --- Dynamic Anomaly Collection ---
  const anomaliUnik = useMemo(() => {
    const list = new Set(["Judol", "Kebocoran Data", "Defacement", "Aman"]);
    (semuaDataAset || []).forEach((d) => {
      if (d?.jenis_anomali) list.add(d.jenis_anomali.trim());
    });
    return list;
  }, [semuaDataAset]);

  // --- Filtering Data (Dashboard) ---
  const dataTersaring = useMemo(() => {
    return (Array.isArray(semuaDataAset) ? semuaDataAset : [])
      .filter((baris) => {
        if (!baris) return false;

        let lolosKategori = true;
        const filterKatClean = (filterKategori || "semua").toLowerCase().trim();
        const barisAnomaliClean = (baris.jenis_anomali || "aman").toLowerCase().trim();

        if (filterKatClean === "semua") {
          lolosKategori = true;
        } else if (filterKatClean === "aktif") {
          lolosKategori = String(baris.is_aktif) === "1";
        } else if (filterKatClean === "mati") {
          lolosKategori = String(baris.is_aktif) === "0";
        } else if (filterKatClean === "anomali_semua") {
          lolosKategori = isAnomali(baris.jenis_anomali);
        } else {
          lolosKategori = barisAnomaliClean === filterKatClean;
        }

        let lolosPenanganan = true;
        if (filterPenanganan !== "semua") {
          lolosPenanganan = (baris.status_perbaikan || "Belum Ditangani") === filterPenanganan;
        }

        const kataKunciClean = (kataKunci || "").toLowerCase().trim();
        const namaDomain = (baris.nama_domain || "").toLowerCase();
        const tglInsiden = (baris.tanggal_insiden || "").toLowerCase();
        const lolosCari = namaDomain.includes(kataKunciClean) || tglInsiden.includes(kataKunciClean);

        return lolosKategori && lolosPenanganan && lolosCari;
      })
      .sort((a, b) => {
        // Urutkan berdasarkan tanggal insiden terbaru di paling atas.
        // Baris tanpa tanggal insiden diletakkan paling bawah.
        const tglA = a?.tanggal_insiden ? new Date(a.tanggal_insiden).getTime() : -Infinity;
        const tglB = b?.tanggal_insiden ? new Date(b.tanggal_insiden).getTime() : -Infinity;
        return tglB - tglA;
      });
  }, [semuaDataAset, filterKategori, filterPenanganan, kataKunci]);

  // --- Filtering Data (Riwayat Insiden) ---
  const dataInsiden = useMemo(() => {
    return (Array.isArray(semuaDataAset) ? semuaDataAset : [])
      // Tampilkan SEMUA data web, bukan hanya yang beranomali,
      // supaya seluruh daftar aset tetap terlihat di halaman ini.
      .filter((d) => {
        if (!tglMulai && !tglAkhir) return true;
        if (!d?.tanggal_insiden) return false;
        const tgl = d.tanggal_insiden; // format "YYYY-MM-DD" dari backend
        if (tglMulai && tgl < tglMulai) return false;
        if (tglAkhir && tgl > tglAkhir) return false;
        return true;
      })
      .sort((a, b) => {
        const tglA = a?.tanggal_insiden ? new Date(a.tanggal_insiden).getTime() : -Infinity;
        const tglB = b?.tanggal_insiden ? new Date(b.tanggal_insiden).getTime() : -Infinity;
        return tglB - tglA;
      });
  }, [semuaDataAset, tglMulai, tglAkhir]);

  // --- Pagination Logic (Dashboard) ---
  const totalPages = Math.max(1, Math.ceil(dataTersaring.length / rowsPerPage));
  const pageAman = Math.min(currentPage, totalPages);
  const dataHalaman = dataTersaring.slice((pageAman - 1) * rowsPerPage, pageAman * rowsPerPage);

  // --- Pagination Logic (Riwayat Insiden) ---
  const totalPagesInsiden = Math.max(1, Math.ceil(dataInsiden.length / rowsPerPage));
  const pageAmanInsiden = Math.min(currentPageInsiden, totalPagesInsiden);
  const dataHalamanInsiden = dataInsiden.slice((pageAmanInsiden - 1) * rowsPerPage, pageAmanInsiden * rowsPerPage);

  // --- Export Handlers ---
  const handleExportExcel = async () => {
    const result = await exportAsetExcel(dataTersaring, filterKategori, filterPenanganan);
    setToast({ message: result.message, type: result.success ? "success" : "error" });
  };

  const handleExportPDF = async () => {
    const result = await buildAsetPdf(dataTersaring, filterKategori, filterPenanganan, profilUsername);
    if (result.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }
    setPreviewPDF(result);
  };

  const handleExportPDFInsiden = async () => {
    const result = await buildInsidenPdf(dataInsiden, tglMulai, tglAkhir, profilUsername);
    if (result.error) {
      setToast({ message: result.error, type: "error" });
      return;
    }
    setPreviewPDF(result);
  };

  const tutupPreviewPDF = () => {
    if (previewPDF?.url) URL.revokeObjectURL(previewPDF.url);
    setPreviewPDF(null);
  };

  const konfirmasiDownloadPDF = () => {
    if (!previewPDF) return;
    previewPDF.doc.save(previewPDF.filename);
    setToast({ message: "Laporan PDF berhasil diunduh!", type: "success" });
    tutupPreviewPDF();
  };

  return (
    <div className={`h-screen flex font-sans transition-colors duration-300 overflow-hidden ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-800"}`}>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        isAdmin={isAdmin}
        darkMode={darkMode}
        logoSrc={diskominfoLogoFull}
      />

      <main className="flex-1 p-8 overflow-y-auto min-w-0">
        <TopBar
          activeMenu={activeMenu}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          profilUsername={profilUsername}
          profilBuka={profilBuka}
          setProfilBuka={setProfilBuka}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          handleLogout={handleLogout}
        />

        {activeMenu === "dashboard" && (
          <DashboardHome
            darkMode={darkMode}
            semuaDataAset={semuaDataAset}
            loading={loading}
            filterKategori={filterKategori}
            setFilterKategori={setFilterKategori}
            filterPenanganan={filterPenanganan}
            setFilterPenanganan={setFilterPenanganan}
            kataKunci={kataKunci}
            setKataKunci={setKataKunci}
            dataHalaman={dataHalaman}
            dataTersaring={dataTersaring}
            currentPage={pageAman}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            isAdmin={isAdmin}
            handleBukaEdit={handleBukaEdit}
            handleBukaHapus={handleBukaHapus}
            handleBukaPulihkan={handleBukaPulihkan}
            setPreviewBukti={setPreviewBukti}
            handleExportExcel={handleExportExcel}
            handleExportPDF={handleExportPDF}
            setModalTambahBuka={setModalTambahBuka}
          />
        )}

        {activeMenu === "insiden" && (
          <RiwayatInsiden
            darkMode={darkMode}
            loading={loading}
            tglMulai={tglMulai}
            setTglMulai={setTglMulai}
            tglAkhir={tglAkhir}
            setTglAkhir={setTglAkhir}
            handleExportPDFInsiden={handleExportPDFInsiden}
            dataHalamanInsiden={dataHalamanInsiden}
            dataInsiden={dataInsiden}
            currentPage={pageAmanInsiden}
            totalPages={totalPagesInsiden}
            setCurrentPage={setCurrentPageInsiden}
            rowsPerPage={rowsPerPage}
            setPreviewBukti={setPreviewBukti}
          />
        )}

        {activeMenu === "persuratan" && (
  <Persuratan darkMode={darkMode} isAdmin={isAdmin} setToast={setToast} />
)}

        {activeMenu === "tools" && (
          <div className={`p-6 rounded-xl shadow-lg border transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <ToolsDorking
              darkMode={darkMode}
              daftarAset={semuaDataAset}
              profilUsername={profilUsername}
              setPreviewPDF={setPreviewPDF}
              setToast={setToast}
            />
          </div>
        )}

        {activeMenu === "users" && (
          <div className={`p-6 rounded-xl shadow-lg border transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <ManajemenUser darkMode={darkMode} profilUsername={profilUsername} setToast={setToast} />
          </div>
        )}

        {activeMenu === "logs" && (
          <div className={`p-6 rounded-xl shadow-lg border transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
            <LogAktivitas darkMode={darkMode} setToast={setToast} />
          </div>
        )}
      </main>

      {/* --- MODAL DIALOGS --- */}
      <ModalTambah
        modalTambahBuka={modalTambahBuka}
        setModalTambahBuka={setModalTambahBuka}
        formData={formData}
        setFormData={setFormData}
        handleSimpanTambah={handleSimpanTambah}
        anomaliUnik={anomaliUnik}
        darkMode={darkMode}
      />

      <ModalEdit
        modalEditBuka={modalEditBuka}
        setModalEditBuka={setModalEditBuka}
        editData={editData}
        setEditData={setEditData}
        handleSimpanEdit={handleSimpanEdit}
        anomaliUnik={anomaliUnik}
        darkMode={darkMode}
      />

      <ModalHapus
        isOpen={modalHapusBuka}
        onClose={() => setModalHapusBuka(false)}
        onConfirm={handleKonfirmasiHapus}
        domainName={dataHapusTarget.nama_domain}
        darkMode={darkMode}
      />

      <ModalPulihkan
        isOpen={modalPulihkanBuka}
        onClose={() => setModalPulihkanBuka(false)}
        onConfirm={handleKonfirmasiPulihkan}
        namaDomain={dataPulihkanTarget.nama_domain}
        darkMode={darkMode}
      />

      <ModalPreviewPDF
        previewPDF={previewPDF}
        onClose={tutupPreviewPDF}
        onConfirmDownload={konfirmasiDownloadPDF}
        darkMode={darkMode}
      />

      <ModalPreviewBukti url={previewBukti} onClose={() => setPreviewBukti(null)} darkMode={darkMode} />
    </div>
  );
}