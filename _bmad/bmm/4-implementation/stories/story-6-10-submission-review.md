# Story 6.10: 工作台提交审核功能

> **Story ID:** 6.10  
> **Epic:** 6 - 高级功能与增强  
> **状态:** ready-for-dev  
> **创建日期:** 2026-04-07  
> **最后更新:** 2026-04-07  
> **来源:** PRD.md v1.6 (FR-2.28~FR-2.32)

---

## 1. User Story

**As a** 想发布设计作品的前端开发者，  
**I want** 将完成的设计提交审核，  
**So that** 我的作品可以发布到 StyleSnap 平台被其他用户使用。

---

## 2. Story Context & Background

### 2.1 业务背景

工作台提交审核是用户创作流程的最后一步。用户在工作台完成设计后，需要：
1. 通过完整性检查确保设计质量
2. 提交审核进入发布队列
3. 查看审核状态和反馈
4. 根据审核结果进行修改或等待发布

由于管理员模块尚未实现，当前采用简化方案：
- 提交后状态直接设为 `pending_review`
- 只记录提交时间，不实现实际审核操作
- 预留审核员备注字段供未来使用

### 2.2 与 Story 6.2 的区别

| 对比项 | Story 6.2 (用户提交流程) | Story 6.10 (提交审核功能) |
|--------|------------------------|--------------------------|
| **入口** | 独立 `/submit` 页面 | 工作台编辑器内提交按钮 |
| **场景** | 从头创建并提交风格 | 在工作台编辑后提交 |
| **检查** | 基础表单验证 | 完整性检查（必填项、设计变量） |
| **状态** | 提交后 pending_review | 提交/撤回/重新提交的完整状态流转 |
| **反馈** | 简单成功提示 | 审核状态展示、审核员备注显示 |

### 2.3 用户旅程

```
工作台编辑器 → 完成设计 → 点击"提交审核" → 
完整性检查 → 确认提交 → 提交成功 →
├─ 审核中 → 查看状态 → 撤回提交 → 恢复草稿
├─ 审核通过 → 风格已发布
└─ 审核拒绝 → 查看备注 → 重新编辑 → 再次提交
```

---

## 3. Acceptance Criteria (BDD Format)

### 3.1 提交审核按钮与完整性检查 (FR-2.28, FR-2.29)

**Given** 用户在工作台完成设计  
**When** 用户点击"提交审核"按钮  
**Then** 系统执行完整性检查  
**And** 检查必填项（名称、描述、分类、8 色配色、字体、间距）  
**And** 检查在 500ms 内完成

**Given** 完整性检查通过  
**When** 检查完成  
**Then** 系统弹出确认对话框  
**And** 显示"提交后风格将进入审核队列，预计 24 小时内完成"

**Given** 用户确认提交  
**When** 用户点击"确认提交"按钮  
**Then** 系统将风格状态更新为 `pending_review`  
**And** 记录提交时间 `submitted_at`  
**And** 显示"提交成功，等待审核"Toast  
**And** 风格卡片状态标识变为"审核中"

**Given** 完整性检查失败  
**When** 有必填项缺失  
**Then** 系统显示错误提示  
**And** 高亮缺失的必填项  
**And** 阻止提交操作

### 3.2 审核状态展示 (FR-2.30)

**Given** 用户的工作台风格列表  
**When** 风格处于"审核中"状态  
**Then** 系统显示"审核中"状态标识  
**And** 显示提交时间  
**And** 显示"预计 24 小时内完成"

**Given** 用户查看已通过审核的风格  
**When** 风格处于"已发布"状态  
**Then** 系统显示"已发布"状态标识  
**And** 显示发布时间  
**And** 显示点赞数、收藏数、评论数

**Given** 用户的风格被审核拒绝  
**When** 风格处于"已拒绝"状态  
**Then** 系统显示"已拒绝"状态标识  
**And** 显示审核员备注  
**And** 显示"重新编辑"按钮

### 3.3 撤回提交功能 (FR-2.31)

