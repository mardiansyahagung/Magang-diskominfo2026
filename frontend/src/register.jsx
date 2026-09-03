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
  button: { width: '100%', padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: 'bold' }
};

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      } else {
        alert(data.message || 'Gagal mendaftar akun.');
      }
    } catch (error) {
      console.error('Error saat registrasi:', error);
      alert('Gagal terhubung ke server database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{ marginBottom: '20px' }}>Register Akun Baru</h2>
        <form onSubmit={handleRegister}>
          <input 
            type="text" 
            placeholder="Username Baru" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={styles.input}
          />
          <input 
            type="password" 
            placeholder="Password Baru" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p style={{ marginTop: '15px', fontSize: '14px' }}>
          Sudah punya akun? <Link to="/login" style={{ color: '#38bdf8' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
