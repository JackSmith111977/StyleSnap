# Debug Fix Flow - 详细流程

**返回主文件：** [SKILL.md](../SKILL.md)

---

## 阶段 1：事件链分析

**目标**: 理解问题的完整执行链路，识别关键节点

### 步骤 1.1：问题澄清（Inversion 模式）

如果用户描述模糊，主动提问：

1. **问题现象** - 具体表现是什么？错误提示？
2. **触发条件** - 什么操作会导致问题？
3. **影响范围** - 哪些功能受影响？
4. **发生时间** - 什么时候开始的？是否有相关更改？
5. **环境信息** - 本地/生产环境？浏览器类型？

**门控**: 问题描述清晰，能够定位到具体功能模块

### 步骤 1.2：事件链绘制

识别从用户交互到后端处理的完整数据流：

```
用户操作
  ↓
前端组件 (事件处理)
  ↓
API 调用 / Server Action
  ↓
业务逻辑层
  ↓
数据访问层 (数据库/Storage)
  ↓
响应返回
  ↓
前端更新
```

**示例（头像上传）**:
```
前端 (profile-form.tsx:handleAvatarChange)
  ↓
Server Action (actions/profiles/index.ts:uploadAvatar)
  ↓
认证层 (lib/auth.ts:getCurrentUser)
  ↓
Storage 上传 (Supabase Storage)
  ↓
数据库更新 (profiles 表)
  ↓
缓存清除 (revalidatePath)
```

### 步骤 1.3：识别关键节点

标记可能出错的环节：

- **参数传递** - 前端到后端的参数是否正确
- **认证授权** - 用户身份是否有效
- **数据验证** - 输入验证是否通过
- **外部调用** - API/数据库/Storage 调用是否成功
- **状态更新** - 数据更新是否成功

**门控**: 事件链完整，关键节点已识别

---

## 阶段 2：添加调试输出

**目标**: 在关键节点插入日志，观察实际执行

### 步骤 2.1：前端组件调试

在事件处理函数中添加：

```typescript
const handleEvent = async (params) => {
  console.log('[组件名] 事件触发:', { params, 关键状态 })
  
  // 验证
  if (!params) {
    console.log('[组件名] 参数验证失败')
    return
  }
  
  console.log('[组件名] 调用 API:', { API 名，参数 })
  const result = await apiCall(params)
  console.log('[组件名] API 返回:', result)
  
  // 处理结果
}
```

### 步骤 2.2：Server Action 调试

在 Server Action 中添加：

```typescript
export async function actionName(params) {
  console.log('[action 名] 开始执行:', { params })
  
  const client = await createClient()
  const user = await getCurrentUser()
  console.log('[action 名] 用户认证:', { hasUser: !!user, userId: user?.id })
  
  if (!user) {
    console.error('[action 名] 用户未登录')
    return { error: '请先登录' }
  }
  
  // 业务逻辑
  console.log('[action 名] 业务逻辑执行:', { 关键变量 })
  
  // 外部调用
  console.log('[action 名] 调用外部服务:', { 服务名 })
  const result = await externalCall()
  console.log('[action 名] 外部服务返回:', result)
  
  return { success: true }
}
```

### 步骤 2.3：认证层调试

在认证函数中添加：

```typescript
export async function getCurrentUser() {
  console.log('[getCurrentUser] 开始执行')
  const client = await createClient()
  console.log('[getCurrentUser] 客户端已创建')
  
  const result = await client.auth.getUser()
  console.log('[getCurrentUser] 返回:', { 
    hasUser: !!result.data.user, 
    userId: result.data.user?.id 
  })
  
  return result.data.user
}
```

**门控**: 调试输出已添加到所有关键节点

---

## 阶段 3：MCP Flow 调试

**目标**: 使用 MCP 工具获取运行时输出

### 步骤 3.1：启动开发服务器

```bash
pnpm dev
```

### 步骤 3.2：发现 Next.js 服务器

使用 `nextjs_index` 发现运行的服务器：

```
nextjs_index → 获取服务器端口和可用工具
```

