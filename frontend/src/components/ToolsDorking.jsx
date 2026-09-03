import { useState, useMemo, useRef, useEffect } from "react";
import { buildDorkingPdf } from "../utils/exportDorkingPdf";

// --- Preset Dork Siap Pakai ---
const PRESET_DORK = [
  {
    id: "pii_leak",
    label: "🪪 Cek Kebocoran NIK/KTP",
    deskripsi: 'Dokumen publik yang berpotensi memuat NIK, No. KTP, atau Nama Lengkap warga.',
    query: '(filetype:pdf OR filetype:xlsx OR filetype:csv) ("NIK" OR "No. KTP" OR "Nama Lengkap")',
  },
  {
    id: "judol",
    label: "🎰 Cek Indikasi Judol",
    deskripsi: "Halaman yang terindikasi disisipi konten judi online (deface/SEO poisoning).",
    query: "(slot OR gacor OR kasino OR togel)",
  },
];

export default function ToolsDorking({
  darkMode = false,
  daftarAset = [],
  profilUsername = "",
  setPreviewPDF,
  setToast,
}) {
  const [domain, setDomain] = useState("");
  const [dorkKustom, setDorkKustom] = useState("");
  const [hasilQuery, setHasilQuery] = useState([]);
  const [disalin, setDisalin] = useState(null);
  const [dropdownTerbuka, setDropdownTerbuka] = useState(false);
  const [mengekspor, setMengekspor] = useState(false);
  const comboboxRef = useRef(null);

  // Ambil daftar domain unik dari data aset yang berstatus aktif saja
  const opsiDomain = useMemo(() => {
    const unik = new Set(
      (Array.isArray(daftarAset) ? daftarAset : [])
        .filter((item) => String(item?.is_aktif) === "1")
        .map((item) => item?.nama_domain)
        .filter(Boolean)
    );
    return Array.from(unik).sort();
  }, [daftarAset]);

  // Daftar domain yang terfilter sesuai apa yang sudah diketik user
  const opsiTerfilter = useMemo(() => {
    if (!domain.trim()) return opsiDomain;
    const lower = domain.toLowerCase();
    return opsiDomain.filter((d) => d.toLowerCase().includes(lower));
  }, [domain, opsiDomain]);

  const pilihDomain = (d) => {
    setDomain(d);
    setDropdownTerbuka(false);
  };

  // Tutup dropdown kalau klik di luar area combobox
  useEffect(() => {
    const handleClickLuar = (e) => {
      if (comboboxRef.current && !comboboxRef.current.contains(e.target)) {
        setDropdownTerbuka(false);
      }
    };
    document.addEventListener("mousedown", handleClickLuar);
    return () => document.removeEventListener("mousedown", handleClickLuar);
  }, []);

  const bersihkanDomain = (raw) => {
    return raw
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
  };

  const tambahKeHasil = (label, queryDork) => {
    const target = bersihkanDomain(domain);
    if (!target) return;

    const queryLengkap = `site:${target} ${queryDork}`;

    setHasilQuery((prev) => {
      // Hindari duplikat query yang persis sama
      if (prev.some((item) => item.query === queryLengkap)) return prev;
      return [...prev, { label, query: queryLengkap, tanggal: new Date().toISOString(), status: "belum" }];
    });
  };

  const gunakanPreset = (preset) => {
    tambahKeHasil(preset.label, preset.query);
  };

  const tambahDorkKustom = () => {
    if (!dorkKustom.trim()) return;
    tambahKeHasil("Query Kustom", dorkKustom.trim());
    setDorkKustom("");
  };

  const hapusSatu = (index) => {
    setHasilQuery((prev) => prev.filter((_, i) => i !== index));
  };

  // Tandai manual hasil pengecekan setelah user melihat sendiri hasil pencarian di Google
  const ubahStatus = (index, status) => {
    setHasilQuery((prev) => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  };

  const bersihkanSemua = () => setHasilQuery([]);

  const bukaDiGoogle = (query) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const salinQuery = async (query, index) => {
    try {
      await navigator.clipboard.writeText(query);
      setDisalin(index);
      setTimeout(() => setDisalin(null), 1500);
    } catch (err) {
      console.error("Gagal menyalin:", err);
    }
  };

  // --- Export Laporan PDF: daftar query dorking yang sudah dijalankan ---
  const handleExportPDF = async () => {
    setMengekspor(true);
    try {
      const result = await buildDorkingPdf(hasilQuery, profilUsername);
      if (result.error) {
        setToast?.({ message: result.error, type: "error" });
        return;
      }
      setPreviewPDF?.(result);
    } catch (err) {
      console.error("Gagal membuat PDF dorking:", err);
      setToast?.({ message: "Terjadi kesalahan saat membuat laporan PDF.", type: "error" });
    } finally {
      setMengekspor(false);
    }
  };

  const domainKosong = !bersihkanDomain(domain);

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">🔍 Google Dorking</h2>
      <p className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Pilih domain yang mau dicek, lalu jalankan preset atau buat query sendiri.
      </p>

      {/* Combobox Domain: ketik untuk filter, atau klik untuk pilih dari daftar */}
      <div className="mb-5">
        <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          Domain Target
        </label>
        <div ref={comboboxRef} className="relative w-full sm:w-96">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onFocus={() => setDropdownTerbuka(true)}
            placeholder="Pilih atau ketik nama domain..."
            autoComplete="off"
            className={`w-full border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
            }`}
          />

          {dropdownTerbuka && (
            <div
              className={`absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border shadow-lg ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-300"
              }`}
            >
              {opsiTerfilter.length === 0 ? (
                <div className={`px-3 py-2 text-sm italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                  Tidak ada domain yang cocok.
                </div>
              ) : (
                opsiTerfilter.map((d) => (
                  <div
                    key={d}
                    onClick={() => pilihDomain(d)}
                    className={`px-3 py-2 text-sm cursor-pointer ${
                      darkMode
                        ? "text-slate-200 hover:bg-slate-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {d}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        {opsiDomain.length === 0 && (
          <p className={`text-[11px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Belum ada aset berstatus aktif di database. Kamu tetap bisa ketik domain manual.
          </p>
        )}
      </div>

      {/* Preset Cepat */}
      <div className="mb-5">
        <label className={`block text-xs font-semibold mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          Preset Cepat
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_DORK.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => gunakanPreset(preset)}
              disabled={domainKosong}
              title={preset.deskripsi}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                darkMode
                  ? "bg-amber-950 border border-amber-800 text-amber-300 hover:bg-amber-900"
                  : "bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        {domainKosong && (
          <p className={`text-[11px] mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Pilih domain dulu untuk menjalankan preset.
          </p>
        )}
      </div>

      {/* Dork Kustom */}
      <div className="mb-6">
        <label className={`block text-xs font-semibold mb-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          Query Kustom
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={dorkKustom}
            onChange={(e) => setDorkKustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tambahDorkKustom()}
            placeholder='contoh: inurl:upload filetype:php'
            className={`w-full sm:w-96 border px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
            }`}
          />
          <button
            onClick={tambahDorkKustom}
            disabled={domainKosong || !dorkKustom.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg shadow cursor-pointer text-sm"
          >
            ⚡ Jalankan Query
          </button>
        </div>
      </div>

      {/* Hasil Query */}
      {hasilQuery.length > 0 && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
            <div className="flex flex-wrap gap-3 text-xs font-semibold">
              <span className={darkMode ? "text-emerald-400" : "text-emerald-600"}>
                ✅ Aman: {hasilQuery.filter((q) => q.status === "aman").length}
              </span>
              <span className={darkMode ? "text-red-400" : "text-red-600"}>
                ⚠️ Ada Temuan: {hasilQuery.filter((q) => q.status === "temuan").length}
              </span>
              <span className={darkMode ? "text-slate-400" : "text-slate-500"}>
                ⏳ Belum Dicek: {hasilQuery.filter((q) => !q.status || q.status === "belum").length}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportPDF}
                disabled={mengekspor}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-1.5 px-3 rounded-lg shadow transition cursor-pointer text-xs"
              >
                {mengekspor ? "Menyiapkan..." : "📄 Unduh Laporan PDF"}
              </button>
              <button
                onClick={bersihkanSemua}
                className={`text-xs font-semibold cursor-pointer ${
                  darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                🗑️ Hapus Semua
              </button>
            </div>
          </div>
          <p className={`text-[11px] mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Klik "🔗 Buka" untuk lihat hasil pencarian di Google, lalu tandai sendiri statusnya di kolom Status.
          </p>
          <div
            className={`border rounded-lg overflow-hidden ${
              darkMode ? "border-slate-800" : "border-slate-200"
            }`}
          >
            <table className="min-w-full text-left text-xs">
              <thead
                className={
                  darkMode
                    ? "bg-slate-950 text-slate-200 border-b border-slate-800"
                    : "bg-slate-800 text-white"
                }
              >
                <tr>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Query</th>
                  <th className="p-2 text-center">Status</th>
                  <th className="p-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className={darkMode ? "text-slate-300" : "text-slate-700"}>
                {hasilQuery.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`border-b ${
                      darkMode
                        ? "border-slate-800 hover:bg-slate-900/60"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-2 font-bold whitespace-nowrap">{item.label}</td>
                    <td className="p-2 font-mono break-all">{item.query}</td>
                    <td className="p-2">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => ubahStatus(idx, "aman")}
                          title="Tandai Aman"
                          className={`px-2 py-1 rounded text-[11px] font-bold shadow transition cursor-pointer whitespace-nowrap ${
                            item.status === "aman"
                              ? "bg-emerald-600 text-white"
                              : darkMode
                              ? "bg-slate-800 text-emerald-400 hover:bg-emerald-950"
                              : "bg-slate-100 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          ✅ Aman
                        </button>
                        <button
                          onClick={() => ubahStatus(idx, "temuan")}
                          title="Tandai Ada Temuan"
                          className={`px-2 py-1 rounded text-[11px] font-bold shadow transition cursor-pointer whitespace-nowrap ${
                            item.status === "temuan"
                              ? "bg-red-600 text-white"
                              : darkMode
                              ? "bg-slate-800 text-red-400 hover:bg-red-950"
                              : "bg-slate-100 text-red-600 hover:bg-red-50"
                          }`}
                        >
                          ⚠️ Temuan
                        </button>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => bukaDiGoogle(item.query)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-[11px] font-bold shadow transition cursor-pointer whitespace-nowrap"
                          title="Buka di Google"
                        >
                          🔗 Buka
                        </button>
                        <button
                          onClick={() => salinQuery(item.query, idx)}
                          className="bg-slate-500 hover:bg-slate-600 text-white px-2 py-1 rounded text-[11px] font-bold shadow transition cursor-pointer whitespace-nowrap"
                          title="Salin Query"
                        >
                          {disalin === idx ? "✅ Disalin" : "📋 Salin"}
                        </button>
                        <button
                          onClick={() => hapusSatu(idx)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-[11px] font-bold shadow transition cursor-pointer whitespace-nowrap"
                          title="Hapus dari daftar"
                        >
                          ✖️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {hasilQuery.length === 0 && (
        <p className={`text-sm italic ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Belum ada query. Pilih domain, lalu jalankan preset atau tulis query sendiri.
        </p>
      )}
    </div>
  );
}