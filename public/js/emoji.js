/* ============================================
   CHIT-CHAT - EMOJI PICKER
   ============================================ */

class EmojiPicker {
    constructor() {
        this.modal = document.getElementById('emojiModal');
        this.emojiGrid = document.getElementById('emojiGrid');
        this.populateEmojis();
    }

    // Populate emoji grid
    populateEmojis() {
        if (!this.emojiGrid) return;

        this.emojiGrid.innerHTML = '';

        CONFIG.EMOJIS.forEach(emoji => {
            const emojiItem = document.createElement('div');
            emojiItem.className = 'emoji-item';
            emojiItem.textContent = emoji;
            emojiItem.addEventListener('click', () => this.insertEmoji(emoji));
            this.emojiGrid.appendChild(emojiItem);
        });
    }

    // Insert emoji into message
    insertEmoji(emoji) {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput) return;

        const currentValue = messageInput.value;
        const cursorPosition = messageInput.selectionStart || currentValue.length;

        const newValue = 
            currentValue.substring(0, cursorPosition) + 
            emoji + 
            currentValue.substring(cursorPosition);

        messageInput.value = newValue;
        messageInput.focus();

        // Trigger input event to update counter
        const inputEvent = new Event('input', { bubbles: true });
        messageInput.dispatchEvent(inputEvent);

        // Close modal
        this.closeModal();
    }

    // Close modal
    closeModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }

    // Open modal
    openModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
        }
    }
}

// Initialize emoji picker
const emojiPicker = new EmojiPicker();

// ============================================
// EMOJI MODAL FUNCTIONS
// ============================================

function openEmojiModal() {
    emojiPicker.openModal();
}

function closeEmojiModal() {
    emojiPicker.closeModal();
}

// Close emoji modal on outside click
document.addEventListener('click', (e) => {
    const emojiModal = document.getElementById('emojiModal');
    const emojiBtn = document.getElementById('emojiBtn');
    
    if (emojiModal && e.target === emojiModal) {
        closeEmojiModal();
    }
});

// ============================================
// EMOJI UTILITIES
// ============================================

// Get emoji name
function getEmojiName(emoji) {
    // This is a simple implementation
    // In a real app, you'd use a proper emoji library
    const emojiNames = {
        '😀': 'grinning',
        '😃': 'smiley',
        '😄': 'smile',
        '😁': 'grin',
        '😆': 'laughing',
        '🎉': 'party_popper',
        '🎊': 'confetti_ball',
        '👍': 'thumbsup',
        '👎': 'thumbsdown',
        '❤️': 'heart',
        '🔥': 'fire',
        '⭐': 'star',
        '✨': 'sparkles'
    };
    return emojiNames[emoji] || 'custom';
}

// Split emoji string (handles multi-byte characters)
function splitEmoji(str) {
    return [...str].filter(char => {
        const code = char.codePointAt(0);
        return code > 127;
    });
}

// Add emoji reaction to message
function addEmojiReaction(messageId, emoji) {
    const messageElement = document.getElementById(`msg-${messageId}`);
    if (!messageElement) return;

    let reactionsContainer = messageElement.querySelector('.reactions-container');
    
    if (!reactionsContainer) {
        reactionsContainer = document.createElement('div');
        reactionsContainer.className = 'reactions-container';
        messageElement.appendChild(reactionsContainer);
    }

    const reactionElement = document.createElement('span');
    reactionElement.className = 'reaction-emoji';
    reactionElement.textContent = emoji;
    
    reactionsContainer.appendChild(reactionElement);

    // Emit to other users
    if (window.socket) {
        window.socket.emit('emoji:reaction', {
            messageId: messageId,
            emoji: emoji,
            userId: authManager.getCurrentUser().id
        });
    }
}

// Show emoji picker near cursor
function showEmojiPickerNearCursor(x, y) {
    const modal = document.getElementById('emojiModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Center modal on screen instead of cursor
        modal.style.position = 'fixed';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
    }
}

// Replace emoji shortcuts (like :) -> 😊)
function replaceEmojiShortcuts(text) {
    const shortcuts = {
        ':)': '😊',
        ':(': '☹️',
        ':D': '😃',
        ':P': '😜',
        ':O': '😮',
        '<3': '❤️',
        ':heart:': '❤️',
        ':fire:': '🔥',
        ':star:': '⭐'
    };

    let result = text;
    Object.entries(shortcuts).forEach(([shortcut, emoji]) => {
        result = result.replace(new RegExp(shortcut, 'g'), emoji);
    });

    return result;
}

// Get random emoji
function getRandomEmoji() {
    return CONFIG.EMOJIS[Math.floor(Math.random() * CONFIG.EMOJIS.length)];
}

// Create emoji animation
function createEmojiAnimation(emoji, x, y) {
    const emojiEl = document.createElement('div');
    emojiEl.className = 'floating-emoji';
    emojiEl.textContent = emoji;
    emojiEl.style.position = 'fixed';
    emojiEl.style.left = x + 'px';
    emojiEl.style.top = y + 'px';
    emojiEl.style.fontSize = '2rem';
    emojiEl.style.zIndex = '999';
    emojiEl.style.animation = 'float 2s ease-out forwards';

    document.body.appendChild(emojiEl);

    setTimeout(() => emojiEl.remove(), 2000);
}

// Filter emojis by search
function searchEmojis(query) {
    if (!query) return CONFIG.EMOJIS;

    // Simple search by typing (you could expand this)
    const emojiNames = {
        'happy': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂'],
        'sad': ['🙁', '☹️', '😞', '😖', '😢', '😭'],
        'love': ['❤️', '🧡', '💛', '💚', '💙', '💜'],
        'fire': ['🔥', '💥'],
        'star': ['⭐', '✨', '🌟'],
        'party': ['🎉', '🎊', '🎈', '🎁']
    };

    for (const [key, emojis] of Object.entries(emojiNames)) {
        if (key.includes(query.toLowerCase())) {
            return emojis;
        }
    }

    return CONFIG.EMOJIS;
}

// Start emoji search in modal
function setupEmojiSearch() {
    const modal = document.getElementById('emojiModal');
    if (!modal) return;

    let searchInput = modal.querySelector('.emoji-search');
    
    if (!searchInput) {
        searchInput = document.createElement('input');
        searchInput.className = 'emoji-search';
        searchInput.placeholder = 'Search emoji...';
        searchInput.style.width = '100%';
        searchInput.style.padding = '10px';
        searchInput.style.marginBottom = '10px';
        searchInput.style.border = '1px solid #ddd';
        searchInput.style.borderRadius = '4px';

        const emojiGrid = document.getElementById('emojiGrid');
        if (emojiGrid && emojiGrid.parentNode) {
            emojiGrid.parentNode.insertBefore(searchInput, emojiGrid);
        }

        searchInput.addEventListener('input', (e) => {
            const results = searchEmojis(e.target.value);
            const grid = document.getElementById('emojiGrid');
            if (grid) {
                grid.innerHTML = '';
                results.forEach(emoji => {
                    const item = document.createElement('div');
                    item.className = 'emoji-item';
                    item.textContent = emoji;
                    item.addEventListener('click', () => {
                        emojiPicker.insertEmoji(emoji);
                        searchInput.value = '';
                    });
                    grid.appendChild(item);
                });
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEmojiSearch();
});
