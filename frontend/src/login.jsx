import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginBg from './assets/login-bg.jpg';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${loginBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: '#fff',
  },
  card: { background: 'rgba(30, 41, 59, 0.9)', padding: '30px', borderRadius: '8px', width: '320px', textAlign: 'center', backdropFilter: 'blur(4px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  input: { width: '100%', padding: '10px', margin: '8px 0', borderRadius: '4px', border: '1px solid #334155', boxSizing: 'border-box', backgroundColor: '#0f172a', color: '#fff' },
  button: { width: '100%', padding: '10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }
};

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Mengirim cookie session ke backend
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Simpan status login di browser
        localStorage.setItem('isAuthenticated', 'true');
        navigate("/dashboard");
    } else {
      alert(data.message || "Login gagal!");
    }
    } catch (error) {
      console.error('Error saat login:', error);
      alert('Gagal terhubung ke server database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '20px' }}>Login Monitoring Web</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p style={{ marginTop: '15px', fontSize: '14px' }}>
          Belum punya akun? <Link to="/register" style={{ color: '#38bdf8' }}>Daftar di sini</Link>
        </p>
      </div>
    </div>
  );
}
