const vision = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

/**
 * Complete receipt processing service using Google Cloud Vision + Gemini AI
 * Workflow: Image → OCR (Vision API) → Text Extraction (Gemini) → Structured Data → Transactions
 */

class ReceiptProcessingService {
  constructor() {
    // Initialize Google Cloud Vision client
    this.visionClient = new vision.ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE || './google-cloud-key.json',
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
    });

    // Initialize Gemini AI
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  /**
   * Step 1: Extract text from receipt image using Google Cloud Vision OCR
   * @param {string} imagePath - Path to the receipt image
   * @returns {Promise<string>} - Extracted text from the image
   */
  async extractTextWithOCR(imagePath) {
    try {
      console.log('🔍 Starting OCR extraction with Google Cloud Vision...');
      
      const [result] = await this.visionClient.textDetection(imagePath);
      const detections = result.textAnnotations;
      
      if (!detections || detections.length === 0) {
        throw new Error('No text detected in the image');
      }

      // Get the full text (first detection contains all text)
      const fullText = detections[0].description;
      console.log('✅ OCR extraction completed');
      
      return fullText;
    } catch (error) {
      console.error('❌ OCR extraction failed:', error.message);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  /**
   * Step 2: Process extracted text with Gemini AI to get structured expense data
   * @param {string} extractedText - Raw text from OCR
   * @returns {Promise<Object>} - Structured expense data
   */
  async processTextWithGemini(extractedText) {
    try {
      console.log('🤖 Processing text with Gemini AI...');

      const prompt = `
You are an expert at extracting expense information from receipt text. 
Analyze the following receipt text and extract ALL individual expenses with their details.

RECEIPT TEXT:
${extractedText}

Please return a JSON object with this exact structure:
{
  "storeName": "Store name if found",
  "date": "YYYY-MM-DD format if found",
  "totalAmount": "total amount if found",
  "taxAmount": "tax amount if found",
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

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean the response (remove markdown formatting if present)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Parse JSON response
      const structuredData = JSON.parse(cleanText);
      
      console.log('✅ Gemini processing completed');
      console.log(`📊 Extracted ${structuredData.expenses?.length || 0} expenses`);
      
      return structuredData;
    } catch (error) {
      console.error('❌ Gemini processing failed:', error.message);
      throw new Error(`Text processing failed: ${error.message}`);
    }
  }

  /**
   * Complete receipt processing pipeline
   * @param {string} imagePath - Path to receipt image
   * @returns {Promise<Object>} - Complete processing result
   */
  async processReceipt(imagePath) {
    try {
      console.log('🚀 Starting complete receipt processing...');
      
      // Step 1: OCR extraction
      const extractedText = await this.extractTextWithOCR(imagePath);
      
      // Step 2: Text processing with Gemini
      const structuredData = await this.processTextWithGemini(extractedText);
      
      // Step 3: Add metadata
      const result = {
        success: true,
        extractedText,
        structuredData,
        processedAt: new Date().toISOString(),
        imagePath
      };

      console.log('✅ Complete receipt processing finished');
      return result;
      
    } catch (error) {
      console.error('❌ Receipt processing failed:', error.message);
      return {
        success: false,
        error: error.message,
        processedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Fallback method using Tesseract OCR if Google Cloud Vision fails
   * @param {string} imagePath - Path to receipt image
   * @returns {Promise<string>} - Extracted text
   */
  async fallbackOCR(imagePath) {
    try {
      console.log('🔄 Using fallback Tesseract OCR...');
      const { createWorker } = require('tesseract.js');
      
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(imagePath);
      await worker.terminate();
      
      console.log('✅ Fallback OCR completed');
      return text;
    } catch (error) {
      console.error('❌ Fallback OCR failed:', error.message);
      throw new Error(`Fallback OCR failed: ${error.message}`);
    }
  }
}

module.exports = ReceiptProcessingService;
