# 工作台创建风格功能修复报告

> 日期：2026-04-06  
> 状态：✅ 已修复  
> 提交：待提交

---

## 问题描述

用户反馈：**无法在工作台中创建风格**

### 问题表现

1. 用户登录成功后访问工作台 `/workspace`
2. 点击「新建」按钮打开创建模态框
3. 填写风格名称和分类后点击「创建」
4. 页面显示「创建风格失败」toast 提示，但无具体错误信息

---

## 阶段 1：事件链分析

**完整事件链：**

```
1. 用户访问 /workspace → 
2. 点击「新建」→ 
3. 弹出创建模态框 → 
4. 填写风格名称和分类 → 
5. 点击「创建」按钮 → 
6. 调用 createNewStyle Server Action → 
7. Server Action 查询分类 UUID → 
8. 创建风格记录 → 
9. 返回结果
```

**关键节点分析：**

| 节点 | 预期行为 | 实际行为 |
|------|----------|----------|
| 前端分类值 | 与数据库 `name_en` 匹配 | 使用小写简化值（如 `minimalist`） |
| 数据库 `name_en` | 存储标准英文名（如 `Minimalist`） | 首字母大写或包含特殊字符 |
| Server Action 插入 | 使用分类 UUID | 直接使用前端字符串值 |

---

## 阶段 2-3：调试输出与 MCP 调试

**控制台日志分析：**

```
[createNewStyle] 开始创建风格：{}
[createNewStyle] 获取用户：{}
[createNewStyle] 查询分类结果：{}
[createNewStyle] 创建风格失败：{}
```

日志显示参数为空对象，说明日志被截断或 Server Action 调用有问题。

**浏览器控制台：**
- 用户登录状态正常（userId: `75dadde6-1111-4b8d-a0ad-7c4ee6a531f5`）
- cookie 已正确设置（长度 3024）
- 无前端 JavaScript 错误

---

## 阶段 4：上下文收集

### 前端分类选项（修复前）

```typescript
const CATEGORY_OPTIONS = [
  { value: 'minimalist', label: '极简主义' },      // ❌ 数据库为 'Minimalist'
  { value: 'tech', label: '科技未来' },            // ❌ 数据库为 'Tech/Futuristic'
  { value: 'glassmorphism', label: '玻璃拟态' },   // ✅ 匹配
  { value: 'brutalist', label: '粗野主义' },       // ✅ 匹配
  { value: 'corporate', label: '企业专业' },       // ❌ 数据库为 'Corporate/Professional'
  { value: 'dark', label: '深色优先' },            // ❌ 数据库为 'Dark Mode First'
  { value: 'playful', label: '活泼多彩' },         // ❌ 数据库为 'Playful/Colorful'
  { value: 'editorial', label: '杂志编辑' },       // ✅ 匹配
  { value: 'retro', label: '复古网络' },           // ❌ 数据库为 'Retro/Web 1.0'
  { value: 'typography', label: '排版驱动' },      // ❌ 数据库为 'Typography-Driven'
];
```

### 数据库分类数据

```sql
INSERT INTO categories (name, name_en, description, sort_order) VALUES
('极简主义', 'Minimalist', '简洁、留白、少即是多', 1),
('科技未来', 'Tech/Futuristic', '赛博朋克、霓虹、科技感', 2),
('玻璃拟态', 'Glassmorphism', '毛玻璃效果、半透明、层次感', 3),
('粗野主义', 'Brutalist', '原始、粗糙、反传统', 4),
('企业专业', 'Corporate/Professional', '稳重、专业、可信赖', 5),
('深色优先', 'Dark Mode First', '深色主题、护眼、现代', 6),
('活泼多彩', 'Playful/Colorful', '鲜艳、渐变、活力', 7),
('杂志编辑', 'Editorial', '排版精美、图文结合', 8),
('复古网络', 'Retro/Web 1.0', '像素化、鲜艳色彩、早期互联网美学', 9),
('排版驱动', 'Typography-Driven', '大胆字体、文字即视觉、极简元素', 10);
```

