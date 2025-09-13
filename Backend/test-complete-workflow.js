const AdvancedReceiptProcessor = require('./services/advancedReceiptProcessor');
const { processReceipt } = require('./workerQueueStub');
const Receipt = require('./models/Receipt');
const Transaction = require('./models/Transaction');
const path = require('path');
const fs = require('fs');

/**
 * Complete workflow test: File Upload → OCR → AI Processing → Transaction Creation → Dashboard Display
 */
async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing Complete Receipt Processing Workflow...\n');
    
    // Load environment
    require('dotenv').config();
    
    // Connect to database
    const connectDB = require('./db');
    await connectDB();
    
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not found in environment variables');
      return;
    }
    
    // Find test files
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(ext);
    });
    
    if (files.length === 0) {
      console.log('⚠️  No test files found. Please add a receipt file to uploads directory.');
      return;
    }
    
    const testFile = files[0];
    console.log(`📁 Using test file: ${testFile}\n`);
    
    // Step 1: Create Receipt document (simulating file upload)
    console.log('📄 Step 1: Creating Receipt document...');
    const receipt = new Receipt({
      filename: testFile,
      originalName: testFile,
      parsedText: '',
      parsedJson: null,
      status: 'pending'
    });
    await receipt.save();
    console.log('✅ Receipt document created:', receipt._id);
    
    // Step 2: Process receipt (simulating backend processing)
    console.log('\n🚀 Step 2: Processing receipt...');
    const result = await processReceipt(receipt);
    
    if (result.success) {
      console.log('✅ Receipt processing completed successfully!');
      console.log('📊 Summary:', {
        totalTransactions: result.transactions.length,
        totalAmount: result.summary.totalAmount,
        storeName: result.summary.storeName
      });
      
      // Step 3: Verify transactions were created
      console.log('\n📝 Step 3: Verifying transactions in database...');
      const createdTransactions = await Transaction.find({ receiptId: receipt._id });
      console.log(`✅ Found ${createdTransactions.length} transactions in database`);
      
      createdTransactions.forEach((t, index) => {
        console.log(`  ${index + 1}. ${t.description} - $${t.amount} [${t.category}]`);
      });
      
      // Step 4: Test dashboard data fetch (simulating frontend request)
      console.log('\n📊 Step 4: Testing dashboard data fetch...');
      const allTransactions = await Transaction.find({}).sort({ date: -1 }).limit(10);
      console.log(`✅ Dashboard would show ${allTransactions.length} transactions`);
      
      // Calculate summary like dashboard does
      const totalIncome = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      console.log('💰 Dashboard Summary:');
      console.log(`  Income: $${totalIncome}`);
      console.log(`  Expenses: $${totalExpenses}`);
      console.log(`  Net Balance: $${totalIncome - totalExpenses}`);
      
      console.log('\n🎉 Complete workflow test successful!');
      console.log('✅ File Upload → OCR → AI Processing → Database Storage → Dashboard Display');
      
    } else {
      console.error('❌ Receipt processing failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
    console.error('Error details:', error);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Test individual components
async function testAdvancedProcessor() {
  try {
    console.log('🧪 Testing Advanced Receipt Processor...\n');
    
    require('dotenv').config();
    
    const processor = new AdvancedReceiptProcessor();
    
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(ext);
    });
    
    if (files.length === 0) {
      console.log('⚠️  No test files found.');
      return;
    }
    
    const testFile = path.join(uploadsDir, files[0]);
    console.log(`📁 Processing: ${files[0]}`);
    
    const result = await processor.processReceipt(testFile);
    
    if (result.success) {
      console.log('✅ Advanced processor test successful!');
      console.log('📊 Structured data:', JSON.stringify(result.structuredData, null, 2));
    } else {
      console.error('❌ Advanced processor test failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Advanced processor test error:', error.message);
  }
}

// Run tests based on command line argument
const testType = process.argv[2] || 'complete';

if (testType === 'processor') {
  testAdvancedProcessor();
} else {
  testCompleteWorkflow();
}