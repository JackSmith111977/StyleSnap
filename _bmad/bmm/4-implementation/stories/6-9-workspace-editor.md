# Story 6.9: 工作台编辑器核心功能

> **Story ID:** 6.9  
> **Epic:** 6 - 高级功能与增强  
> **状态:** ready-for-dev  
> **创建日期:** 2026-04-06  
> **最后更新:** 2026-04-06  
> **来源:** PRD.md v1.6 (FR-2.1~2.6, FR-2.10~2.19)

---

## 1. User Story

**As a** 想创建或编辑风格的前端开发者，  
**I want** 在独立的工作台界面中编辑设计变量并实时预览效果，  
**So that** 我可以专注于设计创作，无需在风格详情页和编辑界面之间切换，同时能够保存草稿或提交发布。

---

## 2. Story Context & Background

### 2.1 业务背景

工作台是 StyleSnap Phase 2 的核心功能，它将原本分散在风格详情页的预览功能独立出来，形成一个专注的设计创作环境。用户可以在这里：
- 编辑现有风格的设计变量
- 创建全新的风格
- 实时预览修改效果
- 保存草稿或提交审核

### 2.2 与 Story 6.1 的区别

| 对比项 | Story 6.1 (实时预览编辑器) | Story 6.9 (工作台编辑器核心功能) |
|--------|---------------------------|---------------------------------|
| **位置** | 风格详情页内的一个区域 | 独立的 `/workspace` 页面 |
| **功能范围** | 仅预览和简单调整 | 完整的创作 + 编辑 + 保存 + 发布 |
| **状态管理** | 无 | 草稿/审核中/已发布 |
| **风格选择** | 固定当前风格 | 支持选择任意风格 |
| **新建功能** | 无 | 支持从空白创建 |
| **自动保存** | 无 | 每 30 秒 + 编辑后 5 秒自动保存 |

### 2.3 用户旅程

```
首页 → 工作台（导航栏入口）→ 登录检查 → 
├─ 已登录 → 进入工作台 → 选择风格 → 编辑设计变量 → 实时预览 → 保存草稿/提交发布
└─ 未登录 → 弹出登录提示 → 跳转登录/注册 → 登录成功后返回工作台
```

---

## 3. Acceptance Criteria (BDD Format)

### 3.1 工作台入口与登录权限 (FR-2.1, FR-2.2)

**Given** 用户访问首页  
**When** 页面加载完成  
**Then** 导航栏显示"工作台"入口，与"风格库"同级  
**And** 入口在首屏可见

**Given** 未登录用户点击"工作台"入口  
**When** 用户尝试进入 `/workspace` 页面  
**Then** 系统弹出登录提示对话框  
**And** 对话框提供"登录"、"注册"、"稍后再说"三个选项  
**And** 点击"稍后再说"后允许游客浏览工作台（只读模式）

**Given** 已登录用户访问 `/workspace`  
**When** 页面加载  
**Then** 系统直接进入工作台界面  
**And** 显示用户的风格列表

### 3.2 风格选择功能 (FR-2.3)

**Given** 用户进入工作台  
**When** 页面加载完成  
**Then** 系统显示风格选择区域  
**And** 风格列表加载时间 < 1 秒

**Given** 用户想要筛选风格  
**When** 用户点击状态筛选标签（全部/草稿/审核中/已发布）  
**Then** 系统在 500ms 内刷新显示对应状态的风格

**Given** 用户想要搜索风格  
**When** 用户在搜索框输入关键词  
**Then** 系统实时过滤风格列表  
**And** 支持按名称搜索

**Given** 用户想要新建风格  
**When** 用户点击"创建新风格"按钮  
**Then** 系统在 300ms 内进入编辑界面  
**And** 提供"从空白开始"和"从模板开始"选项

### 3.3 设计变量编辑器 (FR-2.4, FR-2.10~2.16)

**Given** 用户选择了一个风格进行编辑  
**When** 编辑器加载完成  
**Then** 系统显示完整的设计变量编辑控件  
**And** 控件与风格详情页展示的内容完全对齐

**Given** 用户编辑基本信息  
**When** 用户输入名称、描述、分类、标签  
**Then** 所有输入字段支持实时保存  
**And** 输入后 1 秒内自动保存

