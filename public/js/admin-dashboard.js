/* ============================================
   ADMIN DASHBOARD - CLIENT-SIDE
   ============================================ */

class AdminDashboard {
    constructor() {
        this.adminToken = null;
        this.currentUser = null;
        this.users = [];
        this.messages = [];
        this.auditLog = [];
        this.API_BASE = CONFIG.API_BASE; // Use /api (relative path)
    }

    // ============================================
    // ADMIN LOGIN
    // ============================================
    async login(username, password) {
        try {
            const url = `${this.API_BASE}/admin/login`;
            console.log('🔐 Attempting login at:', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.adminToken = data.adminToken;
            this.currentUser = data.admin;
            localStorage.setItem('adminToken', this.adminToken);

            console.log('✅ Admin logged in:', data.admin);
            return data;
        } catch (error) {
            console.error('❌ Admin login failed:', error);
            throw error;
        }
    }

    // ============================================
    // LOAD DASHBOARD DATA
    // ============================================
    async loadDashboard() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/dashboard`, {
                headers: { 'x-admin-token': this.adminToken }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            return data.dashboard || data;
        } catch (error) {
            console.error('❌ Failed to load dashboard:', error);
            throw error;
        }
    }

    // ============================================
    // GET ALL USERS
    // ============================================
    async getAllUsers() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/users`, {
                headers: { 'x-admin-token': this.adminToken }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.users = data.users;
            console.log(`📊 Loaded ${data.users.length} users`);
            return data;
        } catch (error) {
            console.error('❌ Failed to load users:', error);
            throw error;
        }
    }

