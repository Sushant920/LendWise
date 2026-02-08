# Backend Dockerfile for Render when Root Directory must stay empty
# (Render switches Language from Docker to Node if Root Directory is set.)
# Build context: repo root. Use Dockerfile Path: Dockerfile (or leave default).
FROM node:22-alpine

WORKDIR /app

# Copy backend package files and prisma
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy backend source and build
COPY backend/ .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
