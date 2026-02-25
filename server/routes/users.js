/* ============================================
   USERS ROUTES
   ============================================ */

const express = require('express');
const router = express.Router();

// In-memory user storage (use database in production)
const users = new Map();
const onlineUsers = new Map(); // userId -> socketId

// ============================================
// GET ALL USERS
// ============================================

router.get('/', (req, res) => {
    try {
        const allUsers = Array.from(users.values()).map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            status: onlineUsers.has(user.id) ? 'online' : 'offline',
            createdAt: user.createdAt
        }));

        res.json({
            count: allUsers.length,
            users: allUsers
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch users',
            error: error.message 
        });
    }
});

// ============================================
// GET USER BY ID
// ============================================

router.get('/:userId', (req, res) => {
    try {
        const { userId } = req.params;

        if (!users.has(userId)) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        const user = users.get(userId);

        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
            status: onlineUsers.has(userId) ? 'online' : 'offline',
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch user',
            error: error.message 
        });
    }
});

// ============================================
// GET ONLINE USERS
// ============================================

router.get('/status/online', (req, res) => {
    try {
        const onlineUsersList = Array.from(onlineUsers.entries()).map(([userId]) => {
            const user = users.get(userId);
            return {
                id: user.id,
                username: user.username,
                email: user.email,
                status: 'online'
            };
        });

        res.json({
            count: onlineUsersList.length,
            users: onlineUsersList
        });

    } catch (error) {
        console.error('Get online users error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch online users',
            error: error.message 
        });
    }
});

// ============================================
// UPDATE USER PROFILE
// ============================================

router.patch('/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email } = req.body;

        if (!users.has(userId)) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        const user = users.get(userId);

        if (username) {
            user.username = username;
        }

        if (email) {
            user.email = email;
        }

        res.json({
            message: 'User updated successfully',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ 
            message: 'Failed to update user',
            error: error.message 
        });
    }
});

// ============================================
// DELETE USER
// ============================================

router.delete('/:userId', (req, res) => {
    try {
        const { userId } = req.params;

        if (!users.has(userId)) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        users.delete(userId);
        onlineUsers.delete(userId);

        res.json({ message: 'User deleted successfully' });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            message: 'Failed to delete user',
            error: error.message 
        });
    }
});

// ============================================
// SEARCH USERS
// ============================================

router.get('/search/:query', (req, res) => {
    try {
        const { query } = req.params;

        const results = Array.from(users.values())
            .filter(user => 
                user.username.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase())
            )
            .map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                status: onlineUsers.has(user.id) ? 'online' : 'offline'
            }));

        res.json({
            count: results.length,
            users: results
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ 
            message: 'Failed to search users',
            error: error.message 
        });
    }
});

module.exports = router;