    // ============================================
    // GET SPECIFIC USER DETAILS
    // ============================================
    async getUserDetails(userId) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/users/${userId}`, {
                headers: { 'x-admin-token': this.adminToken }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            console.error(`❌ Failed to load user ${userId}:`, error);
            throw error;
        }
    }

    // ============================================
    // GET ALL MESSAGES
    // ============================================
    async getAllMessages(limit = 100) {
        try {
            const response = await fetch(
                `${this.API_BASE}/admin/messages?limit=${limit}`,
                { headers: { 'x-admin-token': this.adminToken } }
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.messages = data.messages;
            console.log(`💬 Loaded ${data.messages.length} messages`);
            return data;
        } catch (error) {
            console.error('❌ Failed to load messages:', error);
            throw error;
        }
    }

    // ============================================
    // BLOCK USER
    // ============================================
    async blockUser(userId, reason) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/users/${userId}/block`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-token': this.adminToken },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`⛔ User ${userId} blocked:`, reason);
            return data;
        } catch (error) {
            console.error('❌ Failed to block user:', error);
            throw error;
        }
    }

    // ============================================
    // UNBLOCK USER
    // ============================================
    async unblockUser(userId) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/users/${userId}/unblock`, {
                method: 'POST',
                headers: { 'x-admin-token': this.adminToken }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`✅ User ${userId} unblocked`);
            return data;
        } catch (error) {
            console.error('❌ Failed to unblock user:', error);
            throw error;
        }
    }

    // ============================================
    // DELETE MESSAGE
    // ============================================
    async deleteMessage(messageId, reason) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/messages/${messageId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'x-admin-token': this.adminToken },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`🗑️ Message ${messageId} deleted:`, reason);
            return data;
        } catch (error) {
            console.error('❌ Failed to delete message:', error);
            throw error;
        }
    }

    // ============================================
    // WARN USER
    // ============================================
    async warnUser(userId, reason) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/users/${userId}/warn`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-token': this.adminToken },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`⚠️ User ${userId} warned:`, reason);
            return data;
        } catch (error) {
            console.error('❌ Failed to warn user:', error);
            throw error;
        }
    }

    // ============================================
    // FLAG MESSAGE
    // ============================================
    async flagMessage(messageId, reason) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/messages/${messageId}/flag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-token': this.adminToken },
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`🚩 Message flagged:`, reason);
            return data;
        } catch (error) {
            console.error('❌ Failed to flag message:', error);
            throw error;
        }
    }

    // ============================================
    // GET FLAGGED MESSAGES
    // ============================================
    async getFlaggedMessages() {
        try {
            const response = await fetch(`${this.API_BASE}/admin/flagged-messages`, {
                headers: { 'x-admin-token': this.adminToken }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`🚩 Found ${data.flaggedMessages.length} flagged messages`);
            return data;
        } catch (error) {
            console.error('❌ Failed to load flagged messages:', error);
            throw error;
        }
    }

    // ============================================
    // GET AUDIT LOG
    // ============================================
    async getAuditLog(limit = 100) {
        try {
            const response = await fetch(
                `${this.API_BASE}/admin/audit-log?limit=${limit}`,
                { headers: { 'x-admin-token': this.adminToken } }
            );

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            this.auditLog = data.auditLog;
            console.log(`📋 Loaded ${data.auditLog.length} audit entries`);
            return data;
        } catch (error) {
            console.error('❌ Failed to load audit log:', error);
            throw error;
        }
    }

    // ============================================
    // BROADCAST MESSAGE TO ALL USERS
    // ============================================
    async broadcast(message, type = 'info') {
        try {
            const response = await fetch(`${this.API_BASE}/admin/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-admin-token': this.adminToken },
                body: JSON.stringify({ message, type })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            console.log(`📢 Broadcast sent to ${data.recipientCount} users`);
            return data;
        } catch (error) {
            console.error('❌ Failed to broadcast:', error);
            throw error;
        }
    }

    // ============================================
    // GET USER ACTIVITY TIMELINE
    // ============================================
    async getUserActivity(userId) {
        try {
            const response = await fetch(`${this.API_BASE}/admin/users/${userId}/activity`, {
                headers: { 'x-admin-token': this.adminToken }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            console.error('❌ Failed to load user activity:', error);
            throw error;
        }
    }

    // ============================================
    // RESTORE ADMIN TOKEN FROM STORAGE
    // ============================================
    restoreSession() {
        const token = localStorage.getItem('adminToken');
        if (token) {
            this.adminToken = token;
            console.log('✅ Admin session restored');
            return true;
        }
        return false;
    }

    // ============================================
    // LOGOUT
    // ============================================
    logout() {
        this.adminToken = null;
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        console.log('✅ Admin logged out');
    }

    // ============================================
    // HELPER: FORMAT USER STATUS
    // ============================================
    formatUserStatus(user) {
        if (user.isBlocked) {
            return `🚫 BLOCKED (${user.blockedReason})`;
        }
        return user.isOnline ? '🟢 ONLINE' : '⚪ OFFLINE';
    }

    // ============================================
    // HELPER: FORMAT ACTION
    // ============================================
    formatAction(action) {
        const actionMap = {
            'ADMIN_LOGIN': '🔑 Admin Login',
            'USER_BLOCKED': '⛔ User Blocked',
            'USER_UNBLOCKED': '✅ User Unblocked',
            'MESSAGE_DELETED': '🗑️ Message Deleted',
            'USER_WARNING': '⚠️ User Warning',
            'MESSAGE_FLAGGED': '🚩 Message Flagged',
            'BROADCAST_MESSAGE': '📢 Broadcast Sent'
        };
        return actionMap[action] || action;
    }
}

// Initialize admin dashboard
const adminDashboard = new AdminDashboard();

// Auto-restore session on page load
if (localStorage.getItem('adminToken')) {
    if (adminDashboard.restoreSession()) {
        // show dashboard immediately when token exists
        try { switchAdminTab('dashboard'); } catch (e) { /* ignore */ }
    }
}

/* ============================================
   UI FUNCTIONS FOR ADMIN PANEL
   ============================================ */

// Open admin panel
function openAdminPanel() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Close admin panel
function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Admin login UI function
async function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('adminLoginError');

    if (!username || !password) {
        errorDiv.textContent = 'Please enter admin credentials';
        return;
    }

    try {
        await adminDashboard.login(username, password);
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'block';
        errorDiv.textContent = '';
        loadDashboard();
    } catch (error) {
        errorDiv.textContent = '❌ ' + error.message;
    }
}

// Load dashboard stats
async function loadDashboard() {
    try {
        const data = await adminDashboard.loadDashboard();
        document.getElementById('totalUsersCount').textContent = data.totalUsers;
        document.getElementById('onlineUsersCount').textContent = data.onlineUsers;
        document.getElementById('totalMessagesCount').textContent = data.totalMessages;
        document.getElementById('blockedUsersCount').textContent = data.blockedUsers;
        
        const actionsList = document.getElementById('recentActionsList');
        actionsList.innerHTML = data.recentActions.map(action => 
            `<div class="action-item">${adminDashboard.formatAction(action.action)} - ${action.timestamp}</div>`
        ).join('');
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

// Load all users
async function loadAllUsers() {
    try {
        const users = await adminDashboard.getAllUsers();
        adminDashboard.users = users;
        renderUsersList(users);
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

// Render users list
function renderUsersList(users) {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = users.map(user => `
        <div class="user-item ${user.isBlocked ? 'blocked' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${user.username}</strong>
                    <div style="font-size: 0.8em; color: #888;">${adminDashboard.formatUserStatus(user)}</div>
                    <div style="font-size: 0.8em; color: #888;">Messages: ${user.messageCount}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    ${user.isBlocked ? 
                        `<button class="btn btn-success" onclick="unblockUser('${user.id}')">Unblock</button>` :
                        `<button class="btn btn-danger" onclick="blockUserUI('${user.id}', '${user.username}')">Block</button>`
                    }
                    <button class="btn btn-small" onclick="warnUserUI('${user.id}', '${user.username}')">Warn</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter users list
function filterUsersList() {
    const searchInput = document.getElementById('userSearchInput').value.toLowerCase();
    const filtered = adminDashboard.users.filter(u => u.username.toLowerCase().includes(searchInput));
    renderUsersList(filtered);
}

// Block user UI
async function blockUserUI(userId, username) {
    const reason = prompt(`Block user "${username}"? Enter reason:`, 'Violation of rules');
    if (reason === null) return;
    
    try {
        await adminDashboard.blockUser(userId, reason);
        alert('✅ User blocked successfully');
        loadAllUsers();
    } catch (error) {
        alert('❌ Failed to block user: ' + error.message);
    }
}

// Unblock user
async function unblockUser(userId) {
    try {
        await adminDashboard.unblockUser(userId);
        alert('✅ User unblocked successfully');
        loadAllUsers();
    } catch (error) {
        alert('❌ Failed to unblock user: ' + error.message);
    }
}

// Warn user UI
async function warnUserUI(userId, username) {
    const reason = prompt(`Warn user "${username}"? Enter reason:`, 'Please follow community guidelines');
    if (reason === null) return;
    
    try {
        await adminDashboard.warnUser(userId, reason);
        alert('✅ User warned successfully');
    } catch (error) {
        alert('❌ Failed to warn user: ' + error.message);
    }
}

// Load messages
async function loadMessages() {
    try {
        const messages = await adminDashboard.getAllMessages(50);
        adminDashboard.messages = messages;
        renderMessagesList(messages);
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Render messages list
function renderMessagesList(messages) {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = messages.map(msg => `
        <div class="message-item">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <strong>${msg.senderUsername}</strong>: ${msg.content.substring(0, 50)}...
                    <div style="font-size: 0.8em; color: #888;">${msg.timestamp}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-small" onclick="flagMessageUI('${msg.id}')">Flag</button>
                    <button class="btn btn-danger" onclick="deleteMessageUI('${msg.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Flag message UI
async function flagMessageUI(messageId) {
    const reason = prompt('Enter reason for flagging:', 'Suspicious content');
    if (reason === null) return;
    
    try {
        await adminDashboard.flagMessage(messageId, reason);
        alert('✅ Message flagged successfully');
        loadMessages();
    } catch (error) {
        alert('❌ Failed to flag message: ' + error.message);
    }
}

// Delete message UI
async function deleteMessageUI(messageId) {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
        await adminDashboard.deleteMessage(messageId, 'Admin deletion');
        alert('✅ Message deleted successfully');
        loadMessages();
    } catch (error) {
        alert('❌ Failed to delete message: ' + error.message);
    }
}

// Load flagged messages
async function loadFlaggedMessages() {
    try {
        const flagged = await adminDashboard.getFlaggedMessages();
        document.getElementById('messagesList').innerHTML = flagged.map(msg => `
            <div class="message-item">
                <div>
                    <strong>${msg.senderUsername}</strong>: ${msg.content}
                    <div style="font-size: 0.8em; color: #888;">Reason: ${msg.flagReason}</div>
                    <div style="font-size: 0.8em; color: #888;">${msg.timestamp}</div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button class="btn btn-danger" onclick="deleteMessageUI('${msg.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load flagged messages:', error);
    }
}

// Send broadcast
async function sendBroadcast() {
    const message = document.getElementById('broadcastMessage').value;
    const type = document.getElementById('broadcastType').value;
    
    if (!message) {
        alert('Please enter a message');
        return;
    }
    
    try {
        await adminDashboard.broadcast(message, type);
        alert('✅ Broadcast sent to all users');
        document.getElementById('broadcastMessage').value = '';
    } catch (error) {
        alert('❌ Failed to send broadcast: ' + error.message);
    }
}

// Load audit log
async function loadAuditLog() {
    try {
        const log = await adminDashboard.getAuditLog(100);
        document.getElementById('auditLogList').innerHTML = log.map(entry => `
            <div class="audit-item">
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <strong>${adminDashboard.formatAction(entry.action)}</strong>
                        <div style="font-size: 0.8em; color: #888;">
                            ${entry.details || ''}
                        </div>
                    </div>
                    <div style="font-size: 0.8em; color: #888;">${entry.timestamp}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load audit log:', error);
    }
}

// Switch admin tabs
function switchAdminTab(tabName) {
    // Hide all admin panels
    document.querySelectorAll('.admin-panel').forEach(panel => panel.style.display = 'none');

    // Remove active class from all buttons and set active on matching
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset && btn.dataset.tab === tabName) btn.classList.add('active');
    });

    // Map tabName to panel ID
    switch (tabName) {
        case 'login':
            document.getElementById('adminLoginSection').style.display = 'block';
            break;
        case 'dashboard':
            document.getElementById('adminDashboardSection').style.display = 'block';
            loadDashboard();
            break;
        case 'users':
            document.getElementById('usersTab').style.display = 'block';
            loadAllUsers();
            break;
        case 'messages':
            document.getElementById('messagesTab').style.display = 'block';
            loadMessages();
            break;
        case 'tools':
            document.getElementById('toolsTab').style.display = 'block';
            loadAuditLog();
            break;
        default:
            // fallback to login
            document.getElementById('adminLoginSection').style.display = 'block';
    }
}

// Admin logout
function adminLogout() {
    adminDashboard.logout();
    document.getElementById('adminLoginSection').style.display = 'block';
    document.getElementById('adminDashboardSection').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    alert('✅ Admin logged out');
}
