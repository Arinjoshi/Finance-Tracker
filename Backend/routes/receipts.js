const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Receipt = require('../models/Receipt');
const { processReceipt } = require('../workerQueueStub');
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

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads (PDF and image formats)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept PDF and image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',           // PDF files
    'image/jpeg',               // JPG files
    'image/jpg',                // JPG files  
    'image/png',                // PNG files
    'image/tiff',               // TIFF files
    'image/bmp'                 // BMP files
  ];
  
  console.log('📄 Uploaded file type:', file.mimetype);
  console.log('📁 Original name:', file.originalname);
  
  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ File type accepted:', file.mimetype);
    cb(null, true);
  } else {
    console.log('❌ File type rejected:', file.mimetype);
    cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload PDF, JPG, PNG, TIFF, or BMP files.`), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST / - Upload receipt file and process with OCR + Gemini
router.post('/', getUserId, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded' });
    }

    console.log('📄 File uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Create receipt document with user ID
    const receipt = new Receipt({
      userId: req.userId,  // Add user ID to receipt
      filename: req.file.filename,
      originalName: req.file.originalname,
      parsedText: '',
      parsedJson: null
    });

    await receipt.save();
    console.log('💾 Receipt document saved to database');

    // Process receipt with AI in the background
    try {
      console.log('🚀 Starting receipt processing...');
      const processingResult = await processReceipt(receipt);
      
      if (processingResult.success) {
        console.log('✅ Receipt processing completed successfully');
        res.status(201).json({ 
          ok: true, 
          receipt: processingResult.receipt,
          transactions: processingResult.transactions,
          summary: processingResult.summary,
          message: `Receipt processed successfully! Created ${processingResult.transactions.length} transactions.`
        });
      } else {
        console.log('❌ Receipt processing failed:', processingResult.error);
        res.status(500).json({ 
          ok: false, 
          error: processingResult.error,
          receipt: processingResult.receipt
        });
      }
    } catch (processingError) {
      console.error('❌ Receipt processing failed:', processingError);
      
      // Still return success for upload, but note processing failed
      res.status(201).json({ 
        ok: true, 
        receipt: receipt,
        error: 'Receipt uploaded but processing failed. Please try again.',
        processingError: processingError.message
      });
    }
  } catch (err) {
    console.error('❌ Upload error:', err);
    next(err);
  }
});

module.exports = router;
