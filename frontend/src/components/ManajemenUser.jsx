import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ManajemenUser({ darkMode = false, profilUsername = "", setToast }) {
  const [daftarUser, setDaftarUser] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorAkses, setErrorAkses] = useState(false);
  const [prosesId, setProsesId] = useState(null);

  const muatDaftarUser = async () => {
    try {
      setLoading(true);
      setErrorAkses(false);
      const res = await fetch(`${API_BASE_URL}/users`, { credentials: "include" });

      if (res.status === 403) {
        setErrorAkses(true);
        setDaftarUser([]);
        return;
      }
      if (!res.ok) throw new Error(`Server status: ${res.status}`);

      const data = await res.json();
      setDaftarUser(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat daftar user:", err);
      setToast?.({ message: "Gagal memuat daftar user dari server.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    muatDaftarUser();
  }, []);

  const ubahRole = async (user, roleBaru) => {
    if (user.username === profilUsername && roleBaru === "user") {
      setToast?.({
        message: "Tidak bisa menurunkan role akun sendiri lewat sini.",
        type: "error",
      });
      return;
    }

    try {
      setProsesId(user.id);
      const res = await fetch(`${API_BASE_URL}/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: roleBaru }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast?.({ message: data.message || "Role berhasil diubah.", type: "success" });
        muatDaftarUser();
      } else {
        setToast?.({ message: data.message || "Gagal mengubah role.", type: "error" });
      }
    } catch (err) {
      setToast?.({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    } finally {
      setProsesId(null);
    }
  };

  const hapusUser = async (user) => {
    if (!window.confirm(`Hapus akun "${user.username}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    try {
      setProsesId(user.id);
      const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (res.ok) {
        setToast?.({ message: data.message || "User berhasil dihapus.", type: "success" });
        muatDaftarUser();
      } else {
        setToast?.({ message: data.message || "Gagal menghapus user.", type: "error" });
      }
    } catch (err) {
      setToast?.({ message: "Terjadi kesalahan koneksi server.", type: "error" });
    } finally {
      setProsesId(null);
    }
  };

  if (errorAkses) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-2">👥 Manajemen Pengguna</h2>
        <p className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"}`}>
          Halaman ini hanya bisa diakses oleh admin.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">👥 Manajemen Pengguna</h2>
      <p className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Kelola siapa saja yang memiliki akses admin di sistem ini.
      </p>

      <div
        className={`overflow-x-auto border rounded-lg transition-colors ${
          darkMode ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <table className="min-w-full text-left text-sm">
          <thead
            className={
              darkMode
                ? "bg-slate-950 text-slate-200 border-b border-slate-800"
                : "bg-slate-800 text-white"
            }
          >
            <tr>
              <th className="p-3">Username</th>
              <th className="p-3">Role</th>
              <th className="p-3">Bergabung Sejak</th>
              <th className="p-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className={darkMode ? "text-slate-300" : "text-slate-700"}>
            {loading && (
              <tr>
                <td colSpan="4" className="text-center p-6 italic text-slate-500">
                  Memuat data pengguna...
                </td>
              </tr>
            )}

            {!loading && daftarUser.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center p-6 text-slate-500">
                  Belum ada pengguna terdaftar.
                </td>
              </tr>
            )}

            {!loading &&
              daftarUser.map((user) => {
                const adalahDiriSendiri = user.username === profilUsername;
                const sedangProses = prosesId === user.id;

                return (
                  <tr
                    key={user.id}
                    className={`border-b transition-colors ${
                      darkMode
                        ? "border-slate-800 hover:bg-slate-900/60"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <td className="p-3 font-semibold">
                      {user.username}
                      {adalahDiriSendiri && (
                        <span className={`ml-2 text-[11px] font-normal ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                          (kamu)
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-bold uppercase ${
                          user.role === "admin"
                            ? darkMode
                              ? "bg-blue-950 text-blue-400 border border-blue-800"
                              : "bg-blue-100 text-blue-700"
                            : darkMode
                              ? "bg-slate-800 text-slate-400"
                              : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className={`p-3 text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2 justify-center">
                        {user.role === "user" ? (
                          <button
                            onClick={() => ubahRole(user, "admin")}
                            disabled={sedangProses}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-3 py-1.5 rounded text-xs font-bold shadow transition cursor-pointer whitespace-nowrap"
                          >
                            ⬆️ Angkat jadi Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => ubahRole(user, "user")}
                            disabled={sedangProses || adalahDiriSendiri}
                            title={adalahDiriSendiri ? "Tidak bisa menurunkan role sendiri" : ""}
                            className="bg-slate-500 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-xs font-bold shadow transition cursor-pointer whitespace-nowrap"
                          >
                            ⬇️ Turunkan ke Pengguna
                          </button>
                        )}

                        <button
                          onClick={() => hapusUser(user)}
                          disabled={sedangProses || user.role === "admin"}
                          title={user.role === "admin" ? "Turunkan role dulu sebelum menghapus" : "Hapus user"}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-xs font-bold shadow transition cursor-pointer whitespace-nowrap"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}