/**
 * Parse receipt text using regex heuristics
 * @param {string} rawText - Raw OCR text from receipt
 * @returns {Object} - Parsed receipt data
 */
function parseReceiptText(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { total: null, date: null, items: [] };
  }

  const text = rawText.toLowerCase();
  
  // Date patterns - can be enhanced with AI for better accuracy
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/g,  // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4}-\d{1,2}-\d{1,2})/g,    // YYYY-MM-DD
    /(\d{1,2}-\d{1,2}-\d{4})/g     // DD-MM-YYYY
  ];
  
  let foundDate = null;
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      foundDate = match[0];
      break;
    }
  }
  
  // Currency amount patterns - can be enhanced with AI for better recognition
  const amountPatterns = [
    /\$?(\d+\.\d{2})/g,           // $123.45 or 123.45
    /\$?(\d+,\d{3}\.\d{2})/g,     // $1,234.56
    /(\d+\.\d{2})\s*(?:usd|dollars?)/gi  // 123.45 USD
  ];
  
  const amounts = [];
  for (const pattern of amountPatterns) {
    const matches = [...text.matchAll(pattern)];
    matches.forEach(match => {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(amount)) {
        amounts.push(amount);
      }
    });
  }
  
  // Find total amount near 'total' keywords - AI can improve this logic
  const totalKeywords = ['total', 'amount', 'sum', 'grand total', 'final total'];
  let total = null;
  
  // Look for amounts near total keywords
  for (const keyword of totalKeywords) {
    const keywordIndex = text.indexOf(keyword);
    if (keywordIndex !== -1) {
      // Search in a window around the keyword
      const windowStart = Math.max(0, keywordIndex - 50);
      const windowEnd = Math.min(text.length, keywordIndex + 50);
      const window = text.substring(windowStart, windowEnd);
      
      const windowAmounts = [];
      for (const pattern of amountPatterns) {
        const matches = [...window.matchAll(pattern)];
        matches.forEach(match => {
          const amount = parseFloat(match[1].replace(/,/g, ''));
          if (!isNaN(amount)) {
            windowAmounts.push(amount);
          }
        });
      }
      
      if (windowAmounts.length > 0) {
        // Take the largest amount near the keyword
        total = Math.max(...windowAmounts);
        break;
      }
    }
  }
  
  // If no total found near keywords, use the largest amount overall
  if (total === null && amounts.length > 0) {
    total = Math.max(...amounts);
  }
  
  // TODO: AI enhancement can be applied here to:
  // 1. Better extract individual line items
  // 2. Improve date parsing with context
  // 3. Handle different currency formats
  // 4. Parse store names, addresses, etc.
  // 5. Handle OCR errors and typos
  
  // Sample OCR text for AI training:
  // "STORE NAME\n123 Main St\nDate: 12/25/2023\nItem 1: $5.99\nItem 2: $12.50\nTax: $1.25\nTotal: $19.74"
  
  return {
    total,
    date: foundDate,
    items: [] // Placeholder - can be enhanced with AI to extract individual items
  };
}

module.exports = { parseReceiptText };
