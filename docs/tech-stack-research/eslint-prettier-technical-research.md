# ESLint + Prettier 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目代码质量工具技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [ESLint 核心知识体系](#2-eslint-核心知识体系)
3. [Prettier 核心知识体系](#3-prettier-核心知识体系)
4. [两者集成方案](#4-两者集成方案)
5. [Next.js 16 配置指南](#5-nextjs-16-配置指南)
6. [StyleSnap 项目应用建议](#6-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 技术选型决策

| 技术 | 定位 | StyleSnap 选择 |
|------|------|---------------|
| **ESLint** | 代码质量检查 | ✅ 采用 |
| **Prettier** | 代码格式化 | ✅ 采用 |
| **eslint-config-prettier** | Prettier 兼容配置 | ✅ 采用 |
| **@typescript-eslint** | TypeScript 规则集 | ✅ 采用 |

### 1.2 为什么选择这个组合？

| 优势 | 说明 |
|------|------|
| **职责分离** | ESLint 负责代码质量，Prettier 负责代码格式 |
| **TypeScript 支持** | @typescript-eslint 提供完整 TS 规则 |
| **Next.js 官方推荐** | create-next-app 默认配置 |
| **生态成熟** | 丰富的插件和共享配置 |
| **自动修复** | 大多数问题可自动修复 |

### 1.3 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **ESLint + Prettier** | 生态成熟、Next.js 默认 | 配置相对复杂 | 大多数 React/Next.js 项目 ⭐ |
| **Biome** | 速度快、配置简单 | 生态较新、规则较少 | 追求性能的新项目 |
| **Rome** | 一体化、零配置 | 项目已停止维护 | 不推荐 |
| **仅 ESLint** | 单一工具 | 格式化规则冲突 | 不推荐 |

### 1.4 ESLint vs Prettier

| 工具 | 职责 | 示例 |
|------|------|------|
| **ESLint** | 代码质量、潜在错误、最佳实践 | 未使用变量、类型错误、空指针 |
| **Prettier** | 代码格式、样式统一 | 缩进、引号、分号、换行 |

**协作模式**：
```
编写代码 → Prettier 格式化 → ESLint 检查质量 → 自动修复 → 提交
```

---

## 2. ESLint 核心知识体系

### 2.1 ESLint 是什么？

**定位**：可配置的 JavaScript/TypeScript 代码检查工具

**核心功能**：
- 发现潜在错误
- 强制执行代码规范
- 自动修复问题
- 支持自定义规则

### 2.2 安装

```bash
# Next.js 16 项目默认已安装
npm install -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier

# 或使用 pnpm
pnpm add -D eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier
```

### 2.3 配置文件（Flat Config）

ESLint v9+ 使用新的 Flat Config 格式：

```typescript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import next from 'eslint-config-next'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // 忽略文件
  { ignores: ['dist', '.next', 'node_modules', '*.config.*'] },

  // 基础配置
  js.configs.recommended,

  // TypeScript 配置
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Next.js 配置
  ...next.configs.recommended,

  // Prettier 配置（必须放在最后）
  prettier,

  // 语言选项
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 插件配置
  {
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh 规则
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // 自定义规则
  {
    rules: {
      // 自定义规则覆盖
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
    },
  }
)
```

### 2.4 传统配置（兼容模式）

如果项目使用传统 `.eslintrc` 格式：

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
    ],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### 2.5 推荐规则配置

```typescript
// eslint.config.js - 自定义规则部分
{
  rules: {
    // ========== 错误级别 ==========

    // 未使用变量（允许 _ 前缀）
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // 禁止 any 类型
    '@typescript-eslint/no-explicit-any': 'error',

    // 必须使用可选链
    '@typescript-eslint/prefer-optional-chain': 'error',

    // 必须使用空值合并
    '@typescript-eslint/prefer-nullish-coalescing': 'error',

    // ========== 警告级别 ==========

    // 严格布尔表达式
    '@typescript-eslint/strict-boolean-expressions': 'warn',

    // 禁止非空断言
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // 显式函数返回类型
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      { allowExpressions: true },
    ],

    // ========== 关闭的规则 ==========

    // Next.js 16 使用 App Router，关闭页面强制要求
    '@next/next/no-html-link-for-pages': 'off',

    // 允许 require
    '@typescript-eslint/no-var-requires': 'off',
  }
}
```

### 2.6 行内禁用

```typescript
// 禁用单行
// eslint-disable-next-line
const result = someAnyFunction()

// 禁用特定规则
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const value: any = getData()

// 禁用多行
/* eslint-disable @typescript-eslint/no-explicit-any */
const a: any = 1
const b: any = 2
/* eslint-enable @typescript-eslint/no-explicit-any */

// 禁用整个文件
/* eslint-disable */
// 文件内容
```

### 2.7 运行 ESLint

```bash
# 检查所有文件
npx eslint .

# 检查并自动修复
npx eslint . --fix

# 检查特定文件
npx eslint src/app/page.tsx

# 输出格式
npx eslint . --format stylish

# 仅显示错误（不显示警告）
npx eslint . --quiet
```

### 2.8 集成到 VS Code

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [{ "mode": "auto" }]
}
```

### 2.9 Git Hooks 集成

```bash
# 安装 lint-staged 和 husky
pnpm add -D lint-staged husky
npx husky init
```

```json
// package.json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write ."
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### 2.10 CI/CD 集成

```yaml
# .github/workflows/lint.yml
name: Lint

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Run ESLint
        run: pnpm lint
```

---

## 3. Prettier 核心知识体系

### 3.1 Prettier 是什么？

**定位**：代码格式化工具

**核心特性**：
- 统一代码风格
- 支持多种语言
- 自动格式化
- Git 友好

### 3.2 安装

```bash
pnpm add -D prettier @trivago/prettier-plugin-sort-imports
```

### 3.3 配置文件

```javascript
// prettier.config.js
/** @type {import('prettier').Config} */
export default {
  // 每行最大字符数
  printWidth: 100,

  // 缩进空格数
  tabWidth: 2,

  // 使用空格缩进
  useTabs: false,

  // 分号
  semi: false,

  // 引号
  singleQuote: true,

  // JSX 使用单引号
  jsxSingleQuote: false,

  // 尾随逗号（ES5 标准）
  trailingComma: 'es5',

  // 对象空格
  bracketSpacing: true,

  // JSX 闭合括号位置
  bracketSameLine: false,

  // 箭头函数单参数括号
  arrowParens: 'always',

  // 格式化注释
  proseWrap: 'preserve',

  // HTML 空白敏感度
  htmlWhitespaceSensitivity: 'css',

  // 末尾换行
  endOfLine: 'lf',

  // 单属性换行
  singleAttributePerLine: false,

  // 插件配置
  plugins: ['@trivago/prettier-plugin-sort-imports'],

  // import 排序
  importOrder: [
    '^react$',
    '^next(/.*)?$',
    '<THIRD_PARTY_MODULES>',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
```

### 3.4 忽略文件

```json
// .prettierignore
# 依赖
node_modules/
.pnpm-store/

# 构建输出
dist/
.next/
out/
build/

# 配置文件
*.config.js
*.config.ts
*.lock

# 类型定义
**/*.d.ts

# 其他
coverage/
.idea/
.vscode/
*.log
```

### 3.5 运行 Prettier

```bash
# 格式化所有文件
npx prettier --write .

# 检查格式化（不修改）
npx prettier --check .

# 格式化特定文件
npx prettier --write src/app/page.tsx

# 仅检查变更文件（Git）
npx prettier --check --cache $(git diff --name-only HEAD)
```

### 3.6 行内禁用

```typescript
// 禁用单行格式化
// prettier-ignore
const messyObject = {  a: 1,  b: 2  }

// 禁用多行
/* prettier-ignore */
const obj = {
  a: 1,
  b: 2
}

// 禁用整个文件
/* prettier-ignore */
// 文件内容
```

### 3.7 支持的语言

Prettier 支持格式化：

| 语言 | 文件扩展名 |
|------|-----------|
| JavaScript | .js, .jsx, .mjs |
| TypeScript | .ts, .tsx |
| CSS | .css, .scss, .less |
| JSON | .json |
| Markdown | .md |
| HTML | .html |
| YAML | .yml, .yaml |
| GraphQL | .graphql |

---

## 4. 两者集成方案

### 4.1 为什么需要集成？

**问题**：ESLint 和 Prettier 都有格式化规则，可能冲突

**解决方案**：使用 `eslint-config-prettier` 禁用 ESLint 中与 Prettier 冲突的规则

### 4.2 安装

```bash
pnpm add -D eslint-config-prettier
```

### 4.3 配置顺序

```typescript
// eslint.config.js - 正确的顺序
export default tseslint.config(
  // 1. 基础配置
  js.configs.recommended,

  // 2. TypeScript 配置
  ...tseslint.configs.recommended,

  // 3. Next.js 配置
  ...next.configs.recommended,

  // 4. Prettier 配置（必须放在最后，覆盖前面所有格式化规则）
  prettier
)
```

### 4.4 验证配置

```bash
# 检查是否有冲突
npx eslint --print-config src/app/page.tsx | grep -A 50 "rules"

# 或使用专用工具
npx eslint-config-prettier src/app/page.tsx
```

### 4.5 共同运行

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint:all": "pnpm lint && pnpm format:check"
  }
}
```

### 4.6 lint-staged 配置

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

**执行顺序**：先 Prettier 格式化，再 ESLint 修复

---

## 5. Next.js 16 配置指南

### 5.1 Next.js 16 ESLint 配置

Next.js 16 默认使用 Flat Config：

```typescript
// eslint.config.js
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
})

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  // 自定义配置...
]
```

### 5.2 App Router 特定规则

```typescript
{
  rules: {
    // 允许在 App Router 中使用 async Server Components
    '@typescript-eslint/require-await': 'off',

    // 关闭 React.FC 强制要求
    'react/function-component-definition': [
      'warn',
      { namedComponents: 'arrow-function' },
    ],
  }
}
```

### 5.3 Server Component 规则

```typescript
{
  files: ['**/*.tsx'],
  rules: {
    // Server Components 中可以使用某些客户端 API
    'no-console': 'warn',
  }
}
```

### 5.4 API Route 规则

```typescript
{
  files: ['src/app/api/**/*.ts'],
  rules: {
    // API Routes 中允许 any 类型（处理外部数据）
    '@typescript-eslint/no-explicit-any': 'warn',
  }
}
```

---

## 6. StyleSnap 项目应用建议

### 6.1 完整配置示例

```typescript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  // 忽略文件
  { ignores: ['dist', '.next', 'node_modules', '*.config.*'] },

  // 基础配置
  js.configs.recommended,

  // TypeScript 配置
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // 语言选项
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 插件配置
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },

  // StyleSnap 自定义规则
  {
    rules: {
      // ========== 错误级别 ==========
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',

      // ========== 警告级别 ==========
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        { allowExpressions: true },
      ],

      // ========== 关闭的规则 ==========
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // Prettier 配置（必须放在最后）
  prettier
)
```

```javascript
// prettier.config.js
/** @type {import('prettier').Config} */
export default {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
}
```

### 6.2 项目脚本

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint src/ --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src/ --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write src/",
    "format:check": "prettier --check src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

### 6.3 VS Code 配置

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.workingDirectories": [{ "mode": "auto" }],
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 6.4 Git Hooks 配置

```bash
# 安装
pnpm add -D husky lint-staged
npx husky init
```

```json
// package.json - lint-staged 配置
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

