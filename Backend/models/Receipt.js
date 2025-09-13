const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true  // Index for faster user-specific queries
  },
  filename: {
    type: String
  },
  originalName: {
    type: String
  },
  parsedText: {
    type: String,
    default: ''
  },
  parsedJson: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  error: {
    type: String,
    default: ''
  },
  processedAt: {
    type: Date,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Receipt', ReceiptSchema);
