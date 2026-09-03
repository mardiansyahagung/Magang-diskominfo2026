import StatistikCard from "../StatistikCard";
import StatistikChart from "../StatistikChart";
import TabelAset from "../TabelAset";
import { isAnomali } from "../../utils/dashboardHelpers";

export default function DashboardHome({
  darkMode,
  semuaDataAset,
  loading,
  filterKategori,
  setFilterKategori,
  filterPenanganan,
  setFilterPenanganan,
  kataKunci,
  setKataKunci,
  dataHalaman,
  dataTersaring,
  currentPage,
  totalPages,
  setCurrentPage,
  isAdmin,
  handleBukaEdit,
  handleBukaHapus,
  handleBukaPulihkan,
  setPreviewBukti,
  handleExportExcel,
  handleExportPDF,
  setModalTambahBuka,
}) {
  return (
    <div>
      <div className="mb-6">
        <StatistikCard
          totalAset={semuaDataAset.length}
          webAktif={semuaDataAset.filter((d) => String(d.is_aktif) === "1").length}
          webMati={semuaDataAset.filter((d) => String(d.is_aktif) === "0").length}
          totalAnomali={semuaDataAset.filter((d) => isAnomali(d?.jenis_anomali)).length}
          filterKategori={filterKategori}
          setFilterKategori={setFilterKategori}
          setKataKunci={setKataKunci}
          semuaDataAset={semuaDataAset}
          darkMode={darkMode}
        />
      </div>

      <div className={`p-6 rounded-xl shadow-lg border mb-10 transition-colors ${darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}>
        <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={`text-xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Daftar Aset & Subdomain</h2>
            {filterKategori !== "semua" && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${darkMode ? "bg-red-950/60 border-red-800 text-red-400" : "bg-red-50 border-red-200 text-red-700"}`}>
                <span>
                  Filter: <span className="uppercase font-bold">{filterKategori}</span>
                </span>
                <button
                  onClick={() => setFilterKategori("semua")}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer ${darkMode ? "bg-red-900 hover:bg-red-800 text-white" : "bg-red-200 hover:bg-red-300 text-red-800"}`}
                  title="Reset Filter"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <select
              value={filterPenanganan}
              onChange={(e) => setFilterPenanganan(e.target.value)}
              className={`border px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer w-full sm:w-auto ${darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-700"}`}
            >
              <option value="semua">Semua Status</option>
              <option value="Belum Ditangani">Belum Ditangani</option>
              <option value="Sedang Ditangani">Sedang Ditangani</option>
              <option value="Selesai">Selesai</option>
            </select>

            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari domain atau tanggal insiden"
              className={`border px-4 py-2 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 w-full sm:w-64 ${darkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400" : "bg-white border-slate-300 text-slate-800"}`}
            />
          </div>

          <div className="space-x-2 flex-shrink-0 flex items-center">
            <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded shadow cursor-pointer text-sm">
              📥 Excel
            </button>
            <button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded shadow cursor-pointer text-sm">
              📄 PDF
            </button>
            {isAdmin && (
              <button onClick={() => setModalTambahBuka(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded shadow cursor-pointer text-sm">
                + Tambah Web
              </button>
            )}
          </div>
        </div>

        <TabelAset
          loading={loading}
          dataHalaman={dataHalaman}
          handleBukaEdit={handleBukaEdit}
          handleHapus={handleBukaHapus}
          handlePulihkan={handleBukaPulihkan}
          handleLihatBukti={(url) => setPreviewBukti(url)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalData={dataTersaring.length}
          darkMode={darkMode}
          isAdmin={isAdmin}
        />
      </div>

      <div className="mt-8">
        <h3 className={`text-xl font-bold mb-4 border-b pb-2 ${darkMode ? "text-white border-slate-800" : "text-slate-800 border-slate-200"}`}>
          📊 Ringkasan Visual
        </h3>
        <StatistikChart semuaDataAset={semuaDataAset} darkMode={darkMode} />
      </div>
    </div>
  );
}