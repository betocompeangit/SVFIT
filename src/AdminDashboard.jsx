import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function AdminDashboard() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  // Campos del formulario
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('123456') // Contraseña por defecto fácil
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('member')
  const [planName, setPlanName] = useState('Mensualidad General')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState('')
  const [paymentDay, setPaymentDay] = useState(5)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        memberships (*)
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setMembers(data)
    }
    setLoading(false)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setMsg('Creando usuario...')

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
      setMsg(`✅ Usuario registrado exitosamente con contraseña: ${password}`)
      setFullName('')
      setUsername('')
      setPassword('123456')
      setPhone('')
      fetchMembers()
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Panel de Administración</h3>
      
      <div style={styles.card}>
        <h4>Alta de Nuevo Usuario / Socio</h4>
        {msg && <p style={{ fontWeight: 'bold', color: msg.includes('Error') ? 'red' : 'green' }}>{msg}</p>}
        
        <form onSubmit={handleCreateUser} style={styles.gridForm}>
          <div>
            <label>Nombre Completo:</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required style={styles.input} />
          </div>
          <div>
            <label>Número de Socio / Usuario:</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              style={styles.input} 
              placeholder="ej. 1001 o coach01"
            />
          </div>
          <div>
            <label>Contraseña Inicial:</label>
            <input 
              type="text" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={styles.input} 
              placeholder="ej. 123456"
            />
          </div>
          <div>
            <label>Teléfono:</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} style={styles.input} />
          </div>
          <div>
            <label>Rol de Usuario:</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={styles.input}>
              <option value="member">Socio / Usuario</option>
              <option value="coach">Coach</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {role === 'member' && (
            <>
              <div>
                <label>Plan:</label>
                <input type="text" value={planName} onChange={e => setPlanName(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label>Fecha Inicio:</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label>Fecha Vencimiento:</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
              </div>
              <div>
                <label>Día de Pago Preferente:</label>
                <input type="number" min="1" max="31" value={paymentDay} onChange={e => setPaymentDay(e.target.value)} style={styles.input} />
              </div>
            </>
          )}

          <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
            <button type="submit" style={styles.btnPrimary}>Registrar en el Gimnasio</button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h4>Lista de Usuarios y Membresías</h4>
        {loading ? <p>Cargando lista...</p> : (
          <table style={styles.table}>
            <thead>
              <tr style={{ backgroundColor: '#eaeaea', textAlign: 'left' }}>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Usuario / Teléfono</th>
                <th style={styles.th}>Rol</th>
                <th style={styles.th}>Membresía</th>
                <th style={styles.th}>Estado</th>
                <th style={styles.th}>Vence</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => {
                const membership = m.memberships?.[0]
                const isExpired = membership && new Date(membership.end_date) < new Date()
                const displayUser = m.email.replace('@svfit.local', '')
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={styles.td}>{m.full_name}</td>
                    <td style={styles.td}><strong>{displayUser}</strong><br/><small>{m.phone || 'Sin tel'}</small></td>
                    <td style={styles.td}>{m.role}</td>
                    <td style={styles.td}>{membership ? membership.plan_name : 'N/A'}</td>
                    <td style={styles.td}>
                      {membership ? (
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          color: '#fff', 
                          backgroundColor: isExpired ? '#e53e3e' : '#38a169',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {isExpired ? 'VENCIDA' : 'ACTIVA'}
                        </span>
                      ) : '-'}
                    </td>
                    <td style={styles.td}>{membership ? membership.end_date : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' },
  gridForm: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' },
  btnPrimary: { backgroundColor: '#2b6cb0', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '10px', borderBottom: '2px solid #ccc' },
  td: { padding: '10px' }
}
