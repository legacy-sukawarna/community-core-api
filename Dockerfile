# Use a lightweight Node.js image
FROM node:22-alpine

# Install OpenSSL
RUN apk add --no-cache openssl

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start:prod"]