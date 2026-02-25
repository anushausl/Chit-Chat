# 📡 CHIT-CHAT - Complete API Reference

## Overview

This document provides comprehensive documentation for all HTTP routes, Socket.io events, and client-side APIs in Chit-Chat.

---

## HTTP API Routes

### Authentication Routes

#### Register User
```
POST /api/auth/register
```

**Request:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Username already exists"
}
```

**Validation Rules:**
- Username: 3-20 characters, alphanumeric and underscores only
- Email: Valid email format
- Password: Minimum 6 characters (recommended: 8+ with mixed case/numbers)

**Status Codes:**
- `201` - User created successfully
- `400` - Validation error
- `409` - Username or email already exists
- `500` - Server error

---

#### Login User
```
POST /api/auth/login
```

**Request:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "Invalid username or password"
}
```

**Status Codes:**
- `200` - Login successful
- `401` - Invalid credentials
- `400` - Missing username or password
- `500` - Server error

---

#### Verify Token
```
POST /api/auth/verify
Content-Type: application/json
Authorization: Bearer <token>
```

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "uuid-string",
    "username": "john_doe"
  }
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "valid": false,
  "error": "Token expired or invalid"
}
```

---

#### Logout
```
POST /api/auth/logout
Content-Type: application/json
Authorization: Bearer <token>
```

**Request:**
```json
{
  "userId": "uuid-string"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status Codes:**
- `200` - Logout successful
- `401` - Unauthorized
- `500` - Server error

---

### User Routes

#### Get All Users
```
GET /api/users
```

**Query Parameters:**
- `includeOffline` (boolean) - Include offline users (default: true)
- `limit` (number) - Maximum users to return (default: 100)

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid-string",
      "username": "john_doe",
      "email": "john@example.com",
      "status": "online",
      "lastSeen": "2024-01-15T10:30:00Z",
      "avatar": "https://..."
    }
  ],
  "total": 1
}
```

---

#### Get Specific User
```
GET /api/users/<userId>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com",
    "status": "online",
    "lastSeen": "2024-01-15T10:30:00Z",
    "avatar": "https://...",
    "messageCount": 42,
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### Get Online Users
```
GET /api/users/online
```

**Response (200):**
```json
{
  "success": true,
  "onlineUsers": [
    {
      "id": "uuid-string",
      "username": "john_doe",
      "status": "online"
    }
  ],
  "count": 5
}
```

---

#### Update User Profile
```
PUT /api/users/<userId>
Content-Type: application/json
Authorization: Bearer <token>
```

**Request:**
```json
{
  "bio": "Hello, I'm John!",
  "avatar": "https://...",
  "status": "away"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "bio": "Hello, I'm John!",
    "avatar": "https://...",
    "status": "away"
  }
}
```

---

#### Search Users
```
GET /api/users/search?q=<query>
```

**Query Parameters:**
- `q` (string, required) - Search term (username or email)
- `limit` (number) - Maximum results (default: 10)

**Response (200):**
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid-string",
      "username": "john_doe",
      "email": "john@example.com",
      "status": "online"
    }
  ]
}
```

---

#### Delete User
```
DELETE /api/users/<userId>
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Status Codes:**
- `200` - User deleted
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### Message Routes

#### Get All Messages
```
GET /api/messages
```

