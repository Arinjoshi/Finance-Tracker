import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import TransactionForm from './components/TransactionForm'
import TransactionsList from './components/TransactionsList'
import Reports from './pages/Reports'
import Dashboard from './components/Dashboard'
import ReceiptUploadForm from './components/ReceiptUploadForm'
import AuthButtons from './components/AuthButtons'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/Landing'

function NavBar() {
  const { user } = useAuth()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Finflow</Link>
      <div className="nav-links">
        {user && (
          <>
            <Link 
              to="/" 
              style={{
                color: isActive('/') ? '#9559c6' : '#CBD5E1',
                fontWeight: isActive('/') ? 'bold' : '500'
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/transactions"
              style={{
                color: isActive('/transactions') ? '#9559c6' : '#CBD5E1',
                fontWeight: isActive('/transactions') ? 'bold' : '500'
              }}
            >
              Transactions
            </Link>
            <Link 
              to="/reports"
              style={{
                color: isActive('/reports') ? '#9559c6' : '#CBD5E1',
                fontWeight: isActive('/reports') ? 'bold' : '500'
              }}
            >
              Reports
            </Link>
            <Link 
              to="/upload-receipt"
              style={{
                color: isActive('/upload-receipt') ? '#9559c6' : '#CBD5E1',
                fontWeight: isActive('/upload-receipt') ? 'bold' : '500'
              }}
            >
              Upload Receipt
            </Link>
          </>
        )}
        <AuthButtons />
      </div>
    </nav>
  )
}

function AppContent() {
  const { user } = useAuth()

  return (
    <Router>
      <div>
        <NavBar />


        <Routes>
          <Route path="/" element={
            user ? 
              <Dashboard />: <LandingPage/> } />
          {/* //   ) : (
          //     <div style={{ textAlign: 'center', padding: '2rem' }}>
          //       <h1>Personal Finance App</h1>
          //       <h2 style={{ color: '#666', marginBottom: '2rem' }}>Track income & expenses</h2>
          //       <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
          //         Sign up or log in to start managing your finances
          //       </p>
          //     </div>
          //   )
          // } /> */}
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
