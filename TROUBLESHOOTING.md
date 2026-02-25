# ❓ CHIT-CHAT - Troubleshooting & FAQ

## Table of Contents
1. [Common Issues](#common-issues)
2. [How To...](#how-to)
3. [FAQ](#frequently-asked-questions)
4. [Advanced Troubleshooting](#advanced-troubleshooting)
5. [Performance Tips](#performance-tips)
6. [Security FAQ](#security-faq)

---

## Common Issues

### Issue 1: "Cannot GET /" - Application Won't Load

**Symptoms:**
- Error page shows "Cannot GET /"
- Only HTML loads, no styles or scripts
- White/blank screen

**Solutions:**

**Solution A: Check Server is Running**
```bash
# Terminal 1: Check if port 3000 is in use
netstat -ano | findstr :3000

# Terminal 2: Look for "LISTENING" status
# If not present, server isn't running
npm start  # Restart server
```

**Solution B: Check Configuration**
```bash
# Verify .env file exists
cat .env

# Should contain:
# PORT=3000
# JWT_SECRET=your-secret-key
# CORS_ORIGIN=http://localhost:3000

# If missing, create .env based on .env.example
copy .env.example .env
```

**Solution C: Clear Browser Cache**
```javascript
// In Browser DevTools Console:
localStorage.clear();
sessionStorage.clear();
```
Then reload page with: `Ctrl+Shift+R` (hard refresh)

---

### Issue 2: "Cannot Find Module" Errors

**Symptoms:**
- Terminal shows: `Error: Cannot find module 'express'`
- Server crashes on startup
- Dependencies not found

**Solutions:**

**Solution A: Install Dependencies**
```bash
cd Chit-Chat
npm install

# If still error, clean install:
rm -rf node_modules package-lock.json
npm install
```

**Solution B: Verify package.json**
```bash
# Check file exists and is valid JSON
npm list

# Should show:
# ├── bcryptjs@2.4.3
# ├── dotenv@16.0.3
# ├── express@4.18.0
# ├── jsonwebtoken@9.0.0
# ├── socket.io@4.5.0
# └── uuid@9.0.0
```

**Solution C: Reinstall Single Package**
```bash
npm install express@4.18.0 --save
```

---

### Issue 3: WebSocket Connection Fails

**Symptoms:**
- Messages don't send
- Presence doesn't update
- Console shows WebSocket errors
- "io.connect failed" in console

**Solutions:**

**Solution A: Check Server WebSocket**
```bash
# Check backend is listening for WebSocket
# In browser DevTools Network tab:
# Look for WebSocket connection named "socket.io"
# Should show as "101 Switching Protocols"
```

**Solution B: Verify Port Configuration**
```javascript
// In config.js, check:
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000',
  SOCKET_URL: 'http://localhost:3000',
  // ... other config
};

// Should match .env PORT setting
```

**Solution C: Check CORS Settings**
```bash
# In .env, ensure:
CORS_ORIGIN=http://localhost:3000

# For remote, use:
CORS_ORIGIN=https://yourdomain.com
```

**Solution D: Restart Both Server and Browser**
```bash
# Terminal: Stop server
Ctrl+C

# Close browser completely
# Restart server
npm start

# Reopen browser and navigate to http://localhost:3000
```

---

### Issue 4: Authentication Fails

**Symptoms:**
- Cannot login with correct credentials
- Registration succeeds but login fails
- "Invalid credentials" error persists

**Solutions:**

**Solution A: Verify JWT Secret**
```bash
# Check .env has a JWT_SECRET
cat .env | grep JWT_SECRET

# If empty or missing:
# Generate new secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env:
# JWT_SECRET=<generated-string>

# Restart server
npm start
```

**Solution B: Clear Stored Token**
```javascript
// Browser DevTools Console:
localStorage.removeItem('authToken');
localStorage.removeItem('userId');
localStorage.removeItem('username');
location.reload();
```

**Solution C: Try Fresh Registration**
1. Open http://localhost:3000
2. Click "Register" tab
3. Enter new username, email, password
4. Click Register
5. Try login with new credentials

**Solution D: Check Backend Validation**
```bash
# Test auth endpoint directly:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123"
  }'

# Should return: success message or error details
```

---

### Issue 5: Messages Not Sending

**Symptoms:**
- Type message, press Enter, nothing happens
- Message appears briefly then disappears
- "Failed to send message" error

**Solutions:**

**Solution A: Verify WebSocket Connected**
```javascript
// Browser Console:
io.connected  // Should be: true

// If false, WebSocket is not connected
// See Issue 3 above
```

**Solution B: Check Message Format**
```javascript
// Browser Console:
// Try sending a message programmatically:
if (chatManager) {
  chatManager.sendMessage('Hello test');
}

// Check for console errors
// F12 > Console tab > Look for red errors
```

**Solution C: Clear Message History**
```bash
# Messages might be stuck in cache
# Open browser DevTools > Application > Storage
# Delete: localStorage keys starting with 'message_'
# Reload page
```

**Solution D: Test with Another Browser Window**
1. Open http://localhost:3000 in two different browser windows
2. Login with different accounts in each
3. Send message from one window
4. Check if it appears in other window
5. This confirms if issue is client or server side

---

### Issue 6: Styles Not Loading (No Colors/Formatting)

**Symptoms:**
- Page shows only text, no colors
- Layout is broken (no grid/flex)
- Buttons look plain
- Doodle effects missing

**Solutions:**

**Solution A: Check CSS Files**
```bash
# Verify all CSS files exist:
ls -la public/css/

# Should show:
# main.css (1200 lines)
# doodle.css (800 lines)
# reactive.css (500 lines)
# responsive.css (600 lines)
# presence-indicators.css (600 lines)
# notifications.css (700 lines)
# media.css (600 lines)
# search.css (700 lines)
# analytics.css (800 lines)
# theme-customizer.css (700 lines)
```

**Solution B: Clear Browser Cache**
```
Press: Ctrl+Shift+Delete
Select: All time
Check: Cookies and cached images
Click Clear data
```

**Solution C: Hard Refresh Page**
```
Windows/Linux: Ctrl+Shift+R
Mac: Cmd+Shift+R
```

**Solution D: Check CSS Links in HTML**
```html
<!-- Open public/index.html and look for: -->
<link rel="stylesheet" href="/css/main.css">
<link rel="stylesheet" href="/css/doodle.css">
<!-- ... etc for all 10 CSS files -->

<!-- All should be present -->
```

**Solution E: Check Network Tab**
```
DevTools > Network tab
Reload page
Look for CSS files (main.css, etc.)
If showing 404 (red), files not found in public/css/
Check file paths in HTML
```

---

### Issue 7: Files Won't Upload

**Symptoms:**
- File upload button does nothing
- "Failed to upload file" error
- File appears then disappears

**Solutions:**

**Solution A: Check File Size**
```javascript
// Max file size is 25MB
// Verify file is smaller:
// In browser, check file properties
// If larger, compress or try smaller file
```

**Solution B: Check File Type**
```javascript
// Allowed types:
// Images: jpg, jpeg, png, gif, webp
// Video: mp4, webm
// Audio: mp3, ogg, wav
// Documents: pdf, docx

// Try uploading supported file first
```

**Solution C: Enable Notifications**
```javascript
// In browser, grant notification permissions
// Click settings (⚙️)
// Toggle "Enable Notifications" ON
// Try upload again
```

**Solution D: Check Console Errors**
```
DevTools > Console tab
Look for file upload related errors
"Failed to validate file"
"Upload directory not found"
```

---

### Issue 8: Search Returns No Results

**Symptoms:**
- Search shows "No results found"
- Results don't highlight
- Saved searches don't work

**Solutions:**

**Solution A: Send Test Messages First**
```
1. Make sure you have messages in chat
2. Send several test messages
3. Then try searching for words from those messages
```

**Solution B: Check Message Content**
```
Search is case-insensitive
But searches for exact words
Try searching: "hello" if messages contain "hello world"
Don't search: "h" or "hel" - must be full word
```

**Solution C: Clear Search Cache**
```javascript
// Browser Console:
localStorage.removeItem('savedSearches');
localStorage.removeItem('searchCache');
location.reload();
```

**Solution D: Try Advanced Filters**
```
1. Click search icon
2. Use filters panel
3. Select specific user/date range
4. Filter by reactions or media
5. Results should appear
```

---

### Issue 9: Notifications Not Working

**Symptoms:**
- No sound when messages arrive
- Read receipts not showing
- Notification toast not appearing

**Solutions:**

**Solution A: Check Browser Permissions**
```
1. Click address bar lock icon
2. Find "Notifications"
3. Set to "Allow"
4. Reload page
```

**Solution B: Enable in Settings**
```
1. Click settings icon (⚙️)
2. Look for "Enable Notifications"
3. Toggle ON
4. Toggle "Sound Alerts" ON
5. Toggle "Vibration" ON (mobile)
```

**Solution C: Check Browser Supports**
```javascript
// Browser Console:
'Notification' in window  // Should be: true

// If false, browser doesn't support notifications
// Try with Chrome or Edge
```

**Solution D: Test Sound Playback**
```javascript
// Browser Console - test audio:
const audio = new Audio('data:audio/wav;base64,SUQzBAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//NJZAAAAAAAAAAASBFAAAASUVORK5CYII=');
audio.play();
// Should hear a beep
```

---

## How To...

### How to Reset Application to Default State

```bash
# 1. Stop server
Ctrl+C

# 2. Clear browser data
# DevTools (F12) > Application > Storage
# Delete all localStorage entries

# 3. Delete local message cache (if exists)
rm public/js/message-history.json

# 4. Restart server
npm start

# 5. Open http://localhost:3000 in new browser tab
# 6. Register new account
```

### How to Change Server Port

```bash
# 1. Edit .env file
# Change: PORT=3000
# To:     PORT=8080

# 2. Update config.js
# Change: API_BASE_URL: 'http://localhost:3000'
# To:     API_BASE_URL: 'http://localhost:8080'

# 3. Restart server
npm start

# 4. Access at: http://localhost:8080
```

### How to Enable Dark Mode

```javascript
// Option 1: Via UI
// Click settings (⚙️) > Toggle "Dark Mode"

// Option 2: Via Console
// Browser Console:
localStorage.setItem('theme', 'dark');
document.body.classList.add('dark-mode');

// Option 3: Auto (system preference)
// Settings > Theme > Select "Auto"
```

### How to Export Chat History

```javascript
// 1. Open Analytics (📊)
// 2. Click "Export JSON" or "Export CSV"
// 3. Choose format
// 4. File downloads automatically

// Or manually in Console:
const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
console.save(messages, 'chat-history.json');
```

### How to Backup All Themes

```bash
# 1. Click settings (⚙️)
# 2. Click "Customize Theme"
# 3. For each saved theme:
#    - Select theme
#    - Click "Export Theme"
# 4. Themes download as .json files
# 5. Keep in safe location
```

### How to Custom Brand the Application

```bash
# 1. Edit public/css/main.css
# 2. Find :root { ... } section
# 3. Change CSS variables:
--primary-color: #your-color;
--secondary-color: #your-color;
--accent-color: #your-color;

# 4. Save and reload browser
```

### How to Add Custom Emojis

```javascript
// Edit public/js/config.js
// Find: CONFIG.EMOJIS = { ... }
// Add to the object:
'category_name': ['👍', '❤️', '🔥', '✨']

// Then save and reload
```

### How to Increase Message Limit

```javascript
// Edit public/js/config.js
// Find: MAX_MESSAGES: 1000
// Change to:
MAX_MESSAGES: 5000

// Or in server/app.js:
// Find: .slice(-100) // Last 100 messages
// Change to:
.slice(-500) // Last 500 messages
```

### How to Debug Socket.io Events

```javascript
// Browser Console:

// Monitor all Socket.io events:
const originalEmit = socket.emit;
socket.emit = function(event, ...args) {
  console.log('Socket emit:', event, args);
  return originalEmit.apply(socket, [event, ...args]);
};

socket.onAny((event, ...args) => {
  console.log('Socket receive:', event, args);
});
```

---

## Frequently Asked Questions

### Q: Can I use Chit-Chat without internet?

**A:** Yes! For local network use:
- All users must be on same WiFi network
- In config.js, change:
  ```javascript
  API_BASE_URL: 'http://192.168.1.100:3000'
  // (use actual server IP, not localhost)
  ```
- Other devices access via that IP

### Q: How many concurrent users doesn't it support?

**A:** With in-memory storage:
- Tested: 100+ concurrent users
- Performance: Remains smooth
- To support 1000+ users:
  - Migrate to PostgreSQL (see DEPLOYMENT.md)
  - Use Redis for sessions
  - Implement load balancing

### Q: How do I password-protect the application?

**A:** Add basic HTTP auth in server/app.js:
```javascript
const basicAuth = require('basic-auth');

app.use((req, res, next) => {
  const user = basicAuth(req);
  if (!user || user.pass !== process.env.APP_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Chit-Chat"');
    return res.sendStatus(401);
  }
  next();
});
```

### Q: Can I run on mobile devices?

**A:** Yes! Access via:
- `http://server-ip:3000` on local network
- Mobile responsive design included
- Touch gestures supported
- Works on iPhone Safari and Android Chrome

### Q: How often should I backup?

**A:** Recommended schedule:
- Development: Daily
- Production: Multiple times per day
- Use: Automated backup script in DEPLOYMENT.md

### Q: What version of Node.js do I need?

**A:** Minimum: Node.js 14.x
Recommended: Node.js 18.x or higher

```bash
node --version  # Check your version
# If < 14.0, upgrade from nodejs.org
```

### Q: Can I host on GitHub Pages?

**A:** No - GitHub Pages only hosts static files.
Alternatives:
- Heroku (see DEPLOYMENT.md)
- Vercel (requires backend refactor)
- AWS/Google Cloud (see DEPLOYMENT.md)
- Self-hosted server

### Q: How do I add two-factor authentication?

**A:** Implement in server/routes/auth.js:
```javascript
// Install: npm install speakeasy qrcode
const speakeasy = require('speakeasy');

app.post('/api/auth/2fa/setup', (req, res) => {
  const secret = speakeasy.generateSecret();
  res.json({ secret: secret.base32 });
});
```

### Q: How can I encrypt messages?

**A:** Add encryption in socket-handler.js:
```javascript
// Install: npm install crypto
const crypto = require('crypto');

socket.on('message', (data) => {
  const encrypted = crypto.createCipher('aes192', 'password');
  // Store encrypted message
});
```

### Q: What's the maximum message length?

**A:** Default: 2000 characters
Change in config.js:
```javascript
MAX_MESSAGE_LENGTH: 2000  // Change to desired limit
```

### Q: Can I integrate with other services?

**A:** Yes, examples:
- **Slack:** Send notifications to Slack channel
- **Discord:** Use Discord webhook for logging
- **Email:** Send transcripts via email
- **GitHub:** Post chat to issues/PRs

Implement in socket-handler.js event handlers.

### Q: How do I monitor performance?

**A:** Use built-in analytics:
1. Click analytics icon (📊)
2. View metrics
3. Export data
4. Monitor trends over time

### Q: Can I limit messages per user?

**A:** Add rate limiting in middleware:
```javascript
// Install: npm install express-rate-limit
const rateLimit = require('express-rate-limit');

const messageLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10  // 10 messages per minute
});

app.use('/api/message', messageLimiter);
```

---

## Advanced Troubleshooting

### Debugging with DevTools

```javascript
// 1. Open DevTools: F12
// 2. Go to Console tab
// 3. Try these commands:

// Check if Socket.io is connected
io.connected

// Check if user is logged in
authManager.isAuthenticated()

// View all stored messages
JSON.parse(localStorage.getItem('chatMessages'))

// Check active themes
localStorage.getItem('currentTheme')

// View all users
JSON.stringify(chatManager.users)
```

### Checking Server Logs

```bash
# If using PM2:
pm2 logs chitchat

# If using systemd:
systemctl status chitchat
journalctl -u chitchat -n 50

# If running direct:
# (look at terminal where npm start runs)
```

### Network Debugging

```bash
# Check if port is listening
netstat -an | grep 3000

# Monitor network traffic
sudo tcpdump -i lo port 3000

# Test endpoint directly
curl http://localhost:3000
curl -X POST http://localhost:3000/api/auth/login
```

### Memory & CPU Debugging

```javascript
// Add memory monitoring to server:
setInterval(() => {
  const mem = process.memoryUsage();
  console.log({
    rss: Math.round(mem.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(mem.external / 1024 / 1024) + 'MB'
  });
}, 10000);
```

### Database Debugging (if using PostgreSQL)

```bash
# Connect to database
psql -U user -d chitchat

# Check tables
\dt

# View records
SELECT * FROM messages LIMIT 10;
SELECT COUNT(*) FROM messages;

# Check indexes
\di

# Monitor performance
EXPLAIN ANALYZE SELECT * FROM messages WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

## Performance Tips

### Optimize Frontend Performance

1. **Lazy Load Images**
   ```javascript
   const img = new Image();
   img.addEventListener('load', () => {
     // Append when loaded
   });
   img.src = url;
   ```

2. **Debounce Typing Indicators**
   ```javascript
   const typingDebounce = debounce(() => {
     socket.emit('typing');
   }, 300);
   ```

3. **Limit Stored Messages**
   ```javascript
   const MAX_STORED = 500;
   if (messages.length > MAX_STORED) {
     messages = messages.slice(-MAX_STORED);
   }
   ```

4. **Use Virtual Scrolling**
   - Only render visible messages
   - Scroll through large histories faster

### Optimize Backend Performance

1. **Add Database Indexing**
   ```sql
   CREATE INDEX idx_messages_sender ON messages(sender_id);
   CREATE INDEX idx_messages_created ON messages(created_at);
   ```

2. **Implement Pagination**
   ```bash
   GET /api/messages?page=1&limit=50
   ```

3. **Cache Frequently Accessed Data**
   ```javascript
   const cache = new Map();
   ```

4. **Use Redis for Sessions**
   ```bash
   npm install redis
   ```

### Optimize Network Performance

1. **Enable Gzip Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Minify CSS & JavaScript**
   ```bash
   npm install -g minify
   minify public/js/config.js > public/js/config.min.js
   ```

3. **Lazy Load Modal Content**
   - Only load emoji picker when opened
   - Only load analytics when requested

---

## Security FAQ

### Q: Are messages encrypted?

**A:** In-transit: Yes (if using HTTPS)
At-rest: No (add encryption per "Advanced Troubleshooting")

### Q: Can I see other users' passwords?

**A:** No - passwords are hashed with bcryptjs
Server never stores plaintext passwords

### Q: Are messages private?

**A:** Current design: All users see all messages
For private messaging: Implement user-to-user channels

### Q: What data is stored?

**A:** Server stores:
- Username, email, password hash
- All messages
- User status
- Reactions

Browser stores:
- Auth token (JWT)
- Username
- Settings/theme

### Q: How often should I change JWT_SECRET?

**A:** When:
- First setup (generate strong secret)
- If compromised
- Quarterly for high-security

Changing invalidates existing tokens - users must login again.

---

## Contact Support

For issues not covered here:

1. **Check Documentation**
   - README.md - Overview
   - FEATURES.md - Feature details
   - DEVELOPMENT.md - Architecture
   - QUICK_REFERENCE.md - Quick answers
   - DEPLOYMENT.md - Hosting guide

2. **Search Existing Issues**
   - GitHub Issues (if on GitHub)
   - Stack Overflow tag: [chat-app]

3. **Provide Debugging Info**
   ```bash
   node --version
   npm --version
   cat .env | grep NODE_ENV
   pm2 logs    # (if using PM2)
   ```

---

**Need Help?** Check the other documentation files or create an issue with:
- Error message
- Steps to reproduce
- Browser/Node version
- Full error stack trace
