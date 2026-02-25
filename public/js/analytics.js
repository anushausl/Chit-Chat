/* ============================================
   CHAT STATISTICS & ANALYTICS
   ============================================ */

class ChatAnalytics {
    constructor() {
        this.stats = {
            totalMessages: 0,
            totalUsers: 0,
            messagesByUser: new Map(),
            messagesByHour: new Map(),
            messagesByDay: new Map(),
            averageMessageLength: 0,
            longestMessage: 0,
            mostActiveUser: null,
            peakHour: null,
            reactionStats: new Map(),
            mediaStats: {
                totalFiles: 0,
                imageCount: 0,
                videoCount: 0,
                audioCount: 0,
                otherCount: 0
            }
        };
    }

    // Calculate analytics
    calculate() {
        if (typeof chatManager === 'undefined') return;

        this.stats = {
            totalMessages: chatManager.messages.length,
            totalUsers: chatManager.allUsers?.length || 0,
            messagesByUser: new Map(),
            messagesByHour: new Map(),
            messagesByDay: new Map(),
            averageMessageLength: 0,
            longestMessage: 0,
            mostActiveUser: null,
            peakHour: null,
            reactionStats: new Map(),
            mediaStats: {
                totalFiles: 0,
                imageCount: 0,
                videoCount: 0,
                audioCount: 0,
                otherCount: 0
            }
        };

        let totalLength = 0;
        const reactions = new Map();

        chatManager.messages.forEach(msg => {
            // Count by user
            const count = this.stats.messagesByUser.get(msg.senderId) || 0;
            this.stats.messagesByUser.set(msg.senderId, count + 1);

            // Message length stats
            totalLength += msg.content.length;
            this.stats.longestMessage = Math.max(this.stats.longestMessage, msg.content.length);

            // By hour
            const date = new Date(msg.timestamp);
            const hour = date.getHours();
            const hourKey = `${hour}:00`;
            const hourCount = this.stats.messagesByHour.get(hourKey) || 0;
            this.stats.messagesByHour.set(hourKey, hourCount + 1);

            // By day
            const dayKey = date.toLocaleDateString();
            const dayCount = this.stats.messagesByDay.get(dayKey) || 0;
            this.stats.messagesByDay.set(dayKey, dayCount + 1);

            // Reactions
            const reactionsEl = document.querySelector(`[data-message-id="${msg.id}"] .reaction-badge`);
            if (reactionsEl) {
                const reactionCount = reactionsEl.childNodes.length;
                const existingCount = reactions.get('total') || 0;
                reactions.set('total', existingCount + reactionCount);
            }
        });

        this.stats.averageMessageLength = chatManager.messages.length > 0 
            ? Math.round(totalLength / chatManager.messages.length)
            : 0;

        // Find most active user
        let maxMessages = 0;
        this.stats.messagesByUser.forEach((count, userId) => {
            if (count > maxMessages) {
                maxMessages = count;
                this.stats.mostActiveUser = userId;
            }
        });

        // Find peak hour
        let maxHourMessages = 0;
        this.stats.messagesByHour.forEach((count, hour) => {
            if (count > maxHourMessages) {
                maxHourMessages = count;
                this.stats.peakHour = hour;
            }
        });

        this.stats.reactionStats = reactions;
        return this.stats;
    }

    // Get user stats
    getUserStats(userId) {
        const user = chatManager?.getUserById(userId);
        const messageCount = this.stats.messagesByUser.get(userId) || 0;
        const firstMessage = chatManager?.messages.find(m => m.senderId === userId);
        const lastMessage = [...chatManager?.messages|| []]
            .reverse()
            .find(m => m.senderId === userId);

        return {
            user,
            messageCount,
            firstMessage: firstMessage?.timestamp,
            lastMessage: lastMessage?.timestamp,
            averageMessagesPerDay: messageCount / (this.getDaysDelta(firstMessage?.timestamp, lastMessage?.timestamp) || 1),
            joinDate: firstMessage?.timestamp
        };
    }

    // Calculate days delta
    getDaysDelta(startDate, endDate) {
        if (!startDate || !endDate) return 1;
        return Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    }

    // Get engagement metrics
    getEngagementMetrics() {
        const totalHours = new Set(
            [...(chatManager?.messages || [])]
                .map(m => new Date(m.timestamp).toLocaleDateString())
        ).size;

        return {
            messagesPerDay: this.stats.totalMessages / Math.max(totalHours, 1),
            uniqueUsers: new Set([...(chatManager?.messages || [])].map(m => m.senderId)).size,
            totalReactions: this.stats.reactionStats.get('total') || 0,
            averageResponseTime: this.calculateAverageResponseTime(),
            peakActivityTime: this.stats.peakHour || 'N/A'
        };
    }

