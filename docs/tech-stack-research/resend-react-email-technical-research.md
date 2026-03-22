# Resend + React Email 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：官方文档、社区最佳实践
> 用途：StyleSnap 项目邮件服务技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [Resend 核心知识体系](#2-resend-核心知识体系)
3. [React Email 核心知识体系](#3-react-email-核心知识体系)
4. [两者集成方案](#4-两者集成方案)
5. [邮件模板详解](#5-邮件模板详解)
6. [StyleSnap 项目应用建议](#6-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 技术选型决策

| 技术 | 定位 | StyleSnap 选择 |
|------|------|---------------|
| **Resend** | 邮件发送 API 服务 | ✅ 采用 |
| **React Email** | React 邮件模板开发工具 | ✅ 采用 |
| **@react-email/components** | React 邮件 UI 组件库 | ✅ 采用 |

### 1.2 为什么选择这个组合？

| 优势 | 说明 |
|------|------|
| **开发者体验** | React 编写邮件模板，无需 HTML 表格布局 |
| **本地预览** | `react-email dev` 命令本地实时预览邮件 |
| **类型安全** | 完整的 TypeScript 支持 |
| **发送可靠** | Resend 专注于邮件送达率，自动处理 SPF/DKIM |
| **免费额度** | 每月 3000 封，100 封/天，足够个人项目 |
| **Domain 验证** | 自定义发件域名，提升送达率 |

### 1.3 与其他方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Resend + React Email** | DX 优秀、类型安全、本地预览 | 相对较新、社区较小 | 现代 React 项目 ⭐ |
| **SendGrid + HTML 模板** | 生态成熟、功能全面 | HTML 邮件开发痛苦 | 企业级项目 |
| **Postmark** | 送达率高、速度快 | 价格较高、无 React 工具 | 交易类邮件 |
| **AWS SES** | 成本最低 | 配置复杂、送达率依赖配置 | 大量邮件发送 |
| **Nodemailer** | 免费、灵活 | 需要自建 SMTP、送达率问题 | 内部工具、测试 |

### 1.4 Resend 定价

| 计划 | 价格 | 额度 | 功能 |
|------|------|------|------|
| **Free** | $0/月 | 3000 封/月，100 封/天 | 基础功能、1 个 Domain |
| **Pro** | $20/月 | 50000 封/月 | 无限 Domains、高级分析 |
| **Enterprise** | 定制 | 定制 | 专属支持、SLA |

---

## 2. Resend 核心知识体系

### 2.1 Resend 是什么？

**定位**：面向开发者的邮件 API 服务

**核心功能**：
- 发送交易类邮件（验证、重置密码、通知）
- 营销邮件（新闻通讯、产品更新）
- 邮件接收（Webhook 处理）

### 2.2 安装

```bash
npm install resend
```

### 2.3 环境变量配置

```bash
# .env.local
RESEND_API_KEY="re_xxxxxxxxxxxxx"
```

在 Supabase Dashboard 或 Vercel Environment Variables 中配置。

### 2.4 基础发送

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmail() {
  const { data, error } = await resend.emails.send({
    from: 'StyleSnap <onboarding@resend.dev>',
    to: ['user@example.com'],
    subject: 'Hello World',
    html: '<strong>Hello World!</strong>',
    text: 'Hello World!',
  })

  if (error) {
    console.error(error)
    return
  }

  console.log('邮件发送成功:', data)
}
```

### 2.5 完整邮件选项

```typescript
const { data, error } = await resend.emails.send({
  // 发件人（必须使用已验证的 Domain）
  from: 'StyleSnap <noreply@stylesnap.dev>',

  // 收件人
  to: ['user@example.com'],

  // 抄送
  cc: ['team@example.com'],

  // 密送
  bcc: ['admin@example.com'],

  // 回复地址
  reply_to: 'support@stylesnap.dev',

  // 主题
  subject: '欢迎使用 StyleSnap',

  // HTML 内容
  html: '<strong>Hello World!</strong>',

  // 纯文本内容（可选，提升兼容性）
  text: 'Hello World!',

  // 标签（用于分类统计）
  tags: [
    { name: 'type', value: 'welcome' },
    { name: 'user_id', value: '123' },
  ],

  // 自定义 Headers
  headers: {
    'X-Entity-Ref-ID': 'unique-id-123',
  },

  // 调度发送（ISO 8601 格式）
  scheduled_at: '2026-03-22T10:00:00.000Z',
})
```

### 2.6 发送带附件的邮件

```typescript
import { readFile } from 'fs/promises'

const attachment = await readFile('./path/to/file.pdf')

const { data, error } = await resend.emails.send({
  from: 'StyleSnap <noreply@stylesnap.dev>',
  to: ['user@example.com'],
  subject: '带附件的邮件',
  html: '<p>请查收附件</p>',
  attachments: [
    {
      filename: 'report.pdf',
      content: attachment,
    },
  ],
})
```

### 2.7 批量发送邮件

```typescript
const { data, error } = await resend.batch.send([
  {
    from: 'StyleSnap <noreply@stylesnap.dev>',
    to: ['user1@example.com'],
    subject: '欢迎 1',
    html: '<p>欢迎用户 1</p>',
  },
  {
    from: 'StyleSnap <noreply@stylesnap.dev>',
    to: ['user2@example.com'],
    subject: '欢迎 2',
    html: '<p>欢迎用户 2</p>',
  },
])

// 限制：每批最多 500 封
```

### 2.8 错误处理

```typescript
try {
  const { data, error } = await resend.emails.send({
    from: 'StyleSnap <noreply@stylesnap.dev>',
    to: ['user@example.com'],
    subject: '测试',
    html: '<p>测试内容</p>',
  })

  if (error) {
    // Resend API 错误
    console.error('Resend API 错误:', error)

    // 错误类型
    switch (error.name) {
      case 'missing_required_field':
        // 缺少必填字段
        break
      case 'invalid_from_address':
        // 发件人地址未验证
        break
      case 'rate_limit_exceeded':
        // 超过速率限制
        break
      default:
        console.error('未知错误:', error)
    }

    return { error: '邮件发送失败' }
  }

  console.log('发送成功:', data)
  return { success: true, id: data.id }
} catch (err) {
  // 网络或其他异常
  console.error('异常:', err)
  return { error: '网络错误' }
}
```

### 2.9 Domain 配置

#### 2.9.1 添加 Domain

1. 登录 Resend Dashboard
2. 进入 Domains → Add Domain
3. 输入域名（如 `stylesnap.dev`）
4. 选择发送类型（Transactional / Marketing）

#### 2.9.2 配置 DNS 记录

Resend 会提供以下 DNS 记录，需在域名服务商处添加：

```
# SPF 记录（验证发件人）
Type: TXT
Name: @
Value: v=spf1 include:resend.dev ~all

# DKIM 记录（签名验证）
Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...

# 可选：自定义返回路径
Type: CNAME
Name: resend
Value: feedback-smtp.us-east-1.amazonses.com
```

#### 2.9.3 验证状态

DNS 记录添加后，Resend 会自动验证（可能需要几分钟）。验证通过后即可使用该域名发送邮件。

### 2.10 Webhook 处理

#### 2.10.1 配置 Webhook

1. Resend Dashboard → Webhooks → Add Webhook
2. 输入 Webhook URL（如 `https://stylesnap.dev/api/webhooks/resend`）
3. 选择事件：
   - `email.sent` - 邮件已发送
   - `email.delivered` - 邮件已送达
   - `email.delivery_delayed` - 邮件延迟
   - `email.complained` - 用户投诉
   - `email.bounced` - 邮件退回
   - `email.opened` - 邮件被打开
   - `email.clicked` - 链接被点击

#### 2.10.2 Next.js API Route 处理

```typescript
// src/app/api/webhooks/resend/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 验证 Resend Webhook 签名
    const headersList = await headers()
    const signature = headersList.get('x-resend-signature')

    if (!signature) {
      return NextResponse.json({ error: '缺少签名' }, { status: 401 })
    }

    const body = await request.text()

    // 验证签名逻辑（可选，建议添加）
    // const isValid = verifyWebhookSignature(body, signature, process.env.RESEND_WEBHOOK_SECRET)
    // if (!isValid) {
    //   return NextResponse.json({ error: '签名无效' }, { status: 401 })
    // }

    const event = JSON.parse(body)

    // 处理不同事件
    switch (event.type) {
      case 'email.sent':
        console.log('邮件已发送:', event.data.email_id)
        break

      case 'email.delivered':
        console.log('邮件已送达:', event.data.email_id)
        break

      case 'email.bounced':
        console.log('邮件退回:', event.data.email_id)
        // 更新用户邮箱状态为无效
        break

      case 'email.complained':
        console.log('用户投诉:', event.data.email_id)
        // 标记用户为不再发送
        break

      case 'email.opened':
        console.log('邮件被打开:', event.data.email_id)
        break

      case 'email.clicked':
        console.log('链接被点击:', event.data.email_id)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook 处理失败:', error)
    return NextResponse.json({ error: '处理失败' }, { status: 500 })
  }
}
```

---

## 3. React Email 核心知识体系

### 3.1 React Email 是什么？

**定位**：使用 React 组件开发邮件模板的工具

**核心特性**：
- 组件化开发，无需 HTML 表格布局
- 本地实时预览
- 热重载支持
- TypeScript 支持
- 丰富的 UI 组件库

### 3.2 安装

```bash
# 创建邮件模板目录
mkdir -p emails

# 安装 React Email CLI
npm install -g react-email

# 或使用 npx 运行
npx react-email dev
```

### 3.3 项目结构

```
emails/
├── components/
│   ├── email-header.tsx    # 邮件头部组件
│   ├── email-footer.tsx    # 邮件底部组件
│   └── email-button.tsx    # 按钮组件
├── templates/
│   ├── welcome-email.tsx   # 欢迎邮件模板
│   ├── verify-email.tsx    # 验证邮箱模板
│   └── reset-password.tsx  # 重置密码模板
└── preview/
    └── welcome-preview.tsx # 模板预览
```

### 3.4 基础邮件模板

```typescript
// emails/templates/welcome-email.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface WelcomeEmailProps {
  username: string
  verifyUrl: string
}

export function WelcomeEmail({ username, verifyUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>欢迎加入 StyleSnap！</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>欢迎 {username}！</Heading>
          <Text style={text}>
            感谢注册 StyleSnap，这里是前端开发者的视觉风格灵感库。
          </Text>
          <Text style={text}>
            请点击下方按钮验证你的邮箱地址：
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={verifyUrl}>
              验证邮箱
            </Button>
          </Section>
          <Text style={text}>
            如果按钮无法点击，请复制以下链接到浏览器：
          </Text>
          <Text style={link}>{verifyUrl}</Text>
        </Container>
      </Body>
    </Html>
  )
}

// 样式
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '6px',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
}

const link = {
  color: '#0070f3',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all',
}
```

### 3.5 使用组件库

```bash
npm install @react-email/components @react-email/tailwind
```

```typescript
import {
  // 基础组件
  Html, Head, Body, Preview,

  // 布局组件
  Container, Section, Column,

  // 文本组件
  Heading, Text, Link, Hr,

  // 交互组件
  Button, Img,

  // 高级组件
  CodeBlock, Markdown,
} from '@react-email/components'

// Tailwind CSS 支持
import { Tailwind } from '@react-email/tailwind'

<Tailwind config={tailwindConfig}>
  <Container className="max-w-lg mx-auto bg-white rounded-lg p-8">
    <Heading className="text-2xl font-bold mb-6">欢迎</Heading>
  </Container>
</Tailwind>
```

### 3.6 本地预览开发

```bash
# 启动开发服务器
npx react-email dev

# 访问 http://localhost:3000 预览所有模板
```

开发服务器功能：
- 实时热重载
- 模板列表展示
- 桌面/移动端预览切换
- 发送到测试邮箱

### 3.7 模板组合模式

```typescript
// emails/components/email-header.tsx
import { Section, Img, Text } from '@react-email/components'

export function EmailHeader() {
  return (
    <Section style={header}>
      <Img
        src="https://stylesnap.dev/logo.png"
        alt="StyleSnap"
        width="40"
        height="40"
      />
      <Text style={brandName}>StyleSnap</Text>
    </Section>
  )
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const brandName = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  marginTop: '8px',
}
```

```typescript
// emails/components/email-footer.tsx
import { Section, Text, Hr } from '@react-email/components'

export function EmailFooter() {
  return (
    <>
      <Hr style={hr} />
      <Section style={footer}>
        <Text style={footerText}>
          此邮件由 StyleSnap 发送
        </Text>
        <Text style={footerText}>
          如有任何问题，请回复此邮件或联系 support@stylesnap.dev
        </Text>
        <Text style={footerText}>
          © 2026 StyleSnap. All rights reserved.
        </Text>
      </Section>
    </>
  )
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}

const footerText = {
  margin: '4px 0',
  textAlign: 'center' as const,
}
```

```typescript
// emails/templates/verify-email.tsx
import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Button,
} from '@react-email/components'
import { EmailHeader } from '../components/email-header'
import { EmailFooter } from '../components/email-footer'

interface VerifyEmailProps {
  username: string
  verifyUrl: string
  code: string
}

export function VerifyEmail({ username, verifyUrl, code }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>验证你的 StyleSnap 账号</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />

          <Heading style={heading}>验证邮箱</Heading>
          <Text style={text}>你好 {username}，</Text>
          <Text style={text}>
            欢迎加入 StyleSnap！请使用以下验证码完成邮箱验证：
          </Text>

          <Section style={codeContainer}>
            <Text style={code}>{code}</Text>
          </Section>

          <Text style={text}>
            或者点击下方按钮：
          </Text>

          <Button style={button} href={verifyUrl}>
            验证邮箱
          </Button>

          <Text style={text}>
            验证码 10 分钟后过期。
          </Text>

          <Text style={text}>
            如果不是你本人操作，请忽略此邮件。
          </Text>

          <EmailFooter />
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const codeContainer = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const code = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  fontFamily: 'monospace',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '6px',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  margin: '16px 0',
}
```

---

## 4. 两者集成方案

### 4.1 项目结构

```
src/
├── emails/
│   ├── templates/
│   │   ├── welcome-email.tsx
│   │   ├── verify-email.tsx
│   │   └── reset-password-email.tsx
│   └── index.ts            # 导出所有模板
├── lib/
│   └── email/
│       ├── config.ts       # Resend 配置
│       ├── send.ts         # 发送工具函数
│       └── types.ts        # 邮件类型定义
└── app/
    └── api/
        └── emails/
            ├── send-verification/
            └── send-welcome/
```

### 4.2 Resend 配置

```typescript
// src/lib/email/config.ts
import { Resend } from 'resend'
import { env } from '@/env'

export const resend = new Resend(env.RESEND_API_KEY)

// 发件人配置
export const FROM_EMAIL = 'StyleSnap <noreply@stylesnap.dev>'
export const SUPPORT_EMAIL = 'support@stylesnap.dev'
```

### 4.3 发送工具函数

```typescript
// src/lib/email/send.ts
import { resend, FROM_EMAIL } from './config'
import { render } from '@react-email/components'

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactNode
  tags?: Array<{ name: string; value: string }>
}

export async function sendEmail({ to, subject, react, tags }: SendEmailOptions) {
  const html = render(react as React.ReactElement)

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    tags,
  })

  if (error) {
    console.error('邮件发送失败:', error)
    throw new Error(`邮件发送失败：${error.message}`)
  }

  return { id: data.id, to }
}
```

### 4.4 邮件模板定义

```typescript
// src/emails/templates/verify-email.tsx
import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Button, Hr,
} from '@react-email/components'

export interface VerifyEmailTemplateProps {
  username: string
  verifyUrl: string
  code: string
}

export function VerifyEmailTemplate({
  username,
  verifyUrl,
  code,
}: VerifyEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>验证你的 StyleSnap 账号</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>StyleSnap</Heading>
          <Hr style={divider} />

          <Heading style={subHeading}>验证邮箱</Heading>
          <Text style={text}>你好 {username}，</Text>
          <Text style={text}>
            欢迎加入 StyleSnap！请使用以下验证码完成邮箱验证：
          </Text>

          <Section style={codeContainer}>
            <Text style={code}>{code}</Text>
          </Section>

          <Text style={text}>
            验证码 10 分钟后过期。
          </Text>

          <Text style={text}>
            如果按钮无法点击，请复制以下链接到浏览器：
          </Text>
          <Text style={link}>{verifyUrl}</Text>

          <Hr style={divider} />
          <Text style={footer}>
            如果不是你本人操作，请忽略此邮件。
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const subHeading = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  marginBottom: '16px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const divider = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const codeContainer = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
}

const code = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  fontFamily: 'monospace',
}

const link = {
  color: '#0070f3',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  textAlign: 'center' as const,
}
```

### 4.5 邮件发送服务

```typescript
// src/lib/email/services/auth-emails.ts
import { sendEmail } from '../send'
import { VerifyEmailTemplate, VerifyEmailTemplateProps } from '@/emails/templates/verify-email'

interface SendVerificationEmailOptions {
  to: string
  username: string
  verifyUrl: string
  code: string
}

export async function sendVerificationEmail({
  to,
  username,
  verifyUrl,
  code,
}: SendVerificationEmailOptions) {
  const props: VerifyEmailTemplateProps = {
    username,
    verifyUrl,
    code,
  }

  return sendEmail({
    to,
    subject: '验证你的 StyleSnap 账号',
    react: <VerifyEmailTemplate {...props} />,
    tags: [
      { name: 'type', value: 'verification' },
      { name: 'user', value: username },
    ],
  })
}
```

### 4.6 Server Action 集成

```typescript
// src/actions/auth/send-verification.ts
'use server'

import { createClient } from '@/lib/supabase/route-handler'
import { sendVerificationEmail } from '@/lib/email/services/auth-emails'
import { randomInt } from 'crypto'

export async function sendVerificationAction() {
  try {
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '未登录' }
    }

    // 生成 6 位验证码
    const code = String(randomInt(100000, 999999))

    // 生成验证链接
    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/verify?code=${code}`

    // 发送验证邮件
    await sendVerificationEmail({
      to: user.email!,
      username: user.user_metadata.username || user.email!.split('@')[0],
      verifyUrl,
      code,
    })

    // 存储验证码到数据库（10 分钟过期）
    await supabase.from('verification_codes').insert({
      user_id: user.id,
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })

    return { success: true, message: '验证码已发送' }
  } catch (error) {
    console.error('发送验证邮件失败:', error)
    return { error: '发送失败，请稍后重试' }
  }
}
```

### 4.7 欢迎邮件触发

```typescript
// src/actions/auth/on-user-signup.ts
'use server'

import { Resend } from 'resend'
import { WelcomeEmail, WelcomeEmailProps } from '@/emails/templates/welcome-email'
import { render } from '@react-email/components'

export async function onUserSignupAction(user: {
  id: string
  email: string
  user_metadata: { username?: string }
}) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const props: WelcomeEmailProps = {
      username: user.user_metadata.username || user.email.split('@')[0],
      dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    }

    const html = render(<WelcomeEmail {...props} />)

    await resend.emails.send({
      from: 'StyleSnap <noreply@stylesnap.dev>',
      to: user.email,
      subject: '欢迎加入 StyleSnap！',
      html,
      tags: [{ name: 'type', value: 'welcome' }],
    })

    return { success: true }
  } catch (error) {
    console.error('发送欢迎邮件失败:', error)
    return { error: '欢迎邮件发送失败' }
  }
}
```

---

## 5. 邮件模板详解

### 5.1 欢迎邮件

```typescript
// src/emails/templates/welcome-email.tsx
import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Button, Hr, Img,
} from '@react-email/components'

