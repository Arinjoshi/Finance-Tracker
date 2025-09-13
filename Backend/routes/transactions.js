const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// Middleware to extract user ID from headers
function getUserId(req, res, next) {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ 
      ok: false, 
      error: 'User authentication required. Please login.' 
    });
  }
  req.userId = userId;
  next();
}

// POST / - Create new transaction
router.post('/', getUserId, async (req, res, next) => {
  try {
    // Check if req.body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        ok: false, 
        error: 'Request body is missing or invalid. Make sure to send JSON with Content-Type: application/json' 
      });
    }

    const { amount, type, category, date, description, receiptId, source } = req.body;
    
    // Validate amount is numeric
    if (typeof amount !== 'number' || isNaN(amount)) {
      return res.status(400).json({ ok: false, error: 'Amount must be a valid number' });
    }
    
    // Validate type
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ ok: false, error: 'Type must be either income or expense' });
    }
    console.log(req.userId,amount);
    const transaction = new Transaction({
      userId: req.userId,  // Add user ID to transaction
      amount,
      type,
      category: category || 'uncategorized',
      date: date || new Date(),
      description: description || '',
      receiptRef: receiptId || null,
      source: source || 'manual'
    });
    
    await transaction.save();
    
    res.status(201).json({ ok: true, transaction });
  } catch (err) {
    next(err);
  }
});

// GET / - Get transactions with filtering and pagination
router.get('/', getUserId, async (req, res, next) => {
  try {
    const { start, end, page = 1, limit = 10, category } = req.query;
    
    // Build query with user filter
    const query = { userId: req.userId };  // Only get user's transactions
    
    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }
    
    if (category) {
      query.category = category;
    }
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const [data, total] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }).skip(skip).limit(limitNum),
      Transaction.countDocuments(query)
    ]);
    
    res.json({
      ok: true,
      data,
      page: pageNum,
      limit: limitNum,
      total
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