**Query Parameters:**
- `limit` (number) - Maximum messages (default: 50)
- `offset` (number) - Pagination offset (default: 0)
- `userId` (string) - Filter by user
- `since` (date) - Messages since timestamp

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid-string",
      "senderId": "uuid-string",
      "senderUsername": "john_doe",
      "content": "Hello everyone!",
      "reactions": ["👍", "❤️"],
      "edited": false,
      "pinned": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 100
}
```

---

#### Get Specific Message
```
GET /api/messages/<messageId>
```

**Response (200):**
```json
{
  "success": true,
  "message": {
    "id": "uuid-string",
    "senderId": "uuid-string",
    "senderUsername": "john_doe",
    "content": "Hello everyone!",
    "reactions": ["👍"],
    "edited": false,
    "pinned": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Delete Message
```
DELETE /api/messages/<messageId>
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

**Rules:**
- Users can only delete their own messages
- Admins can delete any message

**Status Codes:**
- `200` - Message deleted
- `401` - Unauthorized
- `404` - Message not found
- `500` - Server error

---

#### Get Message History
```
GET /api/messages/history/<userId>
```

**Query Parameters:**
- `limit` (number) - Maximum messages (default: 100)

**Response (200):**
```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid-string",
      "content": "Hello!",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "userId": "uuid-string"
}
```

---

#### Clear Conversation
```
POST /api/messages/clear-conversation
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "userId": "uuid-string",
  "confirm": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation cleared",
  "deletedCount": 42
}
```

---

## Socket.io Events

### Client → Server Events

#### Send Message
```javascript
socket.emit('message', {
  content: 'Hello everyone!',
  timestamp: Date.now()
});
```

**Data Structure:**
```typescript
{
  content: string,        // Max 2000 characters
  timestamp?: number,     // Optional, server uses current if omitted
  replyTo?: string,      // Message ID to reply to (optional)
  media?: {              // Optional media attachment
    type: 'image' | 'video' | 'audio' | 'document',
    url: string,
    size: number,
    name: string
  }
}
```

**Server Response:**
- Broadcasts to all connected clients
- Message stored in server memory/database

---

#### Set User Typing
```javascript
socket.emit('user:typing', {
  username: 'john_doe',
  isTyping: true
});
```

**Data Structure:**
```typescript
{
  username: string,
  isTyping: boolean
}
```

---

#### Update Presence Status
```javascript
socket.emit('user:presence:update', {
  status: 'online',     // 'online' | 'away' | 'offline'
  lastSeen: Date.now()
});
```

---

#### Add Message Reaction
```javascript
socket.emit('message:reaction:add', {
  messageId: 'uuid-string',
  emoji: '👍',
  userId: 'uuid-string'
});
```

---

#### Remove Message Reaction
```javascript
socket.emit('message:reaction:remove', {
  messageId: 'uuid-string',
  emoji: '👍',
  userId: 'uuid-string'
});
```

---

#### Edit Message
```javascript
socket.emit('message:edit', {
  messageId: 'uuid-string',
  newContent: 'Edited message content'
});
```

---

#### Delete Message
```javascript
socket.emit('message:delete', {
  messageId: 'uuid-string'
});
```

---

#### Pin Message
```javascript
socket.emit('message:pin', {
  messageId: 'uuid-string',
  isPinned: true
});
```

---

#### Mark Message as Read
```javascript
socket.emit('message:read', {
  messageId: 'uuid-string',
  userId: 'uuid-string'
});
```

---

#### Update User Profile
```javascript
socket.emit('user:profile:update', {
  username: 'john_doe',
  avatar: 'https://...',
  bio: 'Hello, I am John!',
  status: 'online'
});
```

---

### Server → Client Events

#### Receive Message
```javascript
socket.on('message', (data) => {
  console.log(data);
  // {
  //   id: 'uuid-string',
  //   senderId: 'uuid-string',
  //   senderUsername: 'john_doe',
  //   content: 'Hello everyone!',
  //   timestamp: 1705318200000,
  //   reactions: [],
  //   edited: false,
  //   pinned: false
  // }
});
```

---

#### User Joined
```javascript
socket.on('user:joined', (data) => {
  console.log(`${data.username} joined the chat`);
  // {
  //   userId: 'uuid-string',
  //   username: 'john_doe',
  //   timestamp: 1705318200000
  // }
});
```

---

#### User Left
```javascript
socket.on('user:left', (data) => {
  console.log(`${data.username} left the chat`);
  // {
  //   userId: 'uuid-string',
  //   username: 'john_doe',
  //   timestamp: 1705318200000
  // }
});
```

---

#### User Typing
```javascript
socket.on('user:typing', (data) => {
  // {
  //   username: 'john_doe',
  //   isTyping: true
  // }
});
```

---

#### User Presence Updated
```javascript
socket.on('user:presence:updated', (data) => {
  // {
  //   userId: 'uuid-string',
  //   username: 'john_doe',
  //   status: 'away',
  //   timestamp: 1705318200000
  // }
});
```

---

#### Message Reaction Added
```javascript
socket.on('message:reaction:added', (data) => {
  // {
  //   messageId: 'uuid-string',
  //   emoji: '👍',
  //   userId: 'uuid-string',
  //   userName: 'john_doe'
  // }
});
```

---

#### Message Reaction Removed
```javascript
socket.on('message:reaction:removed', (data) => {
  // {
  //   messageId: 'uuid-string',
  //   emoji: '👍',
  //   userId: 'uuid-string'
  // }
});
```

---

#### Message Edited
```javascript
socket.on('message:edited', (data) => {
  // {
  //   messageId: 'uuid-string',
  //   newContent: 'Edited content',
  //   userId: 'uuid-string',
  //   timestamp: 1705318200000
  // }
});
```

---

#### Message Deleted
```javascript
socket.on('message:deleted', (data) => {
  // {
  //   messageId: 'uuid-string',
  //   userId: 'uuid-string',
  //   timestamp: 1705318200000
  // }
});
```

---

#### Message Pinned
```javascript
socket.on('message:pinned', (data) => {
  // {
  //   messageId: 'uuid-string',
  //   isPinned: true,
  //   userId: 'uuid-string'
  // }
});
```

---

#### Message Read Receipt
```javascript
socket.on('message:read', (data) => {
  // {
  //   messageId: 'uuid-string',
  //   userId: 'uuid-string',
  //   userName: 'john_doe',
  //   timestamp: 1705318200000
  // }
});
```

---

#### Connection Error
```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
  // Handle connection errors
});
```

---

#### Disconnect
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

---

## Client-Side JavaScript APIs

### Auth Manager API

```javascript
// Create instance (auto-instantiated)
const authManager = window.authManager;

