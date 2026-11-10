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

    // 1. Actualizar la contraseña en Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (authError) {
      setErrorMsg('Error al actualizar contraseña: ' + authError.message)
      setLoading(false)
      return
    }

    // 2. Desactivar la bandera en la tabla profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', userId)

    if (profileError) {
      setErrorMsg('Error al actualizar perfil: ' + profileError.message)
      setLoading(false)
    } else {
      onPasswordChanged()
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={{ textAlign: 'center', color: '#2b6cb0' }}>🔒 Primer Inicio de Sesión</h3>
        <p style={{ fontSize: '14px', color: '#4a5568', textAlign: 'center' }}>
          Por seguridad de tu cuenta, debes actualizar la contraseña temporal asignada por la administración.
        </p>

        {errorMsg && <div style={styles.error}>{errorMsg}</div>}

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nueva Contraseña</label>
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
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Confirmar Nueva Contraseña</label>
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
            {loading ? 'Guardando...' : 'Establecer Mi Contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' },
  input: { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' },
  button: { padding: '12px', backgroundColor: '#38a169', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  error: { backgroundColor: '#ffe6e6', color: '#d00', padding: '10px', borderRadius: '4px', fontSize: '13px' }
}
