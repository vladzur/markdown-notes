# Etapa de construcción
FROM node:22-alpine AS builder
WORKDIR /app

# Copiar configuraciones del monorepo para pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc package.json ./
COPY packages/config/package.json packages/config/
COPY packages/firebase/package.json packages/firebase/
COPY apps/server/package.json apps/server/

# Instalar pnpm y dependencias
RUN corepack enable && corepack prepare pnpm@11 --activate
RUN pnpm install --frozen-lockfile --filter @notes-app/server

# Copiar código fuente
COPY packages/ packages/
COPY apps/server/ apps/server/

# Compilar TypeScript
RUN pnpm --filter @notes-app/server build

# Etapa de producción
FROM node:22-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=8080
EXPOSE 8080

CMD ["node", "dist/index.js"]
