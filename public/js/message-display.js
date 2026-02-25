/* ============================================
   ENHANCED MESSAGE DISPLAY SYSTEM
   ============================================ */

class MessageDisplay {
    constructor() {
        this.messageCache = new Map();
        this.setupMessageObserver();
    }

    // Setup mutation observer for new messages
    setupMessageObserver() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.classList && node.classList.contains('message')) {
                            this.enhanceMessage(node);
                        }
                    });
                }
            });
        });

        observer.observe(messagesContainer, {
            childList: true,
            subtree: true
        });
    }

    // Enhance message with interactive features
    enhanceMessage(messageElement) {
        const messageId = messageElement.id?.replace('msg-', '');
        if (!messageId) return;

        // Add hover effects
        messageElement.addEventListener('mouseenter', () => {
            this.showMessageActions(messageElement, messageId);
        });

        messageElement.addEventListener('mouseleave', () => {
            this.hideMessageActions(messageElement);
        });

        // Add emoji support
        this.enhanceEmojis(messageElement);

        // Add markup for message content
        this.markupContent(messageElement);

        // Cache message
        this.messageCache.set(messageId, {
            element: messageElement,
            timestamp: new Date()
        });
    }

    // Show message action buttons
    showMessageActions(messageElement, messageId) {
        let actionsBar = messageElement.querySelector('.message-actions');

        if (!actionsBar) {
            const currentUserId = authManager.getCurrentUser().id;
            const message = chatManager.messages.find(m => m.id === messageId);

            if (!message) return;

            actionsBar = document.createElement('div');
            actionsBar.className = 'message-actions';

            // Reaction button
            const reactionBtn = document.createElement('button');
            reactionBtn.className = 'message-action-btn';
            reactionBtn.innerHTML = '😊';
            reactionBtn.title = 'Add reaction';
            reactionBtn.addEventListener('click', () => this.showReactionPicker(messageElement, messageId));
            actionsBar.appendChild(reactionBtn);

            // Reply button (if not own message)
            if (message.senderId !== currentUserId) {
                const replyBtn = document.createElement('button');
                replyBtn.className = 'message-action-btn';
                replyBtn.innerHTML = '↩️';
                replyBtn.title = 'Reply';
                replyBtn.addEventListener('click', () => this.startReply(messageId));
                actionsBar.appendChild(replyBtn);
            }

            // Edit button (if own message)
            if (message.senderId === currentUserId) {
                const editBtn = document.createElement('button');
                editBtn.className = 'message-action-btn';
                editBtn.innerHTML = '✏️';
                editBtn.title = 'Edit';
                editBtn.addEventListener('click', () => messageEditor.startEdit(messageId));
                actionsBar.appendChild(editBtn);
            }

            // Pin button
            const pinBtn = document.createElement('button');
            pinBtn.className = 'message-action-btn';
            pinBtn.innerHTML = messagePin.isPinned(messageId) ? '📍' : '📌';
            pinBtn.title = messagePin.isPinned(messageId) ? 'Unpin' : 'Pin';
            pinBtn.addEventListener('click', () => {
                messagePin.togglePin(messageId);
                pinBtn.innerHTML = messagePin.isPinned(messageId) ? '📍' : '📌';
            });
            actionsBar.appendChild(pinBtn);

            messageElement.style.position = 'relative';
            messageElement.appendChild(actionsBar);
        }

        actionsBar.style.opacity = '1';
    }

    // Hide message action buttons
    hideMessageActions(messageElement) {
        const actionsBar = messageElement.querySelector('.message-actions');
        if (actionsBar) {
            actionsBar.style.opacity = '0';
        }
    }

    // Show reaction picker
    showReactionPicker(messageElement, messageId) {
        const messageId_element = messageElement.querySelector('.message-bubble');
        if (!messageId_element) return;

        const picker = document.createElement('div');
        picker.className = 'quick-reaction-picker';

        // Show top 8 emojis
        const topEmojis = CONFIG.EMOJIS.slice(0, 8);
        topEmojis.forEach(emoji => {
            const item = document.createElement('div');
            item.className = 'quick-reaction-item';
            item.textContent = emoji;
            item.addEventListener('click', () => {
                messageReactions.addReaction(messageId, emoji, authManager.getCurrentUser().id);
                renderMessageWithReactions(messageId);
                emitEmojiReaction(messageId, emoji);
                picker.remove();
            });
            picker.appendChild(item);
        });

        // Add "more" button
        const moreBtn = document.createElement('div');
        moreBtn.className = 'quick-reaction-item';
        moreBtn.textContent = '+';
        moreBtn.addEventListener('click', () => {
            openEmojiModal();
            picker.remove();
        });
        picker.appendChild(moreBtn);

        messageElement.appendChild(picker);
    }

    // Start reply
    startReply(messageId) {
        const message = chatManager.messages.find(m => m.id === messageId);
        if (!message) return;

        const inputWrapper = document.querySelector('.input-wrapper');
        if (!inputWrapper) return;

        // Create reply indicator
        let replyIndicator = document.querySelector('.reply-indicator');
        if (!replyIndicator) {
            replyIndicator = document.createElement('div');
            replyIndicator.className = 'reply-indicator';
            inputWrapper.before(replyIndicator);
        }

        replyIndicator.innerHTML = `
            <div class="message-reply">
                <div class="reply-to">
                    Replying to <span class="reply-to-username">${this.escapeHTML(message.senderUsername)}</span>
                </div>
                <div class="reply-to-content">"${this.escapeHTML(message.content.substring(0, 100))}"</div>
                <button class="btn-icon" onclick="document.querySelector('.reply-indicator').remove(); window.currentReplyId = null;">✕</button>
            </div>
        `;

        window.currentReplyId = messageId;

        // Focus input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
            messageInput.placeholder = `Reply to ${message.senderUsername}...`;
        }

        showNotification(`Replying to ${message.senderUsername}`, 'info');
    }

    // Enhance emojis in message
    enhanceEmojis(messageElement) {
        const bubble = messageElement.querySelector('.message-bubble');
        if (!bubble) return;

        const content = bubble.textContent;
        const emojiRegex = /\p{Emoji}/gu;

        if (emojiRegex.test(content)) {
            bubble.classList.add('has-emoji');
        }
    }

    // Markup content (links, mentions, hashtags)
    markupContent(messageElement) {
        const bubble = messageElement.querySelector('.message-bubble');
        if (!bubble) return;

        let html = bubble.textContent;

        // Convert URLs to links
        html = html.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Highlight mentions (@username)
        html = html.replace(
            /@([a-zA-Z0-9_]+)/g,
            '<span class="mention-highlight">@$1</span>'
        );

        // Highlight hashtags (#tag)
        html = html.replace(
            /#([a-zA-Z0-9_]+)/g,
            '<span class="hashtag-highlight">#$1</span>'
        );

        bubble.innerHTML = html;
    }

    // Format message timestamp
    formatTimestamp(date) {
        const now = new Date();
        const diff = now - new Date(date);

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    // Escape HTML
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Search in messages
    searchMessages(query) {
        if (!query) {
            chatManager.messages.forEach(msg => {
                const elem = document.getElementById(`msg-${msg.id}`);
                if (elem) elem.classList.remove('search-highlight');
            });
            return;
        }

        const results = chatManager.messages.filter(msg =>
            msg.content.toLowerCase().includes(query.toLowerCase())
        );

        results.forEach(msg => {
            const elem = document.getElementById(`msg-${msg.id}`);
            if (elem) {
                elem.classList.add('search-highlight');
                const bubble = elem.querySelector('.message-bubble');
                if (bubble) {
                    const regex = new RegExp(`(${query})`, 'gi');
                    bubble.innerHTML = bubble.textContent.replace(
                        regex,
                        '<span class="message-highlight">$1</span>'
                    );
                }
            }
        });

        showNotification(`Found ${results.length} message(s)`, 'info');
    }

    // Export message
    exportMessage(messageId) {
        const message = chatManager.messages.find(m => m.id === messageId);
        if (!message) return;

        const text = `${message.senderUsername}: ${message.content}\n${this.formatTimestamp(message.timestamp)}`;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `message_${messageId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Copy message
    copyMessage(messageId) {
        const message = chatManager.messages.find(m => m.id === messageId);
        if (!message) return;

        navigator.clipboard.writeText(message.content).then(() => {
            showNotification('Message copied! 📋', 'success');
        });
    }

    // Get message statistics
    getStatistics() {
        const totalMessages = chatManager.messages.length;
        const ownMessages = chatManager.messages.filter(
            m => m.senderId === authManager.getCurrentUser().id
        ).length;
        const otherMessages = totalMessages - ownMessages;

        return {
            total: totalMessages,
            own: ownMessages,
            other: otherMessages,
            averageLength: totalMessages > 0 
                ? chatManager.messages.reduce((sum, m) => sum + m.content.length, 0) / totalMessages
                : 0
        };
    }
}

// Initialize message display
const messageDisplay = new MessageDisplay();

// ============================================
// GLOBAL FUNCTIONS FOR MESSAGE ACTIONS
// ============================================

window.copyMessage = (messageId) => messageDisplay.copyMessage(messageId);
window.exportMessage = (messageId) => messageDisplay.exportMessage(messageId);
window.startReply = (messageId) => messageDisplay.startReply(messageId);
window.showReactionPicker = (elem, msgId) => messageDisplay.showReactionPicker(elem, msgId);
