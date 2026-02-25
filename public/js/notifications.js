/* ============================================
   NOTIFICATION & READ RECEIPT SYSTEM
   ============================================ */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 4000;
    }

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    // Create and show notification
    notify(options) {
        this.init();

        const {
            title = 'Notification',
            message = '',
            type = 'info', // info, success, warning, error, message
            duration = this.defaultDuration,
            action = null,
            actionLabel = 'View'
        } = options;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        let icon = '';
        switch(type) {
            case 'success': icon = '✓'; break;
            case 'error': icon = '✕'; break;
            case 'warning': icon = '⚠'; break;
            case 'message': icon = '💬'; break;
            default: icon = 'ℹ';
        }

        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            ${action ? `<button class="notification-action">${actionLabel}</button>` : ''}
            <button class="notification-close">✕</button>
        `;

        if (action) {
            notification.querySelector('.notification-action').addEventListener('click', action);
        }

        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.removeNotification(notification);
        });

        this.container.appendChild(notification);
        this.notifications.push(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }

        // Keep only maxNotifications visible
        while (this.notifications.length > this.maxNotifications) {
            this.removeNotification(this.notifications[0]);
        }

        return notification;
    }

    // Remove notification
    removeNotification(notification) {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
            this.notifications = this.notifications.filter(n => n !== notification);
        }, 300);
    }

    // Show info notification
    info(title, message, duration) {
        return this.notify({ title, message, type: 'info', duration });
    }

    // Show success notification
    success(title, message, duration) {
        return this.notify({ title, message, type: 'success', duration });
    }

    // Show error notification
    error(title, message, duration) {
        return this.notify({ title, message, type: 'error', duration: duration || 6000 });
    }

    // Show warning notification
    warning(title, message, duration) {
        return this.notify({ title, message, type: 'warning', duration });
    }

    // Show message notification
    messageNotification(username, message, action, duration) {
        return this.notify({
            title: username,
            message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
            type: 'message',
            duration,
            action,
            actionLabel: 'Reply'
        });
    }

    // Clear all notifications
    clearAll() {
        this.notifications.forEach(n => this.removeNotification(n));
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// ============================================
// READ RECEIPT TRACKER
// ============================================

class ReadReceiptManager {
    constructor() {
        this.readReceipts = new Map(); // messageId -> { readBy: Set, timestamp, firstReadAt }
    }

    // Mark message as read
    markAsRead(messageId, userId) {
        if (!this.readReceipts.has(messageId)) {
            this.readReceipts.set(messageId, {
                readBy: new Set(),
                timestamp: new Date(),
                firstReadAt: new Date()
            });
        }

        const receipt = this.readReceipts.get(messageId);
        receipt.readBy.add(userId);

        // Update visual indicator
        this.updateReadReceiptUI(messageId);
    }

    // Get read status
    getReadStatus(messageId) {
        const receipt = this.readReceipts.get(messageId);
        return receipt ? {
            readBy: Array.from(receipt.readBy),
            readCount: receipt.readBy.size,
            firstReadAt: receipt.firstReadAt
        } : {
            readBy: [],
            readCount: 0,
            firstReadAt: null
        };
    }

    // Update UI
    updateReadReceiptUI(messageId) {
        const receipt = this.readReceipts.get(messageId);
        if (!receipt) return;

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const status = this.getReadStatus(messageId);
        const existingReceipt = messageElement.querySelector('.message-read-receipt');

        if (existingReceipt) {
            existingReceipt.remove();
        }

        if (status.readCount > 0) {
            const receiptElement = document.createElement('span');
            receiptElement.className = 'message-read-receipt';

            if (status.readCount === 1) {
                receiptElement.innerHTML = `<span class="read-receipt-check single" title="Seen by 1">✓</span>`;
            } else if (status.readCount < 5) {
                receiptElement.innerHTML = `<span class="read-receipt-check double" title="Seen by ${status.readCount}">✓✓</span>`;
            } else {
                receiptElement.innerHTML = `<span class="read-receipt-check multiple">✓ +${status.readCount - 1}</span>`;
            }

            receiptElement.addEventListener('mouseenter', () => {
                this.showReadReceiptTooltip(messageElement, status);
            });

            messageElement.querySelector('.message-footer')?.appendChild(receiptElement);
        }
    }

    // Show tooltip with who read the message
    showReadReceiptTooltip(messageElement, status) {
        const tooltip = document.createElement('div');
        tooltip.className = 'read-receipt-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-title">Seen by:</div>
            ${status.readBy.map(userId => {
                const user = chatManager.getUserById(userId);
                return `<div class="tooltip-item">${user?.username || 'Unknown'}</div>`;
            }).join('')}
        `;

        messageElement.appendChild(tooltip);

        setTimeout(() => tooltip.remove(), 3000);
    }

    // Batch mark as read
    markMultipleAsRead(messageIds, userId) {
        messageIds.forEach(id => this.markAsRead(id, userId));
    }

    // Get unread count
    getUnreadCount(userId) {
        let count = 0;
        this.readReceipts.forEach((receipt, messageId) => {
            if (!receipt.readBy.has(userId)) {
                count++;
            }
        });
        return count;
    }
}