### 6.5 代码审查清单

| 检查项 | 工具 | 频率 |
|--------|------|------|
| ESLint 无错误 | `pnpm lint` | 提交前 |
| Prettier 格式化 | `pnpm format` | 提交前 |
| TypeScript 类型检查 | `pnpm typecheck` | 提交前 |
| 单元测试通过 | `pnpm test:run` | 提交前 |
| E2E 测试通过 | `pnpm test:e2e` | 发布前 |

### 6.6 CI/CD 工作流

```yaml
# .github/workflows/quality.yml
name: Code Quality

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm format:check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:run

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
```

---

## 附录：常见问题 FAQ

### Q1: ESLint 和 Prettier 规则冲突怎么办？

**A**: 确保 `eslint-config-prettier` 在配置数组的最后，它会禁用所有与 Prettier 冲突的 ESLint 规则。

### Q2: 如何禁用某个文件的 ESLint 检查？

**A**: 在文件顶部添加 `/* eslint-disable */`，或在配置中添加到 `ignores` 数组。

### Q3: 为什么 ESLint 不报告某些错误？

**A**: 检查：
1. `tsconfig.json` 是否包含该文件
2. ESLint 配置中的 `files` 模式
3. 是否有行内禁用注释

### Q4: 如何在 CI 中加速 ESLint 检查？

**A**: 使用缓存：
```yaml
- uses: actions/cache@v4
  with:
    path: node_modules/.cache/eslint
    key: eslint-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### Q5: Prettier 格式化后代码与预期不符？

**A**: 检查 `.prettierignore` 是否包含该文件，或检查是否有语法错误导致无法解析。

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
