# API 与前端开发指南

本文档整理接口开发流程、前后端并行开发方式，以及公共类型的放置约定。

---

## 改接口后的必做步骤

**只要新增或修改了后端接口（路径、请求/响应结构），请按顺序做这两步，否则前端类型会与接口不一致：**

1. **重启后端**（或执行能写出 `openapi.json` 的流程）  
   后端启动时会把当前 Swagger 文档写入 `packages/api-client/specs/openapi.json`，不重启则该文件不会更新。

2. **执行 `pnpm run generate:api`**  
   根据最新的 `openapi.json` 重新生成 `packages/api-client/src/generated` 中的客户端与类型。

**说明**：根目录的 `pnpm build` 已包含 `generate:api`，因此若**只改了前端代码**、没有动后端接口，直接执行 `pnpm build` 即可，无需单独跑 `generate:api`。只有在你改过接口并重启后端之后，才需要再跑一次 `generate:api`（或直接跑一次 `pnpm build` 也会先生成再构建）。

---

## 一、开发一个接口的完整流程（后端 → Swagger → 前端）

整体链路：**后端写接口并打 Swagger 装饰器 → 后端启动时自动生成 OpenAPI → 用 openapi-ts 生成前端客户端 → 前端调用生成的方法**。

### 1. 后端：在 Nest 里写接口并写清 Swagger

在对应 Controller（如 `apps/backend/src/health.controller.ts`）里增加方法，并加上 `@ApiOperation`、`@ApiResponse` 等，让 Swagger 能生成完整的请求/响应描述。

**示例：在 health 里增加「获取服务器时间」**

```typescript
@Get('time')
@ApiOperation({ summary: '获取服务器时间' })
@ApiResponse({
  status: 200,
  description: '服务器当前时间（ISO 8601）',
  schema: {
    example: {
      serverTime: '2025-03-05T12:00:00.000Z',
      timestamp: 1709632800000,
    },
  },
})
getServerTime() {
  const now = new Date();
  return {
    serverTime: now.toISOString(),
    timestamp: now.getTime(),
  };
}
```

- 路径为：`GET /health/time`。
- 不需要手改 `openapi.json`，后端启动时会由 `main.ts` 写入 `packages/api-client/specs/openapi.json`。

### 2. 让 OpenAPI 文件更新

保存代码后**重启后端**（如 `pnpm --filter backend dev`）。重启完成后，`packages/api-client/specs/openapi.json` 中会出现新的 `"/health/time"` 及对应 `operationId`（如 `HealthController_getServerTime`）。

### 3. 重新生成前端客户端

在项目根目录执行：

```bash
pnpm run generate:api
```

会在 `packages/api-client/src/generated` 中生成/更新：

- `sdk.gen.ts`：如 `healthControllerGetServerTime`
- `types.gen.ts`：如 `HealthControllerGetServerTimeData`、`HealthControllerGetServerTimeResponses`

入口 `packages/api-client/src/index.ts` 已 `export * from './generated'`，新方法会自动被导出。

### 4. 前端调用

在 Web（如 `apps/web/app/page.tsx`）中：

```ts
import {
  healthControllerGetServerTime,
} from '@memorize/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002';

const result = await healthControllerGetServerTime({
  baseUrl: API_BASE,
  responseStyle: 'data',
});
// result 类型由 OpenAPI schema 推断
```

### 流程小结

| 步骤 | 操作 | 结果 |
|------|------|------|
| 1 | 在 Controller 中加方法并写 Swagger 装饰器 | 多出对应 HTTP 接口 |
| 2 | 启动/重启后端 | `packages/api-client/specs/openapi.json` 自动更新 |
| 3 | 根目录执行 `pnpm run generate:api` | `packages/api-client` 生成新方法及类型 |
| 4 | 前端从 `@memorize/api-client` 引入并调用 | 类型安全的请求/响应 |

注意：不要手改 `openapi.json` 或 `src/generated` 下的文件；每次新增/修改接口或响应结构后，需重启后端并重新执行 `pnpm run generate:api`，前端类型才会与接口一致。

---

## 二、前后端并行开发（契约先行）

