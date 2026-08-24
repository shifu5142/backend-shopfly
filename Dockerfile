FROM node:25.5-alpine AS builder

WORKDIR /app

ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY nest-cli.json tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY src ./src

RUN npx prisma generate
RUN npm run build


FROM node:25.5-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache dumb-init openssl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 shopfly

RUN chown -R shopfly:nodejs /app

USER shopfly

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/main.js"]