**Given** 用户编辑配色方案  
**When** 用户使用颜色选择器修改 8 色（primary, secondary, background, surface, text, textMuted, border, accent）  
**Then** 每个颜色选择器支持 HEX/RGB 输入  
**And** 选择后 100ms 内更新预览

**Given** 用户编辑字体系统  
**When** 用户选择字体系、调整字重、行高  
**Then** 字体选择后 200ms 内预览更新  
**And** 字重/行高滑块实时反馈

**Given** 用户编辑间距系统  
**When** 用户修改 5 档间距配置（xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px）  
**Then** 支持数字输入和滑块  
**And** 修改后 100ms 内更新预览

**Given** 用户编辑圆角系统  
**When** 用户修改 3 档圆角配置（small: 4px, medium: 8px, large: 16px）  
**Then** 支持数字输入（px）  
**And** 修改后 100ms 内更新预览

**Given** 用户编辑阴影系统  
**When** 用户修改 3 档阴影配置（light, medium, heavy）  
**Then** 支持 X/Y/Blur/Spread 四参数配置  
**And** 修改后 200ms 内更新预览

**Given** 用户想要启用深色模式  
**When** 用户开启深色模式开关  
**Then** 系统显示深色配色配置入口  
**And** 允许配置深色模式覆盖参数

### 3.4 实时预览 (FR-2.5, FR-2.17)

**Given** 用户修改任意设计变量  
**When** 变量值更新  
**Then** 系统实时显示设计变量修改后的效果  
**And** 预览更新延迟 < 200ms

**Given** 工作台页面加载  
**When** 页面渲染完成  
**Then** 系统采用双栏布局  
**And** 左侧工具栏占 25%，右侧预览占 75%

### 3.5 重置与自动保存 (FR-2.18, FR-2.19)

**Given** 用户想要恢复原始设计  
**When** 用户点击"一键重置"按钮  
**Then** 系统恢复所选风格的原始设计变量  
**And** 所有变量在 500ms 内恢复默认值

**Given** 用户正在编辑  
**When** 用户停止编辑 5 秒后  
**Then** 系统自动保存编辑内容  
**And** 保存成功显示轻提示

**Given** 用户正在编辑  
**When** 距离上次保存已过 30 秒  
**Then** 系统自动保存编辑内容

### 3.6 代码导出 (FR-2.6)

**Given** 用户完成设计变量配置  
**When** 系统自动生成代码  
**Then** 系统支持导出 HTML+CSS、React、Tailwind CSS 三种格式的完整代码  
**And** 导出代码生成时间 < 500ms

---

## 4. Technical Requirements

### 4.1 前端技术要求

| 要求项 | 规格 |
|--------|------|
| **框架** | Next.js 16+ App Router |
| **语言** | TypeScript 5+ (strict: true) |
| **样式** | Tailwind CSS + CSS Modules（混合模式） |
| **UI 组件** | Shadcn UI + Radix UI |
| **状态管理** | Zustand |
| **表单验证** | Zod |

### 4.2 性能要求

| 指标 | 目标值 | 测量方式 |
|------|--------|----------|
| 风格列表加载时间 | < 1 秒 | 页面加载性能测试 |
| 编辑器控件响应 | < 100ms | 交互延迟测试 |
| 预览更新延迟 | < 200ms | 渲染性能测试 |
| 代码生成时间 | < 500ms | API 响应时间测试 |
| 自动保存响应 | < 1 秒 | 网络请求测试 |

### 4.3 数据模型

#### 4.3.1 Style 表（扩展现有）

```sql
-- 新增字段到 styles 表
ALTER TABLE styles ADD COLUMN status TEXT DEFAULT 'draft'; -- draft/pending/approved/rejected
ALTER TABLE styles ADD COLUMN owner_id UUID REFERENCES users(id); -- 所有者
ALTER TABLE styles ADD COLUMN last_edited_at TIMESTAMPTZ; -- 最后编辑时间
ALTER TABLE styles ADD COLUMN submitted_at TIMESTAMPTZ; -- 提交审核时间
ALTER TABLE styles ADD COLUMN reviewed_at TIMESTAMPTZ; -- 审核完成时间
ALTER TABLE styles ADD COLUMN reviewer_comments TEXT; -- 审核员备注
```

#### 4.3.2 EditHistory 表（新增）

