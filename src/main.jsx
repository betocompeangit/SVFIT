import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { supabase } from './supabaseClient'
import Login from './Login'
import AdminDashboard from './AdminDashboard'
import MemberDashboard from './MemberDashboard'
import CoachDashboard from './CoachDashboard'
import ChangePassword from './ChangePassword'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (!error && data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Cargando SVFit...</div>
  }

  if (!session) {
    return <Login onLoginSuccess={() => setLoading(true)} />
  }

  // CIBERSEGURIDAD: Obligar a cambiar la contraseña si la bandera must_change_password está activa
  if (profile?.must_change_password) {
    return (
      <ChangePassword 
        userId={session.user.id} 
        onPasswordChanged={() => fetchProfile(session.user.id)} 
      />
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h2>SVFit - Gestión</h2>
        <button onClick={handleLogout} style={{ padding: '8px 12px', cursor: 'pointer' }}>Cerrar Sesión</button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eef6ff', borderRadius: '6px' }}>
        <h3>Bienvenido, {profile?.full_name || session.user.email}</h3>
        <p><strong>Rol actual:</strong> {profile?.role || 'Sin rol asignado'}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        {profile?.role === 'admin' && <AdminDashboard />}
        {profile?.role === 'coach' && <CoachDashboard coachId={session.user.id} />}
        {profile?.role === 'member' && <MemberDashboard userId={session.user.id} />}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