**Given** 用户有一个"审核中"的风格  
**When** 用户点击"撤回提交"按钮  
**Then** 系统弹出确认对话框  
**And** 显示"撤回后风格将恢复为草稿状态"

**Given** 用户确认撤回  
**When** 用户点击"确认撤回"按钮  
**Then** 系统将风格状态恢复为 `draft`  
**And** 清除 `submitted_at` 字段  
**And** 显示"已撤回提交"Toast  
**And** 风格卡片状态标识变为"草稿"

**Given** 用户尝试撤回已审核通过的风格  
**When** 风格状态为 `approved`  
**Then** 系统不显示"撤回提交"按钮  
**And** 只提供"编辑"或"下架"选项

### 3.4 重新编辑后再次提交 (FR-2.32)

**Given** 用户的风格被审核拒绝  
**When** 用户点击"重新编辑"按钮  
**Then** 系统跳转至工作台编辑器  
**And** 加载该风格的设计变量和基本信息  
**And** 显示审核员备注供参考

**Given** 用户完成修改  
**When** 用户再次点击"提交审核"  
**Then** 系统执行完整性检查  
**And** 用户确认后将状态更新为 `pending_review`  
**And** 更新 `submitted_at` 为当前时间  
**And** 清空审核员备注

### 3.5 工作台编辑器集成

**Given** 用户在工作台编辑器中  
**When** 编辑器加载完成  
**Then** 系统显示"提交审核"按钮（与"保存草稿"并列）  
**And** 草稿状态时按钮可用  
**And** 审核中状态时按钮变为"撤回提交"

**Given** 用户点击"提交审核"  
**When** 按钮被点击  
**Then** 系统先触发自动保存  
**And** 保存完成后执行完整性检查  
**And** 检查通过后显示确认对话框

---

## 4. Technical Requirements

### 4.1 前端技术要求

| 要求项 | 规格 |
|--------|------|
| **框架** | Next.js 16+ App Router |
| **语言** | TypeScript 5+ (strict: true) |
| **样式** | Tailwind CSS + CSS Modules |
| **UI 组件** | Shadcn UI + Radix UI |
| **状态管理** | Zustand |
| **表单验证** | Zod |
| **对话框** | `@radix-ui/react-dialog` |

### 4.2 性能要求

| 指标 | 目标值 | 测量方式 |
|------|--------|----------|
| 完整性检查时间 | < 500ms | 客户端性能测试 |
| 提交 API 响应 | < 300ms | 网络请求时间 |
| 状态更新延迟 | < 200ms | UI 响应时间 |
| Toast 显示延迟 | < 100ms | 交互反馈 |

### 4.3 数据模型

#### 4.3.1 styles 表字段（已有）

```sql
-- 已有字段，无需修改
status TEXT DEFAULT 'draft'; -- draft/pending_review/approved/rejected
submitted_at TIMESTAMPTZ;    -- 提交审核时间
reviewed_at TIMESTAMPTZ;     -- 审核完成时间
reviewer_comments TEXT;      -- 审核员备注
```

#### 4.3.2 编辑历史（可选扩展）

```sql
-- 如果实现编辑历史追踪
CREATE TABLE edit_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  changes JSONB NOT NULL,
  action TEXT NOT NULL, -- 'create' | 'update' | 'submit' | 'withdraw' | 'resubmit'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_edit_histories_style_id ON edit_histories(style_id);
CREATE INDEX idx_edit_histories_action ON edit_histories(action);
```

### 4.4 API 设计（Server Actions）

| Action | 输入 | 输出 | 说明 |
|--------|------|------|------|
| `submitStyleForReview` | styleId | `{success, message}` | 提交风格审核 |
| `withdrawSubmission` | styleId | `{success, message}` | 撤回提交 |
| `checkStyleCompleteness` | styleId, designTokens, basics | `{complete, missingFields}` | 完整性检查 |

---

## 5. Architecture Compliance

### 5.1 文件结构

