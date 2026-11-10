import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function CoachDashboard({ coachId }) {
  const [members, setMembers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [notes, setNotes] = useState('')
  const [progressHistory, setProgressHistory] = useState([])
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [])

  useEffect(() => {
    if (selectedUser) {
      fetchProgress(selectedUser)
    }
  }, [selectedUser])

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'member')
      .order('full_name')
    if (data) setMembers(data)
  }

  const fetchProgress = async (userId) => {
    const { data } = await supabase
      .from('member_progress')
      .select('*')
      .eq('user_id', userId)
      .order('progress_date', { ascending: false })
    if (data) setProgressHistory(data)
  }

  const handleSaveProgress = async (e) => {
    e.preventDefault()
    if (!selectedUser) return setMsg('Selecciona un socio.')

    setMsg('Guardando avance...')
    const { error } = await supabase.from('member_progress').insert([
      {
        user_id: selectedUser,
        coach_id: coachId,
        weight_kg: weight ? parseFloat(weight) : null,
        body_fat_pct: bodyFat ? parseFloat(bodyFat) : null,
        notes: notes
      }
    ])

    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('✅ Avance registrado correctamente')
      setWeight('')
      setBodyFat('')
      setNotes('')
      fetchProgress(selectedUser)
    }
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Panel de Coach - Registro de Avances</h3>

      <div style={styles.card}>
        <h4>Registrar Progreso Mensual</h4>
        {msg && <p style={{ fontWeight: 'bold', color: msg.includes('Error') ? 'red' : 'green' }}>{msg}</p>}

        <form onSubmit={handleSaveProgress} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label>Seleccionar Socio:</label>
            <select 
              value={selectedUser} 
              onChange={e => setSelectedUser(e.target.value)} 
              required 
              style={styles.input}
            >
              <option value="">-- Elige un socio --</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Peso (kg):</label>
              <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="ej. 75.5" style={styles.input} />
            </div>
            <div>
              <label>% Grasa Corporal (opcional):</label>
              <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)} placeholder="ej. 18.5" style={styles.input} />
            </div>
          </div>

          <div>
            <label>Notas / Observaciones del Entintamiento:</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ej. Buen rendimiento en sentadillas, ajustar peso la próxima semana." style={{ ...styles.input, height: '80px' }} />
          </div>

          <button type="submit" style={styles.btnPrimary}>Guardar Avance</button>
        </form>
      </div>

      {selectedUser && (
        <div style={{ marginTop: '30px' }}>
          <h4>Historial de Avances del Socio</h4>
          {progressHistory.length === 0 ? <p>No hay registros previos.</p> : (
            <table style={styles.table}>
              <thead>
                <tr style={{ backgroundColor: '#eaeaea', textAlign: 'left' }}>
                  <th style={styles.th}>Fecha</th>
                  <th style={styles.th}>Peso (kg)</th>
                  <th style={styles.th}>% Grasa</th>
                  <th style={styles.th}>Notas</th>
                </tr>
              </thead>
              <tbody>
                {progressHistory.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={styles.td}>{p.progress_date}</td>
                    <td style={styles.td}>{p.weight_kg ? `${p.weight_kg} kg` : '-'}</td>
                    <td style={styles.td}>{p.body_fat_pct ? `${p.body_fat_pct}%` : '-'}</td>
                    <td style={styles.td}>{p.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  card: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' },
  input: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginTop: '4px', boxSizing: 'border-box' },
  btnPrimary: { backgroundColor: '#38a169', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { padding: '10px', borderBottom: '2px solid #ccc' },
  td: { padding: '10px' }
}
