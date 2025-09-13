
# ai-manifest.md
# Add one line per created file: <path> :: <one-line description> :: exports/notes

Backend/db.js :: connect to MongoDB using mongoose :: exports connectDB()
Backend/models/Transaction.js :: Transaction mongoose model :: exports Transaction model
Backend/models/Receipt.js :: Receipt mongoose model for file uploads :: exports Receipt model
Backend/routes/transactions.js :: Express router for transaction CRUD operations :: exports router
Backend/routes/receipts.js :: Express router for file upload handling with multer :: exports router
Backend/routes/reports.js :: Express router for expense analytics with aggregation :: exports router
Backend/server.js :: Express server setup with middleware and routes :: exports app
Backend/workers/ocrWorker.js :: OCR text extraction from images using tesseract.js :: exports runOCR()
Backend/parsers/receiptParser.js :: Receipt text parsing with regex heuristics :: exports parseReceiptText()
Backend/services/nodeOcrReceiptService.js :: Receipt processing service using node-ts-ocr + Gemini AI (supports PDF and images) :: exports ReceiptProcessingService
Backend/test-node-ocr.js :: Test script for node-ts-ocr integration with PDF and image support :: exports testReceiptProcessing
Backend/NODE_OCR_SETUP_GUIDE.md :: Setup guide for node-ts-ocr + Gemini integration :: documentation
Backend/PDF_IMAGE_SUPPORT.md :: Complete documentation for PDF and image receipt processing :: documentation
Frontend/src/main.jsx :: Vite + React app entry point :: renders App component
Frontend/src/App.jsx :: React Router app with navigation links :: exports App component
Frontend/src/api/client.js :: API client with fetch functions :: exports createTransaction, listTransactions, uploadReceipt, getExpensesByCategory, getExpensesByDate
Frontend/src/components/TransactionForm.jsx :: Controlled form component for creating transactions :: exports TransactionForm
Frontend/src/components/ReceiptUploadForm.jsx :: Receipt upload form with Gemini AI processing and automatic transaction creation :: exports ReceiptUploadForm
Frontend/src/components/TransactionsList.jsx :: Transaction list component with filtering and pagination :: exports TransactionsList
Frontend/src/pages/Reports.jsx :: Reports page with Chart.js bar and line charts :: exports Reports
Frontend/package.json :: Vite + React project dependencies and scripts :: npm package config
Frontend/vite.config.js :: Vite configuration with React plugin and proxy :: Vite config
Frontend/index.html :: HTML entry point for Vite React app :: HTML template
Frontend/src/index.css :: Global CSS styles for the application :: CSS styles
Frontend/src/contexts/AuthContext.jsx :: Simple authentication context with login/logout :: exports AuthProvider, useAuth
Frontend/src/components/LoginForm.jsx :: Login form component with modal :: exports LoginForm
Frontend/src/components/SignupForm.jsx :: Signup form component with modal :: exports SignupForm
Frontend/src/components/AuthButtons.jsx :: Authentication buttons with login/signup modals :: exports AuthButtons
Frontend/src/components/ProtectedRoute.jsx :: Protected route wrapper for authenticated users :: exports ProtectedRoute
Frontend/src/components/Dashboard.jsx :: Dashboard with summary cards and recent transactions :: exports Dashboard
