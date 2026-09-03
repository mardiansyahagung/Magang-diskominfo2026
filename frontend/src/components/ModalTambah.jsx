import React, { useEffect } from "react";

export default function ModalTambah({
  modalTambahBuka,
  setModalTambahBuka,
  formData,
  setFormData,
  handleSimpanTambah,
  anomaliUnik = [],
  darkMode,
}) {
  // 1. Pindahkan useEffect ke ATAS sebelum conditional return (Rules of Hooks)
  useEffect(() => {
    if (modalTambahBuka) {
      const today = new Date().toISOString().split("T")[0];

      setFormData((prev) => ({
        ...prev,
        tanggal_insiden: prev?.tanggal_insiden || today,
        jenis_aset: prev?.jenis_aset || "Web Dinas / SKPD",
        is_aktif: prev?.is_aktif ?? "1",
        status_perbaikan: prev?.status_perbaikan || "Belum Ditangani",
      }));
    }
  }, [modalTambahBuka, setFormData]);

  // 2. Early return diletakkan SETELAH semua React Hooks
  if (!modalTambahBuka) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
      {/* Container Modal Compact */}
      <div
        className={`rounded-xl shadow-2xl max-w-md w-full p-4 border transition-colors ${
          darkMode
            ? "bg-slate-900 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header Modal */}
        <div
          className={`flex justify-between items-center mb-3 border-b pb-2 ${
            darkMode ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <h3 className="text-lg font-bold flex items-center gap-1.5">
            ➕ Tambah Aset Web Baru
          </h3>
          <button
            type="button"
            onClick={() => setModalTambahBuka(false)}
            className={`font-bold text-lg cursor-pointer transition ${
              darkMode
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            ✕
          </button>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSimpanTambah} className="space-y-3 text-sm">
          {/* Nama Domain */}
          <div>
            <label
              className={`block font-semibold mb-1 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Nama Domain <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: garutkab.go.id"
              value={formData.nama_domain || ""}
              onChange={(e) =>
                setFormData({ ...formData, nama_domain: e.target.value })
              }
              className={`w-full border px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-800"
              }`}
            />
          </div>

          {/* Kategori Aset & Tanggal Insiden (Grid 2 Kolom) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Kategori Aset
              </label>
              <select
                value={formData.jenis_aset || "Web Dinas / SKPD"}
                onChange={(e) =>
                  setFormData({ ...formData, jenis_aset: e.target.value })
                }
                className={`w-full border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="Web Dinas / SKPD">Web Dinas / SKPD</option>
                <option value="Web Kecamatan">Web Kecamatan</option>
                <option value="Web Desa / Kelurahan">
                  Web Desa / Kelurahan
                </option>
                <option value="Web Puskesmas / RSUD">
                  Web Puskesmas / RSUD
                </option>
                <option value="Aplikasi Sistem">Aplikasi Sistem</option>
              </select>
            </div>

            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Tanggal Insiden
              </label>
              <input
                type="date"
                required
                value={formData.tanggal_insiden || ""}
                onChange={(e) =>
                  setFormData({ ...formData, tanggal_insiden: e.target.value })
                }
                className={`w-full border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              />
            </div>
          </div>

          {/* Status Server & Status Penanganan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Status Server
              </label>
              <select
                value={formData.is_aktif ?? "1"}
                onChange={(e) =>
                  setFormData({ ...formData, is_aktif: e.target.value })
                }
                className={`w-full border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="1">Aktif</option>
                <option value="0">Down</option>
              </select>
            </div>

            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Status Penanganan
              </label>
              <select
                value={formData.status_perbaikan || "Belum Ditangani"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status_perbaikan: e.target.value,
                  })
                }
                className={`w-full border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${
                  darkMode
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-white border-slate-300 text-slate-800"
                }`}
              >
                <option value="Belum Ditangani">Belum Ditangani</option>
                <option value="Sedang Ditangani">Sedang Ditangani</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {/* Jenis Anomali */}
          <div>
            <label
              className={`block font-semibold mb-1 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Jenis Anomali
            </label>
            <input
              type="text"
              list="listAnomali"
              required
              placeholder="Ketik atau pilih anomali..."
              value={formData.jenis_anomali || ""}
              onChange={(e) =>
                setFormData({ ...formData, jenis_anomali: e.target.value })
              }
              style={{ colorScheme: darkMode ? "dark" : "light" }}
              className={`w-full border px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-800"
              }`}
            />
            <datalist id="listAnomali">
              <option value="Aman" />
              <option value="Judol" />
              <option value="Kebocoran Data" />
            </datalist>
          </div>

          {/* Catatan / Link Evidence */}
          <div>
            <label
              className={`block font-semibold mb-1 ${
                darkMode ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Catatan / Link Evidence
            </label>
            <textarea
              rows="2"
              placeholder="Masukkan link bukti atau keterangan..."
              value={formData.catatan || ""}
              onChange={(e) =>
                setFormData({ ...formData, catatan: e.target.value })
              }
              className={`w-full border px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                  : "bg-white border-slate-300 text-slate-800"
              }`}
            ></textarea>
          </div>

          {/* Tombol Aksi */}
          <div
            className={`flex justify-end space-x-2 pt-3 border-t ${
              darkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <button
              type="button"
              onClick={() => setModalTambahBuka(false)}
              className={`font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-md transition cursor-pointer"
            >
              Simpan Aset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}