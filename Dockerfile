# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install OpenSSL and glibc compat for Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
RUN npm install --package-lock-only || true
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /usr/src/app

# Install curl for health checks and OpenSSL/libc6-compat for Prisma
RUN apk add --no-cache curl openssl libc6-compat

COPY package*.json ./
RUN npm install --package-lock-only --omit=dev || true
RUN npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps

# Copy node_modules completo ao invés de apenas .prisma (necessário para Prisma client completo)
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000
EXPOSE 9229

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
