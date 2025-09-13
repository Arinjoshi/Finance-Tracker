const connectDB = require('./db');
const User = require('./models/User');
const crypto = require('crypto');

async function createDemoUser() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Check if demo user already exists
    const existingUser = await User.findOne({ username: 'demo' });
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Hash password
    const hashedPassword = crypto.createHash('sha256').update('demo123').digest('hex');

    // Create demo user
    const demoUser = new User({
      username: 'demo',
      email: 'demo@example.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User'
    });

    await demoUser.save();
    console.log('✅ Demo user created successfully!');
    console.log('Username: demo');
    console.log('Password: demo123');

    // Create another test user
    const testUser = new User({
      username: 'user2',
      email: 'user2@example.com',
      password: crypto.createHash('sha256').update('password123').digest('hex'),
      firstName: 'Test',
      lastName: 'User'
    });

    await testUser.save();
    console.log('✅ Test user2 created successfully!');
    console.log('Username: user2');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error creating demo user:', error);
  } finally {
    process.exit(0);
  }
}

createDemoUser();