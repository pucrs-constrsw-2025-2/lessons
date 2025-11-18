# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

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

# Install curl for health checks
RUN apk add --no-cache curl

COPY package*.json ./
RUN npm install --package-lock-only --omit=dev || true
RUN npm ci --omit=dev --legacy-peer-deps || npm install --omit=dev --legacy-peer-deps

COPY --from=builder /usr/src/app/.env ./.env
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
EXPOSE 9229

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
