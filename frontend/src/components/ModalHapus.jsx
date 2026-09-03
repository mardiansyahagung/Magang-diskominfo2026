export default function ModalHapus({
  isOpen,
  onClose,
  onConfirm,
  domainName,
  darkMode,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-2xl shadow-2xl max-w-md w-full p-6 border transition-colors ${darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}
      >
        <div className="flex items-center gap-3 mb-4 text-red-500">
          <span className="text-3xl">⚠️</span>
          <h3
            className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}
          >
            Konfirmasi Hapus Permanen
          </h3>
        </div>

        <p
          className={`text-sm mb-6 leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}
        >
          Apakah Anda benar-benar yakin ingin menghapus aset{" "}
          <span
            className={`font-bold underline ${darkMode ? "text-white" : "text-slate-800"}`}
          >
            "{domainName}"
          </span>
          ? Tindakan ini bersifat{" "}
          <span className="text-red-500 font-bold">permanen</span> dan data yang
          terhapus tidak dapat dikembalikan.
        </p>

        <div
          className={`flex justify-end space-x-3 pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`font-bold px-4 py-2 rounded-lg transition cursor-pointer ${darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-lg shadow transition cursor-pointer"
          >
            Ya, Hapus Permanen
          </button>
        </div>
      </div>
    </div>
  );
}
