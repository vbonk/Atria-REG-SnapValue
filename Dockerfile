# Use Node.js 18 LTS
FROM node:18-alpine

# Install curl for health checks and OpenSSL for Prisma
RUN apk add --no-cache curl openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies (including dev dependencies for build)
RUN npm install
RUN cd server && npm ci --only=production
RUN cd client && npm install

# Copy application code
COPY . .

# Build the client
RUN npm run build:client

# Generate Prisma client
RUN cd server && npx prisma generate

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/healthz || exit 1

# Start server
CMD ["node", "server/index.js"]