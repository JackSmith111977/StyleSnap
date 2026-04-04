# Shadcn UI + Radix UI 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目 UI 组件库技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [Shadcn UI 核心知识体系](#2-shadcn-ui-核心知识体系)
3. [Radix UI 核心知识体系](#3-radix-ui-核心知识体系)
4. [两者关系与协作模式](#4-两者关系与协作模式)
5. [核心组件详解](#5-核心组件详解)
6. [StyleSnap 项目应用建议](#6-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 技术选型决策

| 技术 | 定位 | StyleSnap 选择 |
|------|------|---------------|
| **Shadcn UI** | 组件代码生成器 | ✅ 采用 |
| **Radix UI** | 无头组件原语 | ✅ 采用（Shadcn UI 底层依赖） |

### 1.2 为什么选择这个组合？

| 优势 | 说明 |
|------|------|
| **完全可控** | 组件代码复制到项目中，100% 可控，无黑盒 |
| **Next.js 友好** | 完美支持 App Router、SSR、RSC |
| **可访问性** | Radix UI 提供 WAI-ARIA 合规的底层原语 |
| **包体积小** | 按需导入，Tree-shaking 友好 |
| **定制灵活** | 基于 Tailwind CSS，易于调整 |
| **社区活跃** | 2025 年增长最快的 UI 方案 |

### 1.3 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Shadcn UI + Radix UI** | 配置简单、性能优秀、Next.js 友好 | 相对较新，社区资源较少 | 大多数 Next.js 项目 ⭐ |
| **Nx** | 功能全面、可视化强、支持多框架 | 配置复杂、学习曲线陡 | 大型多框架项目 |
| **Lerna + npm** | 成熟稳定、文档丰富 | 无缓存、构建慢 | 已有 Lerna 项目迁移 |

---

## 2. Shadcn UI 核心知识体系

### 2.1 Shadcn UI 是什么？

**定位**：不是传统组件库，而是通过 CLI 复制代码到项目中的组件生成器。

**核心理念**：你的代码，你做主（Your code, your control）

### 2.2 核心特性

| 特性 | 说明 |
|------|------|
| **代码复制** | 组件代码直接复制到 `src/components/ui/` 目录 |
| **基于 Radix UI** | 所有组件底层使用 Radix UI Primitives |
| **Tailwind CSS** | 样式使用 Tailwind CSS 原子类 |
| **TypeScript** | 完整类型支持 |
| **无运行时依赖** | 不依赖任何运行时包（除 Radix UI） |

### 2.3 安装与初始化

#### 2.3.1 初始化命令

```bash
# 初始化 Shadcn UI 项目
npx shadcn@latest init
```

#### 2.3.2 初始化选项

初始化时会被询问以下配置：

| 配置项 | 选项 | StyleSnap 推荐 |
|--------|------|---------------|
| **风格** | default / new-york | new-york（更现代） |
| **基础色** | Zinc / Slate / Gray 等 | Zinc（中性灰，高级感） |
| **CSS 变量** | yes / no | yes（支持动态主题） |
| **Tailwind 路径** | `src/app/globals.css` | 默认即可 |
| **组件目录** | `@/components/ui` | 默认即可 |

#### 2.3.3 生成的配置文件

```json filename="components.json"
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

#### 2.3.4 生成的工具函数

```typescript filename="src/lib/utils.ts"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**作用**：合并 Tailwind CSS 类名，自动处理冲突。

### 2.4 组件安装

#### 2.4.1 CLI 安装方式（推荐）

```bash
# 安装单个组件
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add dropdown-menu

# 安装多个组件
npx shadcn@latest add button dialog card input label

# 安装所有组件
npx shadcn@latest add --all
```

#### 2.4.2 生成的文件结构

```
src/
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── dropdown-menu.tsx
│   └── ...
└── lib/
    └── utils.ts
```

### 2.5 组件自定义

#### 2.5.1 修改组件样式

由于代码复制到项目中，可直接修改：

```tsx filename="src/components/ui/button.tsx"
// 原始代码
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90",
        destructive: "bg-red-500 text-neutral-50 hover:bg-red-500/90",
        outline: "border border-neutral-200 bg-white hover:bg-neutral-100 hover:text-neutral-900",
        secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900",
        link: "text-neutral-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### 2.5.2 添加自定义变体

```tsx
// 在 buttonVariants 中添加新变体
const buttonVariants = cva(
  "...", // 基础样式
  {
    variants: {
      variant: {
        default: "...",
        // 添加新变体
        brand: "bg-blue-600 text-white hover:bg-blue-700",
        success: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        default: "...",
        // 添加新尺寸
        xl: "h-14 rounded-md px-10 text-lg",
      },
    },
  }
)
```

### 2.6 主题配置

#### 2.6.1 深色模式配置

```css filename="src/app/globals.css"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
```

#### 2.6.2 主题切换 Hook

```typescript filename="src/hooks/use-theme.ts"
'use client'

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system')

  useEffect(() => {
    const isDark = theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)
  }, [theme])

  return { theme, setTheme }
}
```

---

## 3. Radix UI 核心知识体系

### 3.1 Radix UI 是什么？

**定位**：无样式、可访问的组件原语（Headless UI Components）

**核心理念**：只提供功能和可访问性，无样式

### 3.2 产品组成

| 产品 | 说明 |
|------|------|
| **Primitives** | 核心原语组件（25+ 个） |
| **Colors** | 396 种色彩系统 |
| **Icons** | 300+ 个 15x15 SVG 图标 |
| **Themes** | 预置样式的组件库（基于 Primitives） |

### 3.3 核心设计原则

| 原则 | 说明 |
|------|------|
| **完全可访问性** | 严格遵循 WAI-ARIA 指南，WCAG 合规 |
| **强大的功能性** | 焦点管理、键盘导航、碰撞检测等内置 |
| **极致可组合性** | 1 对 1 策略，每个组件渲染单个 DOM 元素 |
| **无样式** | 零样式设计，100% 定制自由 |

### 3.4 核心组件分类

#### 3.4.1 表单组件

| 组件 | 包名 | 用途 |
|------|------|------|
| Checkbox | `@radix-ui/react-checkbox` | 复选框 |
| Radio Group | `@radix-ui/react-radio-group` | 单选按钮组 |
| Select | `@radix-ui/react-select` | 下拉选择器 |
| Switch | `@radix-ui/react-switch` | 开关 |
| Slider | `@radix-ui/react-slider` | 滑块 |

#### 3.4.2 交互组件

| 组件 | 包名 | 用途 |
|------|------|------|
| Dialog | `@radix-ui/react-dialog` | 模态对话框 |
| Dropdown Menu | `@radix-ui/react-dropdown-menu` | 下拉菜单 |
| Context Menu | `@radix-ui/react-context-menu` | 右键菜单 |
| Popover | `@radix-ui/react-popover` | 弹出框 |
| Tooltip | `@radix-ui/react-tooltip` | 工具提示 |
| Accordion | `@radix-ui/react-accordion` | 折叠面板 |
| Tabs | `@radix-ui/react-tabs` | 选项卡 |

#### 3.4.3 导航组件

| 组件 | 包名 | 用途 |
|------|------|------|
| Navigation Menu | `@radix-ui/react-navigation-menu` | 导航菜单 |
| Scroll Area | `@radix-ui/react-scroll-area` | 自定义滚动区域 |

#### 3.4.4 布局组件

| 组件 | 包名 | 用途 |
|------|------|------|
| Flex | `@radix-ui/react-flex` | Flex 布局 |
| Grid | `@radix-ui/react-grid` | Grid 布局 |
| Container | `@radix-ui/react-container` | 容器 |
| Separator | `@radix-ui/react-separator` | 分隔线 |

### 3.5 核心组件详解

#### 3.5.1 Dialog（对话框）

```tsx
import * as Dialog from '@radix-ui/react-dialog'

export function DialogExample() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button>打开</button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">
          <Dialog.Title>标题</Dialog.Title>
          <Dialog.Description>描述内容</Dialog.Description>

          {/* 内容 */}

          <Dialog.Close asChild>
            <button>关闭</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

**核心子组件**：

| 组件 | 作用 |
|------|------|
| `Dialog.Root` | 根组件，提供上下文 |
| `Dialog.Trigger` | 触发器，打开对话框 |
| `Dialog.Portal` | 传送到 body 末尾 |
| `Dialog.Overlay` | 背景遮罩层 |
| `Dialog.Content` | 对话框内容 |
| `Dialog.Title` | 标题（必需，ARIA） |
| `Dialog.Description` | 描述（必需，ARIA） |
| `Dialog.Close` | 关闭按钮 |

**内置功能**：
- ✅ 焦点陷阱（Focus Trap）
- ✅ ESC 键关闭
- ✅ 点击遮罩关闭
- ✅ 滚动锁定
- ✅ 屏幕阅读器支持

#### 3.5.2 Dropdown Menu（下拉菜单）

```tsx
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

export function DropdownMenuExample() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button>菜单</button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white rounded-lg shadow-lg p-2"
          sideOffset={5}
        >
          <DropdownMenu.Item className="p-2 hover:bg-gray-100">
            操作 1
          </DropdownMenu.Item>
          <DropdownMenu.Item className="p-2 hover:bg-gray-100">
            操作 2
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item className="p-2 hover:bg-gray-100 text-red-600">
            删除
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
```

**核心子组件**：

| 组件 | 作用 |
|------|------|
| `DropdownMenu.Root` | 根组件 |
| `DropdownMenu.Trigger` | 触发器 |
| `DropdownMenu.Content` | 菜单内容 |
| `DropdownMenu.Item` | 菜单项 |
| `DropdownMenu.Separator` | 分隔线 |
| `DropdownMenu.Label` | 菜单标签 |
| `DropdownMenu.Sub` | 子菜单 |

#### 3.5.3 Navigation Menu（导航菜单）

```tsx
import * as NavigationMenu from '@radix-ui/react-navigation-menu'

export function NavigationMenuExample() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/">首页</NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>产品</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            {/* 下拉内容 */}
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
```

### 3.6 无障碍性（A11y）

#### 3.6.1 键盘导航支持

| 键 | 行为 |
|----|------|
| Tab | 移动到下一个焦点元素 |
| Enter/Space | 激活当前焦点元素 |
| Escape | 关闭对话框/菜单 |
| Arrow Keys | 在菜单/选项卡中导航 |

#### 3.6.2 ARIA 属性

Radix UI 自动处理所有 ARIA 属性：
- `aria-expanded`
- `aria-controls`
- `aria-labelledby`
- `aria-describedby`
- `role="dialog"`
- `role="menu"`

---

## 4. 两者关系与协作模式

### 4.1 架构关系

```
Shadcn UI (组件生成器)
    ↓
    复制代码到项目
    ↓
src/components/ui/
    ↓
    使用底层原语
    ↓
Radix UI Primitives (无头组件)
    +
Tailwind CSS (样式)
```

### 4.2 协作模式

| 层级 | 技术 | 职责 |
|------|------|------|
| **功能层** | Radix UI | 交互逻辑、无障碍性、焦点管理 |
| **样式层** | Tailwind CSS | 视觉样式、主题、响应式 |
| **组合层** | Shadcn UI | 预设配置、最佳实践、CLI 工具 |

### 4.3 使用建议

| 场景 | 推荐方案 |
|------|----------|
| 通用组件（按钮、卡片、对话框） | Shadcn UI |
| 需要完全自定义的组件 | 直接使用 Radix UI |
| 复杂交互组件 | Radix UI + 自定义样式 |

---

## 5. 核心组件详解

### 5.1 Button（按钮）

```tsx
import { Button } from '@/components/ui/button'

export function ButtonExamples() {
  return (
    <div className="space-y-4">
      {/* 变体 */}
      <Button variant="default">默认</Button>
      <Button variant="secondary">次要</Button>
      <Button variant="destructive">危险</Button>
      <Button variant="outline">边框</Button>
      <Button variant="ghost">幽灵</Button>
      <Button variant="link">链接</Button>

      {/* 尺寸 */}
      <Button size="sm">小</Button>
      <Button size="default">默认</Button>
      <Button size="lg">大</Button>
      <Button size="icon" variant="outline">
        <Icon />
      </Button>

      {/* 状态 */}
      <Button disabled>禁用</Button>
      <Button loading>加载中</Button>
    </div>
  )
}
```

### 5.2 Card（卡片）

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function StyleCard({ style }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{style.name}</CardTitle>
        <CardDescription>{style.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* 预览图 */}
      </CardContent>
      <CardFooter>
        <Button>查看详情</Button>
      </CardFooter>
    </Card>
  )
}
```

### 5.3 Dialog（对话框）

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function StyleSubmitDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>提交风格</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>提交新风格</DialogTitle>
          <DialogDescription>
            填写风格信息并提交审核
          </DialogDescription>
        </DialogHeader>

        {/* 表单内容 */}

        <DialogFooter>
          <Button type="submit">提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 5.4 Form（表单）

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z.string().min(8, '密码至少 8 个字符'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // 处理提交
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">登录</Button>
      </form>
    </Form>
  )
}
```

---

## 6. StyleSnap 项目应用建议

### 6.1 推荐组件清单

基于 PRD 和 APP_FLOW，以下组件是必需的：

| 组件 | 用途 | 优先级 |
|------|------|--------|
| Button | 所有操作按钮 | P0 |
| Input | 表单输入 | P0 |
| Label | 表单标签 | P0 |
| Card | 风格卡片 | P0 |
| Dialog | 登录/注册/提交对话框 | P0 |
| Dropdown Menu | 用户菜单、筛选菜单 | P0 |
| Form | 所有表单 | P0 |
| Select | 分类/排序选择 | P1 |
| Tabs | 代码片段切换 | P1 |
| Tooltip | 提示信息 | P1 |
| Checkbox | 筛选条件 | P1 |
| Separator | 分隔线 | P1 |
| Avatar | 用户头像 | P1 |
| Skeleton | 加载占位 | P1 |
| Toast | 消息提示 | P1 |

### 6.2 安装命令

```bash
# P0 组件
npx shadcn@latest add button input label card dialog dropdown-menu form

# P1 组件
npx shadcn@latest add select tabs tooltip checkbox separator avatar skeleton toast
```

### 6.3 目录结构建议

```
src/
├── components/
│   ├── ui/                       # Shadcn UI 组件
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── ...
│   │   └── toast.tsx
│   ├── layout/                   # 布局组件
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── navigation.tsx
│   │   └── sidebar.tsx
│   └── features/                 # 功能组件
│       ├── style-card.tsx
│       ├── style-grid.tsx
│       ├── search-form.tsx
│       └── filter-panel.tsx
│
├── hooks/
│   ├── use-theme.ts              # 主题切换
│   └── use-toast.ts              # Toast 通知
│
└── lib/
    └── utils.ts                  # cn() 工具函数
```

### 6.4 主题定制建议

#### 6.4.1 StyleSnap 品牌色配置

```css filename="src/app/globals.css"
@layer base {
  :root {
    /* 品牌色 - 鹰角机能风 */
    --brand-primary: 210 100% 50%;      /* 科技蓝 */
    --brand-secondary: 280 100% 50%;    /* 未来紫 */
    --brand-accent: 150 100% 40%;       /* 霓虹绿 */

    /* 中性色 - Zinc */
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;

    /* ... 其他变量 */
  }

  .dark {
    /* 深色模式品牌色 */
    --brand-primary: 210 100% 60%;
    --brand-secondary: 280 80% 60%;
    --brand-accent: 150 80% 50%;

    /* ... 深色模式变量 */
  }
}
```

#### 6.4.2 自定义组件变体

在 Shadcn UI 组件基础上添加品牌变体：

```tsx filename="src/components/ui/button.tsx"
const buttonVariants = cva(
  "...", // 基础样式
  {
    variants: {
      variant: {
        // 默认变体
        default: "...",
        // 品牌变体
        brand: "bg-brand-primary text-white hover:bg-brand-primary/90",
        futuristic: "bg-gradient-to-r from-brand-primary to-brand-secondary text-white",
      },
    },
  }
)
```

### 6.5 性能优化建议

| 优化项 | 方案 |
|--------|------|
| **按需导入** | 只安装需要的组件，不使用 `--all` |
| **Tree-shaking** | 使用 ESM 导入，避免 `import * as` |
| **组件懒加载** | 大型组件（如 Dialog）使用 `lazy()` |
| **图标按需** | 使用 `lucide-react` 按需导入 |

### 6.6 可访问性检查清单

| 检查项 | 要求 |
|--------|------|
| 键盘导航 | Tab 键可访问所有交互元素 |
| 焦点管理 | 对话框打开时焦点被困在内部 |
| 屏幕阅读器 | 所有组件有正确的 ARIA 标签 |
| 颜色对比度 | 文本与背景对比度 ≥ 4.5:1 |
| 表单标签 | 所有 Input 有对应的 Label |

---

## 附录 A：常见问题 FAQ

### Q1: Shadcn UI 和传统组件库有什么区别？

**A**: Shadcn UI 不是 npm 包，而是 CLI 工具。它将组件代码复制到你的项目中，你可以完全控制代码，没有运行时依赖。

### Q2: 如何更新 Shadcn UI 组件？

**A**: 使用以下命令同步最新更改：

```bash
npx shadcn@latest add button --overwrite
```

### Q3: 可以修改组件样式吗？

**A**: 可以，组件代码在你的项目中，可自由修改。建议修改前先复制一份备份。

### Q4: 如何在项目中使用 Radix UI 原语？

**A**: 直接安装使用：

```bash
npm install @radix-ui/react-dialog
```

```tsx
import * as Dialog from '@radix-ui/react-dialog'
```

### Q5: Shadcn UI 支持中文吗？

**A**: 支持。组件本身无语言限制，文案由你在项目中使用。

---

## 附录 B：参考资料

- [Shadcn UI 官方文档](https://ui.shadcn.com)
- [Radix UI 官方文档](https://www.radix-ui.com)
- [Shadcn UI GitHub](https://github.com/shadcn/ui)
- [Radix UI Primitives GitHub](https://github.com/radix-ui/primitives)
- [Radix Colors](https://www.radix-ui.com/colors)

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
