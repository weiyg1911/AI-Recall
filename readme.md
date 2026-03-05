以下是为 Cursor 准备的项目初始化文档，包含完整的技术栈、目录结构、配置步骤和关键代码示例。请按顺序执行。

---

# 背书记忆全栈项目初始化指南

> **初始化状态**：本项目已按本文档完成 Monorepo 骨架初始化，包含根配置、`packages/*`、`apps/backend`、`apps/web`、`apps/mobile`。可直接使用下方「快速开始」进行开发。

## 快速开始

```bash
# 安装依赖（已完成可跳过）
pnpm install

# 生成 API 客户端（后端启动后会更新 specs/openapi.json，可再次执行以更新客户端）
pnpm run generate:api

# 启动所有应用开发模式（或按需单独启动）
pnpm dev

# 仅启动后端
pnpm --filter backend dev

# 仅启动 Web
pnpm --filter web dev

# 仅启动移动端
pnpm --filter mobile dev
```

- 后端默认：http://localhost:3002，Swagger 文档：http://localhost:3002/api-docs
- Web 默认：http://localhost:3001

📄 **开发说明**：接口开发流程、前后端并行开发、公共类型放置约定见 [docs/API与前端开发指南.md](docs/API与前端开发指南.md)。

---

## 项目概述
- **项目名称**：背书记忆（Memorize）
- **技术栈**：
  - 后端：NestJS + TypeScript
  - Web 端：Next.js (App Router) + TypeScript
  - 移动端：React Native (Expo) + TypeScript
  - 包管理：pnpm + Turborepo (Monorepo)
  - API 规范：OpenAPI (Swagger) + 自动生成类型安全的客户端
- **核心功能**：多 Agent 背书记忆，支持挖空、出题、判题、语音/视频讲解
- **开发要求**：所有代码使用 TypeScript，严格模式；前后端类型共享；API 客户端自动生成。

