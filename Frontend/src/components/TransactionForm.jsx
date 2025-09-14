import { useState } from 'react'
import { createTransaction, uploadReceipt } from '../api/client'

function TransactionForm() {
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      let receiptId = null

      // Upload file first if present
      if (file) {
        const receiptResponse = await uploadReceipt(file)
        if (receiptResponse.ok) {
          receiptId = receiptResponse.receipt._id
          
          // If Gemini processing created transactions, show success message
          if (receiptResponse.transactions && receiptResponse.transactions.length > 0) {
            setMessage(`Receipt processed successfully! Created ${receiptResponse.transactions.length} transactions automatically. You can still add additional details below.`)
          }
        } else {
          throw new Error('Failed to upload receipt')
        }
      }

      // Prepare transaction data
      const transactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category || 'uncategorized',
        date: formData.date,
        description: formData.description,
        receiptId: receiptId,
        source: file ? 'ocr' : 'manual'
      }

      // Create transaction
      const response = await createTransaction(transactionData)
      
      if (response.ok) {
        setMessage('Transaction created successfully!')
        // Reset form
        setFormData({
          amount: '',
          type: 'expense',
          category: '',
          date: new Date().toISOString().split('T')[0],
          description: ''
        })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file')
        if (fileInput) fileInput.value = ''
      } else {
        throw new Error(response.error || 'Failed to create transaction')
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return ( 
    <div>
     <form
  onSubmit={handleSubmit}
  className="transaction-form"
>
  {/* Amount */}
  <div className="form-group">
    <label>Amount:</label>
    <input
      type="number"
      name="amount"
      value={formData.amount}
      onChange={handleChange}
      step="0.01"
      required
    />
  </div>

  {/* Type */}
  <div className="form-group">
    <label>Type:</label>
    <div className="radio-options">
      <label>
        <input
          type="radio"
          name="type"
          value="income"
          checked={formData.type === 'income'}
          onChange={handleChange}
        />
        Income
      </label>
      <label>
        <input
          type="radio"
          name="type"
          value="expense"
          checked={formData.type === 'expense'}
          onChange={handleChange}
        />
        Expense
      </label>
    </div>
  </div>

  {/* Category */}
  <div className="form-group">
    <label>Category:</label>
    <input
      type="text"
      name="category"
      value={formData.category}
      onChange={handleChange}
      placeholder="e.g., Food, Transport, Salary"
    />
  </div>

  {/* Date */}
  <div className="form-group">
    <label>Date:</label>
    <input
      type="date"
      name="date"
      value={formData.date}
      onChange={handleChange}
      required
    />
  </div>

  {/* Description */}
  <div className="form-group">
    <label>Description:</label>
    <input
      type="text"
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Optional description"
    />
  </div>

  {/* Receipt */}
  <div className="form-group">
    <label>Receipt (optional):</label>
    <input
      id="file"
      type="file"
      accept="image/*"
      onChange={handleFileChange}
    />
  </div>

  {/* Submit button */}
  <button type="submit" className="button-primary" disabled={isLoading}>
    {isLoading ? 'Creating...' : 'Create Transaction'}
  </button>
</form>


      {message && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
          color: message.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default TransactionForm
