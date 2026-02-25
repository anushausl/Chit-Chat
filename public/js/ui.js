/* ============================================
   CHIT-CHAT - UI MANAGER
   ============================================ */

class UIManager {
    constructor() {
        this.usersList = document.getElementById('usersList');
        this.userSearchInput = document.getElementById('userSearchInput');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.mobileToggle = document.getElementById('mobileToggle');
        this.themeToggle = document.getElementById('themeToggle');
        this.soundToggle = document.getElementById('soundToggle');
        this.notifToggle = document.getElementById('notifToggle');

        this.settings = this.loadSettings();
        this.initializeEventListeners();
        this.applyTheme();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // User search
        if (this.userSearchInput) {
            this.userSearchInput.addEventListener('input', (e) => this.handleUserSearch(e));
        }

        // Settings
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => openSettingsModal());
        }

        if (this.themeToggle) {
            this.themeToggle.checked = this.settings.darkMode;
            this.themeToggle.addEventListener('change', (e) => this.toggleTheme(e));
        }

        if (this.soundToggle) {
            this.soundToggle.checked = this.settings.soundEnabled;
            this.soundToggle.addEventListener('change', (e) => this.saveSetting('soundEnabled', e.target.checked));
        }

        if (this.notifToggle) {
            this.notifToggle.checked = this.settings.notificationsEnabled;
            this.notifToggle.addEventListener('change', (e) => this.saveSetting('notificationsEnabled', e.target.checked));
        }

        // Mobile toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', () => this.toggleMobileSidebar());
        }

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    // Handle user search
    handleUserSearch(e) {
        const query = e.target.value;
        const filteredUsers = chatManager.searchUsers(query);
        this.renderUsersList(filteredUsers);
    }

    // Render users list
    renderUsersList(users = null) {
        if (!this.usersList) return;

        const usersToRender = users || chatManager.getUsers();
        this.usersList.innerHTML = '';

        if (usersToRender.length === 0) {
            this.usersList.innerHTML = '<p class="text-muted">No users online</p>';
            return;
        }

        usersToRender.forEach(user => {
            const userElement = this.createUserElement(user);
            this.usersList.appendChild(userElement);
        });
    }

    // Create user element
    createUserElement(user) {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-item';
        if (chatManager.currentChatUser?.id === user.id) {
            userDiv.classList.add('active');
        }

        const avatarColor = this.getUserAvatarColor(user.username);
        const initials = user.username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        const statusClass = user.status || 'online';
        const lastSeen = user.lastSeen ? this.formatLastSeen(user.lastSeen) : 'Just now';

        userDiv.innerHTML = `
            <div class="user-item-avatar" style="background: linear-gradient(135deg, ${avatarColor}, ${this.getComplementaryColor(avatarColor)});">
                ${initials}
            </div>
            <div class="user-item-info">
                <div class="user-item-name">${this.escapeHTML(user.username)}</div>
                <div class="user-item-status">
                    <span class="status-indicator ${statusClass}"></span>
                    <span>${statusClass === 'online' ? 'Online' : lastSeen}</span>
                </div>
            </div>
        `;

        userDiv.addEventListener('click', () => {
            chatManager.setCurrentChatUser(user);
            this.renderUsersList();
        });

        // Add animation
        userDiv.classList.add('slide-in-left');

        return userDiv;
    }

    // Add user to list
    addUser(user) {
        chatManager.addUser(user);
        this.renderUsersList();
    }

    // Remove user from list
    removeUser(userId) {
        chatManager.removeUser(userId);
        this.renderUsersList();
    }

    // Update user status
    updateUserStatus(userId, status) {
        const user = chatManager.getUserById(userId);
        if (user) {
            user.status = status;
            user.lastSeen = new Date();
            this.renderUsersList();
        }
    }

    // Toggle theme
    toggleTheme(e) {
        const isDarkMode = e.target.checked;
        document.body.classList.toggle('dark-mode', isDarkMode);
        this.saveSetting('darkMode', isDarkMode);
    }

    // Apply theme
    applyTheme() {
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    // Save setting
    saveSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem(CONFIG.STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    }

    // Load settings
    loadSettings() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEYS.SETTINGS);
        return saved ? JSON.parse(saved) : {
            darkMode: false,
            soundEnabled: true,
            notificationsEnabled: true
        };
    }

    // Toggle mobile sidebar
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.chat-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }

    // Handle click outside sidebar
    handleClickOutside(e) {
        const sidebar = document.querySelector('.chat-sidebar');
        const toggleBtn = document.getElementById('mobileToggle');

        if (sidebar && toggleBtn && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
            if (window.innerWidth <= 480 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    }

    // Get user avatar color
    getUserAvatarColor(username) {
        const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#81C784', '#64B5F6'];
        const index = username.charCodeAt(0) % colors.length;
        return colors[index];
    }

    // Get complementary color
    getComplementaryColor(color) {
        const colors = {
            '#FF6B9D': '#E63384',
            '#4ECDC4': '#2BA3A1',
            '#FFE66D': '#FFC93C',
            '#A78BFA': '#8B5CF6',
            '#81C784': '#66BB6A',
            '#64B5F6': '#2196F3'
        };
        return colors[color] || color;
    }

    // Format last seen
    formatLastSeen(lastSeen) {
        if (!lastSeen) return 'Just now';

        const date = new Date(lastSeen);
        const now = new Date();
        const secondsAgo = Math.floor((now - date) / 1000);

        if (secondsAgo < 60) return 'Just now';
        if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
        if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;

        return date.toLocaleDateString();
    }

    // Escape HTML
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show/hide loading state
    setLoading(isLoading) {
        const messages = document.getElementById('messagesContainer');
        if (!messages) return;

        if (isLoading) {
            messages.style.opacity = '0.6';
            messages.style.pointerEvents = 'none';
        } else {
            messages.style.opacity = '1';
            messages.style.pointerEvents = 'auto';
        }
    }

    // Get settings
    getSettings() {
        return { ...this.settings };
    }
}

// Initialize UI manager
const uiManager = new UIManager();

// ============================================
// MODAL FUNCTIONS
// ============================================

function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal && e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

function showNotification(message, type = 'info', duration = 5000) {
    const toast = document.getElementById('notificationToast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `notification-toast ${type}`;
    toast.classList.remove('hidden');

    // Play sound if enabled
    if (uiManager.settings.soundEnabled && type !== 'info') {
        playNotificationSound();
    }

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

function playNotificationSound() {
    // Simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Could not play notification sound');
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function addDoodleAnimation(element) {
    const doodleClass = ['doodle-bounce', 'doodle-pulse', 'floating'][Math.floor(Math.random() * 3)];
    element.classList.add(doodleClass);
}

function removeDoodleAnimation(element) {
    element.classList.remove('doodle-bounce', 'doodle-pulse', 'floating');
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Send desktop notification
function sendDesktopNotification(title, options = {}) {
    if (!uiManager.settings.notificationsEnabled) return;

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '💬',
            badge: '🎨',
            ...options
        });
    }
}

// Initialize notifications
document.addEventListener('DOMContentLoaded', () => {
    requestNotificationPermission();
});
