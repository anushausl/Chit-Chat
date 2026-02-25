/* ============================================
   AUTHENTICATION ROUTES
   ============================================ */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In-memory user storage (use database in production)
const users = new Map();

// ============================================
// REGISTER ROUTE
// ============================================

router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Username, email, and password required' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters' 
            });
        }

        // Check if user already exists
        const existingUser = Array.from(users.values()).find(
            u => u.username === username || u.email === email
        );

        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const userId = uuidv4();
        const newUser = {
            id: userId,
            username: username,
            email: email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.set(userId, newUser);

        // Generate token
        const token = generateToken(userId, username);

        // Return user data (without password)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: userId,
                username: username,
                email: email
            },
            token: token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: error.message 
        });
    }
});

// ============================================
// LOGIN ROUTE
// ============================================

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                message: 'Username and password required' 
            });
        }

        // Find user
        const user = Array.from(users.values()).find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Generate token
        const token = generateToken(user.id, user.username);

        // Return user data (without password)
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Login failed',
            error: error.message 
        });
    }
});

// ============================================
// VERIFY TOKEN ROUTE
// ============================================

router.post('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided' 
            });
        }

        const decoded = verifyToken(token);

        res.json({
            message: 'Token valid',
            userId: decoded.userId,
            username: decoded.username
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ 
            message: 'Invalid token',
            error: error.message 
        });
    }
});

// ============================================
// LOGOUT ROUTE
// ============================================

router.post('/logout', (req, res) => {
    try {
        // In a real app, you might invalidate tokens in a blacklist
        res.json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            message: 'Logout failed',
            error: error.message 
        });
    }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateToken(userId, username) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    return jwt.sign(
        { userId, username },
        secret,
        { expiresIn: '24h' }
    );
}

function verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    return jwt.verify(token, secret);
}

module.exports = router;
