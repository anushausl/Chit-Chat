/* ============================================
   CHIT-CHAT - CONFIGURATION
   ============================================ */

const CONFIG = {
    // Server Configuration
    SERVER_URL: window.location.origin,
    API_BASE: '/api',
    API_BASE_URL: window.location.origin,
    
    // Socket.io Configuration
    SOCKET_OPTIONS: {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
    },
    
    // Message Configuration
    MESSAGE_MAX_LENGTH: 500,
    MESSAGE_DEBOUNCE_TIME: 300,
    TYPING_TIMEOUT: 3000,
    
    // UI Configuration
    MESSAGES_LIMIT: 50,
    USERS_LIMIT: 100,
    AUTO_SCROLL_THRESHOLD: 100,
    
    // Storage Keys
    STORAGE_KEYS: {
        USER_TOKEN: 'chit_chat_token',
        USER_DATA: 'chit_chat_user',
        CHAT_HISTORY: 'chit_chat_history',
        THEME: 'chit_chat_theme',
        SETTINGS: 'chit_chat_settings'
    },
    
    // Emoji List
    EMOJIS: [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
        '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜',
        '🤪', '😌', '😔', '😑', '😐', '😶', '🤐', '🤨',
        '😏', '😒', '🙁', '☹️', '😲', '😞', '😖', '😢',
        '😭', '😤', '😠', '😡', '🤬', '😈', '👿', '💀',
        '💩', '🤡', '👹', '👺', '👻️', '👽️', '👾️', '🤖️',
        '😺', '😸', '😹', '😻', '😼', '😽', '😾', '😿',
        '🙀', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌',
        '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍',
        '👎', '👊', '👏', '🙌', '👐', '🤲', '🤝', '🤜',
        '🤛', '🦾', '🦿', '🦴', '🧠', '🦷', '🦴', '❤️',
        '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎',
        '🎈', '🎉', '🎊', '🎁', '🎀', '🎂', '🎄', '🎆',
        '🍕', '🍔', '🍟', '🌭', '🍿', '🥓', '🍳', '🧈',
        '⭐', '✨', '🌟', '💫', '⚡', '🔥', '💥', '👀',
        '💯', '✅', '❌', '❓', '❔', '❕', '🚀', '💪'
    ],
    
    // Color Theme
    COLORS: {
        primary: '#FF6B9D',
        secondary: '#4ECDC4',
        success: '#81C784',
        warning: '#FFE66D',
        danger: '#E63384',
        info: '#64B5F6'
    },
    
    // Animation Timings (ms)
    ANIMATIONS: {
        fast: 150,
        normal: 250,
        slow: 350
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
