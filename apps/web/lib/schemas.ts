import { z } from 'zod'

/**
 * Server Action 输入验证 Schemas
 *
 * 用于验证所有 Server Action 的输入参数，确保类型安全和数据完整性
 */

// UUID 格式验证（Supabase ID 格式）
const uuidSchema = z.string().uuid('无效的 ID 格式')

// 邮箱验证
export const emailSchema = z.string().email('无效的邮箱格式')

// 密码验证（最少 8 位）
export const passwordSchema = z
  .string()
  .min(8, '密码至少需要 8 位字符')

// 用户名验证（字母数字下划线，3-20 字符）
export const usernameSchema = z
  .string()
  .min(3, '用户名至少 3 位')
  .max(20, '用户名最多 20 位')
  .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')

// 登录参数验证
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '请输入密码'),
})

// 注册参数验证
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
})

// 密码重置参数验证
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// 风格 ID 验证
export const styleIdSchema = uuidSchema.describe('风格 ID')

// 分类 ID 验证
export const categoryIdSchema = uuidSchema.describe('分类 ID')

// 评论 ID 验证
export const commentIdSchema = uuidSchema.describe('评论 ID')

// 创建评论参数验证
export const createCommentSchema = z.object({
  styleId: styleIdSchema,
  content: z.string().min(1, '评论内容不能为空').max(1000, '评论内容最多 1000 字'),
  parentId: commentIdSchema.optional().nullable(),
  replyToUserId: commentIdSchema.optional(),  // 新增：回复的目标用户 ID（扁平化存储方案）
})

// 删除评论参数验证
export const deleteCommentSchema = z.object({
  commentId: commentIdSchema,
})

// 收藏/取消收藏参数验证
export const toggleFavoriteSchema = z.object({
  styleId: styleIdSchema,
})

// 点赞/取消点赞参数验证
export const toggleLikeSchema = z.object({
  styleId: styleIdSchema,
})

// 头像上传参数验证
export const uploadAvatarSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    '头像文件大小不能超过 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
    '头像文件类型仅支持 JPG、PNG、WEBP'
  ),
})

// 用户资料更新参数验证
export const updateProfileSchema = z.object({
  username: usernameSchema.optional(),
  nickname: z.string().max(50, '昵称最多 50 位').optional(),
  bio: z.string().max(200, '简介最多 200 字').optional(),
})

// 分页参数验证
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
})

// 排序参数验证
export const sortSchema = z.enum(['newest', 'oldest', 'popular', 'liked']).default('newest')

// ============== 风格提交相关 Schemas ==============

// 设计变量验证（色板、字体、间距等）
export const designTokensSchema = z.object({
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '主色格式错误'),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '辅色格式错误'),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '背景色格式错误'),
    surface: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '表面色格式错误'),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '文本色格式错误'),
    textMuted: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'muted 文本色格式错误'),
  }).optional(),
  fonts: z.object({
    heading: z.string().min(1, '标题字体不能为空'),
    body: z.string().min(1, '正文字体不能为空'),
    mono: z.string().min(1, '等宽字体不能为空'),
  }).optional(),
  spacing: z.object({
    xs: z.number().min(1).max(16),
    sm: z.number().min(2).max(24),
    md: z.number().min(4).max(32),
    lg: z.number().min(8).max(48),
    xl: z.number().min(16).max(64),
  }).optional(),
})

// 代码片段验证
export const codeSnippetsSchema = z.object({
  html: z.string().min(1, 'HTML 代码不能为空'),
  css: z.string().min(1, 'CSS 代码不能为空'),
  react: z.string().optional(),
  tailwind: z.string().optional(),
})

// 风格提交表单验证
export const submissionFormSchema = z.object({
  title: z
    .string()
    .min(2, '标题至少 2 位字符')
    .max(50, '标题最多 50 位字符'),
  description: z
    .string()
    .min(10, '描述至少 10 位字符')
    .max(500, '描述最多 500 位字符'),
  categoryId: uuidSchema,
  tags: z.array(z.string()).max(10, '最多添加 10 个标签').optional(),
  designTokens: designTokensSchema,
  codeSnippets: codeSnippetsSchema,
})

// 图片上传验证（客户端验证用）
// 注意：FileList 是浏览器 API，在 Server 组件中不可用
// 实际验证在 Server Action 中进行
export const imageUploadSchema = z.object({
  lightImage: z.any().optional(),
  darkImage: z.any().optional(),
})

/**
 * 验证辅助函数
 *
 * @example
 * const result = validate(loginSchema, { email: 'test@example.com', password: '123456' })
 * if (!result.success) {
 *   return { error: result.error.issues[0]?.message }
 * }
 * // result.data 是验证通过的类型安全数据
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data)
}

/**
 * 验证并抛出错误（用于 Server Actions）
 *
 * @example
 * const { styleId } = validateOrThrow(createCommentSchema, data)
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || '参数验证失败')
  }
  return result.data
}
