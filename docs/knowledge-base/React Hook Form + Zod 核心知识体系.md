# React Hook Form + Zod 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目表单处理与 Schema 验证技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [React Hook Form 核心知识体系](#2-react-hook-form-核心知识体系)
3. [Zod 核心知识体系](#3-zod-核心知识体系)
4. [两者集成方案](#4-两者集成方案)
5. [核心表单组件详解](#5-核心表单组件详解)
6. [StyleSnap 项目应用建议](#6-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 技术选型决策

| 技术 | 定位 | StyleSnap 选择 |
|------|------|---------------|
| **React Hook Form** | React 表单库 | ✅ 采用 |
| **Zod** | TypeScript Schema 验证 | ✅ 采用 |
| **@hookform/resolvers** | React Hook Form 验证器桥接 | ✅ 采用 |

### 1.2 为什么选择这个组合？

| 优势 | 说明 |
|------|------|
| **高性能** | React Hook Form 基于非受控组件，减少重渲染 |
| **类型安全** | Zod schema 自动推断 TypeScript 类型 |
| **简洁 API** | 直观的 API 设计，学习曲线低 |
| **生态丰富** | 支持多种验证库（Yup、Valibot、ArkType 等） |
| **bundle 小** | Zod 支持 tree-shaking，打包体积小 |

### 1.3 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **React Hook Form + Zod** | 高性能、类型推断、API 简洁 | 需要学习两个库 | 大多数 React 项目 ⭐ |
| **Formik + Yup** | 生态成熟、文档丰富 | 性能较差、API 繁琐 | 已有 Formik 项目 |
| **React Final Form** | 功能强大、高度可定制 | bundle 大、学习曲线陡 | 复杂表单场景 |
| **原生表单** | 无依赖、最轻量 | 需要手写验证逻辑 | 超简单表单 |

---

## 2. React Hook Form 核心知识体系

### 2.1 React Hook Form 是什么？

**定位**：轻量级 React 表单库，基于非受控组件和 Hook 模式

**核心理念**：最小化重渲染，最大化性能

### 2.2 核心特性

| 特性 | 说明 |
|------|------|
| **非受控组件** | 使用 `ref` 管理表单状态，减少重渲染 |
| **Hook API** | `useForm` 统一入口，返回值包含所有表单方法 |
| **内置验证** | 支持 HTML5 验证规则（required、minLength、pattern 等） |
| **灵活集成** | 支持自定义验证函数或第三方验证库（Zod、Yup） |
| **错误处理** | 自动收集错误信息，支持自定义错误消息 |
| **表单状态** | 支持 isDirty、isSubmitting、isValid 等状态 |

### 2.3 安装

```bash
npm install react-hook-form @hookform/resolvers zod
```

### 2.4 基础使用

```typescript
'use client'

import { useForm } from 'react-hook-form'

interface FormData {
  email: string
  password: string
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        placeholder="邮箱"
        {...register('email', { required: '邮箱必填' })}
      />
      {errors.email && <span>{errors.email.message}</span>}

      <input
        type="password"
        placeholder="密码"
        {...register('password', { required: '密码必填' })}
      />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

### 2.5 useForm 返回值详解

```typescript
const {
  // 注册输入字段
  register,

  // 处理表单提交
  handleSubmit,

  // 表单状态
  formState: {
    errors,        // 错误信息
    isDirty,       // 表单是否被修改
    isSubmitting,  // 是否正在提交
    isValid,       // 表单是否有效
    touchedFields, // 已触碰的字段
    dirtyFields,   // 已修改的字段
  },

  // 手动触发验证
  trigger,

  // 获取/设置表单值
  getValues,
  setValue,

  // 重置表单
  reset,

  // 错误处理
  setError,
  clearErrors,

  // 提交状态
  formState: { submitCount, isSubmitSuccessful },
} = useForm<FormData>()
```

### 2.6 字段注册方式

```typescript
// 方式 1：基础注册（无验证）
<input {...register('name')} />

// 方式 2：内置验证
<input
  {...register('email', {
    required: '邮箱必填',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '无效的邮箱格式',
    },
    minLength: {
      value: 5,
      message: '邮箱至少 5 个字符',
    },
  })}
/>

// 方式 3：自定义验证函数
<input
  {...register('username', {
    validate: async (value) => {
      const response = await fetch(`/api/check-username?name=${value}`)
      const { available } = await response.json()
      return available || '用户名已被占用'
    },
  })}
/>

// 方式 4： Zod Schema 验证（推荐）
const schema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z.string().min(8, '密码至少 8 个字符'),
})

const { register, handleSubmit } = useForm<FormData>({
  resolver: zodResolver(schema),
})
```

### 2.7 表单提交处理

```typescript
// 同步提交
const onSubmit = (data: FormData) => {
  console.log(data)
}

// 异步提交（推荐）
const onSubmit = async (data: FormData) => {
  try {
    await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    // 处理错误
  }
}

// 与 Server Action 集成
import { loginAction } from '@/actions/auth/login'

const onSubmit = async (data: FormData) => {
  const result = await loginAction(data)
  if (result?.error) {
    setError('root', { message: result.error })
  }
}
```

### 2.8 表单重置

```typescript
// 重置为初始值
const { reset } = useForm<FormData>()
reset()

// 重置为新值
reset({
  email: 'new@example.com',
  password: '',
})

// 重置并设置默认值
useEffect(() => {
  if (userData) {
    reset(userData)
  }
}, [userData])
```

### 2.9 表单验证触发时机

```typescript
const { trigger, getValues } = useForm<FormData>({
  // 验证模式
  mode: 'onBlur',      // 失焦时验证（默认）
  reValidateMode: 'onChange',  // 提交失败后验证模式
})

// 手动触发验证
const validateField = async () => {
  const isValid = await trigger('email')
  if (!isValid) {
    // 处理验证失败
  }
}

// 验证所有字段
const validateAll = async () => {
  const isValid = await trigger()
  console.log('表单是否有效:', isValid)
}
```

### 2.10 受控组件集成

```typescript
import { Controller, useForm } from 'react-hook-form'

// 用于第三方 UI 组件（如 Select、DatePicker）
const { control } = useForm<FormData>()

<Controller
  name="category"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Select
      {...field}
      options={categories}
      placeholder="选择分类"
    >
      {error && <span>{error.message}</span>}
    </Select>
  )}