```sql
CREATE TABLE edit_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  style_id UUID REFERENCES styles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  changes JSONB NOT NULL, -- 记录的变更内容
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 索引
CREATE INDEX idx_edit_histories_style_id ON edit_histories(style_id);
CREATE INDEX idx_edit_histories_created_at ON edit_histories(created_at DESC);
```

### 4.4 API 设计（Server Actions）

| Action | 输入 | 输出 | 说明 |
|--------|------|------|------|
| `getUserStyles` | userId, status?, search? | Style[] | 获取用户的风格列表 |
| `saveStyleDraft` | styleId, designTokens, basics | {success, style} | 保存草稿 |
| `submitForReview` | styleId | {success, message} | 提交审核 |
| `getEditHistory` | styleId, limit? | EditHistory[] | 获取编辑历史 |
| `restoreFromHistory` | historyId | {success, style} | 恢复历史版本 |

---

## 5. Architecture Compliance

### 5.1 文件结构

```
app/
├── workspace/
│   ├── page.tsx              # 工作台主页面
│   └── layout.tsx            # 工作台布局（含认证检查）
components/
├── workspace/
│   ├── StyleSelector.tsx     # 风格选择器
│   ├── EditorPanel.tsx       # 编辑器面板（左侧 25%）
│   ├── PreviewPanel.tsx      # 预览面板（右侧 75%）
│   ├── ColorPicker.tsx       # 颜色选择器
│   ├── FontSelector.tsx      # 字体选择器
│   ├── SpacingControl.tsx    # 间距控制
│   ├── BorderRadiusControl.tsx # 圆角控制
│   ├── ShadowControl.tsx     # 阴影控制
│   └── AutoSaveIndicator.tsx # 自动保存指示器
store/
└── workspace-store.ts        # Zustand 工作台状态管理
```

### 5.2 状态管理（Zustand）

```typescript
// workspace-store.ts
interface WorkspaceState {
  // 当前编辑的风格
  currentStyle: Style | null;
  
  // 设计变量
  designTokens: DesignTokens;
  
  // 基本信息
  basics: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  };
  
  // 状态
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  isDirty: boolean; // 是否有未保存的变更
  lastSavedAt: Date | null;
  
  // Actions
  setCurrentStyle: (style: Style) => void;
  updateDesignTokens: (tokens: Partial<DesignTokens>) => void;
  updateBasics: (basics: Partial<typeof basics>) => void;
  saveDraft: () => Promise<void>;
  resetToOriginal: () => void;
}
```

### 5.3 设计变量结构

```typescript
interface DesignTokens {
  colorPalette: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
    weights: number[];
    lineHeights: Record<string, number>;
  };
  spacing: {
    xs: number;  // 4px
    sm: number;  // 8px
    md: number;  // 16px
    lg: number;  // 24px
    xl: number;  // 32px
  };
  borderRadius: {
    small: number;   // 4px
    medium: number;  // 8px
    large: number;   // 16px
  };
  shadows: {
    light: ShadowConfig;
    medium: ShadowConfig;
    heavy: ShadowConfig;
  };
  darkModeOverrides?: Partial<DesignTokens>;
}

interface ShadowConfig {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}
```

---

## 6. Library/Framework Requirements

| 库 | 版本 | 用途 | 引入位置 |
|----|------|------|----------|
| `next` | 16+ | Next.js App Router | `app/workspace/page.tsx` |
| `react` | 19+ | React 框架 | 所有组件 |
| `zustand` | latest | 状态管理 | `store/workspace-store.ts` |
| `zod` | latest | 表单验证 | 所有表单组件 |
| `@radix-ui/react-dialog` | latest | 登录提示对话框 | `components/workspace/StyleSelector.tsx` |
| `@radix-ui/react-tabs` | latest | 编辑器 Tab | `components/workspace/EditorPanel.tsx` |
| `@radix-ui/react-slider` | latest | 间距/字重滑块 | `components/workspace/*Control.tsx` |
| `lucide-react` | latest | 图标 | 所有组件 |

---

## 7. File Structure Requirements

### 7.1 必须创建的文件