    // Calculate average response time
    calculateAverageResponseTime() {
        let totalResponseTime = 0;
        let responseCount = 0;

        const messages = chatManager?.messages || [];
        for (let i = 1; i < messages.length; i++) {
            if (messages[i].senderId !== messages[i - 1].senderId) {
                const timeDiff = new Date(messages[i].timestamp) - new Date(messages[i - 1].timestamp);
                totalResponseTime += timeDiff;
                responseCount++;
            }
        }

        return responseCount > 0 
            ? Math.round(totalResponseTime / responseCount / 1000) // in seconds
            : 0;
    }

    // Export stats as JSON
    exportStats() {
        return JSON.stringify(this.stats, (key, value) => {
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }
            return value;
        }, 2);
    }

    // Export stats as CSV
    exportStatsCSV() {
        const rows = [
            ['Metric', 'Value'],
            ['Total Messages', this.stats.totalMessages],
            ['Total Users', this.stats.totalUsers],
            ['Average Message Length', this.stats.averageMessageLength],
            ['Longest Message', this.stats.longestMessage],
            ['Peak Hour', this.stats.peakHour || 'N/A'],
            ['Most Active User', this.stats.mostActiveUser || 'N/A'],
            ['Total Reactions', this.stats.reactionStats.get('total') || 0]
        ];

        // Add message by user
        rows.push(['', '']);
        rows.push(['User Statistics', '']);
        this.stats.messagesByUser.forEach((count, userId) => {
            const user = chatManager?.getUserById(userId);
            rows.push([user?.username || userId, count]);
        });

        // Convert to CSV
        return rows.map(row => row.join(',')).join('\n');
    }
}

// Initialize analytics
const chatAnalytics = new ChatAnalytics();

// ============================================
// ANALYTICS DASHBOARD
// ============================================

class AnalyticsDashboard {
    constructor() {
        this.isOpen = false;
        this.dashboard = null;
    }

    // Create dashboard
    createDashboard() {
        const container = document.createElement('div');
        container.className = 'analytics-dashboard';
        container.innerHTML = `
            <div class="analytics-header">
                <h2>Chat Statistics</h2>
                <button class="btn-close-analytics" title="Close">✕</button>
            </div>

            <div class="analytics-content">
                <div class="analytics-section">
                    <h3>Overview</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">💬</div>
                            <div class="stat-value" id="stat-total-messages">0</div>
                            <div class="stat-label">Total Messages</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-value" id="stat-total-users">0</div>
                            <div class="stat-label">Active Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⏱️</div>
                            <div class="stat-value" id="stat-avg-length">0</div>
                            <div class="stat-label">Avg. Msg Length</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">⭐</div>
                            <div class="stat-value" id="stat-reactions">0</div>
                            <div class="stat-label">Total Reactions</div>
                        </div>
                    </div>
                </div>

                <div class="analytics-section">
                    <h3>Peak Activity</h3>
                    <div id="peak-hour-info" class="info-box"></div>
                </div>

                <div class="analytics-section">
                    <h3>Top Contributors</h3>
                    <div id="top-users" class="user-list"></div>
                </div>

                <div class="analytics-section">
                    <h3>Engagement</h3>
                    <div id="engagement-metrics" class="metrics-list"></div>
                </div>

                <div class="analytics-section">
                    <h3>Message Activity by Hour</h3>
                    <div id="hour-chart" class="chart-container"></div>
                </div>

                <div class="analytics-actions">
                    <button class="btn btn-secondary" id="btn-export-json">Export JSON</button>
                    <button class="btn btn-secondary" id="btn-export-csv">Export CSV</button>
                    <button class="btn btn-secondary" id="btn-refresh">Refresh</button>
                </div>
            </div>
        `;

        return container;
    }

    // Open dashboard
    open() {
        if (!this.dashboard) {
            this.dashboard = this.createDashboard();
            document.body.appendChild(this.dashboard);
            this.attachEventListeners();
        }

        this.dashboard.classList.add('active');
        this.isOpen = true;
        this.refresh();
    }

    // Close dashboard
    close() {
        if (this.dashboard) {
            this.dashboard.classList.remove('active');
            this.isOpen = false;
        }
    }

