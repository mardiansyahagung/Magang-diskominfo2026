export default function ModalSuratKeluar({
  modalBuka,
  setModalBuka,
  mode = "tambah", // "tambah" | "edit"
  formData,
  setFormData,
  file,
  setFile,
  handleSimpan,
  daftarAset = [],
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
            {mode === "edit" ? "✏️ Edit Surat Keluar" : "📤 Buat Surat Keluar"}
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
              Aset / Domain Terkait <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.aset_id || ""}
              onChange={(e) => setFormData({ ...formData, aset_id: e.target.value })}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">-- Pilih aset yang bermasalah --</option>
              {daftarAset.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nama_domain} {a.jenis_anomali && a.jenis_anomali !== "Aman" ? `(${a.jenis_anomali})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="005/DISKOMINFO/2026"
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
              Instansi Tujuan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="contoh: Dinas Kesehatan Kab. Garut"
              value={formData.instansi_tujuan || ""}
              onChange={(e) => setFormData({ ...formData, instansi_tujuan: e.target.value })}
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
              placeholder="contoh: Laporan Indikasi Judi Online pada Domain..."
              value={formData.perihal || ""}
              onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Ringkasan Isi Surat</label>
            <textarea
              rows="2"
              placeholder="Ringkasan singkat isi laporan..."
              value={formData.isi_ringkas || ""}
              onChange={(e) => setFormData({ ...formData, isi_ringkas: e.target.value })}
              className={inputClass}
            ></textarea>
          </div>

          {mode === "edit" && (
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formData.status || "Menunggu Balasan"}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Menunggu Balasan">Menunggu Balasan</option>
                <option value="Sudah Dibalas">Sudah Dibalas</option>
              </select>
            </div>
          )}

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
