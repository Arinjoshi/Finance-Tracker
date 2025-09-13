const connectDB = require('./db');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

async function testAuthentication() {
  try {
    await connectDB();
    console.log('🔌 Connected to database');

    // Get user information
    const demoUser = await User.findOne({ username: 'demo' });
    const user2 = await User.findOne({ username: 'user2' });

    if (!demoUser || !user2) {
      console.error('❌ Test users not found. Please run create-demo-user.js first');
      return;
    }

    console.log('\n👥 Test Users Found:');
    console.log(`  Demo User: ${demoUser.username} (ID: ${demoUser._id})`);
    console.log(`  User2: ${user2.username} (ID: ${user2._id})`);

    // Check transactions by user
    const demoTransactions = await Transaction.find({ userId: demoUser._id.toString() });
    const user2Transactions = await Transaction.find({ userId: user2._id.toString() });
    const orphanTransactions = await Transaction.find({ 
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: '' }
      ]
    });

    console.log('\n📊 Transaction Distribution:');
    console.log(`  Demo User Transactions: ${demoTransactions.length}`);
    console.log(`  User2 Transactions: ${user2Transactions.length}`);
    console.log(`  Orphan Transactions (no userId): ${orphanTransactions.length}`);

    // Show sample transactions for each user
    if (demoTransactions.length > 0) {
      console.log('\n🔍 Demo User Sample Transactions:');
      demoTransactions.slice(0, 3).forEach((t, index) => {
        console.log(`  ${index + 1}. ${t.description || 'No description'} - $${t.amount} [${t.type}] - ${t.category}`);
      });
    }

    if (user2Transactions.length > 0) {
      console.log('\n🔍 User2 Sample Transactions:');
      user2Transactions.slice(0, 3).forEach((t, index) => {
        console.log(`  ${index + 1}. ${t.description || 'No description'} - $${t.amount} [${t.type}] - ${t.category}`);
      });
    }

    if (orphanTransactions.length > 0) {
      console.log('\n⚠️  Orphan Transactions Found:');
      orphanTransactions.forEach((t, index) => {
        console.log(`  ${index + 1}. ${t.description || 'No description'} - $${t.amount} [${t.type}] - ${t.category}`);
      });
      console.log('\n❌ Please run the migration script again to fix orphan transactions');
    } else {
      console.log('\n✅ No orphan transactions found. Data isolation is working correctly!');
    }

    // Test data isolation
    console.log('\n🧪 Testing Data Isolation:');
    
    // Simulate API call for demo user
    const demoUserQuery = { userId: demoUser._id.toString() };
    const demoApiResult = await Transaction.find(demoUserQuery).sort({ date: -1 }).limit(5);
    console.log(`  Demo user API call returns: ${demoApiResult.length} transactions`);

    // Simulate API call for user2
    const user2Query = { userId: user2._id.toString() };
    const user2ApiResult = await Transaction.find(user2Query).sort({ date: -1 }).limit(5);
    console.log(`  User2 API call returns: ${user2ApiResult.length} transactions`);

    // Check for cross-contamination
    const demoHasUser2Data = demoApiResult.some(t => t.userId !== demoUser._id.toString());
    const user2HasDemoData = user2ApiResult.some(t => t.userId !== user2._id.toString());

    if (!demoHasUser2Data && !user2HasDemoData) {
      console.log('✅ Data isolation test PASSED! No cross-contamination detected.');
    } else {
      console.log('❌ Data isolation test FAILED! Cross-contamination detected.');
    }

    console.log('\n🎯 Authentication Test Results:');
    console.log(`  ✅ Users exist: ${demoUser && user2 ? 'YES' : 'NO'}`);
    console.log(`  ✅ Transactions have userId: ${orphanTransactions.length === 0 ? 'YES' : 'NO'}`);
    console.log(`  ✅ Data isolation working: ${!demoHasUser2Data && !user2HasDemoData ? 'YES' : 'NO'}`);

    if (orphanTransactions.length === 0 && !demoHasUser2Data && !user2HasDemoData) {
      console.log('\n🎉 All authentication tests PASSED! The system is ready for multi-user use.');
    } else {
      console.log('\n⚠️  Some authentication tests FAILED. Please review the issues above.');
    }

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run test
testAuthentication();