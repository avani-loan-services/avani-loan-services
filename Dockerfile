# Multi-stage production Dockerfile for AVANI LOAN SERVICES Backend
# Production-ready, secure, least-privilege, optimized for Fly.io / Node.js 22

FROM node:22-bookworm-slim AS base
WORKDIR /app

# Install runtime utilities & build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package manifests
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source files
COPY src/ ./src/
COPY data/ ./data/
COPY public/ ./public/
COPY dist/ ./dist/

# Ensure non-root permissions
USER node

# Production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/portal/health || exit 1

# Start backend server
CMD ["node", "src/server.cjs"]
