# 🚀 CHIT-CHAT - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Chit-Chat to production environments including local networks, cloud platforms, and containerized deployments.

---

## Phase 1: Pre-Deployment Checklist

### Security Review
- [ ] All user inputs validated (server-side)
- [ ] SQL injection protected (using Maps not SQL)
- [ ] XSS protected (no innerHTML for user content)
- [ ] CSRF tokens implemented if needed
- [ ] JWT secrets are strong (256+ bits)
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error messages don't leak information
- [ ] Passwords hashed with bcryptjs
- [ ] No sensitive data in localStorage

### Performance Optimization
- [ ] CSS minified in production
- [ ] JavaScript minified in production
- [ ] Images optimized
- [ ] Lazy loading enabled for media
- [ ] Caching headers configured
- [ ] Gzip compression enabled
- [ ] Database indexes created (if using DB)
- [ ] CDN configured (optional)

### Testing Completion
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Load testing completed
- [ ] Security scanning done
- [ ] Cross-browser testing done
- [ ] Mobile testing done
- [ ] Stress testing completed

---

## Phase 2: Environment Configuration

### Production .env
```env
# Server
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Security
JWT_SECRET=generate-very-long-random-string-here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=https://yourdomain.com

# Database (if upgrading from in-memory)
DATABASE_URL=postgresql://user:password@host:5432/chitchat
DB_POOL_SIZE=10

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Features
ENABLE_MEDIA_UPLOAD=true
MAX_FILE_SIZE=25000000
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Generate Strong JWT Secret
```bash
# Linux/Mac
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
```

---

## Phase 3: Database Migration (Optional)

### From In-Memory to PostgreSQL

1. **Install PostgreSQL driver**
```bash
npm install pg pg-promise
```

2. **Update server/app.js**
```javascript
const pgp = require('pg-promise');

const db = pgp()('postgresql://user:password@host:5432/chitchat');

// Replace Map storage with database queries
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await db.query(
      'SELECT * FROM messages ORDER BY timestamp DESC LIMIT $1',
      [req.query.limit || 50]
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});
```

3. **Create database schema**
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  status VARCHAR(50) DEFAULT 'offline',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  edited BOOLEAN DEFAULT false,
  pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id),
  user_id UUID NOT NULL REFERENCES users(id),
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_reactions_message ON reactions(message_id);
```

---

## Phase 4: Node.js Server Deployment

### Option 1: Standalone Server

1. **Install Node.js on server**
```bash
# Download from nodejs.org or use package manager
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Clone or upload project**
```bash
git clone <repository-url> /var/www/chitchat
cd /var/www/chitchat
```

3. **Install dependencies**
```bash
npm install --production
```

4. **Create systemd service**
```bash
sudo nano /etc/systemd/system/chitchat.service
```

```ini
[Unit]
Description=Chit-Chat Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/chitchat
ExecStart=/usr/bin/node server/app.js
Restart=on-failure
RestartSec=10
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/chitchat/.env

[Install]
WantedBy=multi-user.target
```

5. **Start service**
```bash
sudo systemctl daemon-reload
sudo systemctl enable chitchat
sudo systemctl start chitchat
sudo systemctl status chitchat
```

### Option 2: PM2 Process Manager

1. **Install PM2**
```bash
npm install -g pm2
```

2. **Create ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'chitchat',
    script: './server/app.js',
    instances: 4,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

3. **Start with PM2**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Phase 5: Reverse Proxy Setup (Nginx)

### Install Nginx
```bash
sudo apt-get update
sudo apt-get install nginx
```

### Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/chitchat
```

```nginx
upstream node_app {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
  server localhost:3003;
}

server {
  listen 80;
  server_name yourdomain.com www.yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  # SSL Certificates
  ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
  ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

  # Security headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Compression
  gzip on;
  gzip_types text/plain text/css text/javascript application/json application/javascript;
  gzip_min_length 1000;

  # Reverse proxy
  location / {
    proxy_pass http://node_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
  }

  # Static files caching
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/chitchat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Phase 6: SSL/TLS Certificate (Let's Encrypt)

### Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

### Generate Certificate
```bash
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
sudo systemctl list-timers certbot.timer
```

---

## Phase 7: Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "server/app.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - db
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
    networks:
      - chitchat-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: chitchat
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - chitchat-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/ssl/certs
    depends_on:
      - web
    restart: unless-stopped
    networks:
      - chitchat-network

volumes:
  db_data:

networks:
  chitchat-network:
    driver: bridge
```

### Build and Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Phase 8: Cloud Platform Deployment

### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-chitchat-app

# Add environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### AWS EC2
```bash
# Launch EC2 instance (Ubuntu 20.04)
# Connect via SSH
ssh -i key.pem ubuntu@instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <repo> /home/ubuntu/chitchat
cd /home/ubuntu/chitchat

# Setup and start
npm install
node server/app.js
```

### Google Cloud Run
```bash
# Install Google Cloud CLI
# Authenticate
gcloud auth login

# Deploy
gcloud run deploy chitchat \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,JWT_SECRET=your-secret
```

