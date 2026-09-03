import { useState, useEffect } from "react";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalData,
  darkMode,
}) {
  const [inputPage, setInputPage] = useState(currentPage);

  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const handleJump = (e) => {
    e.preventDefault();
    let pageNum = parseInt(inputPage);
    if (isNaN(pageNum)) return;
    if (pageNum < 1) pageNum = 1;
    if (pageNum > totalPages) pageNum = totalPages;
    onPageChange(pageNum);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t text-sm gap-3 transition-colors ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}
    >
      <div>
        Menampilkan:{" "}
        <span
          className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}
        >
          {totalData}
        </span>{" "}
        baris
      </div>

      <div className="flex items-center space-x-2 flex-wrap justify-center gap-y-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer shadow-xs text-xs disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"}`}
          title="Halaman Pertama"
        >
          « Awal
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer shadow-xs text-xs disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"}`}
        >
          ‹ Prev
        </button>

        <form
          onSubmit={handleJump}
          className="flex items-center space-x-1.5 px-2"
        >
          <span className="text-xs">Hal</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            className={`w-12 text-center border rounded-md py-1 text-xs font-bold focus:outline-none focus:border-blue-500 shadow-inner ${darkMode ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-800"}`}
            title="Ketik nomor halaman, lalu tekan Enter"
          />
          <span className="text-xs">dari {totalPages}</span>
          <button
            type="submit"
            className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer shadow-xs ${darkMode ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-200 hover:bg-slate-300 text-slate-700"}`}
          >
            Go
          </button>
        </form>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-lg border font-semibold transition cursor-pointer shadow-xs text-xs disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"}`}
        >
          Next ›
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`px-2.5 py-1.5 rounded-lg border font-semibold transition cursor-pointer shadow-xs text-xs disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? "bg-slate-900 border-slate-700 hover:bg-slate-800 text-slate-200" : "bg-white border-slate-300 hover:bg-slate-100 text-slate-700"}`}
          title="Halaman Terakhir"
        >
          Akhir »
        </button>
      </div>
    </div>
  );
}