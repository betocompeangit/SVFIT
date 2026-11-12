import React, { useState } from 'react'
import { apiFetch } from './api'

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      })

      // data contiene { success, user, profile, session }
      onLoginSuccess(data.user, data.profile)
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas.')
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.brandTitle}>SVFIT</h1>
          <p style={styles.brandSub}>Gestión de Gimnasio</p>
        </div>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Número de Socio / Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="Ej. 1001 o admin"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif', padding: '20px' },
  card: { backgroundColor: '#1e293b', padding: '40px 30px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', width: '100%', maxWidth: '400px', border: '1px solid #334155' },
  header: { textAlign: 'center', marginBottom: '28px' },
  brandTitle: { margin: 0, fontSize: '32px', fontWeight: '900', color: '#38bdf8', letterSpacing: '2px' },
  brandSub: { margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', fontWeight: '600', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '12px 14px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#f8fafc', fontSize: '14px', outline: 'none' },
  button: { padding: '14px', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', marginTop: '10px' },
  error: { backgroundColor: '#451a1a', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '13px', border: '1px solid #7f1d1d', marginBottom: '15px', textAlign: 'center' }
}