### Azure App Service
```bash
# Install Azure CLI
# Login
az login

# Create resource group
az group create --name chitchat-rg --location eastus

# Create app service plan
az appservice plan create --name chitchat-plan --resource-group chitchat-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group chitchat-rg --plan chitchat-plan --name chitchat-app --runtime "NODE|18.0"

# Deploy from GitHub
az webapp up -n chitchat-app
```

---

## Phase 9: Monitoring & Logging

### Application Logging
```javascript
// Add to server/app.js
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logFile = fs.createWriteStream(path.join(logsDir, 'app.log'), { flags: 'a' });

function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  console.log(logMessage);
  logFile.write(logMessage);
}

io.on('connection', (socket) => {
  log('INFO', `User connected: ${socket.id}`);
});

io.on('disconnect', (socket) => {
  log('INFO', `User disconnected: ${socket.id}`);
});
```

### Monitoring Tools

**PM2 Plus (Recommended)**
```bash
pm2 install pm2-auto-pull
pm2 link <secret-key> <public-key>
```

**New Relic**
```bash
npm install newrelic
```

**Datadog**
```bash
npm install dd-trace
```

### Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: Object.keys(io.sockets.sockets).length
  });
});
```

---

## Phase 10: Backup & Recovery

### Database Backup (PostgreSQL)
```bash
# Backup
pg_dump -U user chitchat > backup-2024-01-01.sql

# Restore
psql -U user chitchat < backup-2024-01-01.sql

# Automated daily backup
0 2 * * * /usr/bin/pg_dump -U user chitchat > /backups/chitchat-$(date +\%Y-\%m-\%d).sql
```

### File Backup
```bash
# Regular backup script
#!/bin/bash
BACKUP_DIR="/backups"
APP_DIR="/var/www/chitchat"
DATE=$(date +%Y-%m-%d)

tar -czf $BACKUP_DIR/chitchat-$DATE.tar.gz $APP_DIR
find $BACKUP_DIR -name "chitchat-*.tar.gz" -mtime +30 -delete
```

### Recovery Procedure
```bash
# 1. Restore files
tar -xzf chitchat-2024-01-01.tar.gz -C /var/www/

# 2. Restore database
psql -U user chitchat < backup-2024-01-01.sql

# 3. Restart service
systemctl restart chitchat

# 4. Verify
curl http://localhost:3000/health
```

---

## Phase 11: Performance Tuning

### Node.js Optimization
```bash
# Increase file descriptors
ulimit -n 65536

# Enable clustering in app.js
const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

### Database Optimization
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM messages WHERE created_at > NOW() - INTERVAL '1 day';

-- Vacuum and analyze
VACUUM ANALYZE;
```

### Memory Management
```javascript
// Monitor memory usage
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory Usage:', {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    external: Math.round(memUsage.external / 1024 / 1024) + ' MB'
  });
}, 60000);
```

---

## Phase 12: Post-Deployment Testing

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 1000 -c 100 https://yourdomain.com/
```

### SSL Testing
```bash
# Use SSL Labs
# https://www.ssllabs.com/ssltest/

# Or use testssl.sh
./testssl.sh https://yourdomain.com
```

### Security Scanning
```bash
# OWASP ZAP
# npm install -g @owasp/zap-cli

# npm audit
npm audit

# Snyk
npm install -g snyk
snyk test
```

---

## Quick Reference: Deployment Commands

```bash
# Production Startup
NODE_ENV=production npm start

# With PM2
pm2 start ecosystem.config.js

# Docker
docker-compose up -d

# View logs
journalctl -u chitchat -f
tail -f /var/log/nginx/error.log

# Health check
curl http://localhost:3000/health

# Database backup
pg_dump chitchat > backup.sql

# Restart service
systemctl restart chitchat
systemctl restart nginx
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
journalctl -u chitchat -n 50
pm2 logs

# Verify port
netstat -tulpn | grep 3000
```

### High Memory Usage
```bash
# Check memory
free -h

# Restart PM2
pm2 restart all

# Check for memory leaks
node --inspect server/app.js
```

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U user -d chitchat

# Check credentials in .env
cat .env | grep DATABASE

# Verify network connectivity
ping database-host
```

### SSL Certificate Errors
```bash
# Check certificate
openssl s_client -connect yourdomain.com:443

# Renew certificate
certbot renew --dry-run
certbot renew
```

---

## Success Checklist

- [ ] Environment configured
- [ ] Dependencies installed
- [ ] Server starts without errors
- [ ] Health check endpoint responds
- [ ] Database connected (if used)
- [ ] Reverse proxy configured
- [ ] SSL certificate installed
- [ ] Firewall rules configured
- [ ] Monitoring enabled
- [ ] Backup system operational
- [ ] Load testing passed
- [ ] Security scanning passed
- [ ] Team trained
- [ ] Rollback plan documented

---

**Deployment Ready!** 🚀

For production support, see QUICK_REFERENCE.md
For feature documentation, see FEATURES.md
