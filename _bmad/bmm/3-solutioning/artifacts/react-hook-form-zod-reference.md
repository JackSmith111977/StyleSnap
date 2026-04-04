# React Hook Form + Zod - Agent 参考

> 用途：表单处理与数据验证
> 来源：`knowledge-base/tech-stack/react-hook-form-zod-technical-research.md`

---

## 快速参考

### 安装
```bash
pnpm add react-hook-form @hookform/resolvers zod
```

### 基础用法
```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('无效的邮箱地址'),
  password: z.string().min(8, '密码至少 8 位'),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await submitAction(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        登录
      </button>
    </form>
  )
}
```

---

## Zod 常用 Schema

```typescript
import { z } from 'zod'

// 基础类型
const stringSchema = z.string()
const numberSchema = z.number()
const booleanSchema = z.boolean()

// 字符串验证
const emailSchema = z.string().email()
const urlSchema = z.string().url()
const uuidSchema = z.string().uuid()
const minMaxSchema = z.string().min(1).max(100)

// 数组
const arraySchema = z.array(z.string())

// 对象
const userSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
})

// 可选
const optionalSchema = z.string().optional()

// 默认值
const defaultSchema = z.string().default('default')
```

---

## 集成 Server Actions

```typescript
// action.ts
'use server'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function loginAction(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!result.success) {
    return { error: result.error.flatten() }
  }

  // 处理登录逻辑
}

// 组件
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(loginSchema),
})
```

---

## 最佳实践

1. **类型推断**：使用 `z.infer<typeof schema>` 获取类型
2. **错误消息**：在 schema 中定义友好的错误消息
3. **服务端验证**：永远不要只依赖客户端验证
4. **useFormContext**：在嵌套组件中共享表单上下文
