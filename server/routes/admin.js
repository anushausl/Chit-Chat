/* ============================================
    ADMIN SYSTEM - SERVER-SIDE
    ============================================ */

/* eslint-env node */
/* global process,module */

// Admin configuration
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin-token-secret-key-change-this-in-production';

console.log('✅ Admin System Initialized:');
console.log(`   - Username: ${ADMIN_USERNAME}`);
console.log(`   - Password: ${ADMIN_PASSWORD ? '****' : 'NOT SET'}`);
console.log(`   - Token: ${ADMIN_TOKEN ? '****' : 'NOT SET'}`);

// ============================================
// ADMIN MIDDLEWARE
// ============================================

const adminAuthMiddleware = (req, res, next) => {
    const adminToken = req.headers?.['x-admin-token'];

    if (adminToken !== ADMIN_TOKEN) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized - Invalid admin token'
        });
    }

    next();
};

// ============================================
// ADMIN DATA STRUCTURES (to add to server)
// ============================================

const adminData = {
    sessionLog: [],      // Track all user sessions
    messageLog: [],      // Full message audit log
    warningsLog: [],     // User warnings
    activityLog: [],     // Admin actions
    suspendedUsers: new Map() // userId -> reason
};

// ============================================
// ADMIN ROUTES
// ============================================