// Authenticate user
authManager.register(username, email, password)
  .then(user => console.log('Registered:', user))
  .catch(err => console.error(err));

authManager.login(username, password)
  .then(user => console.log('Logged in:', user))
  .catch(err => console.error(err));

// Logout
authManager.logout();

// Check authentication
authManager.isAuthenticated()  // Returns: boolean

// Get current user
authManager.getCurrentUser()   // Returns: { id, username, email }

// Verify token
authManager.verifyToken()      // Returns: Promise<boolean>
```

---

### Chat Manager API

```javascript
const chatManager = window.chatManager;

// Send message
chatManager.sendMessage('Hello world!');

// Edit message
chatManager.editMessage(messageId, 'New content');

// Delete message
chatManager.deleteMessage(messageId);

// Add reaction
chatManager.addReaction(messageId, '👍');

// Remove reaction
chatManager.removeReaction(messageId, '👍');

// Pin message
chatManager.pinMessage(messageId);

// Unpin message
chatManager.unpinMessage(messageId);

// Get all messages
chatManager.getMessages()      // Returns: Array<Message>

// Get specific message
chatManager.getMessage(messageId)  // Returns: Message

// Get user messages
chatManager.getUserMessages(userId)  // Returns: Array<Message>

// Search messages
chatManager.searchMessages(query)    // Returns: Array<Message>

// Clear chat history
chatManager.clearHistory();

// Get message count
chatManager.getMessageCount()  // Returns: number

// Update typing status
chatManager.setTyping(true);
```

---

### UI Manager API

```javascript
const uiManager = window.uiManager;

// Toggle dark mode
uiManager.toggleDarkMode();

// Set theme
uiManager.setTheme('dark');    // 'light' | 'dark'

// Get current theme
uiManager.getCurrentTheme()    // Returns: string

// Update user list
uiManager.updateUserList(users);

// Add notification
uiManager.notify(type, message, duration);
// type: 'info' | 'success' | 'error' | 'warning'
// duration: milliseconds

// Show modal
uiManager.showModal(modalId);

// Hide modal
uiManager.hideModal(modalId);

// Show loading spinner
uiManager.showLoader();

// Hide loading spinner
uiManager.hideLoader();

// Update settings
uiManager.updateSettings(settingsObject);
```

---

### Emoji Picker API

```javascript
const emojiPicker = new EmojiPicker();

// Initialize
emojiPicker.init(containerElement);

// Add custom emoji
emojiPicker.addEmoji('custom', '🎉');

// Get recent emojis
emojiPicker.getRecentEmojis()  // Returns: Array<string>

// Clear recent emojis
emojiPicker.clearRecent();

// Search emojis
emojiPicker.search('smile')    // Returns: Array<emoji objects>

// Listen for selection
emojiPicker.on('select', (emoji) => {
  console.log('Selected:', emoji);
});
```

---

### Notification Manager API

```javascript
const notificationManager = window.notificationManager;

// Show notification
notificationManager.notify(type, message, options);
// type: 'info' | 'success' | 'error' | 'warning' | 'message'
// options: { duration, sound, vibrate, action }

