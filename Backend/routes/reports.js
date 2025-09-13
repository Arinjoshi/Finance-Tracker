const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// GET /expenses-by-category - Get expenses aggregated by category
router.get('/expenses-by-category', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    // Build match stage with user filtering
    const matchStage = { 
      type: 'expense',
      userId: userId
    };
    
    if (start || end) {
      matchStage.date = {};
      if (start) matchStage.date.$gte = new Date(start);
      if (end) matchStage.date.$lte = new Date(end);
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          category: '$_id',
          total: 1,
          _id: 0
        }
      },
      { $sort: { total: -1 } }
    ];
    
    const result = await Transaction.aggregate(pipeline);
    res.json({ ok: true, data: result });
  } catch (err) {
    console.error('Expenses by category error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch expenses by category' });
  }
});

// GET /expenses-by-date - Get expenses grouped by date
router.get('/expenses-by-date', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }
    
    // Build match stage with user filtering
    const matchStage = { 
      type: 'expense',
      userId: userId
    };
    
    if (start || end) {
      matchStage.date = {};
      if (start) matchStage.date.$gte = new Date(start);
      if (end) matchStage.date.$lte = new Date(end);
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date'
            }
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          date: '$_id',
          total: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ];
    
    const result = await Transaction.aggregate(pipeline);
    res.json({ ok: true, data: result });
  } catch (err) {
    console.error('Expenses by date error:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch expenses by date' });
  }
});

module.exports = router;
