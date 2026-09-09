const MENU_UTAMA = [
  { key: "dashboard", label: "Dashboard", icon: "📊" },
  { key: "insiden", label: "Riwayat Insiden", icon: "📅" },
  { key: "persuratan", label: "Persuratan", icon: "✉️" },
];

const MENU_ADMIN = [
  { key: "tools", label: "Perangkat & Alat", icon: "🛠️" },
  { key: "users", label: "Manajemen Pengguna", icon: "👥" },
  { key: "logs", label: "Log Aktivitas", icon: "📜" },
];

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  sidebarOpen,
  setSidebarOpen,
  isAdmin,
  darkMode,
  logoSrc,
  profilUsername,
  handleLogout,
}) {
  const menuItems = isAdmin ? [...MENU_UTAMA, ...MENU_ADMIN] : MENU_UTAMA;

  return (
    <>
      {/* Backdrop gelap di belakang sidebar, cuma muncul di HP/tablet saat sidebar terbuka */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-auto
          transition-all duration-300 flex-shrink-0 flex flex-col justify-between border-r overflow-y-auto
          w-64 p-5
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${sidebarOpen ? "md:w-64" : "md:w-0 md:p-0 md:border-none"}
          ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}
      >
        <div
          className={
            sidebarOpen
              ? "opacity-100 transition-opacity duration-300"
              : "opacity-0 md:opacity-0"
          }
        >
          <div className="mb-8 px-2 flex items-center justify-between gap-2">
            {/* Backdrop gelap tetap di belakang logo, biar logo putih tetap kebaca walau sidebar lagi mode terang */}
            <div className="bg-slate-900 rounded-xl p-3 flex-1">
              <img
                src={logoSrc}
                alt="Persandian dan Keamanan Informasi - Diskominfo Kabupaten Garut"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Tombol tutup, cuma muncul di HP/tablet (di desktop pakai tombol ☰ di TopBar) */}
            <button
              onClick={() => setSidebarOpen(false)}
              className={`md:hidden flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold transition cursor-pointer ${
                darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              title="Tutup menu"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                  activeMenu === item.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : darkMode
                      ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.icon} <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Panel profil + logout, pojok kiri bawah */}
        {sidebarOpen && (
          <div
            className={`border-t pt-4 mt-4 space-y-3 ${darkMode ? "border-slate-800" : "border-slate-200"}`}
          >
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 text-white">
                {(profilUsername || "?").charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-bold truncate ${darkMode ? "text-slate-100" : "text-slate-800"}`}
                >
                  {profilUsername || "Akun Saya"}
                </div>
                <div
                  className={`text-xs truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                >
                  {isAdmin ? "Administrator" : "Pengguna"}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-semibold text-sm border transition cursor-pointer ${
                darkMode
                  ? "bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-red-300 border-red-900/50"
                  : "bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200"
              }`}
            >
              🚪 <span>Keluar</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
