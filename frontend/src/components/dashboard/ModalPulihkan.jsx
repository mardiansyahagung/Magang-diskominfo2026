export default function ModalPulihkan({ isOpen, onClose, onConfirm, namaDomain, darkMode }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl border transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-800"}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl font-bold flex-shrink-0">
            🛡️
          </div>
          <div>
            <h3 className="text-lg font-bold">Pulihkan Aset Ini?</h3>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Status aset akan dikembalikan menjadi Aman & Aktif.
            </p>
          </div>
        </div>

        <p className={`text-sm mb-6 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
          Apakah kamu yakin ingin memulihkan domain{" "}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">"{namaDomain}"</span>{" "}
          kembali menjadi <span className="font-semibold underline">Aman & Aktif</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer border ${darkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300" : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            Ya, Pulihkan Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}