| 文件路径 | 说明 | 优先级 |
|----------|------|--------|
| `app/workspace/page.tsx` | 工作台主页面 | P0 |
| `app/workspace/layout.tsx` | 工作台布局（认证检查） | P0 |
| `components/workspace/StyleSelector.tsx` | 风格选择器组件 | P0 |
| `components/workspace/EditorPanel.tsx` | 编辑器面板组件 | P0 |
| `components/workspace/PreviewPanel.tsx` | 预览面板组件 | P0 |
| `components/workspace/ColorPicker.tsx` | 颜色选择器组件 | P0 |
| `components/workspace/FontSelector.tsx` | 字体选择器组件 | P0 |
| `components/workspace/SpacingControl.tsx` | 间距控制组件 | P0 |
| `components/workspace/BorderRadiusControl.tsx` | 圆角控制组件 | P0 |
| `components/workspace/ShadowControl.tsx` | 阴影控制组件 | P0 |
| `components/workspace/AutoSaveIndicator.tsx` | 自动保存指示器 | P1 |
| `store/workspace-store.ts` | Zustand 状态管理 | P0 |
| `app/(auth)/login/page.tsx` | 登录页面（如不存在） | P1 |

### 7.2 Server Actions 文件

| 文件路径 | 说明 |
|----------|------|
| `app/(auth)/actions/auth-actions.ts` | 认证相关 Server Actions |
| `app/workspace/actions/workspace-actions.ts` | 工作台相关 Server Actions |

---

## 8. Testing Requirements

### 8.1 单元测试（Vitest）

| 测试文件 | 测试内容 |
|----------|----------|
| `store/workspace-store.test.ts` | Zustand store 的 actions 和 state |
| `components/workspace/ColorPicker.test.tsx` | 颜色选择器交互 |
| `components/workspace/SpacingControl.test.tsx` | 间距控制交互 |

### 8.2 E2E 测试（Playwright）

| 测试文件 | 测试场景 |
|----------|----------|
| `tests/e2e/workspace-editor.spec.ts` | 工作台完整编辑流程 |
| `tests/e2e/workspace-auth.spec.ts` | 登录权限检查 |
| `tests/e2e/workspace-auto-save.spec.ts` | 自动保存功能 |

---

## 9. Previous Story Intelligence

### 9.1 来自 Story 6.1 (实时预览编辑器)

**已完成的功能：**
- 风格详情页内的预览编辑器
- 颜色、字体、间距、圆角、阴影编辑控件
- 实时预览更新

**可复用的组件：**
- `components/style-detail/DesignTokenEditor.tsx` → 可改造为 `EditorPanel.tsx`
- `components/style-detail/PreviewPanel.tsx` → 可复用于工作台

**学到的经验：**
- CSS Variables 实时更新性能良好
- 使用防抖处理减少不必要的渲染
- Zustand 状态管理响应快速

### 9.2 来自 Story 6.8 (风格预览组件)

**已完成的功能：**
- 固定尺寸、响应式的预览组件
- 包含导航栏、侧边栏、标题、正文、卡片、列表、页脚等

**可复用的组件：**
- `components/style-preview/StylePreview.tsx` → 可直接用于工作台预览面板

---

## 10. Git Intelligence

### 最近提交（工作台相关）

```
e52a0c5 - PRD v1.6 更新 - 工作台功能增强
8fae00e - test: 完成 Epic 6 浏览器 E2E 测试报告
009f71c - docs: 更新进度跟踪 - Epic 4 测试完成
```

### 代码模式观察

- 组件命名：`PascalCase` + 描述性名称
- 文件结构：按功能模块组织
- 状态管理：统一使用 Zustand
- 测试文件：与组件同级或 `tests/e2e/` 目录

---

## 11. Latest Tech Information

### Next.js 16 Server Actions 最佳实践

- Server Actions 必须是 `async` 函数
- 使用 `'use server'` 指令标记
- 客户端调用时使用 `await`
- 错误处理使用 `try/catch` 并返回统一的响应格式

### Zustand 最佳实践

- 使用 `create` 创建 store
- Actions 定义为函数
- 支持 `setState` 和 `getState`
- 可使用 `persist` 中间件持久化状态

---

## 12. Security Considerations

### 12.1 认证检查

- 工作台页面需要在 `layout.tsx` 中进行认证检查
- Server Actions 需要验证用户身份
- 用户只能编辑自己拥有的风格

### 12.2 RLS 策略

```sql
-- styles 表 RLS
CREATE POLICY "用户只能编辑自己的风格"
  ON styles FOR UPDATE
  USING (auth.uid() = owner_id);

-- edit_histories 表 RLS
CREATE POLICY "用户只能查看自己的编辑历史"
  ON edit_histories FOR SELECT
  USING (auth.uid() = user_id);
```

