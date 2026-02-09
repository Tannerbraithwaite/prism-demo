import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/authService'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(email, password)
      console.log('Login response:', response) // Debug log
      
      if (response.success && response.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        // Check if password needs to be changed
        if (response.password_changed === false) {
          console.log('Redirecting to change password')
          navigate('/change-password', { replace: true })
        } else if (response.is_admin) {
          // Admin user - redirect to admin panel
          console.log('Redirecting to admin panel')
          navigate('/admin', { replace: true })
        } else {
          // Regular user - redirect to dashboard
          console.log('Redirecting to dashboard')
          navigate('/dashboard', { replace: true })
        }
      } else {
        // Show error message
        const errorMessage = response.message || 'Login failed. Please check your credentials.'
        setError(errorMessage)
        console.error('Login failed:', response)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.'
      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          Welcome
        </h1>
        <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#666' }}>
          Freelancer Pricing Tool
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor="email" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="password" 
              style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

