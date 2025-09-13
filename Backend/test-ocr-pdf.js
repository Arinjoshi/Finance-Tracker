const { Ocr } = require('node-ts-ocr');
const path = require('path');
const fs = require('fs');

/**
 * Extract text from PDF file using node-ts-ocr
 * Following your preferred approach
 * @param {string} fileName - Name of the file to process
 * @returns {Promise<string>} - Extracted text
 */
async function getPdfText(fileName) {
  try {
    // Build the file path (assuming files are in uploads directory)
    const relativePath = path.join('uploads', fileName);
    const pdfPath = path.join(__dirname, relativePath);
    
    console.log('🔍 Extracting text from:', pdfPath);
    
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File not found: ${pdfPath}`);
    }
    
    // Extract the text and return the result
    const extractedText = await Ocr.extractText(pdfPath);
    
    if (!extractedText) {
      throw new Error('OCR returned undefined - file may be corrupted or unsupported format');
    }
    
    console.log('✅ Text extraction completed!');
    console.log('📄 Text length:', extractedText.length);
    console.log('📄 Preview:', extractedText.substring(0, 300) + '...');
    
    return extractedText;
  } catch (error) {
    console.error('❌ OCR extraction failed:', error.message);
    throw error;
  }
}

/**
 * Process extracted text with Gemini AI
 * @param {string} extractedText - Text extracted from OCR
 * @returns {Promise<Object>} - Structured expense data
 */
async function processWithGemini(extractedText) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  try {
    console.log('🤖 Processing with Gemini AI...');
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert at extracting expense information from receipt text. 
Analyze the following receipt text and extract ALL individual expenses with their details.

RECEIPT TEXT:
${extractedText}

Please return a JSON object with this exact structure:
{
  "storeName": "Store name if found",
  "date": "YYYY-MM-DD format if found",
  "totalAmount": "total amount as number",
  "taxAmount": "tax amount as number",
  "expenses": [
    {
      "description": "item description",
      "amount": "item cost as number",
      "category": "expense category (food, transportation, shopping, etc.)",
      "quantity": "quantity if mentioned"
    }
  ]
}

IMPORTANT RULES:
1. Extract EVERY individual item/expense from the receipt
2. Amount should be a number (not string)
3. If no specific category, use "general"
4. If no quantity mentioned, use 1
5. If no date found, use today's date
6. Return valid JSON only, no other text

Example response:
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
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response (remove markdown formatting if present)
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON response
    const structuredData = JSON.parse(cleanText);
    
    console.log('✅ Gemini processing completed');
    console.log(`📊 Extracted ${structuredData.expenses?.length || 0} expenses`);
    console.log('💰 Total amount:', structuredData.totalAmount);
    console.log('🏪 Store:', structuredData.storeName);
    
    return structuredData;
  } catch (error) {
    console.error('❌ Gemini processing failed:', error.message);
    throw new Error(`Text processing failed: ${error.message}`);
  }
}

/**
 * Complete test function
 */
async function testOcrWithPdf() {
  try {
    // Check if .env file exists and load it
    require('dotenv').config();
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      console.log('💡 Please add GEMINI_API_KEY to your .env file');
      return;
    }
    
    // List available files in uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const files = fs.readdirSync(uploadsDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(ext);
    });
    
    if (files.length === 0) {
      console.log('⚠️  No receipt files found in uploads directory');
      console.log('📁 Please add a PDF or image file to:', uploadsDir);
      console.log('📄 Supported formats: PDF, JPG, PNG, TIFF, BMP');
      return;
    }
    
    console.log('📁 Available files:', files);
    const testFile = files[0]; // Use first available file
    
    console.log(`🧪 Testing with file: ${testFile}`);
    
    // Step 1: Extract text using OCR
    const extractedText = await getPdfText(testFile);
    
    // Step 2: Process with Gemini
    const structuredData = await processWithGemini(extractedText);
    
    console.log('\n🎉 Test completed successfully!');
    console.log('📊 Final result:', JSON.stringify(structuredData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test if called directly
if (require.main === module) {
  testOcrWithPdf();
}

module.exports = { getPdfText, processWithGemini, testOcrWithPdf };