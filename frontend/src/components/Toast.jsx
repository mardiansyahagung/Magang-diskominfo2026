import { useEffect } from "react";

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    // Toast otomatis hilang setelah 3 detik
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  let bgColor = type === "success" ? "bg-emerald-600" : "bg-red-600";
  let icon = type === "success" ? "✅" : "❌";

  return (
    <div
      className={`fixed top-6 right-6 z-50 flex items-center gap-3 ${bgColor} text-white px-5 py-3 rounded-xl shadow-2xl border border-white/20 transform transition-all duration-300 animate-fade-in`}
    >
      <span className="text-lg">{icon}</span>
      <span className="font-semibold text-sm">{message}</span>
      <button
        onClick={onClose}
        className="ml-3 text-white/80 hover:text-white font-bold text-sm"
      >
        ✕
      </button>
    </div>
  );
}
