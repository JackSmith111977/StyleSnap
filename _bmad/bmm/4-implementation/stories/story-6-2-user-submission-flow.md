---
title: '用户提交流程 - Story 6.2'
type: 'feature'
created: '2026-04-04'
status: 'done'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md', '_bmad/bmm/3-solutioning/artifacts/database-schema.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 开发者在使用 StyleSnap 时，无法提交自己的设计风格案例到平台，无法分享设计成果和贡献社区内容。

**Approach:** 创建用户提交功能，包括 /submit 提交页面、风格提交表单、图片上传、代码输入、审核流程，提交后状态为 pending_review，管理员审核通过后公开。

## Boundaries & Constraints

**Always:**
- 使用 Server Action `submitStyle` 处理提交逻辑
- 必须已登录用户才能提交（服务端验证）
- 表单验证使用 Zod Schema（名称 2-50 字符、描述 10-500 字符）
- 图片上传使用 Supabase Storage（浅色/深色模式预览图，PNG/JPG，≤5MB）
- 设计风格变量使用 JSONB 存储（色板、字体、间距、圆角、阴影）
- 代码片段支持 HTML/CSS/React 三种格式
- 提交后状态自动设为 `pending_review`
- Toast 反馈操作结果
- 缓存失效使用 `revalidateTag('styles', 'max')`

**Ask First:**
- 是否需要邮件通知用户审核结果

**Never:**
- 不允许未登录用户提交（自动跳转登录）
- 不允许跳过审核直接发布
- 不允许上传超过 5MB 的图片
- 不允许提交空代码或无效内容

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 已登录用户填写完整有效信息 | 创建风格记录，状态 pending_review，显示成功 Toast，跳转/my-submissions | N/A |
| UNAUTHORIZED | 未登录用户访问 /submit | 跳转登录页，返回后保留表单数据 | Session 检查失败 |
| VALIDATION_ERROR | 用户输入无效数据 | 前端显示错误提示，阻止提交 | Zod 验证失败 |
| IMAGE_TOO_LARGE | 上传图片超过 5MB | 显示"图片不能超过 5MB"，阻止上传 | 前端 + 服务端双重检查 |
| STORAGE_ERROR | Supabase Storage 上传失败 | 显示"图片上传失败，请重试"，记录错误日志 | 返回错误，不创建记录 |
| DATABASE_ERROR | 数据库写入失败 | 显示"提交失败，请重试"Toast | 记录错误日志，回滚事务 |
| PARTIAL_SUBMISSION | 用户只填写部分必填字段 | 前端验证拦截，显示"请填写所有必填字段" | 不允许提交 |

</frozen-after-approval>

## Code Map

- `apps/web/actions/styles/submit.ts` -- `submitStyle` Server Action（新建）
- `apps/web/app/submit/page.tsx` -- 提交页面（新建）
- `apps/web/components/submit/style-submission-form.tsx` -- 提交表单组件（新建）
- `apps/web/components/submit/image-upload.tsx` -- 图片上传组件（新建）
- `apps/web/components/submit/code-editor.tsx` -- 代码输入组件（新建）
- `apps/web/lib/storage.ts` -- Supabase Storage 工具函数（新建）
- `apps/web/lib/schemas.ts` -- 添加提交表单 Zod Schema（修改）
- `supabase/migrations/xxx_add_submission_status.sql` -- 审核状态迁移（如需要）

## Developer Context

### 技术栈要求
- **表单**: React Hook Form + Zod 验证
- **图片上传**: Supabase Storage (bucket: `style-previews`)
- **代码编辑**: 使用 `react-simple-code-editor` 或类似组件，支持语法高亮
- **状态管理**: 本地表单状态，不需要全局状态
- **认证检查**: Server Action 中使用 `getCurrentUser()` 服务端验证

### 架构合规要求
- 文件结构遵循 `FRONTEND_GUIDELINES.md` 规范
- 样式使用 CSS Modules + Tailwind CSS 4.x
- 组件命名：PascalCase 动词 + 名词 (如 `ImageUpload`, `CodeEditor`)
- Server Action 必须返回统一格式：`{ success: boolean, data?: T, error?: string }`
- 所有用户输入必须服务端验证（不信任客户端）

