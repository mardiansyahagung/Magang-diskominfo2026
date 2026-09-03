export default function ModalEdit({
  modalEditBuka,
  setModalEditBuka,
  editData,
  setEditData,
  handleSimpanEdit,
  anomaliUnik,
  darkMode,
}) {
  if (!modalEditBuka) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-2xl shadow-2xl max-w-lg w-full p-6 border transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
      >
        <div
          className={`flex justify-between items-center mb-4 border-b pb-3 ${darkMode ? "border-slate-800" : "border-slate-200"}`}
        >
          <h3 className="text-xl font-bold">✏️ Edit Aset Web</h3>
          <button
            onClick={() => setModalEditBuka(false)}
            className={`font-bold text-xl cursor-pointer ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSimpanEdit} className="space-y-4">
          <div>
            <label
              className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Nama Domain
            </label>
            <input
              type="text"
              required
              value={editData.nama_domain}
              onChange={(e) =>
                setEditData({ ...editData, nama_domain: e.target.value })
              }
              className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Kategori Aset
              </label>
              <select
                value={editData.jenis_aset}
                onChange={(e) =>
                  setEditData({ ...editData, jenis_aset: e.target.value })
                }
                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
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
                className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Tanggal Insiden
              </label>
              <input
                type="date"
                required
                value={editData.tanggal_insiden || ""}
                onChange={(e) =>
                  setEditData({ ...editData, tanggal_insiden: e.target.value })
                }
                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Status Server
              </label>
              <select
                value={editData.is_aktif}
                onChange={(e) =>
                  setEditData({ ...editData, is_aktif: e.target.value })
                }
                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
              >
                <option value="1">Aktif</option>
                <option value="0">Down</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                Status Penanganan
              </label>
              <select
                value={editData.status_perbaikan}
                onChange={(e) =>
                  setEditData({ ...editData, status_perbaikan: e.target.value })
                }
                className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
              >
                <option value="Belum Ditangani">Belum Ditangani</option>
                <option value="Sedang Ditangani">Sedang Ditangani</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Jenis Anomali
            </label>
            <input
              type="text"
              list="listAnomaliEdit"
              required
              value={editData.jenis_anomali}
              onChange={(e) =>
                setEditData({ ...editData, jenis_anomali: e.target.value })
              }
              className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-list-button]:hidden ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
            />
            <datalist id="listAnomaliEdit">
              <option value="Aman" />
              <option value="Judol" />
              <option value="Kebocoran Data" />
            </datalist>
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-700"}`}
            >
              Catatan / Link Evidence
            </label>
            <textarea
              rows="3"
              value={editData.catatan}
              onChange={(e) =>
                setEditData({ ...editData, catatan: e.target.value })
              }
              className={`w-full border px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
            ></textarea>
          </div>

          <div
            className={`flex justify-end space-x-3 pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}
          >
            <button
              type="button"
              onClick={() => setModalEditBuka(false)}
              className={`font-bold px-4 py-2 rounded-lg transition cursor-pointer ${darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg shadow transition cursor-pointer"
            >
              Perbarui Aset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
