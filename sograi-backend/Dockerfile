# Estágio 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN pnpm build

# Estágio 2: Produção
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN pnpm install --prod
RUN pnpm prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3333

CMD ["sh", "-c", "pnpm prisma db push && node dist/main.js"]