export interface WelcomeEmailProps {
  username: string
  dashboardUrl: string
}

export function WelcomeEmail({ username, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>欢迎加入 StyleSnap，开始探索视觉风格之旅</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <Img
              src="https://stylesnap.dev/logo.png"
              alt="StyleSnap"
              width="48"
              height="48"
            />
          </Section>

          {/* 欢迎标题 */}
          <Heading style={heading}>欢迎，{username}！</Heading>

          <Text style={text}>
            欢迎加入 StyleSnap —— 前端开发者的视觉风格灵感库。
          </Text>

          <Text style={text}>
            在这里，你可以：
          </Text>

          <Section style={featureList}>
            <Text style={featureItem}>✨ 浏览精心策划的设计风格</Text>
            <Text style={featureItem}>🎨 收藏灵感，建立个人风格库</Text>
            <Text style={featureItem}>💻 一键复制代码片段</Text>
            <Text style={featureItem}>📤 提交自己的风格创作</Text>
          </Section>

          <Section style={buttonSection}>
            <Button style={button} href={dashboardUrl}>
              探索风格
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            开始你的风格探索之旅吧！
          </Text>
          <Text style={footerSmall}>
            — StyleSnap 团队
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
}

const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '24px',
  textAlign: 'center' as const,
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '28px',
  marginBottom: '16px',
}

