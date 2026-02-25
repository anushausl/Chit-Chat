/* ============================================
   CHIT-CHAT - SOCKET.IO HANDLER
   ============================================ */

let socket = null;

// Initialize socket connection
function initializeSocket() {
    socket = io(CONFIG.SERVER_URL, CONFIG.SOCKET_OPTIONS);
    window.socket = socket;

    setupSocketListeners();
}

// Setup all socket event listeners
function setupSocketListeners() {
    // Connection events
    socket.on('connect', handleSocketConnect);
    socket.on('disconnect', handleSocketDisconnect);
    socket.on('error', handleSocketError);
    socket.on('connect_error', handleConnectError);

    // User events
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);
    socket.on('user:list', handleUserList);
    socket.on('user:status', handleUserStatus);

    // Message events
    socket.on('message:receive', handleMessageReceive);
    socket.on('message:read', handleMessageRead);

    // Typing events
    socket.on('typing:active', handleTypingActive);
    socket.on('typing:stop', handleTypingStop);

    // Notification events
    socket.on('notification:new', handleNewNotification);

    // Error events
    socket.on('error:message', handleMessageError);
}

// ============================================
// CONNECTION HANDLERS
// ============================================

function handleSocketConnect() {
    console.log('Connected to server');
    showNotification('Connected to Chit-Chat! 🎉', 'success');

    // Emit user info
    const user = authManager.getCurrentUser();
    if (user) {
        socket.emit('user:connect', {
            userId: user.id,
            username: user.username
        });
    }
}

function handleSocketDisconnect(reason) {
    console.log('Disconnected from server:', reason);
    showNotification('Disconnected from server 📡', 'error');
}

function handleSocketError(error) {
    console.error('Socket error:', error);
    showNotification('Connection error occurred', 'error');
}

function handleConnectError(error) {
    console.error('Connection error:', error);
    showNotification('Failed to connect to server', 'error');
}

// ============================================
// USER HANDLERS
// ============================================

function handleUserOnline(data) {
    console.log('User online:', data);
    
    const user = {
        id: data.userId,
        username: data.username,
        status: 'online',
        lastSeen: new Date()
    };

    uiManager.addUser(user);
    showNotification(`${data.username} is now online 🟢`, 'info');
}

function handleUserOffline(data) {
    console.log('User offline:', data);
    
    if (chatManager.currentChatUser?.id === data.userId) {
        uiManager.updateUserStatus(data.userId, 'offline');
    } else {
        uiManager.removeUser(data.userId);
    }

    showNotification(`${data.username} went offline 🔴`, 'info');
}

function handleUserList(data) {
    console.log('Received user list:', data);
    
    if (Array.isArray(data.users)) {
        data.users.forEach(user => {
            uiManager.addUser({
                id: user.id,
                username: user.username,
                status: user.status || 'online',
                lastSeen: user.lastSeen
            });
        });
    }
}

function handleUserStatus(data) {
    console.log('User status changed:', data);
    uiManager.updateUserStatus(data.userId, data.status);
}

// ============================================
// MESSAGE HANDLERS
// ============================================

function handleMessageReceive(data) {
    console.log('Message received:', data);

    const message = {
        id: data.messageId || chatManager.generateMessageId(),
        senderId: data.senderId,
        senderUsername: data.senderUsername,
        recipientId: data.recipientId,
        content: data.content,
        timestamp: data.timestamp || new Date(),
        read: false,
        type: data.type || 'text'
    };

    // If this message is from current chat user, display it
    if (chatManager.currentChatUser && 
        chatManager.currentChatUser.id === message.senderId) {
        
        chatManager.addMessage(message, false);
        chatManager.saveMessageToStorage(message);

        // Emit read receipt
        socket.emit('message:read', {
            messageId: message.id,
            senderId: message.senderId
        });

        // Show notification
        sendDesktopNotification(`New message from ${message.senderUsername}`, {
            body: message.content,
            tag: `msg-${message.senderId}`
        });
    } else {
        // Message from other user, show notification
        sendDesktopNotification(`${message.senderUsername} sent you a message`, {
            body: message.content,
            tag: `msg-${message.senderId}`
        });

        showNotification(`New message from ${message.senderUsername}`, 'info');

        // Add user if not in list
        const receivedUser = chatManager.getUserById(message.senderId);
        if (!receivedUser) {
            uiManager.addUser({
                id: message.senderId,
                username: message.senderUsername,
                status: 'online'
            });
        }
    }
}

