import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { getExpensesByCategory, getExpensesByDate } from '../api/client'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend)

function Reports() {
  const [categoryData, setCategoryData] = useState([])
  const [dateData, setDateData] = useState([])
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Set default date range to last 30 days
  useEffect(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    
    setDateRange({
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    })
  }, [])

  const fetchReports = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Fetching reports with date range:', dateRange);
      
      const [categoryResponse, dateResponse] = await Promise.all([
        getExpensesByCategory(dateRange.start, dateRange.end),
        getExpensesByDate(dateRange.start, dateRange.end)
      ])
      
      console.log('Category response:', categoryResponse);
      console.log('Date response:', dateResponse);
      
      // Handle API response format
      if (categoryResponse.ok) {
        setCategoryData(categoryResponse.data || [])
      } else {
        console.error('Category API error:', categoryResponse.error);
        setCategoryData([])
      }
      
      if (dateResponse.ok) {
        setDateData(dateResponse.data || [])
      } else {
        console.error('Date API error:', dateResponse.error);
        setDateData([])
      }
      
    } catch (err) {
      console.error('Reports fetch error:', err);
      setError(err.message || 'Failed to load reports')
      setCategoryData([])
      setDateData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch reports when date range changes and is not empty
    if (dateRange.start && dateRange.end) {
      fetchReports()
    }
  }, [dateRange])

  const handleDateChange = (e) => {
    const { name, value } = e.target
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    fetchReports()
  }

  // Prepare data for charts with fallback data
  const categoryChartData = {
    labels: categoryData.length > 0 ? categoryData.map(item => item.category || 'Unknown') : ['No Data'],
    datasets: [{
      label: 'Expenses by Category (₹)',
      data: categoryData.length > 0 ? categoryData.map(item => item.total || 0) : [0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 205, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)',
        'rgba(83, 102, 255, 0.6)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 205, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
        'rgba(83, 102, 255, 1)'
      ],
      borderWidth: 2
    }]
  }

  const dateChartData = {
    labels: dateData.length > 0 ? dateData.map(item => {
      const date = new Date(item.date)
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }) : ['No Data'],
    datasets: [{
      label: 'Daily Expenses (₹)',
      data: dateData.length > 0 ? dateData.map(item => item.total || 0) : [0],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  }

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Expenses by Category',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN')
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN')
          }
        }
      }
    }
  }

  const dateChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Daily Expenses Trend',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ₹' + context.parsed.y.toLocaleString('en-IN')
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN')
          }
        }
      }
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#FFFFDE', marginBottom: '2rem' }}>Expense Reports</h2>
      
      {/* Date Range Filter */}
      <form onSubmit={handleSubmit} style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>Start Date:</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#555' }}>End Date:</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
              style={{
                padding: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                padding: '0.6rem 1.5rem',
                backgroundColor: isLoading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold'
              }}
            >
              {isLoading ? 'Loading...' : 'Update Reports'}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #f5c6cb'
        }}>
          Error: {error}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && (categoryData.length > 0 || dateData.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: '#e7f3ff',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #b3d9ff'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0066cc' }}>Total Categories</h4>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#004499' }}>
              {categoryData.length}
            </p>
          </div>
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>Total Expense Days</h4>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#533f03' }}>
              {dateData.length}
            </p>
          </div>
          <div style={{
            backgroundColor: '#f8d7da',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #f5c6cb'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#721c24' }}>Total Expenses</h4>
            <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#491217' }}>
              ₹{categoryData.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: '#666',
          fontSize: '1.1rem'
        }}>
          ⏳ Loading reports...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '3rem' }}>
          {/* Expenses by Category Chart */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ height: '400px' }}>
              <Bar data={categoryChartData} options={categoryChartOptions} />
            </div>
            {categoryData.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
                No category data available for the selected date range. Add some expenses to see the breakdown!
              </p>
            )}
          </div>

          {/* Expenses by Date Chart */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ height: '400px' }}>
              <Line data={dateChartData} options={dateChartOptions} />
            </div>
            {dateData.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
                No daily expense data available for the selected date range. Add some expenses to see the trend!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
