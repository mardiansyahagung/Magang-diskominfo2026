import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Label & warna badge untuk tiap jenis aksi
const LABEL_AKSI = {
  tambah: { label: "➕ Tambah", warna: "text-green-500" },
  edit: { label: "✏️ Edit", warna: "text-amber-500" },
  hapus: { label: "🗑️ Hapus", warna: "text-red-500" },
  pulihkan: { label: "✅ Pulihkan", warna: "text-emerald-500" },
  ubah_role: { label: "🔑 Ubah Role", warna: "text-blue-500" },
  hapus_user: { label: "🗑️ Hapus User", warna: "text-red-500" },
};

export default function LogAktivitas({ darkMode = false, setToast }) {
  const [daftarLog, setDaftarLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorAkses, setErrorAkses] = useState(false);
  const [kataKunci, setKataKunci] = useState("");
  const [tglMulai, setTglMulai] = useState("");
  const [tglAkhir, setTglAkhir] = useState("");

  const muatLog = async () => {
    try {
      setLoading(true);
      setErrorAkses(false);
      const res = await fetch(`${API_BASE_URL}/log-aktivitas`, { credentials: "include" });

      if (res.status === 403) {
        setErrorAkses(true);
        setDaftarLog([]);
        return;
      }
      if (!res.ok) throw new Error(`Server status: ${res.status}`);

      const data = await res.json();
      setDaftarLog(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat log aktivitas:", err);
      setToast?.({ message: "Gagal memuat log aktivitas dari server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatLog();
  }, []);

  const logTersaring = daftarLog.filter((item) => {
    const q = kataKunci.toLowerCase().trim();
    const cocokKataKunci =
      !q ||
      (item.username || "").toLowerCase().includes(q) ||
      (item.detail || "").toLowerCase().includes(q) ||
      (item.aksi || "").toLowerCase().includes(q);

    if (!cocokKataKunci) return false;

    if (tglMulai || tglAkhir) {
      // Ambil bagian tanggal saja (YYYY-MM-DD) dari "YYYY-MM-DD HH:MM:SS"
      const tglItem = (item.waktu || "").slice(0, 10);
      if (!tglItem) return false;
      if (tglMulai && tglItem < tglMulai) return false;
      if (tglAkhir && tglItem > tglAkhir) return false;
    }

    return true;
  });

  if (errorAkses) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-2">📜 Log Aktivitas</h2>
        <p className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"}`}>
          Halaman ini hanya bisa diakses oleh admin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">📜 Log Aktivitas</h2>
      <p className={`text-sm mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Riwayat perubahan data yang dilakukan oleh admin — tambah, edit, hapus aset, dan perubahan akses pengguna.
      </p>

      <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Pencarian
          </label>
          <input
            type="text"
            value={kataKunci}
            onChange={(e) => setKataKunci(e.target.value)}
            placeholder="Cari username, aksi, atau detail..."
            className={`border px-4 py-2 rounded-lg text-sm shadow-sm focus:outline-none focus:border-blue-500 w-full sm:w-80 ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400"
                : "bg-white border-slate-300 text-slate-800"
            }`}
          />
        </div>

        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Dari Tanggal
          </label>
          <input
            type="date"
            value={tglMulai}
            onChange={(e) => setTglMulai(e.target.value)}
            className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${
              darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
            }`}
          />
        </div>

        <div>
          <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
            Sampai Tanggal
          </label>
          <input
            type="date"
            value={tglAkhir}
            onChange={(e) => setTglAkhir(e.target.value)}
            className={`border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer ${
              darkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"
            }`}
          />
        </div>

        {(tglMulai || tglAkhir) && (
          <button
            onClick={() => {
              setTglMulai("");
              setTglAkhir("");
            }}
            className={`px-3 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
          >
            Reset Tanggal
          </button>
        )}
      </div>

      <div
        className={`overflow-x-auto border rounded-lg transition-colors ${
          darkMode ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <table className="min-w-full text-left text-sm">
          <thead
            className={
              darkMode
                ? "bg-slate-950 text-slate-200 border-b border-slate-800"
                : "bg-slate-800 text-white"
            }
          >
            <tr>
              <th className="p-3">Waktu</th>
              <th className="p-3">Pengguna</th>
              <th className="p-3">Aksi</th>
              <th className="p-3">Detail</th>
            </tr>
          </thead>
          <tbody className={darkMode ? "text-slate-300" : "text-slate-700"}>
            {loading && (
              <tr>
                <td colSpan="4" className="text-center p-6 italic text-slate-500">
                  Memuat data...
                </td>
              </tr>
            )}

            {!loading && logTersaring.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-6 text-slate-500">
                  {tglMulai || tglAkhir
                    ? "Tidak ada aktivitas pada rentang tanggal ini."
                    : "Belum ada aktivitas tercatat."}
                </td>
              </tr>
            )}

            {!loading &&
              logTersaring.map((item) => {
                const infoAksi = LABEL_AKSI[item.aksi] || { label: item.aksi, warna: "text-slate-400" };

                return (
                  <tr
                    key={item.id}
                    className={`border-b transition-colors ${
                      darkMode
                        ? "border-slate-800 hover:bg-slate-900/60"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <td className={`p-3 whitespace-nowrap text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {item.waktu}
                    </td>
                    <td className="p-3 font-semibold whitespace-nowrap">{item.username || "-"}</td>
                    <td className={`p-3 font-bold whitespace-nowrap ${infoAksi.warna}`}>{infoAksi.label}</td>
                    <td className="p-3">{item.detail || "-"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}