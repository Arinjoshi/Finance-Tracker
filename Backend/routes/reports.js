const express = require('express');
const Transaction = require('../models/Transaction');
const router = express.Router();

// GET /expenses-by-category - Get expenses aggregated by category
router.get('/expenses-by-category', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    
    // Build match stage
    const matchStage = { type: 'expense' };
    
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
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /expenses-by-date - Get expenses grouped by date
router.get('/expenses-by-date', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    
    // Build match stage
    const matchStage = { type: 'expense' };
    
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
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
