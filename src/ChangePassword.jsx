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

    // Ejecutar la función RPC segura en Supabase
    const { data, error } = await supabase.rpc('change_user_password_secure', {
      target_user_id: userId,
      new_plain_password: newPassword
    })

    if (error) {
      setErrorMsg('Error al actualizar: ' + error.message)
      setLoading(false)
    } else {
      // Forzar recarga o refrescar sesión para entrar al sistema con la nueva contraseña
      onPasswordChanged()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={{ textAlign: 'center', color: '#2b6cb0', marginTop: 0 }}>🔒 Seguridad Requerida</h3>
        <p style={{ fontSize: '14px', color: '#4a5568', textAlign: 'center', lineHeight: '1.4' }}>
          Es tu primer inicio de sesión. Por protocolo de seguridad, debes establecer una contraseña personal.
        </p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#2d3748' }}>Nueva Contraseña</label>
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
            <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#2d3748' }}>Confirmar Contraseña</label>
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
            {loading ? 'Actualizando credenciales...' : 'Establecer Contraseña y Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'sans-serif', backgroundColor: '#f7fafc', padding: '20px' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05), 0 4px 10px rgba(0,0,0,0.03)', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' },
  input: { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e0', marginTop: '6px', boxSizing: 'border-box', fontSize: '14px' },
  button: { padding: '12px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px', fontSize: '14px', transition: 'background 0.2s' },
  error: { backgroundColor: '#fff5f5', color: '#e53e3e', padding: '10px', borderRadius: '6px', fontSize: '13px', border: '1px solid #feb2b2' }
}