可以**先定好接口契约，后端只做“符合契约的占位实现”，前端用生成的客户端开发**，两边并行。

### 思路：契约先行（API / Contract First）

- **先定契约**：路径、方法、请求/响应形状（在项目里 = Swagger 装饰器 + 最终生成的 `openapi.json`）。
- **后端**：先实现“符合契约的壳子”——路由存在、返回固定/假数据，暂不写复杂业务。
- **前端**：用 `pnpm run generate:api` 根据契约生成客户端，按类型调接口、做 UI。
- **并行**：前端不依赖后端业务实现，只依赖“接口长什么样”；后端之后再把 stub 换成真实逻辑，只要不改契约，前端无需大改。

### 具体做法

**做法：后端先写“空实现 + Swagger”（推荐）**

- 在后端 Nest 里先把 Controller 写好：路径、方法、`@ApiOperation`、`@ApiResponse`（含 `schema`/`example`）写全。
- 方法里先 `return` 写死的示例数据（或简单计算），不接数据库、不写复杂逻辑。
- 启动后端 → 自动更新 `packages/api-client/specs/openapi.json`。
- 执行 `pnpm run generate:api` → 前端拿到类型安全的客户端并开发。
- 后端之后再替换成真实业务；只要请求/响应形状不变，前端不用动。


### 并行时注意

- **契约尽量稳定**：路径、请求/响应结构定好后少改；若必须改，需同步改后端装饰器（或 openapi.json）并重新 `generate:api`。
- **后端先返回“合法形状”**：stub 返回的 JSON 要与 Swagger 中声明的 `schema`/`example` 一致，前端用生成类型时才不会踩坑。
- **前端不依赖业务细节**：前端只依赖“接口返回什么类型、有哪些字段”；业务规则、校验、数据库等由后端后续实现。

---

## 三、公共传输类型放在哪里

项目中与“公共传输类型”相关的有两类位置，用途不同。

### 1. `packages/shared-types` —— 手写、前后端共用的类型

- **放什么**：业务里前后端都要用的**领域/模型类型**、**DTO**，例如 `Card`、`User`、`HealthResponse` 等。
- **谁用**：
  - 后端：在 Nest 的 DTO/Entity 中引用，并用 Swagger 的 `@ApiProperty()` 等把结构暴露到 OpenAPI。
  - 前端：从 `@memorize/shared-types` 引入，做类型标注、组件 props 等。
- **特点**：人工维护、一处定义、两边共享，适合“业务语义明确、多处复用”的类型。

**推荐**：把「公共传输的类型」（业务层共用的模型/DTO）**放在 `packages/shared-types`**。

### 2. `packages/api-client/src/generated/types.gen.ts` —— 自动生成的契约类型

- **放什么**：由 `openapi.json` 经 `@hey-api/openapi-ts` 生成的、**每个接口的请求/响应类型**（如 `HealthControllerCheckHealthData`、`HealthControllerCheckHealthResponses`）。
- **谁用**：主要为前端调用 API 时的入参、返回值类型；后端一般不直接引用。
- **特点**：**不要手改**，每次执行 `pnpm run generate:api` 会覆盖；与 OpenAPI 契约严格一致。

### 如何选择

| 需求 | 放置位置 |
|------|----------|
| 业务实体、通用 DTO（如 Card、User、分页结果包装） | **`packages/shared-types`** |
| 某个接口的请求/响应形状（仅由 OpenAPI 描述即可） | 不单独放，由 **api-client 的 generated** 根据 OpenAPI 生成 |
| 既要在后端 DTO/Swagger 里用，又要在前端当“公共类型”用 | 定义在 **`packages/shared-types`**，后端 DTO 引用并打 `@ApiProperty()`，保证 OpenAPI 与类型一致 |

---

## 参考

- 后端 Swagger 输出与生成脚本：`apps/backend/src/main.ts`
- OpenAPI 规范文件：`packages/api-client/specs/openapi.json`
- 生成器配置：`packages/api-client/openapi-ts.config.ts`
- 共享类型示例：`packages/shared-types/src/index.ts`