notificationManager.info('Information message');
notificationManager.success('Success!');
notificationManager.error('An error occurred');
notificationManager.warning('Warning message');
notificationManager.message('New message from John');

// Play sound
notificationManager.playSound('notification');

// Trigger vibration
notificationManager.vibrate([100, 50, 100]);

// Mark as read
notificationManager.markAsRead(messageId);

// Get read receipts
notificationManager.getReadReceipts(messageId)
  // Returns: Map<userId, timestamp>
```

---

### User Presence Manager API

```javascript
const userPresenceManager = window.userPresenceManager;

// Update user presence
userPresenceManager.updateUserPresence(userId, status, lastSeen);
// status: 'online' | 'away' | 'offline'

// Get user status
userPresenceManager.getUserStatus(userId)  // Returns: string

// Set typing indicator
userPresenceManager.setUserTyping(userId, isTyping);

// Get all users grouped by status
userPresenceManager.getUsersByStatus()
// Returns: { online: [...], away: [...], offline: [...] }

// Get online users
userPresenceManager.getOnlineUsers()      // Returns: Array<User>

// Get presence stats
userPresenceManager.getPresenceStats()
// Returns: { online: number, away: number, offline: number }

// Create presence badge
userPresenceManager.createPresenceBadge(status)
// Returns: HTMLElement
```

---

### Media Manager API

```javascript
const mediaManager = window.mediaManager;

// Validate file
mediaManager.validateFile(file)  // Returns: boolean or error message

// Upload file
mediaManager.uploadFile(file)
  .then(url => console.log('Uploaded:', url))
  .catch(err => console.error(err));

// Get media gallery
mediaManager.getGallery()        // Returns: Array<media objects>

// Delete media
mediaManager.deleteMedia(mediaId);

// Start recording audio
mediaManager.audioRecorder.start();

// Stop recording audio
mediaManager.audioRecorder.stop()
  .then(blob => console.log('Recording:', blob));

// Start screen share
mediaManager.screenShareManager.start()
  .then(stream => console.log('Sharing screen'));

// Stop screen share
mediaManager.screenShareManager.stop();
```

---

### Message Search API

```javascript
const searchEngine = window.messageSearchEngine;

// Search messages
searchEngine.search(query, options)
// Returns: Array<Message>
// options: { sender, dateFrom, dateTo, reactions, media, pinned, edited }

// Add filter
searchEngine.addFilter(type, value);
// type: 'sender' | 'date' | 'reactions' | 'media' | 'pinned' | 'edited'

// Remove filter
searchEngine.removeFilter(type);

// Get suggestions
searchEngine.getSuggestions(query)  // Returns: Array<suggestions>

// Save search
searchEngine.saveSearch(name, query, filters);

// Get saved searches
searchEngine.getSavedSearches()     // Returns: Array<saved searches>

// Load saved search
searchEngine.loadSavedSearch(searchId);

// Delete saved search
searchEngine.deleteSavedSearch(searchId);

// Export results
searchEngine.exportResults(format)  // format: 'json' | 'csv'
```

---

### Analytics API

```javascript
const analytics = window.chatAnalytics;

// Get metrics
analytics.getMetrics()
// Returns: {
//   totalMessages: number,
//   totalUsers: number,
//   averageMessageLength: number,
//   peakHour: number,
//   topSenders: Array,
//   engagementRate: number
// }

// Get hourly statistics
analytics.getHourlyStats()
// Returns: Array<{ hour, count }>

// Get user rankings
analytics.getUserRankings()
// Returns: Array<{ userId, messageCount, percentage }>

// Export analytics
analytics.exportAnalytics(format)
// format: 'json' | 'csv'
// Returns: blob

// Calculate engagement
analytics.calculateEngagement()  // Returns: percentage

// Get active hours
analytics.getActiveHours()       // Returns: Array<hour numbers>
```

---

### Theme Manager API

```javascript
const themeManager = window.themeManager;

// Get current theme
themeManager.getCurrentTheme()   // Returns: theme object

// Apply theme
themeManager.applyTheme(themeObject);

// Create custom theme
themeManager.createTheme(name, colors);
// colors: { primary, secondary, success, danger, warning, background }

// Get preset themes
themeManager.getPresetThemes()   // Returns: Array<theme>

// Get saved themes
themeManager.getSavedThemes()    // Returns: Array<theme>

