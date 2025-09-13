const BASE_URL = 'http://localhost:4000'

// Get user ID from localStorage
function getUserId() {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.id;
  }
  return null;
}

// Get auth headers
function getAuthHeaders() {
  const userId = getUserId();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (userId) {
    headers['x-user-id'] = userId;
  }
  
  return headers;
}

// Authentication functions
export async function register(userData) {
  try {
    console.log('API: Attempting registration with data:', userData);
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    console.log('API: Registration response:', data);
    
    // Add response status to the data for better error handling
    return {
      ...data,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('API: Registration error:', error);
    return {
      ok: false,
      error: 'Network error: Unable to connect to server',
      status: 0
    };
  }
}

export async function login(credentials) {
  try {
    console.log('API: Attempting login with credentials:', credentials);
    console.log('API: Request URL:', `${BASE_URL}/api/auth/login`);
    console.log('API: Request body:', JSON.stringify(credentials));
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('API: Response status:', response.status);
    console.log('API: Response ok:', response.ok);
    console.log('API: Response headers:', response.headers);
    
    const data = await response.json();
    console.log('API: Response data:', data);
    
    // Add response status to the data for better error handling
    return {
      ...data,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('API: Login error:', error);
    return {
      ok: false,
      error: 'Network error: Unable to connect to server',
      status: 0
    };
  }
}

export async function logout() {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return response.json();
}

// Create a new transaction
export async function createTransaction(body) {
  const response = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  })
  return response.json()
}

// List transactions with optional query parameters
export async function listTransactions(params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const url = queryString ? `${BASE_URL}/api/transactions?${queryString}` : `${BASE_URL}/api/transactions`
  
  const response = await fetch(url, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Upload receipt file
export async function uploadReceipt(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const userId = getUserId();
  const headers = {};
  if (userId) {
    headers['x-user-id'] = userId;
  }
  
  const response = await fetch(`${BASE_URL}/api/receipts`, {
    method: 'POST',
    headers: headers,
    body: formData,
  })
  return response.json()
}

// Get expenses aggregated by category
export async function getExpensesByCategory(start, end) {
  const params = new URLSearchParams()
  if (start) params.append('start', start)
  if (end) params.append('end', end)
  
  const response = await fetch(`${BASE_URL}/api/reports/expenses-by-category?${params}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}

// Get expenses grouped by date
export async function getExpensesByDate(start, end) {
  const params = new URLSearchParams()
  if (start) params.append('start', start)
  if (end) params.append('end', end)
  
  const response = await fetch(`${BASE_URL}/api/reports/expenses-by-date?${params}`, {
    headers: getAuthHeaders()
  })
  return response.json()
}
