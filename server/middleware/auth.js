/* ============================================
   AUTHENTICATION MIDDLEWARE
   ============================================ */

const jwt = require('jsonwebtoken');

// Verify JWT Token
function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error('Invalid token');
    }
}

// Authenticate middleware for express routes
function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided' 
            });
        }

        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        req.username = decoded.username;

        next();

    } catch (error) {
        res.status(401).json({ 
            message: 'Authentication failed',
            error: error.message 
        });
    }
}

module.exports = { verifyToken, authenticate };
