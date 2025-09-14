import { useState, useEffect } from 'react'
import { listTransactions } from '../api/client'

function TransactionsList() {
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState({
    start: '',
    end: '',
    category: '',
    page: 1,
    limit: 10
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchTransactions = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const params = {
        page: filters.page,
        limit: filters.limit
      }
      
      if (filters.start) params.start = filters.start
      if (filters.end) params.end = filters.end
      if (filters.category) params.category = filters.category

      const response = await listTransactions(params)
      
      if (response.ok) {
        setTransactions(response.data)
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total
        })
      } else {
        throw new Error('Failed to fetch transactions')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
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

  useEffect(() => {
    fetchTransactions()
  }, [filters.page])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    setFilters(prev => ({ ...prev, page: 1 }))
    fetchTransactions()
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Transactions</h2>
      
      {/* Filters */}
 <form onSubmit={handleFilterSubmit} className="form-container">
  {/* Start Date */}
  <div>
    <label>Start Date:</label>
    <input type="date" name="start" value={filters.start} onChange={handleFilterChange} />
  </div>

  {/* End Date */}
  <div>
    <label>End Date:</label>
    <input type="date" name="end" value={filters.end} onChange={handleFilterChange} />
  </div>

  {/* Category */}
  <div>
    <label>Category:</label>
    <input
      type="text"
      name="category"
      value={filters.category}
      onChange={handleFilterChange}
      placeholder="Filter by category"
    />
  </div>

  {/* Per Page */}
  <div>
    <label>Per Page:</label>
    <select name="limit" value={filters.limit} onChange={handleFilterChange}>
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
    </select>
  </div>

  {/* Buttons */}
  <div className="form-buttons">
    <button type="submit" className="button-primary" disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Apply Filters'}
    </button>
    <button
      type="button"
      className="button-secondary"
      onClick={() => {
        setFilters({ start: '', end: '', category: '', page: 1, limit: 10 });
        fetchTransactions();
      }}
    >
      Clear Filters
    </button>
  </div>
</form>



      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      {/* Transactions Table */}
      {isLoading ? (
        <div>Loading transactions...</div>
      ) : (
        <>
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
                {transactions.map((transaction) => (
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
        <div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginTop:'15px' }}>
              <div>
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div>
                <button 
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  style={{ marginRight: '5px' }}
                >
                  Previous
                </button>
                <span style={{ margin: '0 10px' }}>
                  Page {pagination.page} of {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= totalPages}
                  style={{ marginLeft: '5px' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
            </>
      )}
    </div>
  )
}

export default TransactionsList
