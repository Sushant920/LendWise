# Backend Dockerfile for Render when Root Directory must stay empty
# (Render switches Language from Docker to Node if Root Directory is set.)
# Build context: repo root. Use Dockerfile Path: Dockerfile (or leave default).
FROM node:22-alpine

WORKDIR /app

# Copy entire backend (root .dockerignore excludes frontend, etc.; backend/.dockerignore is not used for context)
COPY backend/ .

# Install deps, generate Prisma client, build (dist must exist after this)
RUN npm ci && npx prisma generate && npm run build && test -f dist/main.js || (echo "Build did not produce dist/main.js" && ls -la dist/ 2>/dev/null || true && exit 1)

ENV NODE_ENV=production
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
