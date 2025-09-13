# Gemini API Setup

To use Gemini AI for receipt processing, you need to:

1. **Get a Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated API key

2. **Add the API key to your .env file:**
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Install the new dependency:**
   ```bash
   cd Backend
   npm install
   ```

4. **Restart your backend server:**
   ```bash
   npm run server
   ```

## Features Added:

✅ **Gemini AI Integration** - Uses Google's Gemini AI to extract text and costs from receipt images
✅ **Individual Cost Extraction** - Extracts each line item with its individual cost
✅ **Automatic Transaction Creation** - Creates separate expense transactions for each item
✅ **Fallback to OCR** - Falls back to Tesseract OCR if Gemini fails
✅ **Enhanced Receipt Data** - Extracts store name, date, tax amounts, and itemized costs
✅ **Real-time Processing** - Processes receipts immediately after upload

## How it works:

1. **Upload receipt** → Frontend sends image to backend
2. **Gemini processing** → AI extracts text and individual costs
3. **Transaction creation** → Each item becomes a separate expense transaction
4. **Response** → Frontend receives all created transactions

## Example Response:
```json
{
  "ok": true,
  "receipt": { ... },
  "transactions": [
    {
      "amount": 5.99,
      "description": "Coffee (Starbucks)",
      "type": "expense",
      "category": "Receipt Items"
    },
    {
      "amount": 12.50,
      "description": "Sandwich (Starbucks)", 
      "type": "expense",
      "category": "Receipt Items"
    }
  ],
  "message": "Receipt processed successfully! Created 2 transactions."
}
```
