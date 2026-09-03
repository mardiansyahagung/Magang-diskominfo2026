import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    // Verifikasi langsung ke backend apakah user benar-benar sudah login
    fetch(`${API_BASE_URL}/me`, {
      credentials: 'include' // Mengirimkan cookie session
    })
      .then((res) => {
        if (res.ok) {
          setIsAuth(true);
        } else {
          setIsAuth(false);
          localStorage.removeItem('isAuthenticated');
        }
      })
      .catch(() => {
        setIsAuth(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0f172a', 
        color: '#fff' 
      }}>
        Memeriksa sesi...
      </div>
    );
  }

  // Jika belum login / session di server habis, lempar ke /login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
