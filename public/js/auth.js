/* ============================================
   CHIT-CHAT - AUTHENTICATION MODULE
   ============================================ */

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.loadUserData();
    }

    // Load user data from localStorage
    loadUserData() {
        const savedToken = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_TOKEN);
        const savedUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_DATA);

        if (savedToken && savedUser) {
            this.token = savedToken;
            this.currentUser = JSON.parse(savedUser);
            return true;
        }
        return false;
    }

    // Save user data to localStorage
    saveUserData(user, token) {
        this.currentUser = user;
        this.token = token;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    }

    // Clear user data from localStorage
    clearUserData() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_DATA);
    }

    // Register new user
    async register(username, email, password, confirmPassword) {
        // Validate inputs
        if (!this.validateInput(username, email, password)) {
            return { success: false, error: 'Invalid input' };
        }

        if (password !== confirmPassword) {
            return { success: false, error: 'Passwords do not match' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        try {
            const response = await fetch(`${CONFIG.SERVER_URL}${CONFIG.API_BASE}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim(),
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Registration failed' };
            }

            this.saveUserData(data.user, data.token);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    // Login user
    async login(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username and password required' };
        }

        try {
            const response = await fetch(`${CONFIG.SERVER_URL}${CONFIG.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username.trim(),
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            this.saveUserData(data.user, data.token);
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        }
    }

    // Logout user
    logout() {
        this.clearUserData();
        return true;
    }

    // Validate input
    validateInput(username, email, password) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

        if (!username || !usernameRegex.test(username)) {
            return false;
        }

        if (email && !emailRegex.test(email)) {
            return false;
        }

        if (!password || password.length < 6) {
            return false;
        }

        return true;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.token !== null && this.currentUser !== null;
    }

    // Get user initials
    getUserInitials() {
        if (!this.currentUser) return 'U';
        return this.currentUser.username
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    // Get user avatar color
    getUserAvatarColor() {
        if (!this.currentUser) return '#FF6B9D';
        const colors = ['#FF6B9D', '#4ECDC4', '#FFE66D', '#A78BFA', '#81C784', '#64B5F6'];
        const index = this.currentUser.username.charCodeAt(0) % colors.length;
        return colors[index];
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// ============================================
// DOM EVENT HANDLERS
// ============================================

function switchAuthForm(e) {
    e.preventDefault();
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.classList.toggle('active-form');
    registerForm.classList.toggle('active-form');

    // Clear form fields
    document.getElementById('loginFormElement').reset();
    document.getElementById('registerFormElement').reset();
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const result = await authManager.login(username, password);

    if (result.success) {
        showNotification('Login successful! 🎉', 'success');
        setTimeout(() => showChatSection(), 500);
    } else {
        showNotification(result.error, 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    const result = await authManager.register(username, email, password, confirmPassword);

    if (result.success) {
        showNotification('Registration successful! Welcome! 🎉', 'success');
        setTimeout(() => showChatSection(), 500);
    } else {
        showNotification(result.error, 'error');
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        authManager.logout();
        showNotification('Logged out successfully 👋', 'success');
        setTimeout(() => showAuthSection(), 500);
    }
}

// ============================================
// UI STATE MANAGEMENT
// ============================================

function showChatSection() {
    const authSection = document.getElementById('authSection');
    const chatSection = document.getElementById('chatSection');

    authSection.classList.add('hidden');
    chatSection.classList.remove('hidden');

    // Initialize user profile
    initializeUserProfile();

    // Emit user connected event
    if (window.socket) {
        window.socket.emit('user:connect', {
            userId: authManager.getCurrentUser().id,
            username: authManager.getCurrentUser().username
        });
    }
}

function showAuthSection() {
    const authSection = document.getElementById('authSection');
    const chatSection = document.getElementById('chatSection');

    authSection.classList.remove('hidden');
    chatSection.classList.add('hidden');
}

function initializeUserProfile() {
    const user = authManager.getCurrentUser();
    const usernameElement = document.getElementById('currentUsername');
    const avatarElement = document.getElementById('avatarInitials');

    if (usernameElement) {
        usernameElement.textContent = user.username;
    }
    if (avatarElement) {
        avatarElement.textContent = authManager.getUserInitials();
    }
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Attach event listeners
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const logoutBtn = document.getElementById('logoutBtn');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Check if user is already logged in
    if (authManager.isAuthenticated()) {
        showChatSection();
    } else {
        showAuthSection();
    }
});