```
apps/web/
├── components/
│   └── workspace/
│       ├── SubmissionDialog.tsx      # 提交确认对话框（新建）
│       ├── WithdrawDialog.tsx        # 撤回确认对话框（新建）
│       ├── SubmissionStatusBadge.tsx # 审核状态标识（新建）
│       └── EditorPanel.tsx           # 集成提交按钮（修改）
├── actions/
│   └── workspace/
│       ├── submit-for-review.ts      # 提交审核 Server Action（新建）
│       └── withdraw-submission.ts    # 撤回提交 Server Action（新建）
└── stores/
    └── workspace-store.ts            # 扩展状态管理（修改）
```

### 5.2 完整性检查逻辑

```typescript
interface CompletenessCheck {
  complete: boolean;
  missingFields: string[];
  errors: {
    basics?: {
      name?: string;
      description?: string;
      category?: string;
    };
    designTokens?: {
      colorPalette?: string; // 缺少哪些颜色
      fonts?: string;        // 缺少哪些字体配置
      spacing?: string;      // 缺少哪些间距
    };
  };
}

function checkCompleteness(
  designTokens: DesignTokens,
  basics: StyleBasics
): CompletenessCheck {
  const missingFields: string[] = [];
  const errors: CompletenessCheck['errors'] = {};

  // 检查基本信息
  if (!basics.name?.trim()) {
    missingFields.push('name');
    errors.basics = { ...errors.basics, name: '名称为必填项' };
  }
  if (!basics.description?.trim() || basics.description.length < 10) {
    missingFields.push('description');
    errors.basics = { ...errors.basics, description: '描述至少 10 个字符' };
  }
  if (!basics.category) {
    missingFields.push('category');
    errors.basics = { ...errors.basics, category: '请选择分类' };
  }

  // 检查配色（8 色）
  const requiredColors = ['primary', 'secondary', 'background', 'surface', 'text', 'textMuted', 'border', 'accent'];
  const missingColors = requiredColors.filter(c => !designTokens.colorPalette?.[c]);
  if (missingColors.length > 0) {
    missingFields.push('colorPalette');
    errors.designTokens = { ...errors.designTokens, colorPalette: `缺少颜色：${missingColors.join(', ')}` };
  }

  // 检查字体
  if (!designTokens.fonts?.heading || !designTokens.fonts?.body) {
    missingFields.push('fonts');
    errors.designTokens = { ...errors.designTokens, fonts: '请配置字体' };
  }

  // 检查间距
  const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl'];
  const missingSpacing = requiredSpacing.filter(s => !designTokens.spacing?.[s]);
  if (missingSpacing.length > 0) {
    missingFields.push('spacing');
    errors.designTokens = { ...errors.designTokens, spacing: `缺少间距：${missingSpacing.join(', ')}` };
  }

  return {
    complete: missingFields.length === 0,
    missingFields,
    errors,
  };
}
```

### 5.3 状态流转图

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   draft     │─────▶│pending_review│─────▶│  approved   │
│   草稿      │ 提交  │   审核中     │ 通过  │   已发布    │
│             │◀─────│              │      │             │
│             │ 撤回  │              │      │             │
└─────────────┘      └──────┬───────┘      └─────────────┘
                            │
                      拒绝  │
                            ▼
                     ┌─────────────┐
                     │  rejected   │
                     │   已拒绝    │
                     │             │
                     └──────┬──────┘
                            │
                      重新编辑提交
                            │
                            └──────────────┘