### 12.3 输入验证

- 所有用户输入使用 Zod 验证
- 颜色值验证（HEX/RGB 格式）
- 数字范围验证（间距、圆角、阴影参数）

---

## 13. Developer Context

### 13.1 实现顺序建议

1. **Phase 1: 基础结构**
   - 创建 `app/workspace/page.tsx` 和 `layout.tsx`
   - 设置 Zustand store
   - 实现认证检查逻辑

2. **Phase 2: 风格选择器**
   - 实现 `StyleSelector.tsx`
   - 集成状态筛选、搜索功能
   - 连接 Server Actions 获取用户风格

3. **Phase 3: 编辑器组件**
   - 实现各个编辑控件（颜色、字体、间距、圆角、阴影）
   - 集成实时预览
   - 实现重置功能

4. **Phase 4: 自动保存**
   - 实现定时自动保存（30 秒）
   - 实现编辑后自动保存（5 秒）
   - 添加保存状态指示器

5. **Phase 5: 测试与优化**
   - 编写单元测试
   - 编写 E2E 测试
   - 性能优化

### 13.2 关键实现细节

#### 自动保存实现

```typescript
// 使用 useEffect 和 setTimeout 实现
useEffect(() => {
  const timer = setTimeout(() => {
    if (isDirty) {
      saveDraft();
    }
  }, 5000); // 编辑后 5 秒

  return () => clearTimeout(timer);
}, [isDirty, lastEditedAt]);

// 定时保存（30 秒）
useEffect(() => {
  const interval = setInterval(() => {
    saveDraft();
  }, 30000);

  return () => clearInterval(interval);
}, []);
```

#### 防抖处理

```typescript
// 使用 lodash.debounce 或自定义防抖
const debouncedUpdate = useMemo(
  () => debounce((value) => {
    updateDesignTokens(value);
  }, 200),
  []
);
```

### 13.3 已知依赖

- 需要 Story 6.8 的 `StylePreview` 组件
- 需要 Story 6.1 的设计变量编辑器组件（可复用）
- 需要认证系统（Story 1.1-1.5）已完成

---

## 14. Project Context Reference

本项目是 StyleSnap - 帮助前端开发者快速选择、理解和应用网页视觉风格的工具。

**技术栈：**
- 前端：Next.js 16+ App Router, TypeScript, Tailwind CSS + CSS Modules
- 后端：Supabase (PostgreSQL + Auth + Storage)
- 状态管理：Zustand
- 测试：Vitest + Playwright

**设计风格：**
- 鹰角机能风（冷静 · 精准 · 通透 · 秩序）

---

## 15. Story Completion Status

**状态:** ready-for-dev  
**完成日期:** 2026-04-06  
**完成说明:** Ultimate context engine analysis completed - comprehensive developer guide created

---

## 16. Open Questions

以下问题需要在实现前或实现中明确：

1. **代码生成逻辑**：设计变量到代码的映射规则需要详细定义（建议查阅 PRD v1.6 第 5.3.4 节）
2. **代码模板存储**：Phase 1 采用 Git 仓库管理，需要确定仓库结构和 CI/CD 流程
3. **审核流程**：审核由谁执行？需要管理后台还是简单的审核队列？
4. **编辑历史存储**：是否存储完整快照还是只存储变更 diff？（建议存储 diff 以节省空间）

---

## 17. Acceptance Checklist

实现完成后，请对照以下清单验证：

- [ ] 导航栏显示"工作台"入口
- [ ] 未登录用户弹出登录提示（含"稍后再说"选项）
- [ ] 已登录用户直接进入工作台
- [ ] 风格列表支持状态筛选（全部/草稿/审核中/已发布）
- [ ] 风格列表支持搜索
- [ ] 支持创建新风格
- [ ] 编辑器包含所有设计变量控件（8 色、字体、间距、圆角、阴影）
- [ ] 实时预览延迟 < 200ms
- [ ] 一键重置功能正常
- [ ] 自动保存（30 秒定时 + 编辑后 5 秒）
- [ ] 双栏布局（左侧 25%，右侧 75%）
- [ ] 代码导出功能（HTML+CSS、React、Tailwind）
- [ ] 单元测试通过
- [ ] E2E 测试通过
