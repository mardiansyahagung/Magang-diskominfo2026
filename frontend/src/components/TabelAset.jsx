import Pagination from "./Pagination";

export default function TabelAset({
  loading = false,
  dataHalaman = [], // Default value berupa array kosong agar tidak crash jika undefined
  handleBukaEdit,
  handleHapus,
  handlePulihkan,
  handleLihatBukti,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalData,
  darkMode = false,
  isAdmin = false,
}) {
  // Memastikan dataHalaman selalu berupa Array
  const safeData = Array.isArray(dataHalaman) ? dataHalaman : [];

  return (
    <div>
      <div
        className={`overflow-x-auto mt-4 border rounded-lg transition-colors ${
          darkMode ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <table className="min-w-full text-left border-collapse text-xs">
          <thead
            className={`sticky top-0 transition-colors ${
              darkMode
                ? "bg-slate-950 text-slate-200 border-b border-slate-800"
                : "bg-slate-800 text-white"
            }`}
          >
            <tr>
              <th className="p-2 border-b border-inherit">No</th>
              <th className="p-2 border-b border-inherit">Domain</th>
              <th className="p-2 border-b border-inherit">Kategori</th>
              <th className="p-2 border-b border-inherit">Server</th>
              <th className="p-2 border-b border-inherit">Anomali</th>
              <th className="p-2 border-b border-inherit">Insiden</th>
              <th className="p-2 border-b border-inherit">Evidence</th>
              <th className="p-2 border-b border-inherit text-center">Penanganan</th>
              <th className="p-2 border-b border-inherit text-center">Diinput oleh</th>
              {isAdmin && <th className="p-2 border-b border-inherit text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody
            className={`transition-colors ${
              darkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            {loading && (
              <tr>
                <td
                  colSpan={isAdmin ? "10" : "9"}
                  className={`text-center p-6 italic ${
                    darkMode ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && safeData.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? "10" : "9"}
                  className={`text-center p-6 ${
                    darkMode ? "text-slate-500" : "text-slate-500"
                  }`}
                >
                  Tidak ditemukan data yang sesuai.
                </td>
              </tr>
            )}

            {!loading &&
              safeData.map((baris, index) => {
                if (!baris) return null; // Proteksi baris null/undefined

                let nomorUrut = (currentPage - 1) * 10 + (index + 1);

                let badgeAktif =
                  String(baris.is_aktif) === "1"
                    ? darkMode
                      ? "bg-green-950 text-green-400 border border-green-800"
                      : "bg-green-100 text-green-700"
                    : darkMode
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-200 text-slate-700";

                let teksAktif = String(baris.is_aktif) === "1" ? "Aktif" : "Down";
                let anomali = baris.jenis_anomali || "Aman";
                let badgeAnomali =
                  anomali.toLowerCase() === "aman" || anomali === ""
                    ? "text-slate-400 text-[11px]"
                    : darkMode
                      ? "bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap"
                      : "bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap";

                let catatanText = baris.catatan || "";
                let urlMatch = catatanText.match(/https?:\/\/[^\s]+/);
                let cleanUrl = urlMatch ? urlMatch[0] : null;

                return (
                  <tr
                    key={baris.id || index}
                    className={`border-b transition-colors ${
                      darkMode
                        ? "border-slate-800 hover:bg-slate-900/60"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-2">{nomorUrut}</td>
                    <td className="p-2 max-w-[140px] truncate">
                      <a
                        href={
                          baris.nama_domain?.startsWith("http")
                            ? baris.nama_domain
                            : `http://${baris.nama_domain}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title={baris.nama_domain || "-"}
                        className={`font-bold hover:underline ${
                          darkMode ? "text-blue-400" : "text-blue-600"
                        }`}
                      >
                        {baris.nama_domain || "-"} ↗
                      </a>
                    </td>

                    <td className="p-2 font-medium max-w-[110px] truncate" title={baris.jenis_aset || "Aset Utama"}>
                      {baris.jenis_aset || "Aset Utama"}
                    </td>

                    <td className="p-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${badgeAktif}`}
                      >
                        {teksAktif}
                      </span>
                    </td>
                    <td className="p-2 max-w-[90px] truncate" title={anomali}>
                      <span className={badgeAnomali}>{anomali}</span>
                    </td>

                    <td className="p-2 whitespace-nowrap font-medium text-amber-500">
                      {baris.tanggal_insiden || "-"}
                    </td>

                    <td className="p-2 break-words max-w-[100px]">
                      {cleanUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleLihatBukti
                              ? handleLihatBukti(cleanUrl)
                              : window.open(cleanUrl, "_blank", "noopener,noreferrer")
                          }
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold inline-block shadow-sm transition whitespace-nowrap cursor-pointer ${
                            darkMode
                              ? "bg-blue-950 text-blue-400 border border-blue-800 hover:bg-blue-900"
                              : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                          }`}
                        >
                          Bukti 🔗
                        </button>
                      ) : (
                        <span
                          className={`text-[11px] ${
                            darkMode ? "text-slate-500" : "text-slate-500"
                          }`}
                        >
                          {catatanText || "Kosong"}
                        </span>
                      )}
                    </td>

                    <td
                      className={`p-2 font-bold text-center whitespace-nowrap ${
                        darkMode ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {baris.status_perbaikan || "Belum Ditangani"}
                    </td>

                    <td className={`p-2 text-center whitespace-nowrap text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {baris.dibuat_oleh || "-"}
                    </td>

                    {isAdmin && (
                      <td className="p-2">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleBukaEdit && handleBukaEdit(baris)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white w-7 h-7 flex items-center justify-center rounded text-xs shadow transition cursor-pointer"
                            title="Edit Aset"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              handleHapus && handleHapus(baris.id, baris.nama_domain)
                            }
                            className="bg-red-600 hover:bg-red-700 text-white w-7 h-7 flex items-center justify-center rounded text-xs shadow transition cursor-pointer"
                            title="Hapus Aset"
                          >
                            🗑️
                          </button>
                          <button
                            onClick={() =>
                              handlePulihkan && handlePulihkan(baris.id, baris.nama_domain)
                            }
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-7 h-7 flex items-center justify-center rounded text-xs shadow transition cursor-pointer"
                            title="Pulihkan Aset Menjadi Aman"
                          >
                            ✅
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalData={totalData || safeData.length}
        darkMode={darkMode}
      />
    </div>
  );
}