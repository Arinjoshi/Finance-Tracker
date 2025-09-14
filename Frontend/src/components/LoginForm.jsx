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
   <div className="modal-overlay">
  <div className="modal-container">
    <h2>Log In</h2>
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter your email address"
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          placeholder="Enter your password"
        />
      </div>
      {error && <div className="error-message">{error}</div>}
      <div className="modal-buttons">
        <button type="submit" className="primary">
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
        <button type="button" className="secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
    <p className="demo-note">
      Demo: Use username "demo" and password "demo123" to test
    </p>
  </div>
</div>


  )
}

export default LoginForm
