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
RUN npm install -g pnpm

WORKDIR /app

ENV NODE_ENV=production

# Copy only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Install prisma CLI globally for migrations
RUN pnpm add -g prisma

# Copy built output + prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["sh", "-c", "prisma migrate deploy && node dist/main.js"]
