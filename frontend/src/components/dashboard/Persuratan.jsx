import { useState, useEffect, useMemo } from "react";
import { API_BASE_URL } from "../../utils/dashboardHelpers";
import TabelSuratKeluar from "./TabelSuratKeluar";
import TabelSuratMasuk from "./TabelSuratMasuk";
import ModalSuratKeluar from "./ModalSuratKeluar";
import ModalSuratMasuk from "./ModalSuratMasuk";
import ModalHapus from "../ModalHapus";

const FORM_KELUAR_KOSONG = {
  aset_id: "",
  nomor_surat: "",
  tanggal_surat: "",
  instansi_tujuan: "",
  perihal: "",
  isi_ringkas: "",
};

const FORM_MASUK_KOSONG = {
  surat_keluar_id: "",
  nomor_surat: "",
  tanggal_surat: "",
  instansi_asal: "",
  perihal: "",
  status_penanganan: "Sedang Ditangani",
  catatan: "",
};

export default function Persuratan({ darkMode, isAdmin, setToast }) {
  const [activeTab, setActiveTab] = useState("keluar"); // "keluar" | "masuk"
  const [loading, setLoading] = useState(true);

  const [daftarAset, setDaftarAset] = useState([]);
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [kataKunci, setKataKunci] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");

  // --- Modal Tambah/Edit Surat Keluar ---
  const [modalKeluarBuka, setModalKeluarBuka] = useState(false);
  const [modeKeluar, setModeKeluar] = useState("tambah"); // "tambah" | "edit"
  const [formKeluar, setFormKeluar] = useState(FORM_KELUAR_KOSONG);
  const [fileKeluar, setFileKeluar] = useState(null);

  // --- Modal Tambah/Edit Surat Masuk ---
  const [modalMasukBuka, setModalMasukBuka] = useState(false);
  const [modeMasuk, setModeMasuk] = useState("tambah");
  const [formMasuk, setFormMasuk] = useState(FORM_MASUK_KOSONG);
  const [fileMasuk, setFileMasuk] = useState(null);

  // --- Modal Hapus (dipakai gantian oleh kedua tab) ---
  const [modalHapusBuka, setModalHapusBuka] = useState(false);
  const [hapusTarget, setHapusTarget] = useState({ id: null, label: "", jenis: "keluar" });

  const muatSemuaData = async () => {
    try {
      setLoading(true);
      const [resAset, resKeluar, resMasuk] = await Promise.all([
        fetch(`${API_BASE_URL}/aset`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/surat-keluar`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/surat-masuk`, { credentials: "include" }),
      ]);

      const [dataAset, dataKeluar, dataMasuk] = await Promise.all([
        resAset.ok ? resAset.json() : [],
        resKeluar.ok ? resKeluar.json() : [],
        resMasuk.ok ? resMasuk.json() : [],
      ]);

      setDaftarAset(Array.isArray(dataAset) ? dataAset : []);
      setSuratKeluar(Array.isArray(dataKeluar) ? dataKeluar : []);
      setSuratMasuk(Array.isArray(dataMasuk) ? dataMasuk : []);
    } catch (err) {
      console.error("Gagal memuat data persuratan:", err);
      setToast?.({ message: "Gagal memuat data persuratan dari server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatSemuaData();
  }, []);

  // --- Handler Surat Keluar ---
  const bukaTambahKeluar = () => {
    setModeKeluar("tambah");
    setFormKeluar(FORM_KELUAR_KOSONG);
    setFileKeluar(null);
    setModalKeluarBuka(true);
  };

  const bukaEditKeluar = (baris) => {
    setModeKeluar("edit");
    setFormKeluar({
      id: baris.id,
      aset_id: baris.aset_id || "",
      nomor_surat: baris.nomor_surat || "",
      tanggal_surat: baris.tanggal_surat || "",
      instansi_tujuan: baris.instansi_tujuan || "",
      perihal: baris.perihal || "",
      isi_ringkas: baris.isi_ringkas || "",
      status: baris.status || "Menunggu Balasan",
      file_surat: baris.file_surat || "",
    });
    setFileKeluar(null);
    setModalKeluarBuka(true);
  };

  const simpanSuratKeluar = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formKeluar).forEach(([k, v]) => {
        if (k !== "file_surat") fd.append(k, v ?? "");
      });
      if (fileKeluar) fd.append("file_surat", fileKeluar);

      const url = modeKeluar === "edit" ? `${API_BASE_URL}/surat-keluar/${formKeluar.id}` : `${API_BASE_URL}/surat-keluar`;
      const method = modeKeluar === "edit" ? "PUT" : "POST";

      const res = await fetch(url, { method, credentials: "include", body: fd });
      if (res.ok) {
        setModalKeluarBuka(false);
        muatSemuaData();
        setToast?.({
          message: modeKeluar === "edit" ? "Surat keluar berhasil diperbarui!" : "Surat keluar berhasil ditambahkan!",
          type: "success",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setToast?.({ message: err.message || "Gagal menyimpan surat keluar.", type: "error" });
      }
    } catch (err) {
      setToast?.({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  // --- Handler Surat Masuk ---
  const bukaTambahMasuk = () => {
    setModeMasuk("tambah");
    setFormMasuk(FORM_MASUK_KOSONG);
    setFileMasuk(null);
    setModalMasukBuka(true);
  };

  const bukaEditMasuk = (baris) => {
    setModeMasuk("edit");
    setFormMasuk({
      id: baris.id,
      surat_keluar_id: baris.surat_keluar_id || "",
      nomor_surat: baris.nomor_surat || "",
      tanggal_surat: baris.tanggal_surat || "",
      instansi_asal: baris.instansi_asal || "",
      perihal: baris.perihal || "",
      status_penanganan: baris.status_penanganan || "Sedang Ditangani",
      catatan: baris.catatan || "",
      file_surat: baris.file_surat || "",
    });
    setFileMasuk(null);
    setModalMasukBuka(true);
  };

  const simpanSuratMasuk = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(formMasuk).forEach(([k, v]) => {
        if (k !== "file_surat") fd.append(k, v ?? "");
      });
      if (fileMasuk) fd.append("file_surat", fileMasuk);

      const url = modeMasuk === "edit" ? `${API_BASE_URL}/surat-masuk/${formMasuk.id}` : `${API_BASE_URL}/surat-masuk`;
      const method = modeMasuk === "edit" ? "PUT" : "POST";

      const res = await fetch(url, { method, credentials: "include", body: fd });
      if (res.ok) {
        setModalMasukBuka(false);
        muatSemuaData();
        setToast?.({
          message: modeMasuk === "edit" ? "Surat masuk berhasil diperbarui!" : "Surat masuk berhasil dicatat!",
          type: "success",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setToast?.({ message: err.message || "Gagal menyimpan surat masuk.", type: "error" });
      }
    } catch (err) {
      setToast?.({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  // --- Handler Hapus (dipakai gantian) ---
  const bukaHapus = (id, label, jenis) => {
    setHapusTarget({ id, label, jenis });
    setModalHapusBuka(true);
  };

  const konfirmasiHapus = async () => {
    try {
      const endpoint = hapusTarget.jenis === "keluar" ? "surat-keluar" : "surat-masuk";
      const res = await fetch(`${API_BASE_URL}/${endpoint}/${hapusTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setModalHapusBuka(false);
        muatSemuaData();
        setToast?.({ message: "Surat berhasil dihapus.", type: "success" });
      } else {
        setToast?.({ message: "Gagal menghapus surat.", type: "error" });
      }
    } catch (err) {
      setToast?.({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    }
  };

  // --- Filter tanggal (berlaku untuk tab manapun yang aktif) ---
  const dalamRentangTanggal = (tanggalSurat) => {
    if (!tglMulai && !tglAkhir) return true;
    if (!tanggalSurat) return false;
    if (tglMulai && tanggalSurat < tglMulai) return false;
    if (tglAkhir && tanggalSurat > tglAkhir) return false;
    return true;
  };

  const resetFilterTanggal = () => {
    setTglMulai("");
    setTglAkhir("");
  };

  // --- Filter pencarian + tanggal ---
  const suratKeluarTersaring = useMemo(() => {
    const kw = kataKunci.trim().toLowerCase();
    return suratKeluar
      .filter((s) => dalamRentangTanggal(s.tanggal_surat))
      .filter(
        (s) =>
          !kw ||
          s.nomor_surat?.toLowerCase().includes(kw) ||
          s.instansi_tujuan?.toLowerCase().includes(kw) ||
          s.perihal?.toLowerCase().includes(kw) ||
          s.nama_domain?.toLowerCase().includes(kw),
      )
      .sort((a, b) => (b.tanggal_surat || "").localeCompare(a.tanggal_surat || ""));
  }, [suratKeluar, kataKunci, tglMulai, tglAkhir]);

  const suratMasukTersaring = useMemo(() => {
    const kw = kataKunci.trim().toLowerCase();
    return suratMasuk
      .filter((s) => dalamRentangTanggal(s.tanggal_surat))
      .filter(
        (s) =>
          !kw ||
          s.nomor_surat?.toLowerCase().includes(kw) ||
          s.instansi_asal?.toLowerCase().includes(kw) ||
          s.perihal?.toLowerCase().includes(kw) ||
          s.nama_domain?.toLowerCase().includes(kw),
      )
      .sort((a, b) => (b.tanggal_surat || "").localeCompare(a.tanggal_surat || ""));
  }, [suratMasuk, kataKunci, tglMulai, tglAkhir]);

  return (
    <div className={`p-6 rounded-xl shadow-lg border transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      {/* Header + Tab Switcher */}
      
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("keluar")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === "keluar"
                ? "bg-blue-600 text-white shadow"
                : darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            📤 Surat Keluar ({suratKeluar.length})
          </button>
          <button
            onClick={() => setActiveTab("masuk")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
              activeTab === "masuk"
                ? "bg-blue-600 text-white shadow"
                : darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            📥 Surat Masuk ({suratMasuk.length})
          </button>
        </div>

        <div className="flex gap-2 items-center flex-1 justify-end min-w-[220px]">
          <input
            type="text"
            placeholder="Cari nomor surat, instansi, atau domain..."
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-full max-w-xs ${
              darkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-800"
            }`}
          />
          {isAdmin && activeTab === "keluar" && (
            <button
              onClick={bukaTambahKeluar}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow whitespace-nowrap transition cursor-pointer"
            >
              + Surat Keluar
            </button>
          )}
          {isAdmin && activeTab === "masuk" && (
            <button
              onClick={bukaTambahMasuk}
              disabled={suratKeluar.length === 0}
              title={suratKeluar.length === 0 ? "Buat surat keluar terlebih dahulu" : ""}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg shadow whitespace-nowrap transition cursor-pointer"
            >
              + Surat Masuk
            </button>
          )}
        </div>
      </div>

      {/* Filter Rentang Tanggal */}
      <div className={`flex flex-wrap items-end gap-3 mb-4 p-3 rounded-lg border ${darkMode ? "bg-slate-800/50 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Dari Tanggal</label>
          <input
            type="date"
            value={tglMulai}
            onChange={(e) => setTglMulai(e.target.value)}
            className={`border px-2.5 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${
              darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
            }`}
          />
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>Sampai Tanggal</label>
          <input
            type="date"
            value={tglAkhir}
            onChange={(e) => setTglAkhir(e.target.value)}
            className={`border px-2.5 py-1.5 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${
              darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
            }`}
          />
        </div>
        {(tglMulai || tglAkhir) && (
          <button
            onClick={resetFilterTanggal}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
              darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
          >
            ✕ Reset Tanggal
          </button>
        )}
        <span className={`text-xs ml-auto ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Menampilkan {activeTab === "keluar" ? suratKeluarTersaring.length : suratMasukTersaring.length} surat
        </span>
      </div>

      {activeTab === "keluar" ? (
        <TabelSuratKeluar
          data={suratKeluarTersaring}
          loading={loading}
          darkMode={darkMode}
          isAdmin={isAdmin}
          handleEdit={bukaEditKeluar}
          handleHapus={(id, nomor) => bukaHapus(id, nomor, "keluar")}
        />
      ) : (
        <TabelSuratMasuk
          data={suratMasukTersaring}
          loading={loading}
          darkMode={darkMode}
          isAdmin={isAdmin}
          handleEdit={bukaEditMasuk}
          handleHapus={(id, nomor) => bukaHapus(id, nomor, "masuk")}
        />
      )}

      <ModalSuratKeluar
        modalBuka={modalKeluarBuka}
        setModalBuka={setModalKeluarBuka}
        mode={modeKeluar}
        formData={formKeluar}
        setFormData={setFormKeluar}
        file={fileKeluar}
        setFile={setFileKeluar}
        handleSimpan={simpanSuratKeluar}
        daftarAset={daftarAset}
        darkMode={darkMode}
      />

      <ModalSuratMasuk
        modalBuka={modalMasukBuka}
        setModalBuka={setModalMasukBuka}
        mode={modeMasuk}
        formData={formMasuk}
        setFormData={setFormMasuk}
        file={fileMasuk}
        setFile={setFileMasuk}
        handleSimpan={simpanSuratMasuk}
        daftarSuratKeluar={suratKeluar}
        darkMode={darkMode}
      />

      <ModalHapus
        isOpen={modalHapusBuka}
        onClose={() => setModalHapusBuka(false)}
        onConfirm={konfirmasiHapus}
        domainName={hapusTarget.label}
        darkMode={darkMode}
      />
    </div>



  );
}
