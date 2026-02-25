/* ============================================
   CHIT-CHAT - CORE CHAT MANAGER
   ============================================ */

class ChatManager {
    constructor() {
        this.messages = [];
        this.users = new Map();
        this.currentChatUser = null;
        this.typingUsers = new Set();
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.charCounter = document.getElementById('charCounter');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.messageInputTimeout = null;
        this.isTyping = false;
        
        this.initializeEventListeners();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Message input
        if (this.messageInput) {
            this.messageInput.addEventListener('input', (e) => this.handleMessageInput(e));
            this.messageInput.addEventListener('keypress', (e) => this.handleKeyPress(e));
        }

        // Send button
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Message actions
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => openEmojiModal());
        }

        const attachBtn = document.getElementById('attachBtn');
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.handleAttachFile());
        }

        const clearChatBtn = document.getElementById('clearChatBtn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }
    }

    // Handle message input
    handleMessageInput(e) {
        const message = e.target.value;
        
        // Update character counter
        if (this.charCounter) {
            this.charCounter.textContent = `${message.length}/${CONFIG.MESSAGE_MAX_LENGTH}`;
        }

        // Disable button if empty
        if (this.sendBtn) {
            this.sendBtn.disabled = message.trim().length === 0;
        }

        // Emit typing indicator
        this.emitTypingIndicator();

        // Prevent exceeding max length
        if (message.length > CONFIG.MESSAGE_MAX_LENGTH) {
            this.messageInput.value = message.substring(0, CONFIG.MESSAGE_MAX_LENGTH);
        }
    }

    // Handle key press
    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    // Emit typing indicator
    emitTypingIndicator() {
        if (!window.socket || !this.currentChatUser) return;

        clearTimeout(this.messageInputTimeout);

        if (!this.isTyping) {
            this.isTyping = true;
            window.socket.emit('typing:start', {
                userId: authManager.getCurrentUser().id,
                recipientId: this.currentChatUser.id
            });
        }

        this.messageInputTimeout = setTimeout(() => {
            this.isTyping = false;
            window.socket.emit('typing:stop', {
                userId: authManager.getCurrentUser().id,
                recipientId: this.currentChatUser.id
            });
        }, CONFIG.TYPING_TIMEOUT);
    }

    // Send message
    async sendMessage() {
        if (!this.messageInput || !this.currentChatUser) return;

        const messageText = this.messageInput.value.trim();

        if (messageText.length === 0) {
            showNotification('Message cannot be empty', 'error');
            return;
        }

        const message = {
            id: this.generateMessageId(),
            senderId: authManager.getCurrentUser().id,
            senderUsername: authManager.getCurrentUser().username,
            recipientId: this.currentChatUser.id,
            content: messageText,
            timestamp: new Date(),
            read: false,
            type: 'text'
        };

        // Clear input
        this.messageInput.value = '';
        this.sendBtn.disabled = true;

        if (this.charCounter) {
            this.charCounter.textContent = '0/' + CONFIG.MESSAGE_MAX_LENGTH;
        }

        // Add message to local display
        this.addMessage(message, true);

        // Save to local storage
        this.saveMessageToStorage(message);

        // Emit via socket
        if (window.socket) {
            window.socket.emit('message:send', message);
        }

        // Stop typing indicator
        clearTimeout(this.messageInputTimeout);
        this.isTyping = false;
        window.socket?.emit('typing:stop', {
            userId: authManager.getCurrentUser().id,
            recipientId: this.currentChatUser.id
        });
    }

    // Add message to display
    addMessage(message, isOwn = false) {
        const messageElement = this.createMessageElement(message, isOwn);
        
        if (this.messagesContainer) {
            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
        }

        this.messages.push(message);
    }

    // Create message element
    createMessageElement(message, isOwn = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : ''}`;
        messageDiv.id = `msg-${message.id}`;

        const timeString = this.formatTime(message.timestamp);
        const contentHTML = this.escapeHTML(message.content);

        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-bubble">
                    ${contentHTML}
                </div>
                <div class="message-info">
                    <span class="timestamp">${timeString}</span>
                    ${isOwn ? '<span class="read-receipt">✓</span>' : ''}
                </div>
            </div>
        `;

        // Add animation
        messageDiv.classList.add('slide-in-right');

        return messageDiv;
    }

    // Set current chat user
    setCurrentChatUser(user) {
        this.currentChatUser = user;
        this.messages = [];
        this.clearMessages();

        // Update header
        const headerTitle = document.getElementById('chatHeaderTitle');
        if (headerTitle) {
            headerTitle.textContent = `💬 ${user.username}`;
        }

        // Enable message input
        if (this.messageInput) {
            this.messageInput.disabled = false;
            this.messageInput.placeholder = `Message ${user.username}...`;
        }

        if (this.sendBtn) {
            this.sendBtn.disabled = true;
        }

        // Load message history
        this.loadMessageHistory(user.id);

        // Close sidebar on mobile
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }

    // Load message history from storage
    loadMessageHistory(userId) {
        const historyKey = `${CONFIG.STORAGE_KEYS.CHAT_HISTORY}_${userId}`;
        const history = localStorage.getItem(historyKey);

        if (history) {
            const messages = JSON.parse(history);
            messages.forEach(msg => {
                const isOwn = msg.senderId === authManager.getCurrentUser().id;
                this.addMessage(msg, isOwn);
            });
        }
    }

    // Save message to storage
    saveMessageToStorage(message) {
        const historyKey = `${CONFIG.STORAGE_KEYS.CHAT_HISTORY}_${this.currentChatUser.id}`;
        const history = localStorage.getItem(historyKey);
        const messages = history ? JSON.parse(history) : [];

        messages.push(message);

        // Keep only recent messages
        const recentMessages = messages.slice(-CONFIG.MESSAGES_LIMIT);
        localStorage.setItem(historyKey, JSON.stringify(recentMessages));
    }

    // Clear messages display
    clearMessages() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
    }

    // Clear chat history
    clearChat() {
        if (!this.currentChatUser) return;

        if (confirm('Clear chat history with this user?')) {
            const historyKey = `${CONFIG.STORAGE_KEYS.CHAT_HISTORY}_${this.currentChatUser.id}`;
            localStorage.removeItem(historyKey);
            this.messages = [];
            this.clearMessages();
            showNotification('Chat cleared 🗑️', 'success');
        }
    }

    // Handle attach file
    handleAttachFile() {
        showNotification('File sharing coming soon! 📎', 'info');
    }

    // Update typing indicator
    updateTypingIndicator(typingUsers) {
        this.typingUsers = new Set(typingUsers);

        if (typingUsers.length > 0) {
            if (this.typingIndicator) {
                this.typingIndicator.classList.remove('hidden');
            }
        } else {
            if (this.typingIndicator) {
                this.typingIndicator.classList.add('hidden');
            }
        }
    }

    // Mark message as read
    markMessageAsRead(messageId) {
        const messageElement = document.getElementById(`msg-${messageId}`);
        if (messageElement) {
            const receipt = messageElement.querySelector('.read-receipt');
            if (receipt) {
                receipt.innerHTML = '✓✓';
            }
        }
    }

    // Scroll to bottom
    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 0);
        }
    }

    // Generate unique message ID
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Format time
    formatTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    }

    // Escape HTML
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Add user to users list
    addUser(user) {
        this.users.set(user.id, user);
    }

    // Remove user from users list
    removeUser(userId) {
        this.users.delete(userId);
    }

    // Get all users
    getUsers() {
        return Array.from(this.users.values());
    }

    // Get user by ID
    getUserById(userId) {
        return this.users.get(userId);
    }

    // Search users
    searchUsers(query) {
        if (!query) return this.getUsers();

        return this.getUsers().filter(user =>
            user.username.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// Initialize chat manager
const chatManager = new ChatManager();
