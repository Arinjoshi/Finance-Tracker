import { useState } from 'react'
import { uploadReceipt } from '../api/client'


function ReceiptUploadForm() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('') 
  const [isLoading, setIsLoading] = useState(false)
  const [processingResult, setProcessingResult] = useState()

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setMessage('')
    setProcessingResult(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setMessage('Please select a receipt image')
      return
    }

    setIsLoading(true)
    setMessage('')

    try {
      const response = await uploadReceipt(file)
      
      if (response.ok) {
        setProcessingResult(response)
        
        if (response.transactions && response.transactions.length > 0) {
          setMessage(`✅ Receipt processed successfully! Created ${response.transactions.length} transactions automatically.`)
          
          // Show transaction details
          const transactionDetails = response.transactions.map(t => 
            `• ${t.description}: $${t.amount}`
          ).join('\n')
          
          setMessage(prev => prev + '\n\n📋 Created transactions:\n' + transactionDetails)
        } else {
          setMessage('✅ Receipt uploaded successfully!')
        }
        
        // Reset form
        setFile(null)
        const fileInput = document.getElementById('receipt-file')
        if (fileInput) fileInput.value = ''
        
        //Refresh the page after 3 seconds to show new transactions on dashboard
        setTimeout(() => {
          window.location.reload()
        }, 60000)
        
      } else {
        throw new Error(response.error || 'Failed to process receipt')
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#FFFFDE' }}>
        📄 Upload Receipt
      </h2>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '2px dashed #dee2e6',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
        <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>
          Upload Your Receipt (PDF or Image)
        </h3>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          Our AI will automatically extract individual costs from PDF receipts or image files
        </p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center'}}>
            <input
              id="receipt-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.bmp,image/*,application/pdf"
              onChange={handleFileChange}
              required
              style={{
                //id was not before
                id: 'receipt-file',
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: 'white',
                //display was not before
                display: 'none',
              }}
            />
            //this full label block is changed
                  {/* Custom Upload Button */}
          <label
            htmlFor="receipt-file"
            style={{
              display: 'block',
              width: '100%',
              padding: '1rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {file ? '📂 File is uploaded' : '📤 Choose File'}
          </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !file}
            style={{
              padding: '1rem 2rem',
              backgroundColor: isLoading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          >
            {isLoading ? '🔄 Processing Receipt...' : '🚀 Process Receipt'}
          </button>
        </form>
      </div>

      {/* Processing Results */}
      {processingResult && (
        <div style={{
          backgroundColor: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '1rem',
          color: '#333333',
        }}>
          <h3 style={{ color: '#155724', marginBottom: '1rem' }}>
            ✅ Receipt Processed Successfully!
          </h3>
          
          {processingResult.summary && (
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Store:</strong> {processingResult.summary.storeName}</p>
              <p><strong>Total Amount:</strong> ${processingResult.summary.totalAmount}</p>
              <p><strong>Total Expenses:</strong> {processingResult.summary.totalExpenses}</p>
            </div>
          )}
          
          {processingResult.transactions && processingResult.transactions.length > 0 && (
            <div>
              <h4 style={{ color: '#155724', marginBottom: '0.5rem' }}>
                Created Transactions ({processingResult.transactions.length}):
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {processingResult.transactions.map((transaction, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    color: '#333333',
                    padding: '0.5rem',
                    margin: '0.25rem 0',
                    borderRadius: '4px',
                    border: '1px solid #c3e6cb'
                  }}>
                    <strong>{transaction.description}</strong> - ₹{transaction.amount}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div style={{
          padding: '1rem',
          borderRadius: '4px',
          textAlign: 'center',
          backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        backgroundColor: '#e7f3ff',
        border: '1px solid #b3d9ff',
        borderRadius: '8px',
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <h4 style={{ color: '#0066cc', marginBottom: '0.5rem' }}>💡 How it works:</h4>
        <ul style={{ color: '#0066cc', margin: 0, paddingLeft: '1.5rem' }}>
          <li>Upload a PDF receipt or clear image (JPG, PNG, TIFF, BMP)</li>
          <li>AI extracts individual items and their costs</li>
          <li>Each item becomes a separate expense transaction</li>
          <li>All transactions are automatically added to your dashboard</li>
        </ul>
      </div>
    </div>
  )
}

export default ReceiptUploadForm