### 问题根因

**Server Action 直接使用了前端传入的分类值作为 `category_id`，但：**

1. `category_id` 字段应该是 UUID 类型（如 `550e8400-e29b-41d4-a716-446655440000`）
2. 前端传入的是简化英文名（如 `minimalist`），与数据库 `name_en` 不完全匹配
3. 结果：查询分类失败 → 插入外键错误 → 创建失败

---

## 阶段 5：解决方案执行

### 修复 1：修改 Server Action 查询分类 UUID

**文件**：`apps/web/app/workspace/actions/workspace-actions.ts`

```typescript
// 修复前：直接使用前端值
const { data, error } = await supabase
  .from('styles')
  .insert({
    name,
    description: '',
    category_id: categoryId,  // ❌ 错误：应该是 UUID
    author_id: user.id,
    status: 'draft',
    design_tokens: null,
  })

// 修复后：先查询分类 UUID
const { data: category, error: categoryError } = await supabase
  .from('categories')
  .select('id')
  .ilike('name_en', categoryId)  // 大小写不敏感查询
  .single();

if (categoryError || !category) {
  return { success: false, error: `分类不存在：${categoryId}` };
}

const { data, error } = await supabase
  .from('styles')
  .insert({
    name,
    description: '',
    category_id: category.id,  // ✅ 正确：使用 UUID
    author_id: user.id,
    status: 'draft',
    design_tokens: null,
  })
```

### 修复 2：修正前端分类选项值

**文件**：`apps/web/app/workspace/page.tsx`

```typescript
// 修复前
const CATEGORY_OPTIONS = [
  { value: 'minimalist', label: '极简主义' },
  { value: 'tech', label: '科技未来' },
  // ...
];

// 修复后
const CATEGORY_OPTIONS = [
  { value: 'Minimalist', label: '极简主义' },
  { value: 'Tech/Futuristic', label: '科技未来' },
  { value: 'Glassmorphism', label: '玻璃拟态' },
  { value: 'Brutalist', label: '粗野主义' },
  { value: 'Corporate/Professional', label: '企业专业' },
  { value: 'Dark Mode First', label: '深色优先' },
  { value: 'Playful/Colorful', label: '活泼多彩' },
  { value: 'Editorial', label: '杂志编辑' },
  { value: 'Retro/Web 1.0', label: '复古网络' },
  { value: 'Typography-Driven', label: '排版驱动' },
];
```

---

## 验证结果

### 1. 构建验证

```bash
pnpm build
```

**结果**：✅ 构建成功

### 2. 功能测试

使用 Playwright 进行端到端测试：

1. 访问 `/workspace` → ✅ 页面加载成功
2. 点击「新建」→ ✅ 模态框打开
3. 填写风格名称「测试风格最终版」→ ✅ 输入成功
4. 选择分类「极简主义」→ ✅ 选项正确
5. 点击「创建」→ ✅ 风格创建成功

---

## 修复状态

| 任务 | 状态 |
|------|------|
| 问题根因分析 | ✅ 完成 |
| Server Action 修复 | ✅ 完成 |
| 前端分类值修复 | ✅ 完成 |
| 构建验证 | ✅ 通过 |
| 功能测试 | ✅ 通过 |

---

## 经验总结

### 教训

1. **前后端数据类型一致性**：前端选项值必须与数据库字段值完全匹配
2. **外键约束**：插入外键字段前必须确认目标记录存在
3. **错误日志详细度**：Server Action 应返回具体错误信息而非通用消息

### 最佳实践

1. 使用 `ilike` 进行大小写不敏感查询增加容错性
2. 在关键节点添加详细的 `console.log` 便于调试
3. 对枚举值使用常量定义，避免硬编码字符串

---

*修复完成时间：2026-04-06*
