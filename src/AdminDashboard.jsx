import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function AdminDashboard() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Formulario alta
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('123456')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('member')
  const [planName, setPlanName] = useState('Mensualidad General')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [paymentDay, setPaymentDay] = useState(5)
  const [msg, setMsg] = useState('')

  // Estado para modal/acción de reset de contraseña
  const [selectedUserForReset, setSelectedUserForReset] = useState(null)
  const [newTempPassword, setNewTempPassword] = useState('123456')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, memberships(*)')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMembers(data)
    }
    setLoading(false)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setMsg('Creando registro...')

    let finalEndDate = endDate
    if (!finalEndDate) {
      const d = new Date(startDate)
      d.setMonth(d.getMonth() + 1)
      finalEndDate = d.toISOString().split('T')[0]
    }

    const { data, error } = await supabase.rpc('create_new_user_with_profile', {
      new_username: username,
      new_password: password,
      new_full_name: fullName,
      new_role: role,
      new_phone: phone,
      plan_name: planName,
      start_date: startDate,
      end_date: finalEndDate,
      payment_day: parseInt(paymentDay)
    })

    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg(`✅ Registrado con éxito. Contraseña inicial: ${password}`)
      setFullName('')
      setUsername('')
      setPassword('123456')
      setPhone('')
      fetchMembers()
    }
  }

  const handleResetPassword = async (userId, memberName) => {
    const confirmReset = window.confirm(`¿Restablecer contraseña para ${memberName}? Se asignará "${newTempPassword}" y se le pedirá cambiarla en su siguiente acceso.`)
    if (!confirmReset) return

    const { error } = await supabase.rpc('admin_reset_member_password', {
      target_user_id: userId,
      new_plain_password: newTempPassword
    })

    if (error) {
      alert('Error al restablecer: ' + error.message)
    } else {
      alert(`✅ Contraseña de ${memberName} restablecida a "${newTempPassword}".`)
    }
  }

  return (
    <div style={{ marginTop: '10px' }}>
      <h3 style={{ color: '#0f172a' }}>Panel de Administración</h3>

      {/* Formulario de Alta */}
      <div style={styles.card}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Alta de Nuevo Usuario / Socio</h4>
        {msg && <p style={{ fontWeight: 'bold', color: msg.includes('Error') ? '#dc2626' : '#16a34a' }}>{msg}</p>}

        <form onSubmit={handleCreateUser} style={styles.gridForm}>
          <div>
            <label style={styles.label}>Nombre Completo:</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Número de Socio / Usuario:</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={styles.input} placeholder="ej. 1001" />
          </div>
          <div>
            <label style={styles.label}>Contraseña Inicial:</label>
            <input type="text" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Teléfono:</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label style={styles.label}>Rol de Usuario:</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={styles.input}>
              <option value="member">Socio / Usuario</option>
              <option value="coach">Coach</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {role === 'member' && (
            <>
              <div>
                <label style={styles.label}>Plan:</label>
                <input type="text" value={planName} onChange={e => setPlanName(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Fecha Inicio:</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Fecha Vencimiento:</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label style={styles.label}>Día de Pago Preferente:</label>
                <input type="number" min="1" max="31" value={paymentDay} onChange={e => setPaymentDay(e.target.value)} style={styles.input} />
              </div>
            </>
          )}

          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" style={styles.btnPrimary}>Registrar en el Gimnasio</button>
          </div>
        </form>
      </div>

      {/* Lista de Usuarios */}
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ color: '#1e293b' }}>Lista de Usuarios y Membresías</h4>
        {loading ? <p>Cargando información...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', color: '#475569', fontSize: '13px' }}>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Usuario / Teléfono</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Membresía</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Vence</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => {
                  const membership = m.memberships?.[0]
                  const isExpired = membership && new Date(membership.end_date) < new Date()
                  const displayUser = m.email ? m.email.replace('@svfit.local', '') : 'N/A'
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '14px' }}>
                      <td style={styles.td}><strong>{m.full_name}</strong></td>
                      <td style={styles.td}>{displayUser}<br/><small style={{ color: '#64748b' }}>{m.phone || 'Sin tel'}</small></td>
                      <td style={styles.td}><span style={styles.roleBadge}>{m.role}</span></td>
                      <td style={styles.td}>{membership ? membership.plan_name : 'N/A'}</td>
                      <td style={styles.td}>
                        {membership ? (
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            color: '#fff',
                            backgroundColor: isExpired ? '#ef4444' : '#10b981',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {isExpired ? 'VENCIDA' : 'ACTIVA'}
                          </span>
                        ) : '-'}
                      </td>
                      <td style={styles.td}>{membership ? membership.end_date : '-'}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleResetPassword(m.id, m.full_name)}
                          style={styles.btnReset}
                          title="Restablecer contraseña a 123456"
                        >
                          🔑 Reset Clave
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  gridForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' },
  input: { width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' },
  btnPrimary: { backgroundColor: '#0284c7', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnReset: { backgroundColor: '#f59e0b', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '12px', borderBottom: '2px solid #cbd5e1' },
  td: { padding: '12px' },
  roleBadge: { backgroundColor: '#e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', textTransform: 'capitalize' }
}
