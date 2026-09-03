import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Utama (/) — selalu diarahkan ke area terproteksi.
            ProtectedRoute akan cek sesi ke backend: kalau belum login,
            otomatis dilempar ke /login. Kalau sudah login, tampil Dashboard. */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Halaman Login */}
        <Route path="/login" element={<Login />} />

        {/* Halaman Register */}
        <Route path="/register" element={<Register />} />

        {/* Halaman Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Route: URL asal/salah -> kembali ke "/" (yang akan dicek ProtectedRoute) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
