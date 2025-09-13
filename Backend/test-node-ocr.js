const ReceiptProcessingService = require('./services/nodeOcrReceiptService');
const path = require('path');

/**
 * Test the node-ts-ocr + Gemini integration
 */
async function testReceiptProcessing() {
  try {
    console.log('🧪 Testing node-ts-ocr + Gemini integration...');
    
    // Initialize the service
    const receiptService = new ReceiptProcessingService();
    
    // Test with a sample file (you can replace this with an actual receipt file)
    const testFilePath = path.join(__dirname, 'uploads', 'test-receipt.pdf');
    
    // Check if test file exists
    const fs = require('fs');
    if (!fs.existsSync(testFilePath)) {
      console.log('⚠️  No test file found. Please upload a receipt file first.');
      console.log('📁 Expected path:', testFilePath);
      console.log('📄 Supported formats: PDF, JPG, PNG, TIFF, BMP');
      return;
    }
    
    // Process the receipt
    const result = await receiptService.processReceipt(testFilePath);
    
    if (result.success) {
      console.log('✅ Test successful!');
      console.log('📊 Processing result:', JSON.stringify(result.structuredData, null, 2));
    } else {
      console.log('❌ Test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testReceiptProcessing();
}

module.exports = { testReceiptProcessing };
