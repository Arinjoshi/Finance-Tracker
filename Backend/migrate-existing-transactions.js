const connectDB = require('./db');
const Transaction = require('./models/Transaction');
const Receipt = require('./models/Receipt');
const User = require('./models/User');

async function migrateExistingTransactions() {
  try {
    await connectDB();
    console.log('🔌 Connected to database');

    // Find the demo user
    const demoUser = await User.findOne({ username: 'demo' });
    if (!demoUser) {
      console.error('❌ Demo user not found. Please run create-demo-user.js first');
      return;
    }

    console.log(`👤 Found demo user: ${demoUser.username} (ID: ${demoUser._id})`);

    // Find transactions without userId
    const transactionsWithoutUserId = await Transaction.find({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: '' }
      ]
    });

    console.log(`📊 Found ${transactionsWithoutUserId.length} transactions without userId`);

    if (transactionsWithoutUserId.length === 0) {
      console.log('✅ All transactions already have userId. No migration needed.');
      return;
    }

    // Update transactions to assign them to demo user
    const updateResult = await Transaction.updateMany(
      { 
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: '' }
        ]
      },
      { 
        $set: { userId: demoUser._id.toString() }
      }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} transactions`);

    // Also migrate receipts without userId
    const receiptsWithoutUserId = await Receipt.find({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: '' }
      ]
    });

    console.log(`📄 Found ${receiptsWithoutUserId.length} receipts without userId`);

    if (receiptsWithoutUserId.length > 0) {
      const receiptUpdateResult = await Receipt.updateMany(
        { 
          $or: [
            { userId: { $exists: false } },
            { userId: null },
            { userId: '' }
          ]
        },
        { 
          $set: { userId: demoUser._id.toString() }
        }
      );

      console.log(`✅ Updated ${receiptUpdateResult.modifiedCount} receipts`);
    }

    // Verify the migration
    const allTransactions = await Transaction.find({});
    const transactionsWithUserId = allTransactions.filter(t => t.userId);
    
    console.log('\n📈 Migration Summary:');
    console.log(`  Total transactions: ${allTransactions.length}`);
    console.log(`  Transactions with userId: ${transactionsWithUserId.length}`);
    
    if (transactionsWithUserId.length === allTransactions.length) {
      console.log('🎉 Migration completed successfully! All transactions now have userId.');
    } else {
      console.log('⚠️  Some transactions still missing userId. Manual review needed.');
    }

    // Show sample of migrated data
    console.log('\n🔍 Sample migrated transactions:');
    const sampleTransactions = await Transaction.find({ userId: demoUser._id.toString() }).limit(3);
    sampleTransactions.forEach((t, index) => {
      console.log(`  ${index + 1}. ${t.description} - $${t.amount} [UserId: ${t.userId}]`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run migration
migrateExistingTransactions();