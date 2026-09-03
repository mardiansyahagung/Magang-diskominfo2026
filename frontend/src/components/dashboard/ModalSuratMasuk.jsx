export default function ModalSuratMasuk({
  modalBuka,
  setModalBuka,
  mode = "tambah",
  formData,
  setFormData,
  file,
  setFile,
  handleSimpan,
  daftarSuratKeluar = [],
  darkMode,
}) {
  if (!modalBuka) return null;

  const inputClass = `w-full border px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 ${
    darkMode ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500" : "bg-white border-slate-300 text-slate-800"
  }`;
  const labelClass = `block font-semibold mb-1 text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 z-50 animate-fade-in">
      <div
        className={`rounded-xl shadow-2xl max-w-lg w-full p-4 border transition-colors ${
          darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        <div className={`flex justify-between items-center mb-3 border-b pb-2 ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
          <h3 className="text-lg font-bold flex items-center gap-1.5">
            {mode === "edit" ? "✏️ Edit Surat Masuk" : "📥 Catat Surat Masuk (Balasan Dinas)"}
          </h3>
          <button
            type="button"
            onClick={() => setModalBuka(false)}
            className={`font-bold text-lg cursor-pointer transition ${
              darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSimpan} className="space-y-3 text-sm">
          <div>
            <label className={labelClass}>
              Balasan Untuk Surat Keluar <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={mode === "edit"}
              value={formData.surat_keluar_id || ""}
              onChange={(e) => setFormData({ ...formData, surat_keluar_id: e.target.value })}
              className={`${inputClass} cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <option value="">-- Pilih surat keluar yang dibalas --</option>
              {daftarSuratKeluar.map((sk) => (
                <option key={sk.id} value={sk.id}>
                  {sk.nomor_surat} — {sk.instansi_tujuan} ({sk.nama_domain || "-"})
                </option>
              ))}
            </select>
            {mode === "edit" && <p className="text-[11px] text-slate-500 mt-1">Rujukan surat keluar tidak bisa diubah setelah dibuat.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="120/DINKES/2026"
                value={formData.nomor_surat || ""}
                onChange={(e) => setFormData({ ...formData, nomor_surat: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.tanggal_surat || ""}
                onChange={(e) => setFormData({ ...formData, tanggal_surat: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Instansi Asal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Dinas Kesehatan Kab. Garut"
              value={formData.instansi_asal || ""}
              onChange={(e) => setFormData({ ...formData, instansi_asal: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Perihal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Tanggapan atas Laporan Indikasi Judi Online"
              value={formData.perihal || ""}
              onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Status Penanganan <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status_penanganan || "Sedang Ditangani"}
              onChange={(e) => setFormData({ ...formData, status_penanganan: e.target.value })}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="Sedang Ditangani">Sedang Ditangani</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Catatan</label>
            <textarea
              rows="2"
              placeholder="Catatan tambahan dari balasan dinas..."
              value={formData.catatan || ""}
              onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
              className={inputClass}
            ></textarea>
          </div>

          <div>
            <label className={labelClass}>
              File Scan Surat (PDF/JPG/PNG) {mode === "tambah" && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required={mode === "tambah"}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className={`w-full text-xs border px-2 py-1.5 rounded-lg cursor-pointer ${
                darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-300 text-slate-700"
              }`}
            />
            {mode === "edit" && formData.file_surat && !file && (
              <p className="text-[11px] text-slate-500 mt-1">File saat ini akan dipertahankan jika tidak diganti.</p>
            )}
          </div>

          <div className={`flex justify-end space-x-2 pt-3 border-t ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
            <button
              type="button"
              onClick={() => setModalBuka(false)}
              className={`font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
              }`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg shadow-md transition cursor-pointer"
            >
              {mode === "edit" ? "Perbarui Surat" : "Simpan Surat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
