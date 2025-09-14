import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import TransactionForm from './components/TransactionForm'
import TransactionsList from './components/TransactionsList'
import Reports from './pages/Reports'
import Dashboard from './components/Dashboard'
import ReceiptUploadForm from './components/ReceiptUploadForm'
import AuthButtons from './components/AuthButtons'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/Landing'

function AppContent() {
  const { user } = useAuth()

  return (
    <Router>
      <div>
        <nav className="navbar">
  <Link to="/" className="logo">Finance App</Link>
  <div className="nav-links">
    {user && (
      <>
        <Link to="/">Dashboard</Link>
        <Link to="/transactions">Transactions</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/upload-receipt">Upload Receipt</Link>
      </>
    )}
    <AuthButtons />
  </div>
</nav>


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
