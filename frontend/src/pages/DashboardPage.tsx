import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    } else {
      // No user data, redirect to login
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Dashboard</h1>
            <p style={{ margin: 0, color: '#666' }}>Welcome, {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Account Management</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Update your profile information and project details
            </p>
            <button
              onClick={() => navigate('/account')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Manage Account & Projects
            </button>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Pricing Calculator</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Calculate the optimal pricing for your projects
            </p>
            <button
              onClick={() => navigate('/pricing-calculator')}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              Try Our Pricing Calculator
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage

