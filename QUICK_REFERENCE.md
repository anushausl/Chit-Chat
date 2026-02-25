# 🚀 CHIT-CHAT - Developer Quick Reference

## 📁 Project Structure

```
Chit-Chat/
├── public/
│   ├── index.html                 # Main HTML file
│   ├── css/
│   │   ├── main.css              # Core styling
│   │   ├── doodle.css            # Doodle animations
│   │   ├── reactions.css         # Message reactions
│   │   ├── responsive.css        # Mobile responsive
│   │   ├── presence-indicators.css
│   │   ├── notifications.css
│   │   ├── media.css
│   │   ├── search.css
│   │   ├── analytics.css
│   │   └── theme-customizer.css
│   └── js/
│       ├── config.js             # Configuration
│       ├── auth.js               # Authentication
│       ├── chat.js               # Chat manager
│       ├── ui.js                 # UI manager
│       ├── emoji.js              # Emoji picker
│       ├── socket-handler.js     # WebSocket
│       ├── user-presence.js      # Presence system
│       ├── notifications.js      # Notifications
│       ├── media-manager.js      # Media handling
│       ├── search-engine.js      # Search system
│       ├── analytics.js          # Analytics
│       ├── theme-manager.js      # Theme system
│       ├── message-reactions.js  # Reactions
│       ├── effects.js            # Doodle effects
│       └── message-display.js    # Message display
├── server/
│   ├── app.js                    # Express server
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   └── utils/
│       └── validation.js         # Input validation
├── package.json
├── .env
├── .gitignore
├── README.md
╔═══FEATURES.md                  # Advanced features guide
└── DEVELOPMENT.md               # Development guide
```

## 🔑 Key Objects & Classes

### Global Managers
```javascript
authManager          // Authentication (login/register)
chatManager          // Chat messages and history
uiManager            // UI components and layout
emojiPicker          // Emoji selection and reactions
userPresenceManager  // User status tracking
notificationManager  // Toast notifications
readReceiptManager   // Message read tracking
audioVibrationManager // Sound and vibration alerts
mediaManager         // File upload and sharing
messageSearchEngine  // Message search and filtering
chatAnalytics        // Statistics and analytics
themeManager         // Color themes
themeCustomizer      // Theme creation UI
analyticsDashboard   // Analytics dashboard UI
searchUI             // Search panel UI
doodleEffects        // Animation effects
messageDisplay       // Enhanced message rendering
messageReactions     // Emoji reactions system
```

## 🌐 Socket Events

### Client → Server
```javascript
socket.emit('user-join', { userId, username })
socket.emit('message-send', { content, timestamp })
socket.emit('typing-start')
socket.emit('typing-stop')
socket.emit('reaction-add', { messageId, emoji })
socket.emit('message-edit', { messageId, newContent })
socket.emit('message-delete', { messageId })
socket.emit('user-presence', { status: 'online'|'away'|'offline' })
```

### Server → Client
```javascript
socket.on('message-received', { content, sender, timestamp })
socket.on('user-joined', { userId, username })
socket.on('user-left', { userId })
socket.on('typing-indicator', { userId, isTyping })
socket.on('reaction-received', { messageId, emoji })
socket.on('message-updated', { messageId, newContent })
socket.on('user-presence-updated', { userId, status })
```

## 💾 LocalStorage Keys

```javascript
localStorage.getItem('authToken')           // JWT token
localStorage.getItem('userId')              // Current user ID
localStorage.getItem('username')            // Current user name
localStorage.getItem('currentTheme')        // Active theme
localStorage.getItem('customThemes')        // Saved themes (JSON)
localStorage.getItem('savedSearches')       // Saved searches (JSON)
localStorage.getItem('userSettings')        // User settings (JSON)
localStorage.getItem('messageHistory')      // Message cache (JSON)
```

## 🎨 CSS Variables

```css
:root {
    --color-primary: #3498db;
    --color-secondary: #9b59b6;
    --color-success: #2ecc71;
    --color-danger: #e74c3c;
    --color-warning: #f39c12;
    --color-background: #ffffff;
    --color-text: #2c3e50;
    --color-border: #ecf0f1;
}
```

## 🔧 Common Tasks

### Add a User Status Badge
```javascript
const badge = userPresenceManager.createPresenceBadge(userId);
userElement.appendChild(badge);
```

### Show a Notification
```javascript
notificationManager.success('Title', 'Message text', 4000);
notificationManager.error('Error', 'Something went wrong');
notificationManager.warning('Warning', 'Please confirm');
notificationManager.info('Info', 'Informational message');
```

### Search Messages
```javascript
const results = messageSearchEngine.search('search term', {
    sender: userId,
    startDate: new Date(),
    hasMedia: true,
    isPinned: true
});
```

### Create Analytics Report
```javascript
analyticsDashboard.open();
// or
const stats = chatAnalytics.calculate();
console.log(stats);
```

