import Pagination from "../Pagination";
import { isAnomali } from "../../utils/dashboardHelpers";

export default function RiwayatInsiden({
  darkMode,
  loading,
  tglMulai,
  setTglMulai,
  tglAkhir,
  setTglAkhir,
  handleExportPDFInsiden,
  dataHalamanInsiden,
  dataInsiden,
  currentPage,
  totalPages,
  setCurrentPage,
  rowsPerPage,
}) {
  return (
    <div className={`p-6 rounded-xl shadow-lg border transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
      <h2 className="text-xl font-bold mb-2">Semua Kejadian Insiden</h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Pantau kapan setiap insiden keamanan siber terjadi di aset web Garut.
      </p>

      {/* Filter Rentang Tanggal & Download PDF */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Dari Tanggal</label>
          <input
            type="date"
            value={tglMulai}
            onChange={(e) => setTglMulai(e.target.value)}
            className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
          />
        </div>
        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Sampai Tanggal</label>
          <input
            type="date"
            value={tglAkhir}
            onChange={(e) => setTglAkhir(e.target.value)}
            className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
          />
        </div>

        {(tglMulai || tglAkhir) && (
          <button
            onClick={() => {
              setTglMulai("");
              setTglAkhir("");
            }}
            className={`px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer ${darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
          >
            Reset Tanggal
          </button>
        )}

        <button
          onClick={handleExportPDFInsiden}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg shadow cursor-pointer text-sm sm:ml-auto"
        >
          📄 Unduh PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className={`border-b ${darkMode ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-100 border-slate-300 text-slate-700"}`}>
            <tr>
              <th className="p-3">No</th>
              <th className="p-3">Nama Domain</th>
              <th className="p-3">Aset / Kategori</th>
              <th className="p-3">Jenis Anomali</th>
              <th className="p-3">Tanggal Kejadian Insiden</th>
              <th className="p-3">Status Penanganan</th>
              <th className="p-3">Diinput oleh</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-6 text-center italic text-slate-400">
                  Memuat data...
                </td>
              </tr>
            ) : dataHalamanInsiden.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-6 text-center italic text-slate-400">
                  {tglMulai || tglAkhir ? "Tidak ada insiden pada rentang tanggal ini." : "Belum ada data aset."}
                </td>
              </tr>
            ) : (
              dataHalamanInsiden.map((item, idx) => (
                <tr key={item.id || idx} className={`border-b ${darkMode ? "border-slate-800 hover:bg-slate-800/50" : "border-slate-200 hover:bg-slate-50"}`}>
                  <td className="p-3">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td className="p-3 font-semibold text-blue-500">{item.nama_domain}</td>
                  <td className="p-3">{item.jenis_aset || "Aset SKPD"}</td>
                  <td className="p-3">
                    {isAnomali(item.jenis_anomali) ? (
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 font-bold text-xs">{item.jenis_anomali}</span>
                    ) : (
                      <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{item.jenis_anomali || "Aman"}</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-amber-500">{item.tanggal_insiden || "Belum tercatat"}</td>
                  <td className="p-3">{item.status_perbaikan || "Belum Ditangani"}</td>
                  <td className={`p-3 text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>{item.dibuat_oleh || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalData={dataInsiden.length}
        darkMode={darkMode}
      />
    </div>
  );
}