```

---

## 6. Library/Framework Requirements

| 库 | 版本 | 用途 | 引入位置 |
|----|------|------|----------|
| `next` | 16+ | Next.js App Router | `components/workspace/*.tsx` |
| `react` | 19+ | React 框架 | 所有组件 |
| `zustand` | latest | 状态管理 | `stores/workspace-store.ts` |
| `zod` | latest | 表单验证 | `actions/workspace/submit-for-review.ts` |
| `@radix-ui/react-dialog` | latest | 确认对话框 | `components/workspace/SubmissionDialog.tsx` |
| `@radix-ui/react-alert-dialog` | latest | 警告对话框 | `components/workspace/WithdrawDialog.tsx` |
| `lucide-react` | latest | 图标 | 所有组件 |
| `sonner` | latest | Toast 通知 | 所有操作反馈 |

---

## 7. File Structure Requirements

### 7.1 必须创建的文件

| 文件路径 | 说明 | 优先级 |
|----------|------|--------|
| `components/workspace/SubmissionDialog.tsx` | 提交确认对话框 | P0 |
| `components/workspace/WithdrawDialog.tsx` | 撤回确认对话框 | P0 |
| `components/workspace/SubmissionStatusBadge.tsx` | 审核状态标识组件 | P0 |
| `actions/workspace/submit-for-review.ts` | 提交审核 Server Action | P0 |
| `actions/workspace/withdraw-submission.ts` | 撤回提交 Server Action | P0 |

### 7.2 必须修改的文件

| 文件路径 | 修改内容 | 优先级 |
|----------|----------|--------|
| `components/workspace/EditorPanel.tsx` | 添加提交审核按钮和状态显示 | P0 |
| `stores/workspace-store.ts` | 添加提交/撤回相关 actions | P0 |
| `app/workspace/page.tsx` | 风格列表显示审核状态 | P1 |

---

## 8. Testing Requirements

### 8.1 单元测试（Vitest）

| 测试文件 | 测试内容 |
|----------|----------|
| `actions/workspace/submit-for-review.test.ts` | 提交审核逻辑、完整性检查 |
| `actions/workspace/withdraw-submission.test.ts` | 撤回提交逻辑 |
| `components/workspace/SubmissionDialog.test.tsx` | 对话框交互 |
| `components/workspace/SubmissionStatusBadge.test.tsx` | 状态标识渲染 |
| `utils/completeness-check.test.ts` | 完整性检查函数 |

### 8.2 E2E 测试（Playwright）

| 测试文件 | 测试场景 |
|----------|----------|
| `tests/e2e/workspace-submission.spec.ts` | 完整提交流程 |
| `tests/e2e/workspace-withdraw.spec.ts` | 撤回提交流程 |
| `tests/e2e/workspace-rejection.spec.ts` | 审核拒绝后重新提交 |

---

## 9. Previous Story Intelligence

### 9.1 来自 Story 6.9 (工作台编辑器)

**可复用的组件：**
- `components/workspace/EditorPanel.tsx` - 集成提交按钮
- `stores/workspace-store.ts` - 添加提交相关 actions

**可复用的逻辑：**
- 自动保存机制 - 提交前触发自动保存
- 状态管理 - 扩展状态类型

### 9.2 来自 Story 6.2 (用户提交流程)

**可复用的代码：**
- `lib/schemas.ts` - submissionFormSchema, designTokensSchema
- `actions/styles/submit.ts` - 提交逻辑参考
- `lib/storage.ts` - 图片上传（如需要）

**完整性检查逻辑：**
- 参考 Story 6.2 的验证 Schema
- 扩展为工作台特定的检查项

---

## 10. Git Intelligence

### 最近提交（工作台相关）

```
feat: 工作台编辑器 - 颜色选择器增强
feat: 工作台编辑器核心功能实现
feat: 用户提交流程实现
```

### 代码模式观察

- Server Action 返回格式：`{ success: boolean, data?: T, error?: string }`
- 组件命名：`PascalCase` + 描述性名称
- 状态管理：Zustand actions 模式

---

## 11. Security Considerations

### 11.1 认证检查

- Server Action 中必须验证用户身份
- 用户只能提交自己拥有的风格
- 未登录用户不能提交

### 11.2 RLS 策略

```sql
-- styles 表 RLS（已有，确认覆盖以下场景）
CREATE POLICY "用户只能提交自己的风格"
  ON styles FOR UPDATE
  USING (auth.uid() = author_id OR auth.uid() = owner_id);

CREATE POLICY "用户只能查看自己的提交状态"
  ON styles FOR SELECT
  USING (
    status = 'approved' OR  -- 已发布的公开可见
    auth.uid() = author_id OR auth.uid() = owner_id  -- 作者/所有者可见
  );
```

### 11.3 输入验证

- 所有用户输入使用 Zod 验证
- Server Action 中二次验证
- 防止 XSS 和 SQL 注入

---

## 12. Developer Context

### 12.1 实现顺序建议

1. **Phase 1: 完整性检查工具函数**
   - 创建 `utils/completeness-check.ts`
   - 编写单元测试

2. **Phase 2: Server Actions**
   - 创建 `actions/workspace/submit-for-review.ts`
   - 创建 `actions/workspace/withdraw-submission.ts`
   - 编写集成测试

3. **Phase 3: 对话框组件**
   - 创建 `SubmissionDialog.tsx`
   - 创建 `WithdrawDialog.tsx`

4. **Phase 4: 状态标识组件**
   - 创建 `SubmissionStatusBadge.tsx`
   - 支持多种状态显示

5. **Phase 5: 集成到编辑器**
   - 修改 `EditorPanel.tsx`
   - 添加提交按钮和状态显示
   - 集成对话框

6. **Phase 6: 风格列表状态显示**
   - 修改 `workspace/page.tsx`
   - 风格卡片显示审核状态

7. **Phase 7: 测试与优化**
   - E2E 测试
   - 性能优化

### 12.2 关键实现细节

#### 提交审核流程

```typescript
async function handleSubmit() {
  // 1. 触发自动保存
  await saveDraft();
  
  // 2. 执行完整性检查
  const check = checkCompleteness(designTokens, basics);
  if (!check.complete) {
    showValidationErrors(check.errors);
    return;
  }
  
  // 3. 显示确认对话框
  const confirmed = await showSubmissionDialog();
  if (!confirmed) return;
  
  // 4. 调用 Server Action
  const result = await submitStyleForReview(styleId);
  if (result.success) {
    toast.success('提交成功，等待审核');
    updateStyleStatus('pending_review');
  } else {
    toast.error(result.error || '提交失败');
  }
}
```

#### 撤回提交流程

```typescript
async function handleWithdraw() {
  const confirmed = await showWithdrawDialog();
  if (!confirmed) return;
  
  const result = await withdrawSubmission(styleId);
  if (result.success) {
    toast.success('已撤回提交');
    updateStyleStatus('draft');
  } else {
    toast.error(result.error || '撤回失败');
  }
}
```

### 12.3 已知依赖

- 依赖 Story 6.9 的工作台编辑器完成
- 依赖 Story 6.2 的 Schema 定义
- 需要认证系统（Story 1.1-1.5）已完成

---

## 13. Open Questions

以下问题需要在实现前或实现中明确：

1. **完整性检查的详细规则**：是否需要检查预览图上传？（建议：工作台场景下暂不需要）
2. **审核时间预期**：提示文案中的"24 小时"是否准确？（建议：根据实际运营策略调整）
3. **撤回次数限制**：是否限制用户撤回提交的次数？（建议：MVP 暂不限制）
4. **审核拒绝后的处理**：是否需要限制重新提交的次数？（建议：MVP 暂不限制）

---

## 14. Acceptance Checklist

实现完成后，请对照以下清单验证：

- [ ] 完整性检查功能正常（名称、描述、分类、8 色、字体、间距）
- [ ] 提交确认对话框显示正确
- [ ] 提交后状态变为"审核中"
- [ ] 审核中状态显示提交时间和预计完成时间
- [ ] 撤回提交功能正常
- [ ] 撤回后状态恢复为"草稿"
- [ ] 审核拒绝时显示审核员备注
- [ ] 重新编辑后再次提交流程正常
- [ ] 提交按钮在草稿状态可用
- [ ] 审核中状态显示"撤回提交"按钮
- [ ] 已发布状态不显示提交/撤回按钮
- [ ] Toast 通知反馈正确
- [ ] 单元测试通过
- [ ] E2E 测试通过

---

## 15. Story Completion Status

**状态:** ready-for-dev  
**完成日期:** 2026-04-07  
**完成说明:** Ultimate context engine analysis completed - comprehensive developer guide created