/>
```

---

## 3. Zod 核心知识体系

### 3.1 Zod 是什么？

**定位**：TypeScript 优先的 Schema 声明和验证库

**核心理念**：Schema 即类型，自动类型推断

### 3.2 核心特性

| 特性 | 说明 |
|------|------|
| **类型推断** | 从 schema 自动推断 TypeScript 类型 |
| **链式 API** | 直观的链式调用定义复杂规则 |
| **错误处理** | 详细的错误信息，支持自定义消息 |
| **转换功能** | `transform()` 在验证时转换数据 |
| **默认值** | `default()` 设置默认值 |
| **可选/可空** | `optional()`、`nullable()` 处理可选字段 |
| **Tree-shaking** | 支持按需导入，减少打包体积 |

### 3.3 基础类型

```typescript
import { z } from 'zod'

// 基础类型
const stringSchema = z.string()
const numberSchema = z.number()
const booleanSchema = z.boolean()
const dateSchema = z.date()
const nullSchema = z.null()
const undefinedSchema = z.undefined()

// 字面量
const roleSchema = z.literal('admin')

// 枚举
const statusSchema = z.enum(['pending', 'approved', 'rejected'])

// 数组
const stringArraySchema = z.array(z.string())
const minArraySchema = z.array(z.number()).min(1, '数组至少包含一个元素')

// 对象
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().positive(),
})

