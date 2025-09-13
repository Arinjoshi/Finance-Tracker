const Tesseract = require('tesseract.js');

/**
 * Extract text from image file using OCR
 * @param {string} filePath - Path to the image file
 * @returns {Promise<{rawText: string}>} - Extracted text result
 * 
 * Note: For PDF files, convert to image first using external tools like pdf2pic
 * before passing to this function
 */
async function runOCR(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: m => console.log(m) // Optional: remove in production
    });
    
    return { rawText: text };
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error('Failed to extract text from image');
  }
}

module.exports = { runOCR };