const featureList = {
  backgroundColor: '#f6f9fc',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '24px',
}

const featureItem = {
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '8px 0',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '8px',
  color: '#ffffff',
  padding: '14px 32px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
  fontSize: '16px',
}

const divider = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
}

const footer = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontStyle: 'italic',
  textAlign: 'center' as const,
  marginBottom: '8px',
}

const footerSmall = {
  color: '#8898aa',
  fontSize: '14px',
  textAlign: 'center' as const,
}
```

### 5.2 密码重置邮件

```typescript
// src/emails/templates/reset-password-email.tsx
import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Button, Hr,
} from '@react-email/components'

export interface ResetPasswordEmailProps {
  username: string
  resetUrl: string
}

export function ResetPasswordEmail({ username, resetUrl }: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>重置你的 StyleSnap 密码</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>密码重置</Heading>

          <Text style={text}>你好 {username}，</Text>

          <Text style={text}>
            我们收到重置密码的请求。点击下方按钮设置新密码：
          </Text>

          <Section style={buttonSection}>
            <Button style={button} href={resetUrl}>
              重置密码
            </Button>
          </Section>

          <Text style={text}>
            或者复制以下链接到浏览器：
          </Text>
          <Text style={link}>{resetUrl}</Text>

          <Hr style={divider} />

          <Text style={warning}>
            ⚠️ 如果你没有请求重置密码，请忽略此邮件。你的账号安全不受影响。
          </Text>

          <Text style={footer}>
            此链接 1 小时后过期。
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 20px',
}