// Save theme
themeManager.saveTheme(theme);

// Delete theme
themeManager.deleteTheme(themeId);

// Import theme
themeManager.importTheme(jsonString);

// Export theme
themeManager.exportTheme(themeId)  // Returns: JSON string

// Update color
themeManager.updateColor(colorName, colorValue);
```

---

## Data Models

### User Object
```typescript
{
  id: string,                    // UUID
  username: string,              // 3-20 characters
  email: string,                 // Valid email
  status: 'online' | 'away' | 'offline',
  lastSeen: number,              // Unix timestamp
  avatar?: string,               // Avatar URL
  bio?: string,                  // User biography
  joinedAt: number,              // Registration timestamp
  messageCount: number,          // Total messages sent
}
```

### Message Object
```typescript
{
  id: string,                    // UUID
  senderId: string,              // User ID
  senderUsername: string,
  content: string,               // Message text
  reactions: string[],           // Emoji reactions
  replyTo?: string,              // Message ID (for replies)
  edited: boolean,
  pinned: boolean,
  media?: {
    type: string,
    url: string,
    size: number,
    name: string
  },
  readBy: Map<string, number>,   // userId -> timestamp
  createdAt: number,             // Unix timestamp
  updatedAt: number,
}
```

### Theme Object
```typescript
{
  id?: string,
  name: string,
  colors: {
    primary: string,             // Hex color
    secondary: string,
    success: string,
    danger: string,
    warning: string,
    background: string
  },
  isPreset?: boolean,
  createdAt?: number
}
```

### Notification Object
```typescript
{
  id: string,
  type: 'info' | 'success' | 'error' | 'warning' | 'message',
  message: string,
  duration?: number,             // Milliseconds
  sound?: boolean,
  vibrate?: boolean,
  action?: {
    text: string,
    callback: () => void
  }
}
```

---

## Error Handling

### HTTP Error Codes
```
200 - OK / Success
201 - Created
400 - Bad Request / Validation Error
401 - Unauthorized
403 - Forbidden
404 - Not Found
409 - Conflict (e.g., username exists)
500 - Server Error
503 - Service Unavailable
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes
```
VALIDATION_ERROR - Input validation failed
AUTH_FAILED - Authentication failed
TOKEN_EXPIRED - JWT token expired
USER_NOT_FOUND - User doesn't exist
MESSAGE_NOT_FOUND - Message doesn't exist
FORBIDDEN - Action not permitted
SERVER_ERROR - Internal server error
SOCKET_ERROR - WebSocket connection error
```

---

## Rate Limiting

**Current Limits:**
- Message send: 10 messages per minute per user
- File upload: 5 files per minute per user
- Search: 30 searches per minute per user
- API calls: 100 requests per minute per IP

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1705324800
```

---

## Authentication

### JWT Token Structure
```
Header: { alg: 'HS256', typ: 'JWT' }
Payload: { userId, username, exp, iat }
Signature: HMAC-SHA256
```

### Token Usage
```javascript
// Get token from storage
const token = localStorage.getItem('authToken');

// Include in header
fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Or via Socket.io
socket.emit('authenticate', { token });
```

### Token Expiration
- Default: 7 days
- Renewal: Not needed (use new login)
- Revocation: On logout

---

## CORS Configuration

**Allowed Origins:**
```
http://localhost:3000 (development)
https://yourdomain.com (production)
```

**Allowed Methods:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers:**
```
Content-Type, Authorization, X-Requested-With
```

**Credentials:**
```
Include (for cookies, not using in JWT)
```

---

## WebSocket Configuration

**Transport:**
- Polling fallback: Enabled
- Reconnection: Automatic with exponential backoff
- Timeout: 30 seconds
- Max reconnect attempts: Unlimited

**Socket.io URL:**
```
http://localhost:3000
```

---

## Example Integration

### Complete Login & Send Message

```javascript
// 1. Register/Login
const authResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'john_doe',
    password: 'password123'
  })
});

const { token, user } = await authResponse.json();
localStorage.setItem('authToken', token);

// 2. Connect Socket.io
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected');
  
  // 3. Send message
  socket.emit('message', {
    content: 'Hello everyone!',
    timestamp: Date.now()
  });
});

// 4. Receive messages
socket.on('message', (message) => {
  console.log('Message received:', message);
  displayMessage(message);
});
```

---

**For more examples, see QUICK_REFERENCE.md**
