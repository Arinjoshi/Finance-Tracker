const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

/**
 * Process receipt using Gemini AI to extract text and individual costs
 * @param {string} filePath - Path to the receipt image file
 * @returns {Promise<Object>} - Extracted receipt data with individual costs
 */
async function processReceiptWithGemini(filePath) {
  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Read the image file
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');

    // Determine file type
    const fileExtension = path.extname(filePath).toLowerCase();
    let mimeType;
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      default:
        mimeType = 'image/jpeg'; // Default fallback
    }

    // Create the prompt for Gemini
    const prompt = `
    Analyze this receipt image and extract the following information in JSON format:
    
    1. Extract ALL individual line items with their costs (not just the total)
    2. Extract the total amount
    3. Extract the date
    4. Extract the store/merchant name
    5. Extract any tax amounts
    
    For each line item, provide:
    - description: what the item is
    - amount: the cost of that specific item
    - quantity: if mentioned
    
    Return the response in this exact JSON format:
    {
      "storeName": "store name",
      "date": "YYYY-MM-DD format",
      "totalAmount": number,
      "taxAmount": number,
      "lineItems": [
        {
          "description": "item description",
          "amount": number,
          "quantity": number
        }
      ],
      "rawText": "full extracted text from receipt"
    }
    
    Important: Extract EVERY individual cost/item from the receipt, not just the total. Look for itemized lists, individual prices, etc.
    `;

    // Prepare the image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response text to extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', text);
      
      // Fallback: return basic structure
      extractedData = {
        storeName: 'Unknown Store',
        date: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        taxAmount: 0,
        lineItems: [],
        rawText: text
      };
    }

    // Validate and clean the data
    if (!extractedData.lineItems || !Array.isArray(extractedData.lineItems)) {
      extractedData.lineItems = [];
    }

    // Ensure all amounts are numbers
    extractedData.totalAmount = parseFloat(extractedData.totalAmount) || 0;
    extractedData.taxAmount = parseFloat(extractedData.taxAmount) || 0;
    
    extractedData.lineItems = extractedData.lineItems.map(item => ({
      description: item.description || 'Unknown Item',
      amount: parseFloat(item.amount) || 0,
      quantity: parseInt(item.quantity) || 1
    }));

    console.log('Gemini processing completed:', {
      storeName: extractedData.storeName,
      totalAmount: extractedData.totalAmount,
      lineItemsCount: extractedData.lineItems.length
    });

    return extractedData;

  } catch (error) {
    console.error('Gemini processing failed:', error);
    throw new Error(`Failed to process receipt with Gemini: ${error.message}`);
  }
}

module.exports = { processReceiptWithGemini };
