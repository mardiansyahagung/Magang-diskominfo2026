import { API_BASE_URL } from "../../utils/dashboardHelpers";

const FILE_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export default function TabelSuratMasuk({ data = [], loading, darkMode, isAdmin, handleEdit, handleHapus }) {
  const safeData = Array.isArray(data) ? data : [];

  const badgeStatus = (status) => {
    const selesai = status === "Selesai";
    return selesai
      ? darkMode
        ? "bg-green-950 text-green-400 border border-green-800"
        : "bg-green-100 text-green-700"
      : darkMode
        ? "bg-amber-950 text-amber-400 border border-amber-800"
        : "bg-amber-100 text-amber-700";
  };

  return (
    <div className={`overflow-x-auto mt-2 border rounded-lg transition-colors ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
      <table className="min-w-full text-left border-collapse text-xs">
        <thead
          className={`sticky top-0 transition-colors ${
            darkMode ? "bg-slate-950 text-slate-200 border-b border-slate-800" : "bg-slate-800 text-white"
          }`}
        >
          <tr>
            <th className="p-2 border-b border-inherit">No</th>
            <th className="p-2 border-b border-inherit">Nomor Surat</th>
            <th className="p-2 border-b border-inherit">Tanggal</th>
            <th className="p-2 border-b border-inherit">Aset Terkait</th>
            <th className="p-2 border-b border-inherit">Balasan Untuk</th>
            <th className="p-2 border-b border-inherit">Instansi Asal</th>
            <th className="p-2 border-b border-inherit">Perihal</th>
            <th className="p-2 border-b border-inherit">File</th>
            <th className="p-2 border-b border-inherit">Status</th>
            {isAdmin && <th className="p-2 border-b border-inherit text-center">Aksi</th>}
          </tr>
        </thead>
        <tbody className={`transition-colors ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          {loading && (
            <tr>
              <td colSpan={isAdmin ? 10 : 9} className="text-center p-6 italic text-slate-500">
                Memuat data...
              </td>
            </tr>
          )}
          {!loading && safeData.length === 0 && (
            <tr>
              <td colSpan={isAdmin ? 10 : 9} className="text-center p-6 text-slate-500">
                Belum ada surat masuk.
              </td>
            </tr>
          )}
          {!loading &&
            safeData.map((s, i) => (
              <tr
                key={s.id}
                className={`border-b transition-colors ${
                  darkMode ? "border-slate-800 hover:bg-slate-900/60" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-semibold whitespace-nowrap">{s.nomor_surat}</td>
                <td className="p-2 whitespace-nowrap">{s.tanggal_surat}</td>
                <td className="p-2 max-w-[120px] truncate" title={s.nama_domain || "-"}>
                  {s.nama_domain || "-"}
                </td>
                <td className="p-2 max-w-[120px] truncate text-slate-400" title={s.nomor_surat_keluar || "-"}>
                  {s.nomor_surat_keluar || "-"}
                </td>
                <td className="p-2 max-w-[130px] truncate" title={s.instansi_asal}>
                  {s.instansi_asal}
                </td>
                <td className="p-2 max-w-[150px] truncate" title={s.perihal}>
                  {s.perihal}
                </td>
                <td className="p-2">
                  {s.file_surat ? (
                    <a
                      href={`${FILE_ORIGIN}${s.file_surat}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold inline-block ${
                        darkMode ? "bg-blue-950 text-blue-400 border border-blue-800" : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}
                    >
                      Lihat 🔗
                    </a>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Tidak ada</span>
                  )}
                </td>
                <td className="p-2">
                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${badgeStatus(s.status_penanganan)}`}>
                    {s.status_penanganan}
                  </span>
                </td>
                {isAdmin && (
                  <td className="p-2">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white w-7 h-7 flex items-center justify-center rounded text-xs shadow transition cursor-pointer"
                        title="Edit Surat"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleHapus(s.id, s.nomor_surat)}
                        className="bg-red-600 hover:bg-red-700 text-white w-7 h-7 flex items-center justify-center rounded text-xs shadow transition cursor-pointer"
                        title="Hapus Surat"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
