import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function MemberDashboard({ userId }) {
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberData()
  }, [userId])

  const fetchMemberData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!error && data && data.length > 0) {
      setMembership(data[0])
    }
    setLoading(false)
  }

  const getDaysRemaining = (endDateStr) => {
    if (!endDateStr) return 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(endDateStr)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) return <p style={{ marginTop: '20px' }}>Cargando tu información...</p>

  if (!membership) {
    return (
      <div style={styles.card}>
        <h3>Sin Membresía Activa</h3>
        <p>No encontramos una membresía vinculada a tu cuenta. Acércate a la recepción para darla de alta.</p>
      </div>
    )
  }

  const daysLeft = getDaysRemaining(membership.end_date)
  const isExpired = daysLeft <= 0

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Mi Espacio SVFit</h3>

      <div style={{ 
        ...styles.statusCard, 
        backgroundColor: isExpired ? '#fff5f5' : '#f0fff4', 
        borderColor: isExpired ? '#feb2b2' : '#9ae6b4' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ 
              backgroundColor: isExpired ? '#e53e3e' : '#38a169', 
              color: '#fff', 
              padding: '4px 10px', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {isExpired ? 'Membresía Vencida' : 'Membresía Activa'}
            </span>
            <h2 style={{ margin: '10px 0 5px 0', color: '#2d3748' }}>{membership.plan_name}</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: isExpired ? '#e53e3e' : '#2b6cb0' }}>
              {isExpired ? 0 : daysLeft}
            </span>
            <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>Días restantes</p>
          </div>
        </div>
      </div>

      <div style={styles.detailsGrid}>
        <div style={styles.detailBox}>
          <span style={styles.detailLabel}>Fecha de Vencimiento</span>
          <span style={styles.detailValue}>{membership.end_date}</span>
        </div>
        <div style={styles.detailBox}>
          <span style={styles.detailLabel}>Día de Pago Preferente</span>
          <span style={styles.detailValue}>Día {membership.payment_day || '-'} de cada mes</span>
        </div>
        <div style={styles.detailBox}>
          <span style={styles.detailLabel}>Fecha de Inicio</span>
          <span style={styles.detailValue}>{membership.start_date}</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  statusCard: { padding: '24px', borderRadius: '12px', border: '1px solid', marginBottom: '20px' },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' },
  detailBox: { backgroundColor: '#f7fafc', padding: '15px', borderRadius: '8px', border: '1px solid #edf2f7' },
  detailLabel: { display: 'block', fontSize: '12px', color: '#718096', marginBottom: '4px' },
  detailValue: { fontSize: '16px', fontWeight: 'bold', color: '#2d3748' }
}
