# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Prune dev dependencies
RUN npm ci --omit=dev --ignore-scripts

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
