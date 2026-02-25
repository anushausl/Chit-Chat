/* ============================================
   CHIT-CHAT - MAIN SERVER
   ============================================ */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.ALLOW_CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
    }
});

// If REDIS_URL is provided, configure socket.io Redis adapter for scaling
(async () => {
    const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://redis:6379';
    if (!redisUrl) return;

    try {
        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await pubClient.connect();
        await subClient.connect();

        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Socket.io Redis adapter configured');
    } catch (err) {
        console.warn('⚠️ Could not connect to Redis for socket adapter:', err.message);
    }
})();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// ============================================
// IN-MEMORY DATA STORAGE
// (In production, use a database)
// ============================================

const users = new Map(); // userId -> user object
const activeSessions = new Map(); // socketId -> userId
const messages = new Map(); // messageId -> message object
const userConnections = new Map(); // userId -> [socketIds]

// Admin system data structures
const adminAuditLog = []; // Track all admin actions
const blockedUsers = new Map(); // userId -> reason

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Static file serving
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

// Admin Routes (Import admin system)
const { adminRoutes } = require('./routes/admin');
adminRoutes(app, io, users, messages, adminAuditLog, blockedUsers);

// ============================================
// SOCKET.IO EVENT HANDLERS
// ============================================

io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // ============================================
    // USER EVENTS
    // ============================================

    socket.on('user:connect', (data) => {
        console.log('User connected:', data);

        const { userId, username } = data;

        // CHECK: Is user blocked?
        if (blockedUsers.has(userId)) {
            socket.emit('user:blocked', {
                blocked: true,
                reason: blockedUsers.get(userId),
                message: 'Your account has been blocked. Please contact administrators.'
            });
            socket.disconnect();
            return;
        }

        // Store user info
        activeSessions.set(socket.id, userId);
        
        if (!userConnections.has(userId)) {
            userConnections.set(userId, []);
        }
        userConnections.get(userId).push(socket.id);

        // Store user data
        users.set(userId, {
            id: userId,
            username: username,
            status: 'online',
            lastSeen: new Date(),
            socketIds: userConnections.get(userId)
        });

        // Broadcast user online
        socket.broadcast.emit('user:online', {
            userId: userId,
            username: username,
            timestamp: new Date()
        });

        // Send current user list to all clients
        broadcastUserList();
    });

    socket.on('user:status', (data) => {
        console.log('User status update:', data);

        const { userId, status } = data;
        
        if (users.has(userId)) {
            const user = users.get(userId);
            user.status = status;
            user.lastSeen = new Date();

            // Broadcast status change
            io.emit('user:status', {
                userId: userId,
                status: status,
                username: user.username
            });
        }
    });

    // ============================================
    // MESSAGE EVENTS
    // ============================================

    socket.on('message:send', (data) => {
        console.log('Message received:', data);

        const { messageId, senderId, senderUsername, recipientId, content, timestamp, type } = data;

        // CHECK: Is sender blocked?
        if (blockedUsers.has(senderId)) {
            socket.emit('message:error', {
                error: 'Your account has been blocked by administrators.',
                reason: blockedUsers.get(senderId)
            });
            return;
        }

        // Store message
        const message = {
            id: messageId,
            senderId: senderId,
            senderUsername: senderUsername,
            recipientId: recipientId,
            content: content,
            timestamp: timestamp || new Date(),
            read: false,
            type: type || 'text'
        };

        messages.set(messageId, message);

        // Send to recipient
        const recipientSocketIds = userConnections.get(recipientId) || [];
        recipientSocketIds.forEach(socketId => {
            io.to(socketId).emit('message:receive', message);
        });

        // Send confirmation to sender
        socket.emit('message:sent', {
            messageId: messageId,
            status: 'sent'
        });
    });

    socket.on('message:read', (data) => {
        console.log('Message read:', data);

        const { messageId, senderId } = data;

        if (messages.has(messageId)) {
            const message = messages.get(messageId);
            message.read = true;

            // Notify sender
            const senderSocketIds = userConnections.get(senderId) || [];
            senderSocketIds.forEach(socketId => {
                io.to(socketId).emit('message:read', {
                    messageId: messageId,
                    readAt: new Date()
                });
            });
        }
    });

    // ============================================
    // TYPING EVENTS
    // ============================================

    socket.on('typing:start', (data) => {
        console.log('User typing:', data);

        const { userId, username, recipientId } = data;

        // Send to recipient only
        const recipientSocketIds = userConnections.get(recipientId) || [];
        recipientSocketIds.forEach(socketId => {
            io.to(socketId).emit('typing:active', {
                userId: userId,
                username: username
            });
        });
    });

    socket.on('typing:stop', (data) => {
        console.log('User stopped typing:', data);

        const { userId, recipientId } = data;

        // Send to recipient only
        const recipientSocketIds = userConnections.get(recipientId) || [];
        recipientSocketIds.forEach(socketId => {
            io.to(socketId).emit('typing:stop', {
                userId: userId
            });
        });
    });

    // ============================================
    // EMOJI REACTION EVENTS
    // ============================================

    socket.on('emoji:reaction', (data) => {
        console.log('Emoji reaction:', data);

        const { messageId, emoji, userId, senderId } = data;

        // Broadcast reaction
        io.emit('emoji:reaction', {
            messageId: messageId,
            emoji: emoji,
            userId: userId
        });
    });

    // ============================================
    // HEARTBEAT
    // ============================================

    socket.on('heartbeat', (data) => {
        console.log('Heartbeat from user:', data.userId);

        const userId = activeSessions.get(socket.id);
        if (userId && users.has(userId)) {
            const user = users.get(userId);
            user.lastSeen = new Date();
        }
    });

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);

        const userId = activeSessions.get(socket.id);

        if (userId) {
            // Remove socket from user's connections
            const userSockets = userConnections.get(userId) || [];
            const index = userSockets.indexOf(socket.id);
            if (index > -1) {
                userSockets.splice(index, 1);
            }

            // If user has no more connections, mark as offline
            if (userSockets.length === 0) {
                userConnections.delete(userId);

                if (users.has(userId)) {
                    const user = users.get(userId);
                    user.status = 'offline';
                    user.lastSeen = new Date();
                }

                // Broadcast user offline
                io.emit('user:offline', {
                    userId: userId,
                    username: users.get(userId)?.username || 'Unknown'
                });
            }

            // Broadcast updated user list
            broadcastUserList();
        }

        activeSessions.delete(socket.id);
    });

    // ============================================
    // ERROR HANDLING
    // ============================================

    socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
    });

    // Send initial user list to new connection
    setTimeout(() => {
        const userList = Array.from(users.values()).map(user => ({
            id: user.id,
            username: user.username,
            status: user.status,
            lastSeen: user.lastSeen
        }));

        socket.emit('user:list', { users: userList });
    }, 100);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function broadcastUserList() {
    const userList = Array.from(users.values()).map(user => ({
        id: user.id,
        username: user.username,
        status: user.status,
        lastSeen: user.lastSeen
    }));

    io.emit('user:list', { users: userList });
}

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Chit-Chat server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.io service active`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };
