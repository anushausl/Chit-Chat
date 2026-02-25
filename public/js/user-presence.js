/* ============================================
   USER PRESENCE & STATUS INDICATORS
   ============================================ */

class UserPresenceManager {
    constructor() {
        this.userPresence = new Map(); // userId -> { status, lastSeen, isTyping }
        this.statusUpdateTimeout = new Map();
    }

    // Update user presence
    updateUserPresence(userId, status, lastSeen = new Date()) {
        this.userPresence.set(userId, {
            status: status,
            lastSeen: lastSeen,
            isTyping: false
        });

        // Update visual indicators
        this.updatePresenceVisuals(userId);

        // Auto-set offline after inactivity
        if (this.statusUpdateTimeout.has(userId)) {
            clearTimeout(this.statusUpdateTimeout.get(userId));
        }

        if (status === 'online') {
            const timeout = setTimeout(() => {
                this.updateUserPresence(userId, 'away');
            }, 5 * 60 * 1000); // 5 minutes

            this.statusUpdateTimeout.set(userId, timeout);
        }
    }

    // Set user as typing
    setUserTyping(userId, isTyping = true) {
        const presence = this.userPresence.get(userId);
        if (presence) {
            presence.isTyping = isTyping;
            this.updatePresenceVisuals(userId);
        }
    }

    // Update presence visuals
    updatePresenceVisuals(userId) {
        const userItem = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userItem) return;

        const presence = this.userPresence.get(userId);
        if (!presence) return;

        // Update status indicator
        const indicator = userItem.querySelector('.status-indicator');
        if (indicator) {
            indicator.classList.remove('online', 'away', 'offline');
            indicator.classList.add(presence.status);
        }

        // Update status text
        const statusText = userItem.querySelector('.user-item-status');
        if (statusText) {
            if (presence.isTyping) {
                statusText.innerHTML = '<span class="typing-indicator"><span></span><span></span><span></span></span>';
            } else if (presence.status === 'online') {
                statusText.textContent = 'Online';
            } else if (presence.status === 'away') {
                statusText.textContent = 'Away';
            } else {
                const lastSeen = new Date(presence.lastSeen);
                statusText.textContent = this.formatLastSeen(lastSeen);
            }
        }
    }

    // Format last seen time
    formatLastSeen(lastSeen) {
        const now = new Date();
        const diff = now - lastSeen;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return lastSeen.toLocaleDateString();
    }

    // Get user presence
    getUserPresence(userId) {
        return this.userPresence.get(userId) || {
            status: 'offline',
            lastSeen: new Date(),
            isTyping: false
        };
    }

    // Get presence statistics
    getPresenceStats() {
        const stats = {
            online: 0,
            away: 0,
            offline: 0,
            typing: 0
        };

        this.userPresence.forEach(presence => {
            stats[presence.status]++;
            if (presence.isTyping) stats.typing++;
        });

        return stats;
    }

    // Create presence badge for user
    createPresenceBadge(userId) {
        const presence = this.getUserPresence(userId);
        
        const badge = document.createElement('div');
        badge.className = `presence-badge ${presence.status}`;
        badge.title = presence.status.charAt(0).toUpperCase() + presence.status.slice(1);

        if (presence.status === 'online') {
            badge.innerHTML = '<span class="pulse-ring"></span>';
        } else if (presence.status === 'away') {
            badge.innerHTML = '⚪';
        } else {
            badge.innerHTML = '⚫';
        }

        return badge;
    }
}

// Initialize presence manager
const userPresenceManager = new UserPresenceManager();

// ============================================
// USER LIST ENHANCEMENTS
// ============================================

class EnhancedUserList {
    constructor() {
        this.filters = {
            online: true,
            away: true,
            offline: false
        };
        this.sortBy = 'name'; // name, status, activity
    }

    // Apply filters
    applyFilters(users) {
        return users.filter(user => {
            const presence = userPresenceManager.getUserPresence(user.id);
            return this.filters[presence.status] !== false;
        });
    }