### Apply Theme
```javascript
themeManager.createTheme('MyTheme', {
    primary: '#ff00ff',
    secondary: '#00ff00'
});
themeManager.applyTheme('MyTheme');
```

### Upload Media
```javascript
const file = fileInput.files[0];
const validation = mediaManager.validateFile(file);
if (validation.valid) {
    mediaManager.addMediaToMessage(messageId, [file]);
}
```

### Record Voice Message
```javascript
await audioRecorder.startRecording();
// ... recording ...
const audioFile = await audioRecorder.stopRecording();
// Send audioFile to server
```

### Emit Socket Event
```javascript
socket.emit('message-send', {
    content: messageText,
    timestamp: new Date(),
    senderId: currentUserId
});
```

### Add Message Reaction
```javascript
const reactions = new MessageReactions();
reactions.addReaction(messageId, '👍', userId);
```

### Mark Message as Read
```javascript
readReceiptManager.markAsRead(messageId, userId);
```

## 🔗 API Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/verify

Users:
GET    /api/users
GET    /api/users/:id
GET    /api/users/online
PUT    /api/users/:id
GET    /api/users/search?q=query

Messages:
GET    /api/messages
GET    /api/messages/:id
DELETE /api/messages/:id
POST   /api/messages/search
```

## 🧪 Testing Checklist

- [ ] User registration and login
- [ ] Send and receive messages
- [ ] Display user online/offline status
- [ ] Show typing indicators
- [ ] Add emoji reactions
- [ ] Edit and delete messages
- [ ] Upload media files
- [ ] Search messages with filters
- [ ] View analytics dashboard
- [ ] Customize theme colors
- [ ] Dark mode toggle
- [ ] Mobile responsive layout
- [ ] Notifications appear/disappear
- [ ] Read receipts show

## 🐛 Debug Commands

```javascript
// Check current user
console.log(authManager.currentUser);

// View all messages
console.log(chatManager.messages);

// Check user presence
console.log(userPresenceManager.userPresence);

// View analytics
console.log(chatAnalytics.calculate());

// Check custom themes
console.log(themeManager.getAllThemes());

// List saved searches
console.log(messageSearchEngine.getSavedSearches());

// Socket connection status
console.log(socket.connected);

// View stored messages
console.log(JSON.parse(localStorage.getItem('messageHistory')));
```

## 📝 Console Logging Patterns

All modules follow a consistent logging pattern:

```javascript
// Info logs
console.log('[MODULE_NAME] Action completed');

// Error logs
console.error('[MODULE_NAME] Error:', errorMessage);

// Warning logs
console.warn('[MODULE_NAME] Warning:', warningMessage);

// Debug logs (if enabled)
if (DEBUG_MODE) {
    console.debug('[MODULE_NAME] Debug info');
}
```

## 🎯 Performance Tips

1. **Message Loading**: Load messages in batches of 50
2. **Search Debouncing**: Search debounces after 300ms of typing
3. **Image Optimization**: Limit gallery to 150px thumbnails
4. **Animation Frames**: Use requestAnimationFrame for smooth animations
5. **Local Caching**: Cache messages in localStorage
6. **Lazy Loading**: Load analytics dashboard on demand

## 🔒 Security Checklist

- [ ] JWT tokens stored securely
- [ ] Input validation on both sides
- [ ] Password hashing with bcryptjs
- [ ] CORS configured properly
- [ ] File upload validation
- [ ] Rate limiting (implement if needed)
- [ ] XSS prevention (use textContent vs innerHTML)
- [ ] CSRF tokens (implement if needed)

## 📊 File Sizes

Approximate sizes (minified):
- main.js files: ~150KB combined
- main.css files: ~100KB combined
- server/app.js: ~15KB
- Socket.io bundle: ~50KB

## 🚀 Deployment Steps

1. Update `.env` with production values
2. Build/minify assets (optional)
3. Set `NODE_ENV=production`
4. Install dependencies: `npm install --production`
5. Start server: `npm start`
6. Access via domain/IP on port 3000

## 📞 Support & Resources

- Socket.io Docs: https://socket.io/docs/
- Express Docs: https://expressjs.com/
- MDN Web Docs: https://developer.mozilla.org/
- CSS Tricks: https://css-tricks.com/

## 🎓 Learning Path

1. Start with: `public/js/config.js` - Understand configuration
2. Learn: `public/js/auth.js` - Authentication flow
3. Explore: `public/js/chat.js` - Chat management
4. Master: `public/js/socket-handler.js` - Real-time features
5. Advanced: Custom modules in same pattern

## 💡 Tips & Tricks

- Use `CONFIG.DEBUG = true` to enable debug logging
- Use DevTools Network tab to monitor Socket.io events
- Use `localStorage.clear()` to reset app state
- Press F12 and use console for quick module access
- Update `config.js` for quick feature flags
- CSS Variables make theme changes instant
- MutationObserver handles dynamic message updates

---

**Quick Start**: Open `index.html`, register a user, and start chatting! 🎉
