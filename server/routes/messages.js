/* ============================================
   MESSAGES ROUTES
   ============================================ */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// In-memory message storage (use database in production)
const messages = new Map();

// ============================================
// GET MESSAGES
// ============================================

router.get('/:userId', (req, res) => {
    try {
        const { userId } = req.params;

        // Get all messages for user
        const userMessages = Array.from(messages.values())
            .filter(msg => msg.senderId === userId || msg.recipientId === userId)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json({
            count: userMessages.length,
            messages: userMessages
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch messages',
            error: error.message 
        });
    }
});

// ============================================
// GET MESSAGES BETWEEN TWO USERS
// ============================================

router.get('/:userId/:otherId', (req, res) => {
    try {
        const { userId, otherId } = req.params;

        // Get messages between two users
        const conversation = Array.from(messages.values())
            .filter(msg => 
                (msg.senderId === userId && msg.recipientId === otherId) ||
                (msg.senderId === otherId && msg.recipientId === userId)
            )
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        res.json({
            count: conversation.length,
            messages: conversation
        });

    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ 
            message: 'Failed to fetch conversation',
            error: error.message 
        });
    }
});

// ============================================
// DELETE MESSAGE
// ============================================

router.delete('/:messageId', (req, res) => {
    try {
        const { messageId } = req.params;

        if (messages.has(messageId)) {
            messages.delete(messageId);
            res.json({ message: 'Message deleted successfully' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }

    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({ 
            message: 'Failed to delete message',
            error: error.message 
        });
    }
});

// ============================================
// CLEAR CONVERSATION
// ============================================

router.delete('/:userId/:otherId', (req, res) => {
    try {
        const { userId, otherId } = req.params;

        let deletedCount = 0;

        // Delete all messages between two users
        for (const [messageId, message] of messages.entries()) {
            if ((message.senderId === userId && message.recipientId === otherId) ||
                (message.senderId === otherId && message.recipientId === userId)) {
                messages.delete(messageId);
                deletedCount++;
            }
        }

        res.json({ 
            message: 'Conversation cleared',
            deletedCount: deletedCount 
        });

    } catch (error) {
        console.error('Clear conversation error:', error);
        res.status(500).json({ 
            message: 'Failed to clear conversation',
            error: error.message 
        });
    }
});

module.exports = router;