    // Sort users
    sortUsers(users) {
        const sorted = [...users];

        switch (this.sortBy) {
            case 'status':
                sorted.sort((a, b) => {
                    const statusOrder = { online: 0, away: 1, offline: 2 };
                    const aStatus = userPresenceManager.getUserPresence(a.id).status;
                    const bStatus = userPresenceManager.getUserPresence(b.id).status;
                    return statusOrder[aStatus] - statusOrder[bStatus];
                });
                break;

            case 'activity':
                sorted.sort((a, b) => {
                    const aLastSeen = userPresenceManager.getUserPresence(a.id).lastSeen;
                    const bLastSeen = userPresenceManager.getUserPresence(b.id).lastSeen;
                    return new Date(bLastSeen) - new Date(aLastSeen);
                });
                break;

            default: // name
                sorted.sort((a, b) => a.username.localeCompare(b.username));
        }

        return sorted;
    }

    // Get filtered and sorted users
    getFilteredUsers(users) {
        return this.sortUsers(this.applyFilters(users));
    }

    // Toggle filter
    toggleFilter(status) {
        this.filters[status] = !this.filters[status];
    }

    // Set sort order
    setSortBy(sortBy) {
        this.sortBy = sortBy;
    }

    // Group users by status
    groupByStatus(users) {
        const groups = {
            online: [],
            away: [],
            offline: []
        };

        users.forEach(user => {
            const presence = userPresenceManager.getUserPresence(user.id);
            groups[presence.status].push(user);
        });

        return groups;
    }

    // Create user list with grouping
    renderGroupedUserList(users) {
        const groups = this.groupByStatus(users);
        const container = document.getElementById('usersList');

        if (!container) return;

        container.innerHTML = '';

        Object.entries(groups).forEach(([status, groupUsers]) => {
            if (groupUsers.length === 0 && status === 'offline') return;

            // Create group header
            const groupHeader = document.createElement('div');
            groupHeader.className = 'user-group-header';
            groupHeader.innerHTML = `
                <span class="group-title">${status.toUpperCase()} (${groupUsers.length})</span>
                <span class="group-indicator status-indicator ${status}"></span>
            `;
            container.appendChild(groupHeader);

            // Add group users
            groupUsers.forEach(user => {
                const userElement = uiManager.createUserElement(user);
                userElement.setAttribute('data-user-id', user.id);
                container.appendChild(userElement);
            });
        });
    }
}

// Initialize enhanced user list
const enhancedUserList = new EnhancedUserList();

// ============================================
// USER PROFILE CARD
// ============================================

function showUserProfileCard(userId) {
    const user = chatManager.getUserById(userId);
    if (!user) return;

    const presence = userPresenceManager.getUserPresence(userId);
    const card = document.createElement('div');
    card.className = 'user-profile-card';

    const statusEmoji = presence.status === 'online' ? '🟢' : 
                       presence.status === 'away' ? '🟡' : '⚫';

    card.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar" style="background: linear-gradient(135deg, #FF6B9D, #4ECDC4);">
                ${user.username.charAt(0).toUpperCase()}${user.username.charAt(1).toUpperCase()}
            </div>
            <button class="card-close-btn" onclick="this.closest('.user-profile-card').remove()">✕</button>
        </div>
        <div class="profile-content">
            <h3>${user.username}</h3>
            <div class="profile-status">
                <span>${statusEmoji}</span>
                <span>
                    ${presence.status === 'online' ? 'Online Now' :
                      presence.status === 'away' ? 'Away' :
                      'Last seen ' + userPresenceManager.formatLastSeen(presence.lastSeen)}
                </span>
            </div>
            <div class="profile-stats">
                <div class="stat">
                    <div class="stat-label">Messages</div>
                    <div class="stat-value">${chatManager.messages.filter(m => m.senderId === userId).length}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">Joined</div>
                    <div class="stat-value">${new Date().toLocaleDateString()}</div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="chatManager.setCurrentChatUser({id: '${userId}', username: 'Test'});">
                Send Message
            </button>
        </div>
    `;

    document.body.appendChild(card);

    // Position card
    card.style.position = 'fixed';
    card.style.top = '50%';
    card.style.left = '50%';
    card.style.transform = 'translate(-50%, -50%)';
    card.style.zIndex = '1000';

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!card.contains(e.target) && !e.target.closest('.user-item')) {
            card.remove();
        }
    }, { once: true });
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add click listeners to user items for profile cards
    document.addEventListener('click', (e) => {
        const userItem = e.target.closest('.user-item');
        if (userItem && e.detail === 2) { // Double click
            const userId = userItem.getAttribute('data-user-id');
            if (userId) {
                showUserProfileCard(userId);
            }
        }
    });
});