const adminRoutes = (app, io, users, messages, adminAuditLog, blockedUsers) => {

    // ============================================
    // ADMIN LOGIN
    // ============================================
    app.post('/api/admin/login', (req, res) => {
        const { username, password } = req.body;

        console.log(`🔐 Admin login attempt: ${username}`);

        // Verify admin credentials
        const isValidAdmin = 
            (username === ADMIN_USERNAME) &&
            (password === ADMIN_PASSWORD);

        if (!isValidAdmin) {
            console.log(`❌ Failed login attempt for: ${username}`);
            return res.status(401).json({
                success: false,
                error: 'Invalid admin credentials'
            });
        }

        console.log(`✅ Admin ${username} logged in successfully`);
        
        // Log admin login
        adminAuditLog.push({
            timestamp: new Date().toISOString(),
            action: 'ADMIN_LOGIN',
            details: `Admin ${username} logged in`
        });

        res.json({
            success: true,
            message: 'Admin login successful',
            adminToken: ADMIN_TOKEN,
            admin: {
                username: username,
                role: 'ADMIN',
                permissions: [
                    'view_all_messages',
                    'block_users',
                    'delete_messages',
                    'view_user_data',
                    'view_activity_logs'
                ]
            }
        });
    });

    // ============================================
    // GET ALL USERS (Admin view)
    // ============================================
    app.get('/api/admin/users', adminAuthMiddleware, (req, res) => {
        const usersList = Array.from(users.values()).map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            status: user.status,
            lastSeen: user.lastSeen,
            messageCount: Array.from(messages.values())
                .filter(msg => msg.senderId === user.id).length,
            isBlocked: blockedUsers.has(user.id),
            blockedReason: blockedUsers.get(user.id) || null,
            joinedAt: user.joinedAt,
            isOnline: user.status === 'online'
        }));

        res.json({
            success: true,
            totalUsers: usersList.length,
            onlineUsers: usersList.filter(u => u.isOnline).length,
            users: usersList
        });
    });

    // ============================================
    // GET SPECIFIC USER DETAILS
    // ============================================
    app.get('/api/admin/users/:userId', adminAuthMiddleware, (req, res) => {
        const { userId } = req.params;
        const user = users.get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const userMessages = Array.from(messages.values())
            .filter(msg => msg.senderId === userId)
            .slice(-50); // Last 50 messages

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                status: user.status,
                lastSeen: user.lastSeen,
                joinedAt: user.joinedAt,
                messageCount: userMessages.length,
                isBlocked: blockedUsers.has(userId),
                blockedReason: blockedUsers.get(userId) || null
            },
            recentMessages: userMessages.map(msg => ({
                id: msg.id,
                content: msg.content,
                timestamp: msg.timestamp,
                reactions: msg.reactions || []
            }))
        });
    });

    // ============================================
    // GET ALL MESSAGES (Admin view)
    // ============================================
    app.get('/api/admin/messages', adminAuthMiddleware, (req, res) => {
        const limit = req.query.limit || 100;
        const userId = req.query.userId; // Filter by user

        let messagesList = Array.from(messages.values());

        if (userId) {
            messagesList = messagesList.filter(msg => msg.senderId === userId);
        }

        // Sort by timestamp, get latest
        messagesList = messagesList
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        res.json({
            success: true,
            totalMessages: messages.size,
            messages: messagesList.map(msg => ({
                id: msg.id,
                senderId: msg.senderId,
                senderUsername: msg.senderUsername,
                content: msg.content,
                timestamp: msg.timestamp,
                type: msg.type,
                flagged: msg.flagged || false
            }))
        });
    });

    // ============================================
    // BLOCK USER
    // ============================================
    app.post('/api/admin/users/:userId/block', adminAuthMiddleware, (req, res) => {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!users.has(userId)) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        blockedUsers.set(userId, reason || 'No reason specified');

        // Log action
        adminAuditLog.push({
            timestamp: new Date(),
            action: 'USER_BLOCKED',
            targetUserId: userId,
            reason: reason,
            details: `User ${userId} was blocked`
        });

        // Disconnect blocked user from all sockets
        io.emit('admin:user:blocked', {
            userId: userId,
            reason: reason,
            message: 'Your account has been blocked. Contact admin for details.'
        });

        res.json({
            success: true,
            message: `User ${userId} has been blocked`,
            blockedUser: {
                id: userId,
                username: users.get(userId).username,
                blockedReason: reason
            }
        });
    });

    // ============================================
    // UNBLOCK USER
    // ============================================
    app.post('/api/admin/users/:userId/unblock', adminAuthMiddleware, (req, res) => {
        const { userId } = req.params;

        if (!blockedUsers.has(userId)) {
            return res.status(404).json({
                success: false,
                error: 'User is not blocked'
            });
        }

        blockedUsers.delete(userId);

        // Log action
        adminAuditLog.push({
            timestamp: new Date(),
            action: 'USER_UNBLOCKED',
            targetUserId: userId,
            details: `User ${userId} was unblocked`
        });

        res.json({
            success: true,
            message: `User ${userId} has been unblocked`
        });
    });

    // ============================================
    // DELETE MESSAGE
    // ============================================
    app.delete('/api/admin/messages/:messageId', adminAuthMiddleware, (req, res) => {
        const { messageId } = req.params;
        const { reason } = req.body;

        if (!messages.has(messageId)) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        const message = messages.get(messageId);
        messages.delete(messageId);

        // Log action
        adminAuditLog.push({
            timestamp: new Date(),
            action: 'MESSAGE_DELETED',
            messageId: messageId,
            deletedBy: 'admin',
            reason: reason,
            originalMessage: message.content.substring(0, 100)
        });

        // Notify all clients
        io.emit('admin:message:deleted', {
            messageId: messageId,
            reason: reason
        });

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    });

    // ============================================
    // GET AUDIT LOG
    // ============================================
    app.get('/api/admin/audit-log', adminAuthMiddleware, (req, res) => {
        const limit = req.query.limit || 100;
        const actionType = req.query.action; // Filter by action type

        let log = adminAuditLog;

        if (actionType) {
            log = log.filter(entry => entry.action === actionType);
        }

        // Get latest entries
        log = log.slice(-limit);

        res.json({
            success: true,
            totalEntries: adminAuditLog.length,
            auditLog: log
        });
    });

    // ============================================
    // GET DASHBOARD STATS
    // ============================================
    app.get('/api/admin/dashboard', adminAuthMiddleware, (req, res) => {
        const onlineCount = Array.from(users.values()).filter(u => u.status === 'online').length;
        const blockedCount = blockedUsers.size;
        const totalMessages = messages.size;

        res.json({
            success: true,
            dashboard: {
                totalUsers: users.size,
                onlineUsers: onlineCount,
                offlineUsers: users.size - onlineCount,
                blockedUsers: blockedCount,
                totalMessages: totalMessages,
                averageMessagesPerUser: users.size > 0 ? (totalMessages / users.size).toFixed(2) : 0,
                recentActions: adminAuditLog.slice(-10)
            }
        });
    });

    // ============================================
    // WARN USER
    // ============================================
    app.post('/api/admin/users/:userId/warn', adminAuthMiddleware, (req, res) => {
        const { userId } = req.params;
        const { reason } = req.body;

        if (!users.has(userId)) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Log warning
        adminAuditLog.push({
            timestamp: new Date(),
            action: 'USER_WARNING',
            targetUserId: userId,
            reason: reason,
            details: `User ${userId} received warning`
        });

        // Notify user
        io.emit('admin:user:warning', {
            userId: userId,
            reason: reason,
            message: `Warning: ${reason}`
        });

        res.json({
            success: true,
            message: `Warning issued to user ${userId}`
        });
    });

    // ============================================
    // FLAG MESSAGE (Suspicious/Inappropriate)
    // ============================================
    app.post('/api/admin/messages/:messageId/flag', adminAuthMiddleware, (req, res) => {
        const { messageId } = req.params;
        const { reason } = req.body;

        if (!messages.has(messageId)) {
            return res.status(404).json({
                success: false,
                error: 'Message not found'
            });
        }

        const message = messages.get(messageId);
        message.flagged = true;
        message.flagReason = reason;
        message.flaggedAt = new Date();

        // Log action
        adminAuditLog.push({
            timestamp: new Date(),
            action: 'MESSAGE_FLAGGED',
            messageId: messageId,
            reason: reason,
            senderId: message.senderId
        });

        res.json({
            success: true,
            message: 'Message flagged for review'
        });
    });

    // ============================================
    // GET FLAGGED MESSAGES
    // ============================================
    app.get('/api/admin/flagged-messages', adminAuthMiddleware, (req, res) => {
        const flaggedMessages = Array.from(messages.values())
            .filter(msg => msg.flagged === true)
            .map(msg => ({
                id: msg.id,
                senderId: msg.senderId,
                senderUsername: msg.senderUsername,
                content: msg.content,
                timestamp: msg.timestamp,
                flagReason: msg.flagReason,
                flaggedAt: msg.flaggedAt
            }));

        res.json({
            success: true,
            totalFlagged: flaggedMessages.length,
            flaggedMessages: flaggedMessages
        });
    });

    // ============================================
    // BROADCAST SYSTEM MESSAGE
    // ============================================
    app.post('/api/admin/broadcast', adminAuthMiddleware, (req, res) => {
        const { message, type } = req.body;

        // Log action
        adminAuditLog.push({
            timestamp: new Date(),
            action: 'BROADCAST_MESSAGE',
            message: message,
            type: type
        });

        // Send to all connected users
        io.emit('admin:broadcast', {
            message: message,
            type: type || 'info',
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Broadcast sent to all users',
            recipientCount: users.size
        });
    });

    // ============================================
    // GET USER ACTIVITY TIMELINE
    // ============================================
    app.get('/api/admin/users/:userId/activity', adminAuthMiddleware, (req, res) => {
        const { userId } = req.params;

        const userActions = adminAuditLog.filter(entry => 
            entry.targetUserId === userId || entry.action === 'USER_BLOCKED'
        );

        const userMessages = Array.from(messages.values())
            .filter(msg => msg.senderId === userId)
            .map(msg => ({
                type: 'MESSAGE_SENT',
                timestamp: msg.timestamp,
                content: msg.content.substring(0, 50)
            }));

        const timeline = [...userActions, ...userMessages]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            success: true,
            userId: userId,
            activityTimeline: timeline
        });
    });
};

module.exports = {
    adminRoutes,
    adminAuthMiddleware,
    adminData
};
