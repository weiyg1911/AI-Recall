# 构建阶段：在 monorepo 根上下文安装依赖并构建 backend
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# 复制依赖与 workspace 配置
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared-types/package.json packages/shared-types/
COPY packages/utils/package.json packages/utils/

# 复制源码（backend 构建需要）
COPY packages/shared-types/src packages/shared-types/src
COPY packages/utils/src packages/utils/src
COPY apps/backend apps/backend

RUN pnpm install --frozen-lockfile
RUN pnpm --filter backend build

# 运行阶段：仅保留运行时所需
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# 仅复制生产依赖与构建产物
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend/package.json /app/apps/backend/
COPY --from=builder /app/apps/backend/dist /app/apps/backend/dist
COPY --from=builder /app/packages/shared-types/package.json /app/packages/shared-types/
COPY --from=builder /app/packages/shared-types/src /app/packages/shared-types/src
COPY --from=builder /app/packages/utils/package.json /app/packages/utils/
COPY --from=builder /app/packages/utils/src /app/packages/utils/src

# 安装生产依赖（不装 devDependencies）
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate && \
    pnpm install --frozen-lockfile --prod

EXPOSE 3002

CMD ["node", "apps/backend/dist/main.js"]
