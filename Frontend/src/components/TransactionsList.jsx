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
    <div>
      <h2>Transactions</h2>
      
      {/* Filters */}
      <form onSubmit={handleFilterSubmit} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              name="start"
              value={filters.start}
              onChange={handleFilterChange}
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="date"
              name="end"
              value={filters.end}
              onChange={handleFilterChange}
            />
          </div>
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
          <div>
            <label>Per Page:</label>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Apply Filters'}
        </button>
        <button type="button" onClick={() => {
          setFilters({ start: '', end: '', category: '', page: 1, limit: 10 })
          fetchTransactions()
        }}>
          Clear Filters
        </button>
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
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Amount</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map(transaction => (
                  <tr key={transaction._id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <span style={{ 
                        color: transaction.type === 'income' ? 'green' : 'red',
                        textTransform: 'capitalize'
                      }}>
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {transaction.category}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {transaction.description || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </>
      )}
    </div>
  )
}

export default TransactionsList
