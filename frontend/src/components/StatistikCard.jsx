import { useState, useRef, useEffect } from "react";

export default function StatistikCard({
  totalAset,
  webAktif,
  webMati,
  totalAnomali,
  filterKategori,
  setFilterKategori,
  setKataKunci,
  semuaDataAset,
  darkMode,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const anomalyCounts = {};
  semuaDataAset.forEach((d) => {
    let anom = d.jenis_anomali ? d.jenis_anomali.trim() : "Aman";
    if (anom.toLowerCase() !== "aman" && anom !== "") {
      anomalyCounts[anom] = (anomalyCounts[anom] || 0) + 1;
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <div
        onClick={() => {
          setFilterKategori("semua");
          setKataKunci("");
          setDropdownOpen(false);
        }}
        className={`bg-blue-600 text-white p-6 rounded-xl shadow-lg border border-blue-700 cursor-pointer transform transition hover:scale-105 ${filterKategori === "semua" ? "ring-4 ring-blue-300" : ""}`}
      >
        <h2 className="text-lg font-semibold opacity-80">Total Aset Web</h2>
        <p className="text-5xl font-bold mt-2">{totalAset}</p>
      </div>

      <div
        onClick={() => {
          setFilterKategori("aktif");
          setKataKunci("");
          setDropdownOpen(false);
        }}
        className={`bg-green-600 text-white p-6 rounded-xl shadow-lg border border-green-700 cursor-pointer transform transition hover:scale-105 ${filterKategori === "aktif" ? "ring-4 ring-green-300" : ""}`}
      >
        <h2 className="text-lg font-semibold opacity-80">Aset Aktif</h2>
        <p className="text-5xl font-bold mt-2">{webAktif}</p>
      </div>

      <div
        onClick={() => {
          setFilterKategori("mati");
          setKataKunci("");
          setDropdownOpen(false);
        }}
        className={`bg-slate-700 text-white p-6 rounded-xl shadow-lg border border-slate-800 cursor-pointer transform transition hover:scale-105 ${filterKategori === "mati" ? "ring-4 ring-slate-400" : ""}`}
      >
        <h2 className="text-lg font-semibold opacity-80">Aset Bermasalah</h2>
        <p className="text-5xl font-bold mt-2">{webMati}</p>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`bg-red-600 text-white p-6 rounded-xl shadow-lg border border-red-700 cursor-pointer transform transition hover:scale-105 ${filterKategori.startsWith("anomali") || anomalyCounts[filterKategori] ? "ring-4 ring-red-300" : ""}`}
        >
          <h2 className="text-lg font-semibold opacity-90">Total Anomali</h2>
          <p className="text-5xl font-bold mt-2">{totalAnomali}</p>
          <p className="text-xs mt-2 text-red-200 font-bold flex justify-between items-center">
            <span>Lihat rincian jenis ▾</span>
          </p>
        </div>

        {dropdownOpen && (
          <div
            className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border py-2 z-50 transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
          >
            <div className="px-4 py-2 border-b border-slate-700/20 font-bold text-xs text-slate-400 uppercase tracking-wider">
              Daftar Jenis Anomali
            </div>

            <button
              onClick={() => {
                setFilterKategori("anomali_semua");
                setKataKunci("");
                setDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex justify-between items-center transition ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"} ${filterKategori === "anomali_semua" ? "bg-red-500/20 text-red-500 font-bold" : ""}`}
            >
              <span>Semua Anomali</span>
              <span className="bg-red-500/30 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {totalAnomali}
              </span>
            </button>

            {Object.keys(anomalyCounts).length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 italic text-center">
                Tidak ada anomali tercatat
              </div>
            ) : (
              Object.entries(anomalyCounts).map(([namaAnomali, jumlah]) => (
                <button
                  key={namaAnomali}
                  onClick={() => {
                    setFilterKategori(namaAnomali);
                    setKataKunci("");
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-semibold flex justify-between items-center transition ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"} ${filterKategori === namaAnomali ? "bg-red-500/20 text-red-500 font-bold" : ""}`}
                >
                  <span className="truncate pr-2">{namaAnomali}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${darkMode ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"}`}
                  >
                    {jumlah}
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}