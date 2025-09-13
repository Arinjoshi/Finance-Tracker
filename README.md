# 💰 Finance Web App

A modern, AI-powered personal finance management application that automatically extracts expenses from receipts using OCR and AI technology.

![Finance App](https://img.shields.io/badge/Status-Active-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

## 🌟 Features

### 🤖 **AI-Powered Receipt Processing**
- **Automatic OCR**: Upload PDF or image receipts and get text extracted automatically
- **Smart Parsing**: Gemini AI analyzes receipt text and extracts individual expenses
- **Multi-Format Support**: PDF, JPG, PNG, TIFF, BMP files supported
- **Individual Transactions**: Each receipt item becomes a separate expense transaction

### 👥 **Multi-User Support**
- **Secure Authentication**: User registration and login with password hashing
- **Data Isolation**: Each user sees only their own transactions and receipts
- **Session Management**: Persistent login sessions with proper logout

### 📊 **Financial Management**
- **Transaction Tracking**: Manual and automatic transaction creation
- **Category Management**: Smart categorization of expenses (food, transport, shopping, etc.)
- **Dashboard Analytics**: Income, expenses, and net balance visualization
- **Reports & Charts**: Expense analysis by category and date ranges

### 🔧 **Technical Features**
- **Modern Tech Stack**: React frontend with Node.js/Express backend
- **MongoDB Database**: Scalable document storage with proper indexing
- **Real-time Updates**: Dashboard refreshes automatically after receipt processing
- **Error Handling**: Comprehensive error handling with fallback mechanisms

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **MongoDB** 6+ (local or cloud)
- **Gemini API Key** (from Google AI Studio)

### 1. **Clone & Install**
```bash
git clone <repository-url>
cd "Finance Web App"

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies  
cd ../Frontend
npm install
```

### 2. **Environment Setup**
Create `Backend/.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/finance-app
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. **Database Setup**
```bash
# Create demo users (optional)
cd Backend
node create-demo-user.js
```

### 4. **Start the Application**
```bash
# Terminal 1: Start Backend Server
cd Backend
npm run server

# Terminal 2: Start Frontend Development Server  
cd Frontend
npm run dev
```

### 5. **Access the App**
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:4000

## 🎯 How to Use

### **First Time Setup**
1. **Register/Login**: Create an account or use demo credentials
   - Demo User: `demo` / `demo123`
   - Test User: `user2` / `password123`

### **Receipt Processing**
1. **Upload Receipt**: Click "Upload Receipt (AI Processing)"
2. **Select File**: Choose PDF or image file of your receipt
3. **Automatic Processing**: AI extracts text and creates individual transactions
4. **View Results**: All transactions appear on dashboard automatically

### **Manual Transactions**
1. **Add Transaction**: Click "Manual Transaction" 
2. **Enter Details**: Amount, type (income/expense), category, description
3. **Save**: Transaction appears on dashboard immediately

### **Dashboard & Reports**
- **Dashboard**: View income, expenses, net balance, and recent transactions
- **Transactions**: Filter and search all transactions
- **Reports**: Analyze expenses by category and date ranges

## 🏗️ Project Structure

```
Finance Web App/
├── Backend/                    # Node.js/Express Backend
│   ├── models/                # MongoDB Models
│   │   ├── User.js            # User authentication model
│   │   ├── Transaction.js     # Transaction model with user isolation
│   │   └── Receipt.js         # Receipt processing model
│   ├── routes/                # API Routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── transactions.js    # Transaction CRUD operations
│   │   ├── receipts.js        # Receipt upload and processing
│   │   └── reports.js         # Analytics and reporting
│   ├── services/              # Business Logic Services
│   │   ├── advancedReceiptProcessor.js    # Main OCR + AI processor
│   │   └── nodeOcrReceiptService.js       # Backup OCR service
│   ├── workers/               # Background Processing
│   │   ├── ocrWorker.js       # Tesseract OCR worker
│   │   └── geminiReceiptProcessor.js      # Gemini AI processor
│   ├── uploads/               # Receipt file storage
│   ├── server.js              # Express server setup
│   └── db.js                  # MongoDB connection
├── Frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # React Components
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── TransactionForm.jsx    # Manual transaction entry
│   │   │   ├── ReceiptUploadForm.jsx  # Receipt upload interface
│   │   │   ├── TransactionsList.jsx   # Transaction viewing
│   │   │   ├── LoginForm.jsx          # User authentication
│   │   │   └── AuthButtons.jsx        # Auth UI components
│   │   ├── contexts/          # React Context
│   │   │   └── AuthContext.jsx        # Authentication state
│   │   ├── api/               # API Client
│   │   │   └── client.js              # HTTP client functions
│   │   ├── pages/             # Page Components
│   │   │   └── Reports.jsx            # Analytics dashboard
│   │   └── App.jsx            # Main app component
│   └── package.json           # Frontend dependencies
└── README.md                  # This file
```

## 🔑 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### **Transactions**
- `GET /api/transactions` - List user's transactions (with filtering)
- `POST /api/transactions` - Create new transaction
- All endpoints require `x-user-id` header for authentication

### **Receipts**
- `POST /api/receipts` - Upload and process receipt file
- Automatically creates transactions from receipt items

### **Reports**
- `GET /api/reports/expenses-by-category` - Category-wise expense analysis
- `GET /api/reports/expenses-by-date` - Date-wise expense trends

## 🤖 AI & OCR Technology

### **OCR Processing Pipeline**
1. **Primary**: `node-ts-ocr` - Fast PDF and image text extraction
2. **Fallback**: `Tesseract.js` - Reliable OCR with multiple language support
3. **Final Fallback**: Sample text generation for testing

### **AI Processing with Gemini**
- **Text Analysis**: Gemini 1.5 Flash model processes OCR text
- **Smart Parsing**: Extracts store name, date, individual items, amounts
- **Categorization**: Automatically categorizes expenses by type
- **Structured Output**: Returns clean JSON with all expense details

### **Supported Receipt Formats**
- **PDF Documents**: Multi-page receipt PDFs
- **Images**: JPG, JPEG, PNG, TIFF, BMP formats
- **File Size**: Up to 10MB per upload

## 🔐 Security & Data Privacy

### **User Authentication**
- **Password Hashing**: SHA-256 encrypted passwords
- **Session Management**: Secure user session handling
- **Data Isolation**: Users can only access their own data

### **API Security**
- **User ID Validation**: All requests require valid user authentication
- **Data Filtering**: Database queries automatically filter by user ID
- **Error Handling**: Secure error messages without data leakage

### **File Security**
- **Upload Validation**: File type and size restrictions
- **Secure Storage**: Uploaded files stored with unique names
- **Access Control**: Users can only access their own uploaded files

## 🧪 Testing

### **Backend Testing**
```bash
cd Backend

# Test OCR processing
node test-ocr-fix.js

# Test authentication and data isolation
node test-authentication.js

# Test complete workflow
node test-complete-workflow.js
```

### **Demo Data**
```bash
# Create demo users and sample data
node create-demo-user.js

# Migrate existing transactions (if needed)
node migrate-existing-transactions.js
```

## 🚀 Deployment

### **Environment Variables**
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Backend server port (default: 4000)
- `GEMINI_API_KEY` - Google AI API key for receipt processing

### **Production Setup**
1. **Database**: Use MongoDB Atlas or dedicated MongoDB server
2. **File Storage**: Consider cloud storage for receipts (AWS S3, Google Cloud)
3. **API Keys**: Secure storage of Gemini API keys
4. **HTTPS**: Enable SSL certificates for production
5. **Environment**: Use production-grade Node.js hosting

## 🐛 Troubleshooting

### **Common Issues**

**OCR Processing Fails**
- Check Gemini API key is valid and has credits
- Ensure receipt image is clear and readable
- Check file format is supported (PDF, JPG, PNG, TIFF, BMP)

**Authentication Issues**
- Verify user exists in database
- Check `x-user-id` header is being sent with requests
- Ensure MongoDB connection is working

**Dashboard Empty**
- Login with correct user credentials
- Check if transactions have `userId` field (run migration if needed)
- Verify API endpoints are returning user-specific data

**Receipt Upload Errors**
- Check file size is under 10MB limit
- Verify file format is supported
- Check uploads directory has write permissions

### **Debug Mode**
Enable detailed logging by checking server console output for:
- OCR processing steps and results
- Gemini AI processing status
- Database query results
- Authentication validation

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For support and questions:
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Documentation**: Check the setup guides in the `Backend/` directory
- **API**: Test endpoints using the provided demo credentials

## 🎉 Acknowledgments

- **Google AI** - Gemini API for intelligent text processing
- **Tesseract.js** - OCR capabilities for receipt scanning
- **node-ts-ocr** - Primary OCR processing library
- **MongoDB** - Database storage and user management
- **React** - Modern frontend framework
- **Express.js** - Backend API framework

---

**Happy Finance Managing! 💰✨**