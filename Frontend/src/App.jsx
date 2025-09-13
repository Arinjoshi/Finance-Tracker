import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import TransactionForm from './components/TransactionForm'
import TransactionsList from './components/TransactionsList'
import Reports from './pages/Reports'
import Dashboard from './components/Dashboard'
import ReceiptUploadForm from './components/ReceiptUploadForm'
import AuthButtons from './components/AuthButtons'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const { user } = useAuth()

  return (
    <Router>
      <div>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #eee' }}>
          <div>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
              Finance App
            </Link>
          </div>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {user && (
              <>
                <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>Dashboard</Link>
                <Link to="/transactions" style={{ textDecoration: 'none', color: '#333' }}>Transactions</Link>
                <Link to="/reports" style={{ textDecoration: 'none', color: '#333' }}>Reports</Link>
                <Link to="/upload-receipt" style={{ textDecoration: 'none', color: '#333' }}>Upload Receipt</Link>
              </>
            )}
            <AuthButtons />
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            user ? (
              <Dashboard />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <h1>Personal Finance App</h1>
                <h2 style={{ color: '#666', marginBottom: '2rem' }}>Track income & expenses</h2>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
                  Sign up or log in to start managing your finances
                </p>
              </div>
            )
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <TransactionsList />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/add-transaction" element={
            <ProtectedRoute>
              <div>
                <h1>Add Transaction</h1>
                <TransactionForm />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/upload-receipt" element={
            <ProtectedRoute>
              <ReceiptUploadForm />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