    // Toggle dashboard
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    // Refresh dashboard
    refresh() {
        const stats = chatAnalytics.calculate();
        const engagement = chatAnalytics.getEngagementMetrics();

        // Update overview
        document.getElementById('stat-total-messages').textContent = stats.totalMessages;
        document.getElementById('stat-total-users').textContent = stats.totalUsers;
        document.getElementById('stat-avg-length').textContent = stats.averageMessageLength;
        document.getElementById('stat-reactions').textContent = stats.reactionStats.get('total') || 0;

        // Update peak hour
        const peakHourInfo = document.getElementById('peak-hour-info');
        if (stats.peakHour) {
            const peakCount = stats.messagesByHour.get(stats.peakHour) || 0;
            peakHourInfo.innerHTML = `
                <div class="info-item">
                    <span class="info-label">Peak Hour:</span>
                    <span class="info-value">${stats.peakHour}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Messages:</span>
                    <span class="info-value">${peakCount}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(peakCount / Math.max(...stats.messagesByHour.values())) * 100}%"></div>
                </div>
            `;
        }

        // Update top users
        this.displayTopUsers(stats);

        // Update engagement
        this.displayEngagement(engagement);

        // Draw chart
        this.drawHourlyChart(stats);
    }

    // Display top users
    displayTopUsers(stats) {
        const container = document.getElementById('top-users');
        container.innerHTML = '';

        const sortedUsers = Array.from(stats.messagesByUser.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        sortedUsers.forEach(([userId, count], index) => {
            const user = chatManager?.getUserById(userId);
            const item = document.createElement('div');
            item.className = 'top-user-item';
            item.innerHTML = `
                <div class="rank">#${index + 1}</div>
                <div class="user-info">
                    <div class="user-name">${user?.username || 'Unknown'}</div>
                    <div class="user-messages">${count} messages</div>
                </div>
                <div class="percentage">${Math.round((count / stats.totalMessages) * 100)}%</div>
            `;
            container.appendChild(item);
        });
    }

    // Display engagement metrics
    displayEngagement(metrics) {
        const container = document.getElementById('engagement-metrics');
        container.innerHTML = `
            <div class="metric">
                <span class="metric-label">Messages per Day</span>
                <span class="metric-value">${metrics.messagesPerDay.toFixed(1)}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Unique Users</span>
                <span class="metric-value">${metrics.uniqueUsers}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Avg Response Time</span>
                <span class="metric-value">${metrics.averageResponseTime}s</span>
            </div>
            <div class="metric">
                <span class="metric-label">Peak Activity Hour</span>
                <span class="metric-value">${metrics.peakActivityTime}</span>
            </div>
        `;
    }

    // Draw hourly chart
    drawHourlyChart(stats) {
        const container = document.getElementById('hour-chart');
        container.innerHTML = '';

        const maxMessages = Math.max(...stats.messagesByHour.values(), 1);
        const hours = Array.from({length: 24}, (_, i) => `${i}:00`);

        const chart = document.createElement('div');
        chart.className = 'hour-chart';

        hours.forEach(hour => {
            const count = stats.messagesByHour.get(hour) || 0;
            const percentage = (count / maxMessages) * 100;

            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.innerHTML = `
                <div class="bar-fill" style="height: ${percentage}%" title="${hour}: ${count} messages">
                    <span class="bar-label">${count > 0 ? count : ''}</span>
                </div>
                <div class="bar-hour">${hour.split(':')[0]}</div>
            `;
            chart.appendChild(bar);
        });

        container.appendChild(chart);
    }

    // Attach event listeners
    attachEventListeners() {
        const closeBtn = this.dashboard?.querySelector('.btn-close-analytics');
        const exportJsonBtn = document.getElementById('btn-export-json');
        const exportCsvBtn = document.getElementById('btn-export-csv');
        const refreshBtn = document.getElementById('btn-refresh');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (exportJsonBtn) {
            exportJsonBtn.addEventListener('click', () => {
                const json = chatAnalytics.exportStats();
                this.downloadFile(json, 'stats.json', 'application/json');
            });
        }

        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                const csv = chatAnalytics.exportStatsCSV();
                this.downloadFile(csv, 'stats.csv', 'text/csv');
            });
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Close on outside click
        if (this.dashboard) {
            this.dashboard.addEventListener('click', (e) => {
                if (e.target === this.dashboard) {
                    this.close();
                }
            });
        }
    }

    // Download file
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Initialize dashboard
const analyticsDashboard = new AnalyticsDashboard();

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Add analytics button to header
    const header = document.querySelector('.chat-header');
    if (header) {
        const analyticsBtn = document.createElement('button');
        analyticsBtn.className = 'btn btn-icon';
        analyticsBtn.innerHTML = '📊';
        analyticsBtn.title = 'Analytics & Statistics';
        analyticsBtn.addEventListener('click', () => analyticsDashboard.toggle());
        header.appendChild(analyticsBtn);
    }
});
