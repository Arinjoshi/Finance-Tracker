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

  const fetchReports = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const [categoryResponse, dateResponse] = await Promise.all([
        getExpensesByCategory(dateRange.start, dateRange.end),
        getExpensesByDate(dateRange.start, dateRange.end)
      ])
      
      setCategoryData(categoryResponse)
      setDateData(dateResponse)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

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

  // Prepare data for charts
  const categoryChartData = {
    labels: categoryData.map(item => item.category),
    datasets: [{
      label: 'Expenses by Category',
      data: categoryData.map(item => item.total),
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  }

  const dateChartData = {
    labels: dateData.map(item => item.date),
    datasets: [{
      label: 'Daily Expenses',
      data: dateData.map(item => item.total),
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      tension: 0.1
    }]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Expense Reports'
      }
    }
  }

  return (
    <div>
      <h2>Expense Reports</h2>
      
      {/* Date Range Filter */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div>
            <label>Start Date:</label>
            <input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateChange}
            />
          </div>
          <div>
            <label>End Date:</label>
            <input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateChange}
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Update Reports'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div>Loading reports...</div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Expenses by Category Chart */}
          <div>
            <h3>Expenses by Category</h3>
            <div style={{ height: '400px' }}>
              <Bar data={categoryChartData} options={chartOptions} />
            </div>
          </div>

          {/* Expenses by Date Chart */}
          <div>
            <h3>Daily Expenses Trend</h3>
            <div style={{ height: '400px' }}>
              <Line data={dateChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
