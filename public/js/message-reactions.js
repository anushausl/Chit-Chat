/* ============================================
   MESSAGE REACTIONS & ADVANCED FEATURES
   ============================================ */

class MessageReactions {
    constructor() {
        this.reactions = new Map(); // messageId -> [{ emoji, userId }]
    }

    // Add reaction to message
    addReaction(messageId, emoji, userId) {
        if (!this.reactions.has(messageId)) {
            this.reactions.set(messageId, []);
        }

        const messageReactions = this.reactions.get(messageId);

        // Check if user already reacted with this emoji
        const existingIndex = messageReactions.findIndex(
            r => r.emoji === emoji && r.userId === userId
        );

        if (existingIndex >= 0) {
            // Remove reaction if already exists (toggle)
            messageReactions.splice(existingIndex, 1);
        } else {
            // Add new reaction
            messageReactions.push({ emoji, userId });
        }

        return messageReactions;
    }

    // Get reactions for message
    getReactions(messageId) {
        return this.reactions.get(messageId) || [];
    }

    // Get reaction count
    getReactionCount(messageId, emoji) {
        const reactions = this.getReactions(messageId);
        return reactions.filter(r => r.emoji === emoji).length;
    }

    // Remove reaction
    removeReaction(messageId, emoji, userId) {
        const reactions = this.reactions.get(messageId);
        if (!reactions) return;

        const index = reactions.findIndex(
            r => r.emoji === emoji && r.userId === userId
        );

        if (index >= 0) {
            reactions.splice(index, 1);
        }
    }

    // Clear all reactions for message
    clearReactions(messageId) {
        this.reactions.delete(messageId);
    }
}

// Initialize message reactions
const messageReactions = new MessageReactions();

// ============================================
// RENDER MESSAGE WITH REACTIONS
// ============================================

function renderMessageWithReactions(messageId) {
    const messageElement = document.getElementById(`msg-${messageId}`);
    if (!messageElement) return;

    const reactions = messageReactions.getReactions(messageId);
    let reactionsContainer = messageElement.querySelector('.reactions-container');

    if (!reactionsContainer && reactions.length > 0) {
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        messageElement.querySelector('.message-content')?.appendChild(reactionsContainer);
    }

    if (reactionsContainer) {
        reactionsContainer.innerHTML = '';

        // Group reactions by emoji
        const grouped = {};
        reactions.forEach(r => {
            if (!grouped[r.emoji]) {
                grouped[r.emoji] = [];
            }
            grouped[r.emoji].push(r.userId);
        });

        // Render grouped reactions
        Object.entries(grouped).forEach(([emoji, userIds]) => {
            const reactionEl = document.createElement('div');
            reactionEl.className = 'reaction-badge';
            reactionEl.innerHTML = `
                <span class="reaction-emoji">${emoji}</span>
                <span class="reaction-count">${userIds.length}</span>
            `;

            reactionEl.addEventListener('click', () => {
                const currentUserId = authManager.getCurrentUser().id;
                const userReacted = userIds.includes(currentUserId);

                if (userReacted) {
                    messageReactions.removeReaction(messageId, emoji, currentUserId);
                } else {
                    messageReactions.addReaction(messageId, emoji, currentUserId);
                }

                renderMessageWithReactions(messageId);

                // Emit to socket
                if (window.socket) {
                    window.socket.emit('emoji:reaction', {
                        messageId: messageId,
                        emoji: emoji,
                        userId: currentUserId,
                        action: userReacted ? 'remove' : 'add'
                    });
                }
            });

            // Highlight if current user reacted
            if (userIds.includes(authManager.getCurrentUser().id)) {
                reactionEl.classList.add('user-reacted');
            }

            reactionsContainer.appendChild(reactionEl);
        });
    }
}

// ============================================
// MESSAGE EDITING
// ============================================

class MessageEditor {
    constructor() {
        this.editingMessageId = null;
    }

    // Start editing message
    startEdit(messageId) {
        const messageElement = document.getElementById(`msg-${messageId}`);
        if (!messageElement) return;

        const messageBubble = messageElement.querySelector('.message-bubble');
        const originalContent = messageBubble.textContent;

        const editContainer = document.createElement('div');
        editContainer.className = 'message-edit-container';
        editContainer.innerHTML = `
            <input type="text" class="message-edit-input" value="${originalContent}" maxlength="500">
            <div class="edit-actions">
                <button class="btn-edit-save">✓</button>
                <button class="btn-edit-cancel">✕</button>
            </div>
        `;

        messageBubble.replaceWith(editContainer);

        const input = editContainer.querySelector('.message-edit-input');
        const saveBtn = editContainer.querySelector('.btn-edit-save');
        const cancelBtn = editContainer.querySelector('.btn-edit-cancel');

        input.focus();

        saveBtn.addEventListener('click', () => this.saveEdit(messageId, input.value));
        cancelBtn.addEventListener('click', () => this.cancelEdit(messageId, originalContent));
    }

