import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function ChangePassword({ userId, onPasswordChanged }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      return setErrorMsg('La contraseña debe tener al menos 6 caracteres.')
    }
    if (newPassword !== confirmPassword) {
      return setErrorMsg('Las contraseñas no coinciden.')
    }

    setLoading(true)
    setErrorMsg('')

    // 1. Ejecutar la función RPC segura en Supabase
    const { error } = await supabase.rpc('change_user_password_secure', {
      target_user_id: userId,
      new_plain_password: newPassword
    })

    if (error) {
      setErrorMsg('Error al actualizar: ' + error.message)
      setLoading(false)
    } else {
      // 2. Por seguridad, cerrar sesión para forzar un login limpio con la nueva contraseña
      await supabase.auth.signOut()
      onPasswordChanged()
    }
  }

  const handleCancelAndLogout = async () => {
    await supabase.auth.signOut()
    onPasswordChanged()
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>Seguridad Requerida</div>
        <h3 style={styles.title}>Actualiza tu Contraseña</h3>
        <p style={styles.subtitle}>
          Es tu primer inicio de sesión. Por protocolos de ciberseguridad, debes establecer una contraseña personal antes de continuar.
        </p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <form onSubmit={handleChangePassword} style={styles.form}>
          <div>
            <label style={styles.label}>Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label style={styles.label}>Confirmar Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Repite tu contraseña"
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Guardando credenciales...' : 'Establecer Contraseña e Ingresar'}
          </button>
          
          <button type="button" onClick={handleCancelAndLogout} style={styles.secondaryButton}>
            Cerrar Sesión y Volver al Login
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'sans-serif', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '35px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '420px', border: '1px solid #e2e8f0' },
  badge: { display: 'inline-block', backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' },
  title: { margin: '0 0 10px 0', color: '#1a202c', fontSize: '22px' },
  subtitle: { fontSize: '14px', color: '#4a5568', lineHeight: '1.5', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '13px', fontWeight: 'bold', color: '#2d3748' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', marginTop: '6px', boxSizing: 'border-box', fontSize: '14px' },
  button: { padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: 'background 0.2s' },
  secondaryButton: { padding: '10px', backgroundColor: 'transparent', color: '#718096', border: '1px solid #cbd5e0', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', marginTop: '5px' },
  error: { backgroundColor: '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '6px', fontSize: '13px', border: '1px solid #feb2b2', marginBottom: '5px' }
}