// 推断类型
type User = z.infer<typeof userSchema>
// { name: string; email: string; age: number; }
```

### 3.4 字符串验证

```typescript
const schema = z.object({
  // 基础验证
  email: z.string().email('无效的邮箱'),
  url: z.string().url('无效的 URL'),
  uuid: z.string().uuid('无效的 UUID'),
  cuid: z.string().cuid('无效的 CUID'),

  // 长度验证
  username: z.string().min(3, '用户名至少 3 个字符'),
  bio: z.string().max(500, '简介最多 500 个字符'),
  code: z.string().length(6, '验证码必须是 6 位'),

  // 正则表达式
  phone: z.string().regex(/^1[3-9]\d{9}$/, '无效的手机号'),

  // 包含/开始/结束
  description: z.string().includes('必填词'),
  slug: z.string().startsWith('/'),
  domain: z.string().endsWith('.com'),

  // 大小写
  lowerCase: z.string().toLowerCase(),
  upperCase: z.string().toUpperCase(),

  // 去除首尾空格
  trimmed: z.string().trim(),

  // 组合验证
  password: z
    .string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '必须包含大写字母')
    .regex(/[a-z]/, '必须包含小写字母')
    .regex(/[0-9]/, '必须包含数字'),
})
```

### 3.5 数字验证

```typescript
const schema = z.object({
  // 基础验证
  age: z.number().int('年龄必须是整数'),
  price: z.number().positive('价格必须大于 0'),
  discount: z.number().nonnegative('折扣不能为负数'),
  rating: z.number().min(1).max(5),

  // 特殊值
  zeroOrPositive: z.number().gte(0),
  finite: z.number().finite(),

  // 转换
  stringToNumber: z.string().transform(Number),
})
```

### 3.6 可选、可空、默认值

```typescript
const schema = z.object({
  // 可选（可以是 undefined）
  nickname: z.string().optional(),

  // 可空（可以是 null）
  avatar: z.string().nullable(),

  // 可选且可空
  bio: z.string().optional().nullable(),

  // 默认值
  role: z.string().default('user'),
  count: z.number().default(0),

  // 可选字段带默认值
  theme: z.enum(['light', 'dark']).optional().default('light'),
})

// 推断结果
type Schema = z.infer<typeof schema>
// {
//   nickname?: string | undefined;
//   avatar: string | null;
//   bio?: string | null | undefined;
//   role: string;
//   count: number;
//   theme: 'light' | 'dark';
// }
```

### 3.7 对象方法

```typescript
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

// 部分字段可选
const partialSchema = userSchema.partial()

// 部分字段指定
const partialSomeSchema = userSchema.partial({ name: true })

// 所有字段必填（覆盖可选）
const requiredSchema = userSchema.required()

// 深度合并
const extendedSchema = userSchema.extend({
  age: z.number(),
})

// 省略某些字段
const withoutEmailSchema = userSchema.omit({ email: true })

// 只保留某些字段
const onlyNameSchema = userSchema.pick({ name: true })

// 深度部分
const nestedSchema = z.object({
  user: z.object({
    name: z.string(),
    settings: z.object({
      theme: z.string(),
    }),
  }),
})

const deepPartialSchema = nestedSchema.deepPartial()
```

### 3.8 联合、交叉、元组

```typescript
// 联合类型（OR）
const idSchema = z.union([
  z.string(),
  z.number(),
])

// 区分类型
const discriminatedSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), content: z.string() }),
  z.object({ type: z.literal('image'), url: z.string() }),
])

// 交叉类型（AND）
const combinedSchema = z.intersection(
  z.object({ name: z.string() }),
  z.object({ age: z.number() })
)

// 元组（固定长度和类型的数组）
const tupleSchema = z.tuple([
  z.string(),    // 第一个元素
  z.number(),    // 第二个元素
  z.boolean(),   // 第三个元素
])
```

### 3.9 自定义验证

```typescript
const schema = z.object({
  // 自定义验证函数
  username: z.string().refine(
    async (value) => {
      const response = await fetch(`/api/check-username?name=${value}`)
      const { available } = await response.json()
      return available
    },
    { message: '用户名已被占用' }
  ),

  // 多字段验证
  confirmPassword: z.string(),
  password: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }
)

// 转换
const schemaWithTransform = z.object({
  tags: z.string().transform((val) => val.split(',').map(t => t.trim())),
  isActive: z.string().transform((val) => val === 'true'),
})
```

### 3.10 错误处理

```typescript
try {
  schema.parse({ email: 'invalid' })
} catch (error) {
  if (error instanceof z.ZodError) {
    // 扁平化错误
    const flatErrors = error.flatten()
    console.log(flatErrors.fieldErrors.email)

    // 详细错误
    const issues = error.issues
    issues.forEach(issue => {
      console.log(issue.path, issue.message)
    })

    // 格式化错误
    const formatted = error.format()
    console.log(formatted.email?._errors)
  }
}

