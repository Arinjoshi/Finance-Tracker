import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listTransactions } from '../api/client'

function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0
  })
  const [recentTransactions, setRecentTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Calculate date range for last 30 days for recent transactions
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const start = startDate.toISOString().split('T')[0]
      const end = endDate.toISOString().split('T')[0]

      // First, fetch ALL transactions for balance calculation (no date filter, no pagination)
      console.log('Fetching all transactions for balance calculation...')
      const allTransactionsResponse = await listTransactions({
        limit: 10000, // Get all transactions for accurate balance
        page: 1
        // No start/end date - get ALL transactions ever
      })

      // Then fetch recent transactions for display (limit to 5, with date filter)
      console.log('Fetching recent transactions for display...')
      const recentTransactionsResponse = await listTransactions({
        start,
        end,
        limit: 5, // Only get 5 for display
        page: 1
      })

      if (allTransactionsResponse.ok && recentTransactionsResponse.ok) {
        const allTransactions = allTransactionsResponse.data || []
        const recentTransactions = recentTransactionsResponse.data || []
        
        console.log('Dashboard: All transactions fetched:', allTransactions.length)
        console.log('Dashboard: Recent transactions fetched:', recentTransactions.length)
        console.log('Dashboard: All transactions data:', allTransactions)
        
        // Set recent transactions for display (already limited to 5)
        setRecentTransactions(recentTransactions)

        // Calculate summary using ALL transactions for accurate balance
        let totalIncome = 0
        let totalExpenses = 0

        allTransactions.forEach(transaction => {
          console.log(`Processing transaction: ${transaction.type} - ${transaction.amount}`)
          if (transaction.type === 'income') {
            totalIncome += transaction.amount
          } else if (transaction.type === 'expense') {
            totalExpenses += transaction.amount
          }
        })

        console.log('Dashboard: Total Income:', totalIncome)
        console.log('Dashboard: Total Expenses:', totalExpenses)
        console.log('Dashboard: Net Balance:', totalIncome - totalExpenses)

        setSummary({
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses
        })
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      setError('Error loading dashboard data')
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem', color: '#FFFFDE' }}>Dashboard</h1>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem', 
        marginBottom: '3rem' 
      }}>
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#155724' }}>Total Income</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
            {formatCurrency(summary.totalIncome)}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#721c24' }}>Total Expenses</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>
            {formatCurrency(summary.totalExpenses)}
          </div>
        </div>
        
        <div style={{
          backgroundColor: summary.netBalance >= 0 ? '#d1ecf1' : '#f8d7da',
          border: `1px solid ${summary.netBalance >= 0 ? '#bee5eb' : '#f5c6cb'}`,
          borderRadius: '8px',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 0.5rem 0', 
            color: summary.netBalance >= 0 ? '#0c5460' : '#721c24' 
          }}>
            Net Balance
          </h3>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: summary.netBalance >= 0 ? '#0c5460' : '#721c24' 
          }}>
            {formatCurrency(summary.netBalance)}
          </div>
        </div>
      </div>

      {/* Primary CTAs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '3rem',
        justifyContent: 'center'
      }}>
        <Link to="/upload-receipt" style={{
          padding: '1rem 2rem',
          backgroundColor: '#28a745',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          📄 Upload Receipt (AI Processing)
        </Link>
        <Link to="/add-transaction" style={{
          padding: '1rem 2rem',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ➕ Manual Transaction
        </Link>
      </div>

      {/* Recent Transactions */}
      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem' 
        }}>
          <h2 style={{ margin: 0, color: '#FFFFDE' }}>Recent Transactions (Last 5)</h2>
          <Link to="/transactions" style={{
            color: '#007bff',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}>
            View All →
          </Link>
        </div>

        {error ? (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '1rem', 
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '2px dashed #dee2e6'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>
              You have no transactions yet
            </h3>
            <p style={{ color: '#6c757d', marginBottom: '2rem' }}>
              Start by uploading a receipt - our AI will automatically extract individual costs!
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/upload-receipt" style={{
                padding: '1rem 2rem',
                backgroundColor: '#28a745',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                📄 Upload Receipt (Recommended)
              </Link>
              <Link to="/add-transaction" style={{
                padding: '1rem 2rem',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                ➕ Manual Entry
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #000000',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' ,color:'#333333'}}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Description</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id} style={{ borderBottom: '1px solid #f1f3f4',color:'#333333' }}>
                    <td style={{ padding: '1rem' }}>{formatDate(transaction.date)}</td>
                    <td style={{ 
                      padding: '1rem', 
                      fontWeight: 'bold',
                      color: transaction.type === 'income' ? '#28a745' : '#dc3545'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        backgroundColor: transaction.type === 'income' ? '#d4edda' : '#f8d7da',
                        color: transaction.type === 'income' ? '#155724' : '#721c24'
                      }}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{transaction.category}</td>
                    <td style={{ padding: '1rem' }}>{transaction.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

