# Use official Node LTS image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies (production)
RUN npm ci --only=production || npm i --only=production

# Copy application code
COPY . .

# Expose port
ENV PORT=3000
EXPOSE ${PORT}

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Start the app
CMD ["node", "server/app.js"]
