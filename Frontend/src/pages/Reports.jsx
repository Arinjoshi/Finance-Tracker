import { useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import { getExpensesByCategory, getExpensesByDate } from '../api/client'

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend)

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
      backgroundColor: categoryData.length > 0 ? categoryData.map((item, index) => {
        const maxValue = Math.max(...categoryData.map(d => d.total || 0))
        const isHighest = item.total === maxValue
        if (isHighest) {
          return '#ffb151'
        }
        const colors = ['#ec3878', '#8e5777', '#a2abff', '#618ee3', '#987265']
        return colors[index % colors.length]
      }) : ['#ec3878'],
      borderColor: categoryData.length > 0 ? categoryData.map((item, index) => {
        const maxValue = Math.max(...categoryData.map(d => d.total || 0))
        const isHighest = item.total === maxValue
        if (isHighest) {
          return '#ffb151'
        }
        const colors = ['#ec3878', '#8e5777', '#a2abff', '#618ee3', '#987265']
        return colors[index % colors.length]
      }) : ['#ec3878'],
      borderWidth: 0,
      borderRadius: 4,
      borderSkipped: false
    }]
  }

  // Pie chart data for categories
  const categoryPieData = {
    labels: categoryData.length > 0 ? categoryData.map(item => item.category || 'Unknown') : ['No Data'],
    datasets: [{
      data: categoryData.length > 0 ? categoryData.map(item => item.total || 0) : [0],
      backgroundColor: [
        '#667eea',
        '#f093fb',
        '#4facfe',
        '#43e97b',
        '#fa709a',
        '#a8edea',
        '#ff9a9e',
        '#ffecd2'
      ],
      borderColor: '#1a1d29',
      borderWidth: 2,
      hoverBorderWidth: 3,
      hoverBorderColor: '#ffffff'
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
      borderColor: '#ffb151',
      backgroundColor: 'rgba(255, 177, 81, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#ffb151',
      pointBorderColor: '#ffffff',
      pointHoverBackgroundColor: '#ff9500',
      pointHoverBorderColor: '#ffffff',
      pointRadius: 5,
      pointHoverRadius: 7,
      borderWidth: 3,
      shadowColor: 'rgba(255, 177, 81, 0.3)',
      shadowBlur: 10
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
            size: 10
          },
          color: '#9b9b9b',
          usePointStyle: true,
          padding: 10
        }
      },
      title: {
        display: true,
        text: 'Category Breakdown',
        font: {
          size: 12,
          weight: '500'
        },
        color: '#9b9b9b'
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 41, 0.95)',
        titleColor: '#667eea',
        bodyColor: '#e2e8f0',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
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
          color: '#9b9b9b',
          font: {
            size: 10
          },
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN')
          }
        },
        grid: {
          color: 'rgba(155, 155, 155, 0.1)',
          drawBorder: false
        },
        border: {
          color: '#9b9b9b'
        }
      },
      x: {
        ticks: {
          color: '#9b9b9b',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(155, 155, 155, 0.1)',
          drawBorder: false
        },
        border: {
          color: '#9b9b9b'
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
            size: 10
          },
          color: '#9b9b9b',
          usePointStyle: true
        }
      },
      title: {
        display: true,
        text: 'Daily Trend',
        font: {
          size: 12,
          weight: '500'
        },
        color: '#9b9b9b'
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 41, 0.95)',
        titleColor: '#ffb151',
        bodyColor: '#e2e8f0',
        borderColor: '#ffb151',
        borderWidth: 1,
        cornerRadius: 8,
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
          color: '#9b9b9b',
          font: {
            size: 10
          },
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN')
          }
        },
        grid: {
          color: 'rgba(155, 155, 155, 0.1)',
          drawBorder: false
        },
        border: {
          color: '#9b9b9b'
        }
      },
      x: {
        ticks: {
          color: '#9b9b9b',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(155, 155, 155, 0.1)',
          drawBorder: false
        },
        border: {
          color: '#9b9b9b'
        }
      }
    }
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 9
          },
          color: '#718096',
          usePointStyle: true,
          padding: 10
        }
      },
      title: {
        display: true,
        text: 'Distribution',
        font: {
          size: 12,
          weight: '500'
        },
        color: '#e2e8f0'
      },
      tooltip: {
        backgroundColor: 'rgba(26, 29, 41, 0.95)',
        titleColor: '#667eea',
        bodyColor: '#e2e8f0',
        borderColor: '#667eea',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return context.label + ': ₹' + context.parsed.toLocaleString('en-IN') + ' (' + percentage + '%)'
          }
        }
      }
    }
  }

  return (
    <div style={{ 
      padding: '2rem',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <h2 style={{ 
        color: '#ffffff', 
        marginBottom: '1.5rem',
        fontSize: '1.5rem',
        fontWeight: '500',
        textAlign: 'left'
      }}>Expense Analytics</h2>
      
      {/* Date Range Filter */}
     <form
  onSubmit={handleSubmit}
  style={{
    margin: '0 auto 1rem',
    padding: '1rem',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    background: '#252d3a',
    maxWidth: '450px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}
>
  {/* First row: Start and End Date */}
 <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
  <div style={{ flex: 1, minWidth: '100px', maxWidth: '150px' }}>
    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', color: '#ffffff', fontSize: '0.8rem' }}>
      Start Date:
    </label>
    <input
      type="date"
      name="start"
      value={dateRange.start}
      onChange={handleDateChange}
      style={{
        padding: '0.4rem',
        border: '1px solid #4a5568',
        borderRadius: '6px',
        fontSize: '0.8rem',
        width: '100%',
        maxWidth: '150px',
        background: '#2d3748',
        color: '#ffffff'
      }}
    />
  </div>

  <div style={{ flex: 1, minWidth: '100px', maxWidth: '150px' }}>
    <label style={{ display: 'block', marginBottom: '0.3rem', fontWeight: 'bold', color: '#ffffff', fontSize: '0.8rem' }}>
      End Date:
    </label>
    <input
      type="date"
      name="end"
      value={dateRange.end}
      onChange={handleDateChange}
      style={{
        padding: '0.4rem',
        border: '1px solid #4a5568',
        borderRadius: '6px',
        fontSize: '0.8rem',
        width: '100%',
        maxWidth: '150px',
        background: '#2d3748',
        color: '#ffffff'
      }}
    />
  </div>
</div>


  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <button
      type="submit"
      disabled={isLoading}
      style={{
        padding: '0.5rem 1.2rem',
        background: isLoading ? '#4a5568' : '#9559c6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500'
      }}
    >
      {isLoading ? 'Loading...' : 'Update Reports'}
    </button>
  </div>
</form>

      {/* Error Message */}
      {error && (
        <div style={{ 
          color: '#fc8181', 
          background: '#2d1b1b',
          padding: '0.8rem',
          borderRadius: '6px',
          marginBottom: '1rem',
          border: '1px solid #e53e3e',
          fontSize: '0.8rem'
        }}>
          ⚠️ Error: {error}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && (categoryData.length > 0 || dateData.length > 0) && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.8rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: '#252d3a',
            padding: '0.8rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #2d3748'
          }}>
            <h4 style={{ margin: '0 0 0.3rem 0', color: '#a0aec0', fontSize: '0.7rem', fontWeight: '400' }}>Categories</h4>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', color: '#ffffff' }}>
              {categoryData.length}
            </p>
          </div>
          <div style={{
            background: '#252d3a',
            padding: '0.8rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #2d3748'
          }}>
            <h4 style={{ margin: '0 0 0.3rem 0', color: '#a0aec0', fontSize: '0.7rem', fontWeight: '400' }}>Expense Days</h4>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', color: '#ffffff' }}>
              {dateData.length}
            </p>
          </div>
          <div style={{
            background: '#252d3a',
            padding: '0.8rem',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #2d3748'
          }}>
            <h4 style={{ margin: '0 0 0.3rem 0', color: '#a0aec0', fontSize: '0.7rem', fontWeight: '400' }}>Total Expenses</h4>
            <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: '600', color: '#4fd1c7' }}>
              ₹{categoryData.reduce((sum, item) => sum + (item.total || 0), 0).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem',
          color: '#a0aec0',
          fontSize: '0.9rem'
        }}>
          ⏳ Loading reports...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Row: Bar Chart and Pie Chart */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem'
          }}>
            {/* Bar Chart - Expenses by Category */}
            <div style={{
              background: '#232228',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #3a3a3a',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              height: '400px'
            }}>
              <div style={{ height: '100%' }}>
                <Bar data={categoryChartData} options={categoryChartOptions} />
              </div>
              {categoryData.length === 0 && (
                <p style={{ textAlign: 'center', color: '#ffffff', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  No data available
                </p>
              )}
            </div>

            {/* Pie Chart - Category Distribution */}
            <div style={{
              background: '#232228',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #3a3a3a',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              height: '400px'
            }}>
              <div style={{ height: '100%' }}>
                <Pie data={categoryPieData} options={pieChartOptions} />
              </div>
              {categoryData.length === 0 && (
                <p style={{ textAlign: 'center', color: '#ffffff', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                  No data available
                </p>
              )}
            </div>
          </div>

          {/* Bottom Row: Line Chart */}
          <div style={{
            background: '#232228',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid #3a3a3a',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            height: '400px'
          }}>
            <div style={{ height: '100%' }}>
              <Line data={dateChartData} options={dateChartOptions} />
            </div>
            {dateData.length === 0 && (
              <p style={{ textAlign: 'center', color: '#ffffff', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                No data available
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
