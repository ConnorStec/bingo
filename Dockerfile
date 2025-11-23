# Multi-stage build for production deployment

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy workspace package files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/

# Install all dependencies
RUN npm ci

# Copy frontend source
COPY frontend ./frontend

# Build frontend
RUN npm run build -w frontend

# Stage 2: Build backend
FROM node:20-alpine AS backend-build
WORKDIR /app

# Copy workspace package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install all dependencies
RUN npm ci

# Copy backend source
COPY backend ./backend

# Build backend
RUN npm run build -w backend

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Copy workspace package files
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built backend from build stage
COPY --from=backend-build /app/backend/dist ./backend/dist

# Copy frontend build into backend's public directory
COPY --from=frontend-build /app/frontend/dist ./backend/public

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start command (runs migrations then starts app)
CMD ["sh", "-c", "cd backend && npm run migration:run && node dist/main.js"]
