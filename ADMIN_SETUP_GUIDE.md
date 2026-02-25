<!-- ============================================
     ADMIN PANEL MODAL (Add this to index.html)
     ============================================ -->

<div id="adminModal" class="modal">
    <div class="modal-content admin-modal">
        <div class="modal-header">
            <h2>👮 Admin Dashboard</h2>
            <span class="close-btn" onclick="closeAdminModal()">&times;</span>
        </div>

        <div class="modal-body">
            <!-- ADMIN LOGIN SECTION -->
            <div id="adminLoginSection" class="admin-section">
                <h3>Admin Login</h3>
                <div class="form-group">
                    <input 
                        type="text" 
                        id="adminUsername" 
                        placeholder="Admin Username"
                        class="form-input"
                    >
                </div>
                <div class="form-group">
                    <input 
                        type="password" 
                        id="adminPassword" 
                        placeholder="Admin Password"
                        class="form-input"
                    >
                </div>
                <button onclick="adminLogin()" class="btn btn-primary">
                    Login as Admin
                </button>
                <div id="adminLoginError" class="error-msg"></div>
            </div>

            <!-- ADMIN DASHBOARD (after login) -->
            <div id="adminDashboardSection" style="display: none;">
                <div class="admin-tabs">
                    <button class="admin-tab active" onclick="switchAdminTab('dashboard')">
                        Dashboard
                    </button>
                    <button class="admin-tab" onclick="switchAdminTab('users')">
                        Users
                    </button>
                    <button class="admin-tab" onclick="switchAdminTab('messages')">
                        Messages
                    </button>
                    <button class="admin-tab" onclick="switchAdminTab('tools')">
                        Tools
                    </button>
                </div>

                <!-- DASHBOARD TAB -->
                <div id="dashboardTab" class="admin-tab-content">
                    <h3>Dashboard Stats</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="totalUsersCount">0</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="onlineUsersCount">0</div>
                            <div class="stat-label">Online Now</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="totalMessagesCount">0</div>
                            <div class="stat-label">Total Messages</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="blockedUsersCount">0</div>
                            <div class="stat-label">Blocked Users</div>
                        </div>
                    </div>

                    <h4>Recent Actions</h4>
                    <div id="recentActionsList" class="actions-list"></div>

                    <button onclick="loadDashboard()" class="btn btn-small">
                        Refresh Stats
                    </button>
                </div>

                <!-- USERS TAB -->
                <div id="usersTab" class="admin-tab-content" style="display: none;">
                    <h3>User Management</h3>
                    <div class="search-bar">
                        <input 
                            type="text" 
                            id="userSearchInput" 
                            placeholder="Search users..."
                            onkeyup="filterUsersList()"
                            class="form-input"
                        >
                    </div>

                    <div id="usersList" class="users-list"></div>

                    <button onclick="loadAllUsers()" class="btn btn-small">
                        Refresh Users
                    </button>
                </div>

                <!-- MESSAGES TAB -->
                <div id="messagesTab" class="admin-tab-content" style="display: none;">
                    <h3>Message Monitoring</h3>

                    <div style="margin-bottom: 15px;">
                        <label>Filter by user:</label>
                        <input 
                            type="text" 
                            id="messageUserFilter" 
                            placeholder="Username or ID"
                            class="form-input"
                        >
                        <button onclick="loadMessages()" class="btn btn-small">
                            Load Messages
                        </button>
                    </div>

                    <h4>Flagged Messages</h4>
                    <button onclick="loadFlaggedMessages()" class="btn btn-small">
                        View Flagged
                    </button>

                    <div id="messagesList" class="messages-list"></div>
                </div>

                <!-- TOOLS TAB -->
                <div id="toolsTab" class="admin-tab-content" style="display: none;">
                    <h3>Admin Tools</h3>

                    <div class="tool-section">
                        <h4>🔊 Broadcast Message</h4>
                        <textarea 
                            id="broadcastMessage" 
                            placeholder="Important message to send to all users..."
                            class="form-input"
                            style="height: 80px;"
                        ></textarea>
                        <select id="broadcastType" class="form-input">
                            <option value="info">Info</option>
                            <option value="warning">Warning</option>
                            <option value="error">Error</option>
                        </select>
                        <button onclick="sendBroadcast()" class="btn btn-primary full-width">
                            Send to All Users
                        </button>
                    </div>

                    <div class="tool-section">
                        <h4>📋 View Audit Log</h4>
                        <button onclick="loadAuditLog()" class="btn btn-primary full-width">
                            Load Audit Log
                        </button>
                        <div id="auditLogList" class="audit-log"></div>
                    </div>

                    <div class="tool-section">
                        <button onclick="adminLogout()" class="btn btn-danger full-width">
                            Logout Admin
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ============================================
     ADMIN STYLES (Add to main.css)
     ============================================ -->

