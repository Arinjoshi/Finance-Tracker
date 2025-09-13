import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { login as apiLogin } from '../api/client'

function LoginForm({ onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Login form data:', formData);
      
      // Use the API to authenticate
      const credentials = { 
        username: formData.email, 
        password: formData.password 
      };
      
      console.log('Sending login credentials:', credentials);
      console.log('Credentials stringified:', JSON.stringify(credentials));
      
      const response = await apiLogin(credentials)
      
      console.log('Login API response:', response);
      console.log('Response ok:', response.ok);
      console.log('Response status:', response.status);
      console.log('Response error:', response.error);
      
      if (response.ok) {
        console.log('Login successful, user data:', response.user);
        login(response.user)
        onClose()
        // Note: Removed window.location.reload() as per memory guidance
      } else {
        console.error('Login failed:', response.error);
        console.error('Full response object:', response);
        setError(response.error || 'Login failed')
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h2>Log In</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginTop: '0.25rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                marginTop: '0.25rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {error && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
          Demo: Use username "demo" and password "demo123" to test
        </p>
      </div>
    </div>
  )
}

export default LoginForm
