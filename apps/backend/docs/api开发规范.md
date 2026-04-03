# NestJS 后端 API 接口开发规范

为了保证团队开发中 API 文档的清晰度、准确性并与前后端对接顺畅，特制定本后端接口与 Swagger 编写规范。

## 1. 核心设计思想

文档与代码应该遵循**高内聚低耦合**的风格，保持 Controller 层逻辑的清爽：

- **DTO（Type 类型处）**：全权负责描述“数据结构长什么样”、“有什么限制”、“有没有默认值”以及“长什么样的字段范例”。
- **Controller（Interface 接口处）**：全权负责说明“这个接口用于什么业务”、“它需要走什么授权（Token）”以及“数据流入流出的指向性定义”。

---

## 2. 详细编写规范

### 2.1 DTO (Type 类型声明)

所有的入参 (`Request Body/Query`) 和 出参 (`Response Data`) 只要是对象结构，均需要在 `packages/shared-types` （或对应模块下）提取出 DTO 或者 Response 实体类。

在每一个 DTO 属性上**必须**使用 `@ApiProperty` 装饰器，并满足以下规范：

1. **`description` (描述)**：必填。用简短的一句话描述该字段的业务含义。
2. **`example` (示例)**：必填。必须给出一段**具有真实业务含义**的数据示例。绝对不允许填写 `"string"`、`"abc"`、`123` 这种没有任何业务指代意义的临时字符。
3. **`required` (是否必填)**：
   - 如果该属性是必填的（带有 `!`），`required` 可以不写，因为 Swagger 默认所有项为必填。
   - 如果该属性是选填的（TypeScript 中使用了 `?` 修饰符），**必须**配合显式指定 `required: false`，否则会导致文档要求前端必传该参，产生歧义。
4. **其他属性 (视情况)**：比如 `enum`（枚举限制）、`default`（默认值配置）等，如果有需要应在此处定义。

**✅ 正确示例：**

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateKnowledgeDto {
  @ApiProperty({
    example: '水滴石穿',
    description: '知识点标题',
    required: false, // TS 有 ? 说明是选填，则必须加 required: false
  })
  title?: string;

  @ApiProperty({
    example: '比喻只要坚持不懈，细微之力也能成难堪之功',
    description: '知识点核心内容',
  })
  content!: string;
}
```

---

### 2.2 Controller (控制器接口声明)

控制器应该关注请求的接收和下发，**不要在 Controller 里写入大段的字段说明或示例（不要滥用 `@ApiBody` 等）**，只要你在方法签名中使用了正确的 DTO 类，Swagger 便能自动提取你上面写好的类型文档。

一个规范的控制器接口，必须包含以下 Swagger 要素：

1. **`@ApiTags('模块名称')`** (类级)：声明控制器归属的业务模块。
2. **`@ApiOperation({ summary: '接口功能概述' })`** (方法级)：通过一句话简明扼要说明该接口的作用。
3. **鉴权说明 `@ApiBearerAuth()`** (方法级)：凡是加上了 `@UseGuards(JwtAuthGuard)` 守卫需要 Token 鉴权的接口，必须补充声明此装饰器，这使得 Swagger UI 控制台上能触发 auth 输入框。
4. **返回值说明 `@ApiOkResponse({ type: 实体类 })`** (方法级)：**强制要求说明接口返回的内容结构**。如果你们的包装策略是统一格式（如 `{ code, data, msg }`），这里的 `type` 应该指向 `data` 内携带出的目标响应实体类（如 `XxxResponseDto`）。

**✅ 正确示例：**

```typescript
import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
// 引入共享的类型
import { CreateKnowledgeDto, KnowledgeBaseResponseDto } from '@memorize/shared-types';

@ApiTags('知识点管理')
@Controller('knowledge')
export class KnowledgeController {
  @Post('create')
  @UseGuards(JwtAuthGuard)
  // 1. 业务行为：接口是用来干嘛的
  @ApiOperation({ summary: '创建新的知识点' })
  // 2. 鉴权声明：此接口需要 Token 校验
  @ApiBearerAuth()
  // 3. 返回值声明：明确指出操作成功后返回的数据结构和类型的 DTO 模型
  @ApiOkResponse({
    description: '知识点创建成功，返回新创建的知识概览',
    type: KnowledgeBaseResponseDto,
  })
  createKnowledge(
    @Req() req: AuthenticatedRequest,
    // 4. 重中之重：只要写了 @Body() body: 创建DTO，不要在上面写冗长累赘的 @ApiBody！系统会自动去解析 CreateKnowledgeDto 内的 properties
    @Body() body: CreateKnowledgeDto,
  ) {
    return this.knowledgeService.createKnowledge(body, req.user.userId);
  }
}
```

### 2.3 关于 @ApiBody 的额外说明

一般情况下 Controller 层无需编写 `@ApiBody`。**只有当存在以下特殊情况时才考虑使用：**

1. 你的接口业务很复杂，比如你想在文档上**提供多个不同侧重点的 JSON 报文示例**，方便前端切换（使用 `examples` 属性）。
2. 你强行不采用 Class 接收 `@Body()` 数据（非常不推荐。例如接受一个任何形态的泛用型 JSONObject 时，此时属于无奈之举去硬编码）。
3. 纯原生文件上传（如 FormData 结构复杂且难抽象成明确的单纯 DTO）。
