const { runOCR } = require('./workers/ocrWorker');
const { parseReceiptText } = require('./parsers/receiptParser');
const { processReceiptWithGemini } = require('./workers/geminiReceiptProcessor');
const ReceiptProcessingService = require('./services/nodeOcrReceiptService');
const AdvancedReceiptProcessor = require('./services/advancedReceiptProcessor');
const Receipt = require('./models/Receipt');
const Transaction = require('./models/Transaction');
const path = require('path');

/**
 * Process receipt document through OCR and parsing pipeline
 * @param {Object} receiptDoc - Receipt document from database
 * @returns {Promise<Object>} - Processing result
 */
async function processReceipt(receiptDoc) {
  try {
    console.log(`🚀 Processing receipt: ${receiptDoc.originalName}`);

    // Initialize the advanced receipt processing service
    const advancedProcessor = new AdvancedReceiptProcessor();
    
    // Get the file path
    const filePath = path.join('./uploads', receiptDoc.filename);
    
    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      throw new Error(`Receipt file not found: ${filePath}`);
    }
    
    console.log('📄 Processing receipt:', receiptDoc.originalName);
    console.log('📁 File path:', filePath);
    
    // Process the receipt using the advanced pipeline
    const processingResult = await advancedProcessor.processReceipt(filePath);
    
    if (!processingResult.success) {
      throw new Error(`Receipt processing failed: ${processingResult.error}`);
    }

    const { structuredData, extractedText } = processingResult;
    
    console.log(`✅ Receipt processed successfully: ${receiptDoc.originalName}`);
    console.log(`📊 Found ${structuredData.expenses?.length || 0} individual expenses`);

    // Update Receipt document with processed data
    const updateData = {
      parsedText: extractedText,
      parsedJson: structuredData,
      processedAt: new Date(),
      status: 'completed'
    };

    const updatedReceipt = await Receipt.findByIdAndUpdate(
      receiptDoc._id,
      updateData,
      { new: true }
    );

    if (!updatedReceipt) {
      throw new Error('Failed to update receipt document');
    }

    // Create individual transactions for each expense
    const createdTransactions = [];
    
    console.log(`📊 Processing ${structuredData.expenses?.length || 0} expenses from receipt...`);
    
    if (structuredData.expenses && structuredData.expenses.length > 0) {
      for (const expense of structuredData.expenses) {
        try {
          const transactionData = {
            userId: receiptDoc.userId,  // Add user ID to transaction
            type: 'expense',
            amount: parseFloat(expense.amount) || 0,
            description: expense.description || 'Receipt item',
            category: expense.category || 'other',
            date: structuredData.date ? new Date(structuredData.date) : new Date(),
            receiptId: receiptDoc._id,
            source: 'receipt_upload',
            metadata: {
              storeName: structuredData.storeName,
              quantity: expense.quantity || 1,
              unitPrice: expense.unitPrice || expense.amount,
              receiptNumber: structuredData.receiptNumber,
              taxAmount: structuredData.taxAmount,
              originalReceipt: receiptDoc.originalName,
              ocrMethod: 'Advanced OCR + AI'
            }
          };

          console.log('💾 Creating transaction:', {
            description: transactionData.description,
            amount: transactionData.amount,
            category: transactionData.category
          });

          const transaction = new Transaction(transactionData);
          const savedTransaction = await transaction.save();
          createdTransactions.push(savedTransaction);
          
          console.log(`✅ Successfully created transaction: ${expense.description} - $${expense.amount}`);
        } catch (transactionError) {
          console.error(`❌ Failed to create transaction for: ${expense.description}`);
          console.error('Transaction error details:', transactionError.message);
        }
      }
    }

    // If no individual expenses found, create a single transaction for the total
    if (createdTransactions.length === 0 && structuredData.totalAmount) {
      const totalTransaction = new Transaction({
        userId: receiptDoc.userId,  // Add user ID to transaction
        type: 'expense',
        amount: parseFloat(structuredData.totalAmount) || 0,
        description: `Receipt from ${structuredData.storeName || 'Unknown Store'}`,
        category: 'general',
        date: structuredData.date ? new Date(structuredData.date) : new Date(),
        receiptId: receiptDoc._id,
        source: 'receipt_upload',
        metadata: {
          storeName: structuredData.storeName,
          originalReceipt: receiptDoc.originalName,
          taxAmount: structuredData.taxAmount
        }
      });

      const savedTotalTransaction = await totalTransaction.save();
      createdTransactions.push(savedTotalTransaction);
      
      console.log(`✅ Created total transaction: $${structuredData.totalAmount}`);
    }

    console.log(`🎉 Successfully created ${createdTransactions.length} transactions from receipt`);
    console.log(`💰 Total transaction amount: $${createdTransactions.reduce((sum, t) => sum + t.amount, 0)}`);
    console.log(`🏪 Store: ${structuredData.storeName}`);
    
    // Log transaction details for dashboard verification
    console.log('📋 Created transactions:');
    createdTransactions.forEach((t, index) => {
      console.log(`  ${index + 1}. ${t.description} - $${t.amount} [${t.category}]`);
    });

    return {
      success: true,
      receipt: updatedReceipt,
      transactions: createdTransactions,
      processingResult: processingResult,
      summary: {
        totalExpenses: createdTransactions.length,
        totalAmount: createdTransactions.reduce((sum, t) => sum + t.amount, 0),
        storeName: structuredData.storeName,
        receiptDate: structuredData.date,
        processingMethod: 'Advanced OCR + AI'
      }
    };

  } catch (error) {
    console.error(`❌ Error processing receipt ${receiptDoc.originalName}:`, error.message);
    
    // Update receipt status to failed
    await Receipt.findByIdAndUpdate(receiptDoc._id, { 
      status: 'failed',
      error: error.message,
      processedAt: new Date()
    });

    return {
      success: false,
      error: error.message,
      receipt: receiptDoc
    };
  }
}

module.exports = { processReceipt };
