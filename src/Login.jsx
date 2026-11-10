import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isResetMode, setIsResetMode] = useState(false)
  const [newTempPassword, setNewTempPassword] = useState('123456')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const internalEmail = username.trim().toLowerCase() + '@svfit.local'

    const { data, error } = await supabase.auth.signInWithPassword({
      email: internalEmail,
      password,
    })

    if (error) {
      setErrorMsg('Usuario o contraseña incorrectos.')
      setLoading(false)
    } else {
      onLoginSuccess(data.user)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!username.trim()) {
      return setErrorMsg('Ingresa tu usuario o matrícula para restablecer.')
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const { error } = await supabase.rpc('reset_user_password_by_username', {
      target_username: username.trim(),
      new_temp_password: newTempPassword
    })

    if (error) {
      setErrorMsg('Error: ' + error.message)
      setLoading(false)
    } else {
      setSuccessMsg(`✅ Contraseña restablecida con éxito a "${newTempPassword}". Ahora puedes ingresar.`)
      setIsResetMode(false)
      setPassword(newTempPassword)
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>SVFit - Acceso</h2>
        
        {errorMsg && <div style={styles.error}>{errorMsg}</div>}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        {!isResetMode ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario o Matrícula</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
                placeholder="ej. 1001 o admin"
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
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
            
            <button 
              type="button" 
              onClick={() => { setIsResetMode(true); setErrorMsg(''); setSuccessMsg(''); }}
              style={styles.linkButton}
            >
              ¿Olvidaste o necesitas restablecer tu contraseña?
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <p style={{ fontSize: '13px', color: '#4a5568', margin: '0 0 10px 0' }}>
              Ingresa tu usuario o número de socio para asignar una contraseña temporal de acceso.
            </p>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Usuario o Matrícula</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
                placeholder="ej. 1001"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nueva Contraseña Temporal</label>
              <input
                type="text"
                value={newTempPassword}
                onChange={(e) => setNewTempPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Restableciendo...' : 'Restablecer Mi Contraseña'}
            </button>
            <button 
              type="button" 
              onClick={() => { setIsResetMode(false); setErrorMsg(''); }}
              style={styles.secondaryButton}
            >
              Volver al inicio de sesión
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'sans-serif', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px', border: '1px solid #e2e8f0' },
  title: { textAlign: 'center', marginBottom: '20px', color: '#2b6cb0', margin: '0 0 20px 0' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#2d3748' },
  input: { padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '14px', boxSizing: 'border-box' },
  button: { padding: '12px', backgroundColor: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  linkButton: { background: 'none', border: 'none', color: '#3182ce', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', marginTop: '5px' },
  secondaryButton: { padding: '10px', backgroundColor: 'transparent', color: '#718096', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' },
  error: { backgroundColor: '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px', border: '1px solid #feb2b2' },
  success: { backgroundColor: '#f0fff4', color: '#2f855a', padding: '10px', borderRadius: '6px', marginBottom: '10px', fontSize: '13px', border: '1px solid #9ae6b4' }
}