    // Save edited message
    saveEdit(messageId, newContent) {
        if (newContent.trim().length === 0) {
            showNotification('Message cannot be empty', 'error');
            return;
        }

        // Emit to socket
        if (window.socket) {
            window.socket.emit('message:edit', {
                messageId: messageId,
                content: newContent,
                editedAt: new Date()
            });
        }

        this.cancelEdit(messageId, newContent);
        showNotification('Message updated ✓', 'success');
    }

    // Cancel editing
    cancelEdit(messageId, content) {
        const messageElement = document.getElementById(`msg-${messageId}`);
        if (!messageElement) return;

        const editContainer = messageElement.querySelector('.message-edit-container');
        if (!editContainer) return;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = content;

        editContainer.replaceWith(bubble);
    }
}

const messageEditor = new MessageEditor();

// ============================================
// MESSAGE PINNING
// ============================================

class MessagePin {
    constructor() {
        this.pinnedMessages = new Set();
    }

    // Pin message
    pinMessage(messageId) {
        this.pinnedMessages.add(messageId);
        const messageElement = document.getElementById(`msg-${messageId}`);
        if (messageElement) {
            messageElement.classList.add('pinned-message');
        }
    }

    // Unpin message
    unpinMessage(messageId) {
        this.pinnedMessages.delete(messageId);
        const messageElement = document.getElementById(`msg-${messageId}`);
        if (messageElement) {
            messageElement.classList.remove('pinned-message');
        }
    }

    // Toggle pin
    togglePin(messageId) {
        if (this.pinnedMessages.has(messageId)) {
            this.unpinMessage(messageId);
        } else {
            this.pinMessage(messageId);
        }
    }

    // Get pinned messages
    getPinnedMessages() {
        return Array.from(this.pinnedMessages);
    }

    // Is message pinned
    isPinned(messageId) {
        return this.pinnedMessages.has(messageId);
    }
}

const messagePin = new MessagePin();

// ============================================
// MESSAGE DELETION
// ============================================

function deleteMessage(messageId) {
    if (confirm('Delete this message?')) {
        const messageElement = document.getElementById(`msg-${messageId}`);
        
        if (messageElement) {
            messageElement.style.opacity = '0.5';
            messageElement.style.textDecoration = 'line-through';
            
            const bubble = messageElement.querySelector('.message-bubble');
            if (bubble) {
                bubble.textContent = '[Message deleted]';
            }
        }

        // Emit to socket
        if (window.socket) {
            window.socket.emit('message:delete', {
                messageId: messageId,
                deletedAt: new Date()
            });
        }

        showNotification('Message deleted 🗑️', 'success');
    }
}

// ============================================
// MESSAGE FORWARDING
// ============================================

function forwardMessage(messageId) {
    showNotification('Message forwarding coming soon! 📨', 'info');
}

// ============================================
// MESSAGE CONTEXT MENU
// ============================================

function setupMessageContextMenu() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;

    messagesContainer.addEventListener('contextmenu', (e) => {
        const messageElement = e.target.closest('.message');
        if (!messageElement) return;

        e.preventDefault();

        const messageId = messageElement.id.replace('msg-', '');
        const currentUserId = authManager.getCurrentUser().id;
        const message = chatManager.messages.find(m => m.id === messageId);

        // Only show menu for own messages
        if (!message || message.senderId !== currentUserId) {
            return;
        }

        // Close existing menu
        const existingMenu = document.querySelector('.message-context-menu');
        if (existingMenu) existingMenu.remove();

        // Create context menu
        const menu = document.createElement('div');
        menu.className = 'message-context-menu';
        menu.style.position = 'fixed';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.style.zIndex = '1000';
        menu.style.backgroundColor = 'var(--bg-white)';
        menu.style.border = '1px solid var(--border-color)';
        menu.style.borderRadius = 'var(--border-radius-md)';
        menu.style.boxShadow = 'var(--shadow-lg)';
        menu.style.minWidth = '150px';

        menu.innerHTML = `
            <div class="context-menu-item" onclick="messageEditor.startEdit('${messageId}'); this.closest('.message-context-menu').remove();">
                ✏️ Edit
            </div>
            <div class="context-menu-item" onclick="messagePin.togglePin('${messageId}'); this.closest('.message-context-menu').remove();">
                📌 Pin
            </div>
            <div class="context-menu-item" onclick="forwardMessage('${messageId}'); this.closest('.message-context-menu').remove();">
                ➡️ Forward
            </div>
            <div class="context-menu-item" onclick="deleteMessage('${messageId}'); this.closest('.message-context-menu').remove();">
                🗑️ Delete
            </div>
        `;

        const items = menu.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            item.style.padding = '10px 15px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid var(--border-color)';
            item.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'var(--bg-light)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
        });

        // Remove last border
        items[items.length - 1].style.borderBottom = 'none';

        document.body.appendChild(menu);

        // Close menu on click outside
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        }, { once: true });
    });
}

// Initialize context menu on load
document.addEventListener('DOMContentLoaded', () => {
    setupMessageContextMenu();
});
