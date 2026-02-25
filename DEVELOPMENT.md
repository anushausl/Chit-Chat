# CHIT-CHAT DEVELOPMENT GUIDE

## Project Architecture

### Frontend (Public Directory)
- **index.html** - Main application structure
- **css/** - Styling with doodle design theme
  - main.css - Core styles
  - doodle.css - Doodle animations and effects
  - responsive.css - Mobile responsiveness
- **js/** - JavaScript modules
  - config.js - Configuration constants
  - auth.js - Authentication logic
  - chat.js - Chat functionality
  - ui.js - User interface management
  - emoji.js - Emoji picker
  - socket-handler.js - WebSocket handling

### Backend (Server Directory)
- **app.js** - Express server with Socket.io
- **routes/** - API endpoints
  - auth.js - Authentication endpoints
  - messages.js - Message endpoints
  - users.js - User endpoints
- **middleware/** - Request processing
  - auth.js - JWT authentication
- **utils/** - Helper utilities
  - validation.js - Input validation

## Installation & Setup

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create .env File**
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   Edit `.env` and set:
   - PORT (default: 3000)
   - JWT_SECRET (secure key for production)
   - NODE_ENV (development/production)

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Or Start Production Server**
   ```bash
   npm start
   ```

6. **Access Application**
   Open http://localhost:3000 in your browser

## Features Implemented

### Authentication
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Session persistence with localStorage

### Real-Time Messaging
- WebSocket communication with Socket.io
- Instant message delivery
- Message read receipts
- Typing indicators
- User presence/status tracking

### User Interface
- Doodle design theme with custom animations
- Responsive layout for mobile/tablet/desktop
- Dark mode toggle
- Settings panel
- User search functionality
- Message history
- Emoji picker with 100+ emojis

### Message Features
- Text message support
- Emoji reactions (in development)
- Message timestamps
- Read status indicators
- Message history persistence
- Clear chat option

## File Structure

```
Chit-Chat/
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── main.css
│   │   ├── doodle.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── config.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── ui.js
│   │   ├── emoji.js
│   │   └── socket-handler.js
│   └── assets/
├── server/
│   ├── app.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── users.js
│   ├── middleware/
│   │   └── auth.js
│   └── utils/
│       └── validation.js
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── DEVELOPMENT.md
```

## Development Workflow

### Adding New Features

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Code Implementation**
   - Follow existing code style
   - Add comments for complex logic
   - Test thoroughly

3. **Testing**
   - Test in different browsers
   - Test on mobile/tablet
   - Test with multiple users

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

5. **Create Pull Request**

## Socket Events Reference

### User Events
- `user:connect` - User connects to server
- `user:online` - User comes online
- `user:offline` - User goes offline
- `user:status` - User status changes
- `user:list` - List of all users

### Message Events
- `message:send` - Send a message
- `message:receive` - Receive a message
- `message:read` - Mark message as read
- `message:sent` - Confirm message sent

### Typing Events
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `typing:active` - Display typing indicator

### Emoji Events
- `emoji:reaction` - Add emoji reaction

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify token
- `POST /api/auth/logout` - Logout user

### Messages
- `GET /api/messages/:userId` - Get user messages
- `GET /api/messages/:userId/:otherId` - Get conversation
- `DELETE /api/messages/:messageId` - Delete message
- `DELETE /api/messages/:userId/:otherId` - Clear conversation

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user by ID
- `GET /api/users/status/online` - Get online users
- `PATCH /api/users/:userId` - Update user profile
- `DELETE /api/users/:userId` - Delete user
- `GET /api/users/search/:query` - Search users

## Configuration Reference

### Colors
- Primary: #FF6B9D (Pink)
- Secondary: #4ECDC4 (Teal)
- Success: #81C784 (Green)
- Warning: #FFE66D (Yellow)
- Danger: #E63384 (Dark Pink)
- Info: #64B5F6 (Blue)

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

### Animations
- fast: 150ms
- normal: 250ms
- slow: 350ms

## Best Practices

### Frontend
- Use semantic HTML
- Follow CSS naming conventions (BEM style)
- Minimize DOM manipulation
- Debounce input events
- Cache DOM selectors

### Backend
- Validate all inputs server-side
- Use proper error handling
- Log important events
- Use environment variables for config
- Implement rate limiting for production

## Security Considerations

### Current Implementation
- Password hashing with bcrypt
- JWT token authentication
- Input validation
- CORS protection

### For Production
- Use HTTPS only
- Implement rate limiting
- Add CSRF protection
- Sanitize HTML content
- Use secure database
- Implement refresh tokens
- Add message encryption

## Troubleshooting

### Socket Not Connecting
- Check server is running
- Verify correct server URL
- Check browser console for errors
- Ensure Socket.io is loaded

### Messages Not Sending
- Check network connection
- Verify user is selected
- Check message length < 500 chars
- Check WebSocket connection

### Authentication Issues
- Clear localStorage and try again
- Check .env configuration
- Verify JWT_SECRET is set
- Check network requests in DevTools

## Future Enhancements

- [ ] File sharing
- [ ] Voice messages
- [ ] Video call integration
- [ ] Message search
- [ ] User blocking
- [ ] Message encryption
- [ ] Message reactions (emojis)
- [ ] @ mentions
- [ ] User profiles
- [ ] Chat rooms/groups
- [ ] Message pagination
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Email verification
- [ ] Password reset
- [ ] User avatar uploads
- [ ] Custom themes
- [ ] Notifications with sound option
- [ ] Message forwarding
- [ ] Quote/reply to messages
- [ ] Media gallery

## Contact & Support

For issues, questions, or suggestions, please create an issue in the repository.

Happy chatting! 💬🎨
