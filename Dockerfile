# ======================
# Build stage
# ======================
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl
RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm prisma generate
RUN pnpm build


# ======================
# Runtime stage
# ======================
FROM node:22-alpine

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json and use npm for flat node_modules (works better with prisma)
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts

# Install prisma CLI for migrations (match project version)
RUN npm install -g prisma@6

# Copy built output + prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client for runtime environment
RUN prisma generate

EXPOSE 3000

CMD ["sh", "-c", "prisma migrate deploy && node dist/src/main.js"]
