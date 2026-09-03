export default function ModalPreviewBukti({ url, onClose, darkMode }) {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-fade-in">
      <div
        className={`w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <div className={`flex justify-between items-center p-4 border-b gap-3 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div className="min-w-0">
            <h3 className="text-lg font-bold">🔎 Preview Evidence</h3>
            <p className={`text-xs truncate ${darkMode ? "text-slate-400" : "text-slate-500"}`} title={url}>
              {url}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`font-bold text-lg cursor-pointer transition flex-shrink-0 ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 bg-slate-200">
          <iframe src={url} title="Preview Evidence" className="w-full h-full border-0" />
        </div>

        <div className={`flex justify-end gap-3 p-4 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <p className={`text-xs mr-auto self-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Kalau preview tidak muncul (situs memblokir tampilan), gunakan tombol buka tab baru.
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer border ${darkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300" : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition cursor-pointer"
          >
            🔗 Buka di Tab Baru
          </button>
        </div>
      </div>
    </div>
  );
}