<style>
.admin-modal {
    max-width: 800px !important;
}

.admin-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
    overflow-x: auto;
}

.admin-tab {
    padding: 10px 15px;
    background: transparent;
    border: none;
    color: var(--text-color);
    cursor: pointer;
    border-bottom: 3px solid transparent;
    transition: all 0.3s ease;
    white-space: nowrap;
}

.admin-tab:hover {
    background: var(--bg-hover);
}

.admin-tab.active {
    border-bottom-color: var(--primary-color);
    color: var(--primary-color);
}

.admin-tab-content {
    animation: fadeIn 0.3s ease;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.stat-card {
    background: var(--bg-hover);
    padding: 15px;
    border-radius: 8px;
    text-align: center;
    border-left: 4px solid var(--primary-color);
}

.stat-value {
    font-size: 2em;
    font-weight: bold;
    color: var(--primary-color);
    margin: 10px 0;
}

.stat-label {
    font-size: 0.8em;
    color: var(--text-muted);
}

.users-list,
.messages-list,
.actions-list,
.audit-log {
    background: var(--bg-hover);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    max-height: 400px;
    overflow-y: auto;
}

.user-item,
.message-item,
.action-item,
.audit-item {
    padding: 10px;
    margin-bottom: 10px;
    border-left: 4px solid var(--secondary-color);
    border-radius: 4px;
    background: var(--background);
}

.user-item {
    border-left-color: var(--success-color);
}

.user-item.blocked {
    border-left-color: var(--danger-color);
    opacity: 0.7;
}

.tool-section {
    margin-bottom: 20px;
    padding: 15px;
    background: var(--bg-hover);
    border-radius: 8px;
}

.full-width {
    width: 100%;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
</style>

<!-- ============================================
     ADMIN JAVASCRIPT (Add to public/js/)
     ============================================ -->

<!-- Include in HTML before closing body tag: -->
<!-- <script src="/js/admin-ui.js"></script> -->

<!-- JavaScript Code (admin-ui.js): -->
/*
let currentAdminToken = null;

async function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!data.success) {
            document.getElementById('adminLoginError').innerText = data.error;
            return;
        }

        currentAdminToken = data.adminToken;
        localStorage.setItem('adminToken', currentAdminToken);

        // Hide login, show dashboard
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'block';

        loadDashboard();
    } catch (error) {
        console.error('Login failed:', error);
        document.getElementById('adminLoginError').innerText = 'Connection error';
    }
}

async function loadDashboard() {
    try {
        const response = await fetch('/api/admin/dashboard', {
            headers: { 'x-admin-token': currentAdminToken }
        });

        const data = await response.json();
        const dashboard = data.dashboard;

        document.getElementById('totalUsersCount').innerText = dashboard.totalUsers;
        document.getElementById('onlineUsersCount').innerText = dashboard.onlineUsers;
        document.getElementById('totalMessagesCount').innerText = dashboard.totalMessages;
        document.getElementById('blockedUsersCount').innerText = dashboard.blockedUsers;

        // Display recent actions
        let html = '';
        dashboard.recentActions.forEach(action => {
            html += `<div class="action-item">${action.action} - ${new Date(action.timestamp).toLocaleTimeString()}</div>`;
        });
        document.getElementById('recentActionsList').innerHTML = html;
    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

async function loadAllUsers() {
    try {
        const response = await fetch('/api/admin/users', {
            headers: { 'x-admin-token': currentAdminToken }
        });

        const data = await response.json();
        let html = '';

        data.users.forEach(user => {
            const blocked = user.isBlocked ? ' (BLOCKED)' : '';
            const status = user.isOnline ? '🟢' : '⚪';
            html += `
                <div class="user-item ${user.isBlocked ? 'blocked' : ''}">
                    <strong>${status} ${user.username}${blocked}</strong><br>
                    Messages: ${user.messageCount} | Last seen: ${new Date(user.lastSeen).toLocaleTimeString()}
                    <br>
                    <button onclick="blockUser('${user.id}')" class="btn btn-small">Block</button>
                    <button onclick="warnUser('${user.id}')" class="btn btn-small">Warn</button>
                </div>
            `;
        });

        document.getElementById('usersList').innerHTML = html;
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

async function blockUser(userId) {
    const reason = prompt('Reason for blocking:');
    if (!reason) return;

    try {
        await fetch(`/api/admin/users/${userId}/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': currentAdminToken
            },
            body: JSON.stringify({ reason })
        });

        alert('User blocked successfully');
        loadAllUsers();
    } catch (error) {
        console.error('Failed to block user:', error);
    }
}

async function warnUser(userId) {
    const reason = prompt('Warning message:');
    if (!reason) return;

    try {
        await fetch(`/api/admin/users/${userId}/warn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': currentAdminToken
            },
            body: JSON.stringify({ reason })
        });

        alert('User warned successfully');
    } catch (error) {
        console.error('Failed to warn user:', error);
    }
}

async function loadMessages() {
    try {
        const response = await fetch('/api/admin/messages', {
            headers: { 'x-admin-token': currentAdminToken }
        });

        const data = await response.json();
        let html = '';

        data.messages.slice(0, 20).forEach(msg => {
            html += `
                <div class="message-item">
                    <strong>${msg.senderUsername}:</strong> ${msg.content}
                    <br><small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
                    <br>
                    <button onclick="flagMessage('${msg.id}')" class="btn btn-small">Flag</button>
                    <button onclick="deleteMessage('${msg.id}')" class="btn btn-small">Delete</button>
                </div>
            `;
        });

        document.getElementById('messagesList').innerHTML = html;
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

async function deleteMessage(messageId) {
    if (!confirm('Delete this message?')) return;

    try {
        await fetch(`/api/admin/messages/${messageId}`, {
            method: 'DELETE',
            headers: { 'x-admin-token': currentAdminToken }
        });

        alert('Message deleted');
        loadMessages();
    } catch (error) {
        console.error('Failed to delete message:', error);
    }
}

async function sendBroadcast() {
    const message = document.getElementById('broadcastMessage').value;
    const type = document.getElementById('broadcastType').value;

    if (!message) {
        alert('Enter a message');
        return;
    }

    try {
        await fetch('/api/admin/broadcast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': currentAdminToken
            },
            body: JSON.stringify({ message, type })
        });

        alert('Broadcast sent!');
        document.getElementById('broadcastMessage').value = '';
    } catch (error) {
        console.error('Failed to send broadcast:', error);
    }
}

async function loadAuditLog() {
    try {
        const response = await fetch('/api/admin/audit-log', {
            headers: { 'x-admin-token': currentAdminToken }
        });

        const data = await response.json();
        let html = '';

        data.auditLog.forEach(entry => {
            html += `<div class="audit-item"><strong>${entry.action}</strong> - ${new Date(entry.timestamp).toLocaleTimeString()}</div>`;
        });

        document.getElementById('auditLogList').innerHTML = html;
    } catch (error) {
        console.error('Failed to load audit log:', error);
    }
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelectorAll('.admin-tab').forEach(el => {
        el.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').style.display = 'block';
    event.target.classList.add('active');
}

function adminLogout() {
    currentAdminToken = null;
    localStorage.removeItem('adminToken');
    document.getElementById('adminLoginSection').style.display = 'block';
    document.getElementById('adminDashboardSection').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

// Restore session on page load
window.addEventListener('load', () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        currentAdminToken = token;
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboardSection').style.display = 'block';
        loadDashboard();
    }
});
*/
