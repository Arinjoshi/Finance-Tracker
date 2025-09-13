# 📋 Receipt Processing Setup Guide - node-ts-ocr + Gemini

This guide explains how to set up receipt processing using the `node-ts-ocr` library for OCR extraction and Gemini AI for structured data processing.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd Backend
npm install node-ts-ocr @google/generative-ai temp
```

### 2. Environment Variables
Create or update your `.env` file in the Backend directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb://localhost:27017/finance-app
```

### 3. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key to your `.env` file

## 📄 Supported File Formats

✅ **PDF Files** - Direct OCR extraction from PDF  
✅ **JPG/JPEG** - Image OCR extraction  
✅ **PNG** - Image OCR extraction  
✅ **TIFF** - Image OCR extraction  
✅ **BMP** - Image OCR extraction  

## 🧪 Testing the Setup

### Test with Your Own Files
1. Place a receipt file (PDF or image) in the `Backend/uploads/` directory
2. Run the test script:
```bash
node test-ocr-pdf.js
```

### Expected Output
```
🧪 Testing with file: your-receipt.pdf
🔍 Extracting text from: /path/to/uploads/your-receipt.pdf
✅ Text extraction completed!
📄 Text length: 1234
📄 Preview: WALMART SUPERCENTER...
🤖 Processing with Gemini AI...
✅ Gemini processing completed
📊 Extracted 5 expenses
💰 Total amount: 45.67
🏪 Store: Walmart

🎉 Test completed successfully!
```

## 🔧 How It Works

### 1. OCR Extraction (node-ts-ocr)
```javascript
const { Ocr } = require('node-ts-ocr');

// Extract text from PDF or image
const extractedText = await Ocr.extractText(filePath);
```

### 2. Gemini AI Processing
```javascript
// Process the extracted text with Gemini AI
const structuredData = await processWithGemini(extractedText);
```

### 3. Automatic Transaction Creation
- Each receipt item becomes a separate transaction
- Automatic categorization (food, shopping, etc.)
- Store name, date, and amounts extracted
- All transactions appear in dashboard automatically

## 📊 Example Processing Result

**Input:** Receipt with multiple items  
**Output:** 
```json
{
  "storeName": "Walmart",
  "date": "2024-01-15",
  "totalAmount": 45.67,
  "taxAmount": 3.21,
  "expenses": [
    {
      "description": "Milk 2%",
      "amount": 3.99,
      "category": "food",
      "quantity": 1
    },
    {
      "description": "Bread Whole Wheat", 
      "amount": 2.49,
      "category": "food",
      "quantity": 1
    }
  ]
}
```

## 🐛 Troubleshooting

### OCR Errors
```
Error: OCR extraction failed: The "data" argument must be of type string...
```
**Solutions:**
- Ensure file exists in the uploads directory
- Check file format is supported (PDF, JPG, PNG, TIFF, BMP)
- Verify file is not corrupted
- Check file permissions

### Gemini API Errors
```
Error: Text processing failed...
```
**Solutions:**
- Verify GEMINI_API_KEY is set in .env file
- Check API key has proper permissions
- Ensure internet connection is stable

### File Upload Issues
```
Error: Unsupported file type...
```
**Solutions:**
- Only upload PDF or image files (JPG, PNG, TIFF, BMP)
- Check file size is under 10MB limit
- Ensure file is not corrupted

## 🎯 Testing Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] GEMINI_API_KEY set in .env file
- [ ] Test file placed in uploads directory
- [ ] Test script runs successfully (`node test-ocr-pdf.js`)
- [ ] Backend server starts (`npm run server`)
- [ ] Frontend connects to backend
- [ ] File upload works through web interface
- [ ] Transactions appear in dashboard automatically

## 📝 File Processing Flow

1. **Upload** → User uploads PDF/image via web interface
2. **Storage** → File saved to uploads directory with unique name
3. **OCR** → node-ts-ocr extracts text from PDF/image
4. **AI Processing** → Gemini AI analyzes text and extracts expenses
5. **Transaction Creation** → Each expense becomes separate transaction
6. **Database Update** → Receipt and transactions saved to MongoDB
7. **Dashboard Update** → All transactions appear automatically

## 🚀 Ready to Go!

Once everything is set up, you can:
- Upload PDF receipts directly
- Upload image receipts (JPG, PNG, etc.)
- Get automatic expense extraction
- See all transactions in dashboard
- No manual amount entry required

The system automatically handles both PDF and image formats using your preferred `node-ts-ocr` approach!