// Initialize read receipt manager
const readReceiptManager = new ReadReceiptManager();

// ============================================
// NOTIFICATION SOUND & VIBRATION
// ============================================

class AudioVibrationManager {
    constructor() {
        this.soundEnabled = true;
        this.vibrationEnabled = navigator.vibrate ? true : false;
        this.sounds = new Map();
        this.initSounds();
    }

    initSounds() {
        // Message notification sound (using Web Audio API)
        this.createMessageSound();
        this.createNotificationSound();
        this.createSuccessSound();
    }

    // Create message sound using Web Audio API
    createMessageSound() {
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

            this.sounds.set('message', audioContext);
        } catch (e) {
            console.log('Web Audio API not available');
        }
    }

    // Create notification sound
    createNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05);
            oscillator.type = 'triangle';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);

            this.sounds.set('notification', audioContext);
        } catch (e) {
            console.log('Web Audio API not available');
        }
    }

    // Create success sound
    createSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Two-tone success sound
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(audioContext.destination);

            osc1.frequency.value = 800;
            osc2.frequency.value = 1200;
            osc1.type = 'sine';
            osc2.type = 'sine';

            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            osc1.start(audioContext.currentTime);
            osc2.start(audioContext.currentTime + 0.1);
            osc1.stop(audioContext.currentTime + 0.2);
            osc2.stop(audioContext.currentTime + 0.3);

            this.sounds.set('success', audioContext);
        } catch (e) {
            console.log('Web Audio API not available');
        }
    }

    // Play sound
    playSound(soundName) {
        if (!this.soundEnabled) return;
        
        try {
            // Recreate the sound effect each time
            if (soundName === 'message') {
                this.createMessageSound();
            } else if (soundName === 'notification') {
                this.createNotificationSound();
            } else if (soundName === 'success') {
                this.createSuccessSound();
            }
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }

    // Vibrate device
    vibrate(pattern = [100, 50, 100]) {
        if (this.vibrationEnabled && navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                console.log('Vibration not available');
            }
        }
    }

    // Notification alert (sound + vibration)
    alert(type = 'message') {
        this.playSound(type);
        if (type === 'message') {
            this.vibrate([50, 30, 50]);
        } else if (type === 'notification') {
            this.vibrate([100, 50, 100]);
        }
    }

    // Toggle sound
    toggleSound(enabled) {
        this.soundEnabled = enabled;
    }

    // Toggle vibration
    toggleVibration(enabled) {
        this.vibrationEnabled = enabled;
    }
}

// Initialize audio vibration manager
const audioVibrationManager = new AudioVibrationManager();

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Store notification manager in config for global access
    if (typeof CONFIG !== 'undefined') {
        CONFIG.notificationManager = notificationManager;
    }
});