// 安全解析（不抛出异常）
const result = schema.safeParse({ email: 'invalid' })
if (!result.success) {
  console.log(result.error)
} else {
  console.log(result.data)
}
```

---

## 4. 两者集成方案

### 4.1 基础集成

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. 定义 Zod Schema
const loginSchema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z.string().min(8, '密码至少 8 个字符'),
})

// 2. 推断 TypeScript 类型
type LoginFormData = z.infer<typeof loginSchema>

// 3. 创建表单
export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="邮箱" />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} placeholder="密码" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '登录中...' : '登录'}
      </button>
    </form>
  )
}
```

### 4.2 与 Shadcn UI Form 组件集成

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z.object({
  username: z.string().min(2, '用户名至少 2 个字符'),
  email: z.string().email('无效的邮箱'),
  password: z.string().min(8, '密码至少 8 个字符'),
})

export function RegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder="请输入用户名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="请输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? '注册中...' : '注册'}
        </Button>
      </form>
    </Form>
  )
}
```

### 4.3 复杂表单场景

```typescript
const styleSubmitSchema = z.object({
  // 基础信息
  name: z.string().min(2, '风格名称至少 2 个字符'),
  description: z.string().max(500, '简介最多 500 个字符'),

  // 分类（必需）
  category: z.enum(['minimalist', 'cyberpunk', 'brutalist', 'glassmorphism', 'other']),

  // 标签（至少 1 个，最多 5 个）
  tags: z.array(z.string().min(1)).min(1, '至少选择一个标签').max(5, '最多 5 个标签'),

  // 代码片段（必需）
  codeSnippet: z.string().min(10, '代码片段至少 10 个字符'),

  // 预览图 URL（必需，有效的 URL）
  previewImageUrl: z.string().url('请输入有效的图片 URL'),

  // 社交媒体链接（可选）
  socialLinks: z.object({
    github: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
})

// 多步骤表单
const step1Schema = formSchema.pick({ name: true, description: true })
const step2Schema = formSchema.pick({ category: true, tags: true })
const step3Schema = formSchema.pick({ codeSnippet: true, previewImageUrl: true })
```

### 4.4 Server Action 集成

```typescript
// src/actions/style/submit.ts
'use server'

import { z } from 'zod'

const submitStyleSchema = z.object({
  name: z.string().min(2),
  description: z.string().max(500),
  category: z.string(),
  tags: z.array(z.string()),
  codeSnippet: z.string(),
  previewImageUrl: z.string().url(),
})

export async function submitStyleAction(formData: z.infer<typeof submitStyleSchema>) {
  // Zod 验证
  const result = submitStyleSchema.safeParse(formData)
  if (!result.success) {
    return { error: '验证失败', details: result.error.flatten() }
  }

  try {
    // 数据库操作
    // await db.styles.create(result.data)

    revalidatePath('/')
    return { success: true, message: '风格提交成功' }
  } catch (error) {
    return { error: '提交失败，请重试' }
  }
}

// 组件中使用
'use client'

export function StyleSubmitForm() {
  const form = useForm<z.infer<typeof submitStyleSchema>>({
    resolver: zodResolver(submitStyleSchema),
  })

  const onSubmit = async (values: z.infer<typeof submitStyleSchema>) => {
    const result = await submitStyleAction(values)
    if (result?.error) {
      form.setError('root', { message: result.error })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 表单字段 */}
      {form.formState.errors.root && (
        <div className="text-red-500">{form.formState.errors.root.message}</div>
      )}
    </form>
  )
}
```

### 4.5 异步验证优化

```typescript
// 防抖异步验证
const schema = z.object({
  username: z.string().min(3).refine(
    async (value) => {
      // 添加防抖逻辑
      await new Promise(resolve => setTimeout(resolve, 300))
      const response = await fetch(`/api/check-username?name=${value}`)
      const { available } = await response.json()
      return available
    },
    { message: '用户名已被占用' }
  ),
})

// 使用 useForm 配置优化性能
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',        // 失焦时验证
  reValidateMode: 'onChange', // 提交失败后每次变化都验证
  delayError: 300,       // 延迟显示错误（ms）
})
```

---

## 5. 核心表单组件详解

### 5.1 登录表单

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z.string().min(1, '密码必填'),
})

export function LoginForm() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    // 处理登录
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="请输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? '登录中...' : '登录'}
        </Button>
      </form>
    </Form>
  )
}
```

