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

export default function Sidebar({ activeMenu, setActiveMenu, sidebarOpen, isAdmin, darkMode, logoSrc }) {
  const menuItems = isAdmin ? [...MENU_UTAMA, ...MENU_ADMIN] : MENU_UTAMA;

  return (
    <aside
      className={`transition-all duration-300 flex-shrink-0 p-5 flex flex-col justify-between border-r overflow-y-auto ${
        sidebarOpen ? "w-64" : "w-0 p-0 border-none"
      } ${darkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-slate-900 text-slate-100 border-slate-800"}`}
    >
      <div className={sidebarOpen ? "opacity-100 transition-opacity duration-300" : "opacity-0"}>
        <div className="mb-8 px-2">
          <img
            src={logoSrc}
            alt="Persandian dan Keamanan Informasi - Diskominfo Kabupaten Garut"
            className="w-full h-auto object-contain"
          />
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveMenu(item.key)}
              className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeMenu === item.key
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon} <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
