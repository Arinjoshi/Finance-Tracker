const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Simple password hashing (in production, use bcrypt)
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// POST /auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Username, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ username }, { email }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Username or email already exists' 
      });
    }

    // Create new user
    const hashedPassword = hashPassword(password);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName
    });

    await user.save();

    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    res.status(201).json({ 
      ok: true, 
      user: userData,
      message: 'User registered successfully' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Internal server error during registration' 
    });
  }
});

// POST /auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Username and password are required' 
      });
    }

    // Find user (by username or email)
    const user = await User.findOne({ 
      $or: [{ username }, { email: username }] 
    });

    if (!user) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Invalid username or password' 
      });
    }

    // Check password
    const hashedPassword = hashPassword(password);
    if (user.password !== hashedPassword) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Invalid username or password' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        ok: false, 
        error: 'Account is deactivated' 
      });
    }

    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    res.json({ 
      ok: true, 
      user: userData,
      message: 'Login successful' 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Internal server error during login' 
    });
  }
});

// POST /auth/logout - Logout user (client-side only)
router.post('/logout', (req, res) => {
  res.json({ 
    ok: true, 
    message: 'Logout successful' 
  });
});

// GET /auth/me - Get current user (for session validation)
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ 
        ok: false, 
        error: 'User ID required' 
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        ok: false, 
        error: 'User not found or inactive' 
      });
    }

    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    res.json({ 
      ok: true, 
      user: userData 
    });

  } catch (error) {
    console.error('User validation error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;