### 5.2 注册表单

```typescript
const registerSchema = z.object({
  email: z.string().email('无效的邮箱'),
  password: z
    .string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '必须包含大写字母')
    .regex(/[a-z]/, '必须包含小写字母')
    .regex(/[0-9]/, '必须包含数字'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, '必须同意条款'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }
)

export function RegisterForm() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    // 处理注册
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 邮箱字段 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 密码字段 */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="至少 8 位，包含大小写字母和数字" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 确认密码字段 */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="再次输入密码" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 同意条款 */}
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                我同意服务条款和隐私政策
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          注册
        </Button>
      </form>
    </Form>
  )
}
```

### 5.3 风格提交表单

```typescript
const styleSubmitSchema = z.object({
  name: z.string().min(2, '风格名称至少 2 个字符'),
  description: z.string().max(500, '简介最多 500 个字符'),
  category: z.string({ required_error: '请选择分类' }),
  tags: z.array(z.string()).min(1, '至少选择一个标签'),
  codeSnippet: z.string().min(10, '代码片段至少 10 个字符'),
  previewImage: z.instanceof(File).optional(),
})

export function StyleSubmitForm() {
  const form = useForm<z.infer<typeof styleSubmitSchema>>({
    resolver: zodResolver(styleSubmitSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      tags: [],
      codeSnippet: '',
    },
  })

  async function onSubmit(values: z.infer<typeof styleSubmitSchema>) {
    // 处理提交
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('description', values.description)
    // ...
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 名称 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>风格名称</FormLabel>
              <FormControl>
                <Input placeholder="例如：鹰角机能风" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>风格描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="描述这个风格的特点..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 分类选择 */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>分类</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="minimalist">极简主义</SelectItem>
                  <SelectItem value="cyberpunk">赛博朋克</SelectItem>
                  <SelectItem value="brutalist">粗野主义</SelectItem>
                  <SelectItem value="glassmorphism">玻璃拟态</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 标签选择 */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标签</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="输入标签后按回车"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 代码片段 */}
        <FormField
          control={form.control}
          name="codeSnippet"
          render={({ field }) => (
            <FormItem>
              <FormLabel>代码片段</FormLabel>
              <FormControl>
                <CodeEditor
                  value={field.value}
                  onChange={field.onChange}
                  language="css"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 预览图上传 */}
        <FormField
          control={form.control}
          name="previewImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>预览图</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) field.onChange(file)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          提交风格
        </Button>
      </form>
    </Form>
  )
}
```

### 5.4 密码重置表单

```typescript
const resetPasswordSchema = z.object({
  email: z.string().email('无效的邮箱'),
})

const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, '密码至少 8 个字符')
    .regex(/[A-Z]/, '必须包含大写字母')
    .regex(/[a-z]/, '必须包含小写字母')
    .regex(/[0-9]/, '必须包含数字'),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }
)

// 发送重置链接
export function ResetPasswordForm() {
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    // 发送重置邮件
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          发送重置链接
        </Button>
      </form>
    </Form>
  )
}
```

---

## 6. StyleSnap 项目应用建议

### 6.1 推荐表单清单

基于 PRD 和 APP_FLOW，StyleSnap 需要以下表单：

| 表单 | 字段 | 验证规则 | 优先级 |
|------|------|----------|--------|
| **登录表单** | email, password | 邮箱格式、密码必填 | P0 |
| **注册表单** | email, password, confirmPassword, agreeToTerms | 邮箱格式、密码强度、一致校验 | P0 |
| **密码重置** | email | 邮箱格式 | P1 |
| **新密码设置** | password, confirmPassword | 密码强度、一致校验 | P1 |
| **风格提交** | name, description, category, tags, codeSnippet, previewImage | 多字段验证 | P0 |
| **搜索表单** | query, filters | 可选 | P1 |
| **评论表单** | content | 内容必填、长度限制 | P2 |
| **个人资料** | username, avatar, bio, socialLinks | 用户名唯一性 | P2 |

### 6.2 目录结构建议

