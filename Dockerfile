FROM node:20.12.0 AS base

FROM base AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner

WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "start"]
# ENTRYPOINT [ "tail", "-f", "/dev/null" ]