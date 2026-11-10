import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg('Error al iniciar sesión: ' + error.message)
      setLoading(false)
    } else {
      onLoginSuccess(data.user)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>SVFit - Acceso</h2>
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              placeholder="tu@correo.com"
            />
          </div>
          <div style={styles.inputGroup}>
            <label>Contraseña</label>
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
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f4f9', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px' },
  title: { textAlign: 'center', marginBottom: '20px', color: '#333' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' },
  button: { padding: '12px', backgroundColor: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  error: { backgroundColor: '#ffe6e6', color: '#d00', padding: '10px', borderRadius: '4px', marginBottom: '10px', fontSize: '13px' }
}