### 数据库 Schema 参考
`styles` 表已有字段：
- `status`: ENUM ('draft', 'pending_review', 'approved', 'rejected')
- `author_id`: UUID (引用 profiles.id)
- `design_tokens`: JSONB (存储色板、字体、间距等)
- `preview_images`: JSONB (存储浅色/深色模式图片 URL)

### 图片上传规范
- Storage Bucket: `style-previews`
- 路径格式：`submissions/{user_id}/{style_id}/{light|dark}.{png|jpg}`
- 大小限制：≤5MB
- 格式限制：PNG, JPG
- 上传前压缩优化

## Tasks & Acceptance

**Execution:**
- [ ] `lib/schemas.ts` -- 添加 `submissionFormSchema` -- Zod 验证 Schema
- [ ] `lib/storage.ts` -- 创建 Storage 工具函数 -- 图片上传、URL 生成
- [ ] `actions/styles/submit.ts` -- 创建 `submitStyle` Server Action -- 验证、上传、写入数据库
- [ ] `components/submit/image-upload.tsx` -- 图片上传组件 -- 拖拽上传、预览、进度显示
- [ ] `components/submit/code-editor.tsx` -- 代码输入组件 -- 语法高亮、语言切换
- [ ] `components/submit/style-submission-form.tsx` -- 提交表单主组件 -- 整合所有子组件
- [ ] `app/submit/page.tsx` -- 提交页面 -- 布局、表单集成、登录检查
- [ ] Toast 通知 -- 成功/失败反馈
- [ ] 错误处理 -- 所有错误场景的用户提示

**Acceptance Criteria:**
- Given 已登录用户访问 /submit 页面，When 页面加载，Then 系统显示提交表单，包含基本信息、设计变量、代码片段、预览图上传区域
- Given 用户填写表单，When 用户输入名称 (2-50 字符)、描述 (10-500 字符)、选择分类、添加标签，Then 系统实时验证输入，显示错误提示（如有）
- Given 用户上传预览图，When 用户选择或拖拽图片文件（PNG/JPG, ≤5MB），Then 系统显示上传进度，上传成功后显示预览图
- Given 用户输入代码片段，When 用户粘贴 HTML/CSS/React 代码，Then 系统提供语法高亮编辑器，支持语言切换
- Given 用户填写完整信息，When 用户点击"提交审核"按钮，Then 系统创建状态为 `pending_review` 的风格记录，显示"提交成功，等待审核"Toast，跳转到 /my-submissions 页面
- Given 未登录用户访问 /submit，When 页面加载，Then 系统自动跳转至 /login 页面

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 已登录用户访问 /submit 页面，表单正常显示
- 填写完整信息并提交，验证提交成功
- 尝试提交不完整表单，验证错误提示
- 上传大图片（>5MB），验证拒绝上传
- 未登录用户访问 /submit，验证跳转登录

## Change Log

- 2026-04-04: 创建 Story Spec
- 2026-04-04: 实施完成 - 创建所有组件和 Server Action
  - 新增 `lib/schemas.ts` - 添加 submissionFormSchema, designTokensSchema, codeSnippetsSchema
  - 新增 `lib/storage.ts` - Supabase Storage 工具函数
  - 新增 `actions/styles/submit.ts` - submitStyle Server Action
  - 新增 `components/submit/image-upload.tsx` - 图片上传组件
  - 新增 `components/submit/code-editor.tsx` - 代码编辑器组件
  - 新增 `components/submit/style-submission-form.tsx` - 提交表单主组件
  - 新增 `app/submit/page.tsx` - 提交页面
  - 新增 `supabase/migrations/0020_add_submission_status.sql` - 审核状态迁移
  - 安装依赖：react-hook-form, @hookform/resolvers
  - 构建验证：pnpm build 成功 (12.8s)