function handleMessageRead(data) {
    console.log('Message read:', data);
    chatManager.markMessageAsRead(data.messageId);
}

// ============================================
// TYPING HANDLERS
// ============================================

function handleTypingActive(data) {
    console.log('User typing:', data);

    if (chatManager.currentChatUser && 
        chatManager.currentChatUser.id === data.userId) {
        
        const typingUsers = [data.username];
        chatManager.updateTypingIndicator(typingUsers);
    }
}

function handleTypingStop(data) {
    console.log('User stopped typing:', data);

    if (chatManager.currentChatUser && 
        chatManager.currentChatUser.id === data.userId) {
        
        chatManager.updateTypingIndicator([]);
    }
}

// ============================================
// NOTIFICATION HANDLERS
// ============================================

function handleNewNotification(data) {
    console.log('Notification:', data);
    showNotification(data.message, data.type || 'info');

    // Send desktop notification if important
    if (data.type === 'warning' || data.type === 'error') {
        sendDesktopNotification('Chit-Chat Notification', {
            body: data.message
        });
    }
}

// ============================================
// ERROR HANDLERS
// ============================================

function handleMessageError(data) {
    console.error('Message error:', data);
    showNotification('Failed to send message: ' + data.error, 'error');
}

// ============================================
// EMITTER FUNCTIONS
// ============================================

// Emit user typing
function emitUserTyping() {
    if (!socket || !chatManager.currentChatUser) return;

    socket.emit('typing:start', {
        userId: authManager.getCurrentUser().id,
        username: authManager.getCurrentUser().username,
        recipientId: chatManager.currentChatUser.id
    });
}

// Emit user stopped typing
function emitUserStoppedTyping() {
    if (!socket || !chatManager.currentChatUser) return;

    socket.emit('typing:stop', {
        userId: authManager.getCurrentUser().id,
        recipientId: chatManager.currentChatUser.id
    });
}

// Emit message
function emitMessage(message) {
    if (!socket) return;

    socket.emit('message:send', {
        messageId: message.id,
        senderId: message.senderId,
        senderUsername: message.senderUsername,
        recipientId: message.recipientId,
        content: message.content,
        timestamp: message.timestamp,
        type: message.type
    });
}

// Emit user status change
function emitUserStatusChange(status) {
    if (!socket) return;

    socket.emit('user:status', {
        userId: authManager.getCurrentUser().id,
        status: status
    });
}

// Emit emoji reaction
function emitEmojiReaction(messageId, emoji) {
    if (!socket) return;

    socket.emit('emoji:reaction', {
        messageId: messageId,
        emoji: emoji,
        userId: authManager.getCurrentUser().id,
        senderId: chatManager.currentChatUser?.id
    });
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth to be ready
    setTimeout(() => {
        if (authManager.isAuthenticated()) {
            initializeSocket();
        }
    }, 500);
});

// Initialize socket when showing chat section
const originalShowChatSection = showChatSection;
showChatSection = function() {
    originalShowChatSection();
    
    // Ensure socket is connected
    if (!socket && authManager.isAuthenticated()) {
        setTimeout(() => {
            initializeSocket();
        }, 100);
    }
};

// Close socket on logout
const originalHandleLogout = handleLogout;
handleLogout = function() {
    if (socket) {
        socket.disconnect();
    }
    originalHandleLogout();
};

// ============================================
// HEARTBEAT / KEEP-ALIVE
// ============================================

// Send heartbeat every 30 seconds
setInterval(() => {
    if (socket && socket.connected) {
        socket.emit('heartbeat', {
            userId: authManager.getCurrentUser()?.id,
            timestamp: new Date()
        });
    }
}, 30000);

// Auto-reconnect on unexpected disconnect
socket?.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        // Server disconnected client, reconnect manually
        setTimeout(() => {
            if (authManager.isAuthenticated()) {
                initializeSocket();
            }
        }, 5000);
    }
});
