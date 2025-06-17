# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run compile

# Build frontend for production
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps && npm run build

# Go back to app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S hackcoin && \
    adduser -S hackcoin -u 1001

# Create directories with proper permissions
RUN mkdir -p node/wallet && \
    chown -R hackcoin:hackcoin /app

# Switch to non-root user
USER hackcoin

# Expose ports
EXPOSE 3001 6001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Environment variables
ENV NODE_ENV=production
ENV NETWORK_TYPE=MAINNET
ENV HTTP_PORT=3001
ENV P2P_PORT=6001

# Start the global node
CMD ["node", "global-node.js"]
