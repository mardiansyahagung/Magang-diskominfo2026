const JUDUL_HALAMAN = {
  dashboard: "Pemantauan Aset Web Kab. Garut",
  insiden: "Riwayat Insiden Keamanan",
  tools: "Perangkat & Alat Investigasi",
  users: "Manajemen Pengguna",
  logs: "Log Aktivitas",
  persuratan: "Persuratan",
};

export default function TopBar({
  activeMenu,
  sidebarOpen,
  setSidebarOpen,
  profilUsername,
  profilBuka,
  setProfilBuka,
  darkMode,
  setDarkMode,
  handleLogout,
}) {
  return (
    <div className="flex justify-between items-center mb-8 border-b-2 border-blue-500 pb-2">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`p-2 rounded-xl border font-bold transition cursor-pointer hover:bg-blue-600 hover:text-white ${
            darkMode
              ? "bg-slate-800 border-slate-700 text-slate-200"
              : "bg-white border-slate-300 text-slate-700"
          }`}
          title={sidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
        >
          ☰
        </button>

        <h1
          className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}
        >
          {JUDUL_HALAMAN[activeMenu]}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded-xl font-bold text-sm shadow-md transition cursor-pointer flex items-center gap-2 ${
            darkMode
              ? "bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700"
              : "bg-slate-900 hover:bg-slate-800 text-yellow-300"
          }`}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>
    </div>
  );
}
