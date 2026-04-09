# Lint 错误修复报告

**生成时间:** 2026-04-08  
**执行命令:** `pnpm lint`  
**总计:** 564 个警告，0 个错误

---

## 错误类型统计

| 排名 | 规则 | 数量 | 占比 | 修复优先级 |
|------|------|------|------|------------|
| 1 | `@typescript-eslint/explicit-function-return-type` | 268 | 47.5% | 中 |
| 2 | `@typescript-eslint/no-unsafe-assignment` | 132 | 23.4% | 高 |
| 3 | `@typescript-eslint/prefer-nullish-coalescing` | 107 | 18.9% | 低 |
| 4 | `@typescript-eslint/no-unused-vars` | 42 | 7.4% | 中 |
| 5 | `@typescript-eslint/no-explicit-any` | 37 | 6.6% | 高 |
| 6 | `react-hooks/exhaustive-deps` | 5 | 0.9% | 中 |
| 7 | `@typescript-eslint/no-floating-promises` | 5 | 0.9% | 高 |
| 8 | `@typescript-eslint/prefer-optional-chain` | 4 | 0.7% | 低 |
| 9 | `@typescript-eslint/consistent-type-imports` | 4 | 0.7% | 低 |
| 10 | `@typescript-eslint/array-type` | 1 | 0.2% | 低 |

---

## 受影响文件分布

### 高优先级修复文件（错误数 > 20）

| 文件路径 | 错误数 | 主要问题 |
|----------|--------|----------|
| `apps/web/hooks/use-toast.ts` | ~80 | explicit-function-return-type |
| `apps/web/actions/favorites/index.ts` | 18 | no-unsafe-assignment |
| `apps/web/components/ui/custom/card.tsx` | ~50 | explicit-function-return-type |
| `apps/web/app/page.tsx` | ~30 | explicit-function-return-type |
| `apps/web/hooks/use-infinite-scroll.ts` | ~15 | explicit-function-return-type, react-hooks/exhaustive-deps |

### 中优先级修复文件（错误数 10-20）

| 文件路径 | 错误数 | 主要问题 |
|----------|--------|----------|
| `apps/web/actions/comments/index.ts` | 8 | no-unsafe-assignment, prefer-nullish-coalescing |
| `apps/web/actions/collections/index.ts` | 3 | no-unsafe-assignment |
| `apps/web/actions/auth/index.ts` | 1 | no-unsafe-assignment |

---

## 修复策略

### 优先级 1：高风险类型安全问题（169 个）

**规则:** `no-unsafe-assignment`, `no-explicit-any`, `no-floating-promises`

这些错误可能导致运行时错误，需要手动修复：

1. **`no-explicit-any` (37 个)** - 替换 `any` 为具体类型或 `unknown`
2. **`no-unsafe-assignment` (132 个)** - 添加类型断言或改进类型推断
3. **`no-floating-promises` (5 个)** - 添加 `await` 或 `.catch()`

### 优先级 2：函数返回类型（268 个）

**规则:** `explicit-function-return-type`

批量修复方案：
- 使用 TypeScript 的 `infer` 功能自动推断返回类型
- 对于简单函数添加 `: void` 或 `: Promise<void>`
- 对于复杂函数添加完整返回类型

### 优先级 3：代码风格优化（158 个）

**规则:** `prefer-nullish-coalescing`, `no-unused-vars`, `prefer-optional-chain`, `consistent-type-imports`, `array-type`

可自动化修复：
- `||` → `??` (107 个)
- 移除未使用变量 (42 个)
- 可选链优化 (4 个)
- 类型导入规范 (4 个)
- 数组类型规范 (1 个)

---

## 修复执行计划

### 阶段 1：自动化修复（预计 10 分钟）
```bash
# 运行 ESLint 自动修复
pnpm lint --fix
```

### 阶段 2：类型安全修复（预计 60 分钟）
- 修复所有 `no-explicit-any`
- 修复所有 `no-unsafe-assignment`
- 修复所有 `no-floating-promises`

### 阶段 3：返回类型标注（预计 45 分钟）
- 为所有函数添加显式返回类型

### 阶段 4：代码风格优化（预计 15 分钟）
- 剩余的风格问题手动或自动修复

---

## 验证标准

修复完成后运行：
```bash
pnpm lint        # 无警告
pnpm typecheck   # 类型检查通过
pnpm build       # 构建成功
```
