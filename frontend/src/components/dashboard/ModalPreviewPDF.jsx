export default function ModalPreviewPDF({ previewPDF, onClose, onConfirmDownload, darkMode }) {
  if (!previewPDF) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 animate-fade-in">
      <div
        className={`w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <div className={`flex justify-between items-center p-4 border-b ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <div>
            <h3 className="text-lg font-bold">📄 Preview Laporan PDF</h3>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Periksa dulu isinya. Kalau sudah sesuai, klik "Download PDF" untuk menyimpan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`font-bold text-lg cursor-pointer transition ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 bg-slate-200">
          <iframe src={previewPDF.url} title="Preview Laporan PDF" className="w-full h-full border-0" />
        </div>

        <div className={`flex justify-end gap-3 p-4 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer border ${darkMode ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300" : "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700"}`}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmDownload}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition cursor-pointer"
          >
            ⬇️ Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}