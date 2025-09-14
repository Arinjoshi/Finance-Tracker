import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

function AuthButtons() {
  const { user, logout } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Welcome, {user.name || user.email}!</span>
        <button
          onClick={logout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setShowSignup(true)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Sign up
        </button>
        <button
          onClick={() => setShowLogin(true)}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            backgroundColor: 'transparent',
            color: '#007bff',
            border: '2px solid #007bff',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Log in
        </button>
      </div>

      {showLogin && (
        <LoginForm onClose={() => setShowLogin(false)} />
      )}
      {showSignup && (
        <SignupForm onClose={() => setShowSignup(false)} />
      )}
    </>
  )
}

export default AuthButtons
