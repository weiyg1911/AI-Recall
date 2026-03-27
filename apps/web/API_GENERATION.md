# Web 端 API 自动生成流程

## 概述

当后端新增 API 后，前端可以自动生成对应的 TypeScript 接口和预配置的 API 函数，无需手动维护。

## 自动化流程

### 1. 后端新增 API

后端通过 Swagger 注解自动生成 OpenAPI 文档。

### 2. 运行自动生成命令

从项目根目录运行：

```bash
pnpm run generate:api
```

这个命令会自动执行：
1. 生成 API 客户端（`@memorize/api-client`）
2. 生成 web 端预配置的 API 包装函数

### 3. 直接使用

在组件中导入并使用 API 函数：

```typescript
import { knowledgeControllerGetKnowledgeList } from '@/lib/api';

// 直接使用，无需传递 client
const response = await knowledgeControllerGetKnowledgeList({});
```

## 自动注入的功能

所有生成的 API 函数都自动包含：
- ✅ `X-Trace-Id` - 分布式追踪 ID
- ✅ `X-Request-Id` - 唯一请求 ID
- ✅ `Authorization: Bearer {token}` - 认证令牌（如果已登录）

## 文件结构

```
apps/web/
├── lib/
│   ├── api.ts                    # API 客户端配置（拦截器等）
│   └── generated-api.ts          # 自动生成的 API 包装函数 ⚠️ 请勿手动编辑
└── scripts/
    └── generate-api-wrappers.ts  # 生成脚本
```

## 手动触发生成

如果只需要重新生成 web 端包装函数：

```bash
cd apps/web
pnpm run generate:wrappers
```

## 工作原理

1. **API 客户端生成**：
   - `@hey-api/openapi-ts` 从 `openapi.json` 生成 TypeScript 接口和函数
   - 输出到：`packages/api-client/src/generated/`

2. **Web 端包装函数生成**：
   - `generate-api-wrappers.ts` 扫描生成的 API 函数
   - 为每个函数创建预配置版本，自动注入 `apiClient`
   - 输出到：`apps/web/lib/generated-api.ts`

3. **拦截器自动注入**：
   - `api.ts` 中的拦截器自动为所有请求添加 traceId 和 token

## 注意事项

- ⚠️ **不要手动编辑** `lib/generated-api.ts` 文件，每次运行生成命令时都会被覆盖
- ✅ 如果需要自定义拦截器逻辑，编辑 `lib/api.ts` 中的拦截器部分
- ✅ 生成的类型定义会自动导出，可以在任何地方使用

## 示例对比

### 之前的写法
```typescript
import { knowledgeControllerGetKnowledgeList } from '@memorize/api-client';
import { apiClient, getAuthHeaders } from '@/lib/api';

const response = await knowledgeControllerGetKnowledgeList({
  client: apiClient,
  headers: getAuthHeaders(),
});
```

### 现在的写法
```typescript
import { knowledgeControllerGetKnowledgeList } from '@/lib/api';

const response = await knowledgeControllerGetKnowledgeList({});
```

## 故障排查

如果生成的 API 函数不包含最新的接口：

1. 确保后端已经运行并生成了最新的 `openapi.json`
2. 重新运行 `pnpm run generate:api`
3. 检查 `packages/api-client/specs/openapi.json` 是否包含最新的 API 定义