### 步骤 3.3：获取错误信息

```
nextjs_call get_errors → 获取编译/运行时错误
```

### 步骤 3.4：导航到问题页面

使用 `playwright-mcp` 导航：

```
browser_navigate http://localhost:3000/problem-page
```

### 步骤 3.5：执行问题操作

使用 `playwright-mcp` 执行导致问题的操作：

```
browser_click "问题按钮"
browser_fill_form [...]
```

### 步骤 3.6：获取控制台输出

```
browser_console_messages level=debug
```

### 步骤 3.7：分析日志

从日志中识别：
- 哪些步骤执行成功
- 哪一步开始失败
- 错误信息是什么
- 是否有异常堆栈

**门控**: MCP 调试已获取运行时输出，问题环节已定位

---

## 阶段 4：上下文收集

**目标**: 在上下文明确之前禁止修复代码

### 步骤 4.1：API Reference 查阅

查阅相关 API 文档：
- Next.js 文档
- Supabase 文档
- React 文档
- 其他使用中的库文档

### 步骤 4.2：Web Access 搜索

使用 `mcp__WebSearch__bailian_web_search` 搜索：
- 类似问题
- 官方解决方案
- 社区最佳实践

### 步骤 4.3：代码库分析

搜索项目中类似实现：
- 其他类似功能如何实现的
- 是否有可参考的代码模式

### 步骤 4.4：数据库 Schema 确认

确认数据结构和约束：
- 表结构
- 字段类型
- 约束条件
- 触发器

### 步骤 4.5：形成解决方案

基于收集的上下文，形成 2-3 个解决方案：

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| 方案 A | ... | ... | ⭐⭐⭐ |
| 方案 B | ... | ... | ⭐⭐ |

**门控**: 上下文充足，已形成解决方案，等待用户确认

---

## 阶段 5：解决方案执行

**目标**: 实施修复并验证

### 步骤 5.1：方案确认

向用户展示解决方案，等待确认：

```
基于分析，建议以下方案：

方案 A（推荐）：...
方案 B：...

请确认采用哪个方案？
```

### 步骤 5.2：实施修复

根据确认的方案实施代码更改

### 步骤 5.3：验证修复

重新运行 MCP 调试流程，确认问题已解决：
- 页面功能正常
- 无控制台错误
- 无网络请求错误

### 步骤 5.4：构建验证

```bash
pnpm typecheck && pnpm lint && pnpm build
```

**门控**: 修复已验证成功，构建通过

---

## 阶段 6：恢复生产状态

**目标**: 清理调试代码，提交更改，文档化经验

### 步骤 6.1：移除调试日志

清理所有 `console.log` 语句（保留必要的错误处理）

### 步骤 6.2：清理测试文件

删除测试产生的临时文件

### 步骤 6.3：创建调试报告

使用模板 `templates/debug-report.md` 创建报告：

位置：`docs/main/P{序号}_{问题}_DEBUG_REPORT.md`

### 步骤 6.4：提交更改

```bash
git add <changed files>
git commit -m "fix: {问题简述}

- 问题根因：{根因}
- 解决方案：{方案}
- 调试报告：docs/main/P{序号}_{问题}_DEBUG_REPORT.md
"
```

### 步骤 6.5：推送远程

```bash
git push
```

### 步骤 6.6：经验沉淀

如果流程有复用价值，更新或创建相关 Skill

**门控**: 生产状态已恢复，文档已创建，提交已推送

---

## 异常处理

### MCP 工具不可用

如果 MCP 工具无法使用：
1. 尝试重新启动开发服务器
2. 使用浏览器开发者工具手动检查
3. 在 Server Action 中返回详细错误信息

### 修复后仍有问题

如果修复后问题仍然存在：
1. 返回阶段 1，重新分析事件链
2. 检查是否有遗漏的关键节点
3. 考虑是否需要更多上下文收集

### 无法定位问题

如果无法定位问题根因：
1. 使用二分法逐步缩小范围
2. 在更多中间节点添加日志
3. 考虑是否需要 Web Access 搜索类似问题
