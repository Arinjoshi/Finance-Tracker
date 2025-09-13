require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');
const transactionsRouter = require('./routes/transactions');
const receiptsRouter = require('./routes/receipts');
const reportsRouter = require('./routes/reports');
const authRouter = require('./routes/auth');

const app = express();

// Connect to database
connectDB();

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],  // Support both ports
  credentials: true
}));

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/reports', reportsRouter);

// Health endpoint
app.get('/', (req, res) => {
  res.json({ status: 'OK', message: 'Finance App API is running' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