```
src/
├── components/
│   └── forms/
│       ├── login-form.tsx          # 登录表单
│       ├── register-form.tsx       # 注册表单
│       ├── reset-password-form.tsx # 密码重置表单
│       ├── style-submit-form.tsx   # 风格提交表单
│       ├── comment-form.tsx        # 评论表单
│       └── profile-form.tsx        # 个人资料表单
├── lib/
│   └── schemas/
│       ├── auth.ts                 # 认证相关 schema
│       ├── style.ts                # 风格相关 schema
│       └── user.ts                 # 用户相关 schema
└── hooks/
    └── use-form-state.ts           # 表单状态 Hook（可选）
```

### 6.3 Schema 复用模式

```typescript
// src/lib/schemas/auth.ts
import { z } from 'zod'

// 基础邮箱 schema
export const emailSchema = z.string().email('无效的邮箱')

// 基础密码 schema
export const passwordSchema = z
  .string()
  .min(8, '密码至少 8 个字符')
  .regex(/[A-Z]/, '必须包含大写字母')
  .regex(/[a-z]/, '必须包含小写字母')
  .regex(/[0-9]/, '必须包含数字')

// 登录 schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密码必填'),
})

// 注册 schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, '必须同意条款'),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }
)

// 密码重置 schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// 新密码 schema
export const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: '两次密码输入不一致',
    path: ['confirmPassword'],
  }
)
```

### 6.4 表单最佳实践

| 实践 | 说明 |
|------|------|
| **Schema 复用** | 在 `lib/schemas/` 集中管理，避免重复定义 |
| **类型推断** | 使用 `z.infer<typeof schema>` 自动获取类型 |
| **默认值** | 始终设置 `defaultValues` 避免受控组件警告 |
| **错误显示** | 使用 `FormMessage` 组件统一错误样式 |
| **提交状态** | 禁用按钮 + 加载文字防止重复提交 |
| **客户端验证** | 仅用于 UX，服务端必须重新验证 |

### 6.5 性能优化建议

| 优化项 | 方案 |
|--------|------|
| **按需导入** | 使用 ESM 按需导入 Zod 和 React Hook Form |
| **验证模式** | 使用 `mode: 'onBlur'` 减少不必要的验证 |
| **延迟错误** | 设置 `delayError: 300` 避免闪烁 |
| **表单分步** | 复杂表单拆分为多步骤，每步独立验证 |
| **异步验证防抖** | 自定义验证函数中添加防抖逻辑 |

### 6.6 无障碍性检查清单

| 检查项 | 要求 |
|--------|------|
| 表单标签 | 所有 Input 有对应的 Label |
| 错误提示 | 错误消息与输入框正确关联 |
| 焦点管理 | 提交失败后焦点移动到第一个错误字段 |
| 颜色对比 | 错误提示颜色对比度 ≥ 4.5:1 |
| 屏幕阅读器 | 错误更新时通知屏幕阅读器 |

---

## 附录：常见问题 FAQ

### Q1: 如何处理文件上传表单？

**A**: 使用 `useForm` 的 `setValue` 手动设置文件值：

```typescript
const form = useForm<{ file: File }>()

<input
  type="file"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) form.setValue('file', file)
  }}
/>
```

### Q2: 如何实现表单自动保存？

**A**: 使用 `useWatch` + `useEffect`：

```typescript
const { watch } = useForm()
const values = watch()

useEffect(() => {
  const subscription = watch((value) => {
    localStorage.setItem('draft', JSON.stringify(value))
  })
  return () => subscription.unsubscribe()
}, [watch])
```

### Q3: Zod 报错信息如何国际化？

**A**: 使用 `ZodErrorMap`：

```typescript
import { setErrorMap } from 'zod'

setErrorMap((issue, ctx) => {
  if (issue.code === 'invalid_string') {
    return { message: '无效的邮箱格式' }
  }
  return { message: ctx.defaultError }
})
```

### Q4: 如何测试表单验证逻辑？

**A**: 使用 Vitest 测试 schema：

```typescript
test('login schema validation', () => {
  const result = loginSchema.safeParse({ email: 'invalid' })
  expect(result.success).toBe(false)
  expect(result.error?.issues).toHaveLength(1)
})
```

### Q5: React Hook Form 与 Next.js Server Actions 如何集成？

**A**: 直接在 `handleSubmit` 中调用 Server Action：

```typescript
const onSubmit = async (data: FormData) => {
  const result = await loginAction(data)
  if (result?.error) {
    form.setError('root', { message: result.error })
  }
}
```

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