const container = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
  maxWidth: '600px',
  margin: '0 auto',
}

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
}

const text = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const buttonSection = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '6px',
  color: '#ffffff',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  fontWeight: '600',
}

const link = {
  color: '#0070f3',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all',
}

const divider = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const warning = {
  color: '#856404',
  backgroundColor: '#fff3cd',
  border: '1px solid #ffc107',
  borderRadius: '6px',
  padding: '16px',
  fontSize: '14px',
  lineHeight: '20px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  textAlign: 'center' as const,
}
```

### 5.3 风格提交确认邮件

```typescript
// src/emails/templates/style-submitted-email.tsx
import {
  Html, Head, Preview, Body, Container,
  Section, Heading, Text, Hr,
} from '@react-email/components'

export interface StyleSubmittedEmailProps {
  username: string
  styleName: string
  reviewUrl: string
}

export function StyleSubmittedEmail({
  username,
  styleName,
  reviewUrl,
}: StyleSubmittedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>风格提交成功</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>提交成功！</Heading>

          <Text style={text}>你好 {username}，</Text>

          <Text style={text}>
            感谢提交风格 <strong>{styleName}</strong>！
          </Text>

          <Text style={text}>
            我们的团队正在审核你的提交。审核通过后，风格将会出现在 StyleSnap 平台上。
          </Text>

          <Text style={text}>
            你可以在个人中心查看审核状态：
          </Text>

          <Text style={link}>{reviewUrl}</Text>

          <Hr style={divider} />

          <Text style={footer}>
            通常审核需要 1-3 个工作日。
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

// 样式参考前面模板...
```

---

## 6. StyleSnap 项目应用建议

### 6.1 邮件发送场景清单

| 场景 | 触发时机 | 模板 | 优先级 |
|------|----------|------|--------|
| **邮箱验证** | 用户注册/重新发送验证 | VerifyEmail | P0 |
| **欢迎邮件** | 用户完成邮箱验证 | WelcomeEmail | P0 |
| **密码重置** | 用户请求重置密码 | ResetPasswordEmail | P0 |
| **风格提交确认** | 用户提交风格 | StyleSubmittedEmail | P1 |
| **风格审核通过** | 风格通过审核发布 | StyleApprovedEmail | P1 |
| **评论通知** | 收到回复/评论 | CommentNotificationEmail | P2 |
| **收藏更新** | 收藏的风格有更新 | StyleUpdateEmail | P2 |

### 6.2 目录结构建议

```
src/
├── emails/
│   ├── templates/
│   │   ├── verify-email.tsx
│   │   ├── welcome-email.tsx
│   │   ├── reset-password-email.tsx
│   │   └── style-submitted-email.tsx
│   └── index.ts
├── lib/
│   └── email/
│       ├── config.ts           # Resend 配置
│       ├── send.ts             # 发送工具
│       └── services/
│           ├── auth-emails.ts  # 认证相关邮件
│           └── style-emails.ts # 风格相关邮件
└── app/
    └── api/
        └── emails/
            └── webhooks/
                └── route.ts    # Webhook 处理
```

### 6.3 Domain 配置建议

```
# DNS 记录配置（在域名服务商处添加）

# 1. SPF 记录
Type: TXT
Name: @
Value: v=spf1 include:resend.dev ~all

# 2. DKIM 记录
Type: TXT
Name: resend._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...（从 Resend Dashboard 复制）

# 3. 自定义返回路径（可选，提升送达率）
Type: CNAME
Name: resend
Value: feedback-smtp.us-east-1.amazonses.com
```

### 6.4 速率限制处理

Resend 免费计划限制：
- 100 封/天
- 3000 封/月

应对策略：
1. **验证码合并**：验证邮件包含验证码，不再单独发送
2. **批量发送**：营销类邮件使用 batch API
3. **降级策略**：达到限制时记录日志，稍后重试
4. **升级计划**：项目增长后升级到 Pro 计划

### 6.5 测试策略

```typescript
// src/lib/email/test-utils.ts
import { render } from '@react-email/components'

// 本地预览渲染
export function previewEmail(template: React.ReactNode) {
  console.log(render(template))
}

// 测试发送
export async function sendTestEmail(template: React.ReactNode, to: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  await resend.emails.send({
    from: 'StyleSnap <test@stylesnap.dev>',
    to,
    subject: '[测试] 邮件预览',
    html: render(template as React.ReactElement),
  })
}
```

### 6.6 安全性检查清单

| 检查项 | 要求 |
|--------|------|
| **API Key 保护** | 仅服务端访问，不暴露给客户端 |
| **Domain 验证** | 必须验证自定义域名，不使用 resend.dev |
| **敏感信息** | 邮件中不包含密码等敏感信息 |
| **退订链接** | 营销邮件必须包含退订选项 |
| **速率限制** | 实现发送频率限制，防止滥用 |

---

## 附录：常见问题 FAQ

### Q1: 邮件进入垃圾箱怎么办？

**A**:
1. 确保 Domain 已正确配置 SPF/DKIM
2. 避免使用垃圾邮件常见词汇
3. 监控送达率和投诉率
4. 考虑升级到 Pro 计划使用专属 IP

### Q2: 如何测试邮件在不同客户端的显示？

**A**:
1. 使用 `react-email dev` 本地预览
2. 发送到真实邮箱测试（Gmail、Outlook、QQ 邮箱等）
3. 使用 Litmus 或 Email on Acid 等专业工具

### Q3: 如何处理邮件发送失败？

**A**:
1. 捕获 Resend API 错误
2. 记录失败日志到数据库
3. 实现重试机制（指数退避）
4. 达到速率限制时排队延迟发送

### Q4: 如何追踪邮件打开率？

**A**: Resend 自动追踪，可通过 Dashboard 或 Webhook 获取数据。

### Q5: 如何发送 HTML + 纯文本双格式？

**A**:
```typescript
await resend.emails.send({
  html: '<strong>HTML 内容</strong>',
  text: '纯文本内容',
})
```

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
