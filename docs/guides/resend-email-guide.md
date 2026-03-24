# Resend 邮件服务配置指南

> 配置日期：2026-03-24
> 状态：已完成

---

## 一、获取 Resend API Key

1. 访问 [resend.com](https://resend.com) 创建账号
2. 进入 [API Keys](https://resend.com/api-keys) 页面
3. 点击 "Create API Key" 创建新的 API 密钥
4. 复制 API Key 到 `.env` 文件：

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

---

## 二、配置发件人邮箱

### 方式 1：使用 Resend 默认域名（开发环境）

Resend 提供免费域名 `resend.dev`，适合开发测试：

```bash
RESEND_FROM_EMAIL=noreply@resend.dev
RESEND_FROM_NAME=StyleSnap
```

**注意**：使用默认域名发送的邮件会显示 "via resend.dev"，生产环境建议使用自定义域名。

### 方式 2：使用自定义域名（生产环境）

1. 在 Resend 后台添加域名
2. 配置 DNS 记录（SPF、DKIM、DMARC）
3. 等待域名验证通过（通常几分钟）
4. 更新环境变量：

```bash
RESEND_FROM_EMAIL=noreply@stylesnap.com
RESEND_FROM_NAME=StyleSnap
```

---

## 三、DNS 配置（自定义域名）

在域名提供商处添加以下 DNS 记录：

### SPF 记录
```
类型：TXT
名称：@
值：v=spf1 include:send.resend.com ~all
```

### DKIM 记录
```
类型：TXT
名称：resend._domainkey
值：k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...（从 Resend 后台复制）
```

### DMARC 记录（推荐）
```
类型：TXT
名称：_dmarc
值：v=DMARC1; p=quarantine; rua=mailto:dmarc@stylesnap.com
```

---

## 四、邮件模板

项目已创建以下邮件模板：

### 1. 邮箱验证模板
位置：`apps/web/emails/verification-email.tsx`

使用 React Email 组件构建，支持：
- 响应式设计
- 自定义品牌色
- 动态验证链接

### 2. 密码重置模板
位置：`apps/web/emails/password-reset-email.tsx`

功能特性同上。

---

## 五、本地预览邮件模板

使用 React Email 的 CLI 工具在浏览器中预览邮件：

```bash
# 安装（已安装）
pnpm add -D react-email

# 启动开发服务器
pnpm email dev
```

访问 `http://localhost:3001` 预览所有邮件模板。

---

## 六、使用示例

### Server Action 中发送邮件

```typescript
'use server'

import { sendVerificationEmail } from '@/lib/email'

export async function registerAction(email: string, token: string) {
  const result = await sendVerificationEmail(email, token)

  if (result.error) {
    // 处理错误
  }

  if (result.success) {
    // 发送成功
  }
}
```

### 发送验证邮件

```typescript
import { sendVerificationEmail } from '@/lib/email'

await sendVerificationEmail(
  'user@example.com',
  'verification-token-123'
)
```

### 发送密码重置邮件

```typescript
import { sendPasswordResetEmail } from '@/lib/email'

await sendPasswordResetEmail(
  'user@example.com',
  'reset-token-456'
)
```

### 发送欢迎邮件

```typescript
import { sendWelcomeEmail } from '@/lib/email'

await sendWelcomeEmail(
  'user@example.com',
  'UserName'
)
```

---

## 七、邮件发送策略

### 注册流程

1. 用户注册 → Supabase 发送验证邮件
2. 用户点击验证链接 → 邮箱验证完成
3. 验证成功后 → 发送欢迎邮件（可选）

### 密码重置流程

1. 用户请求重置密码 → Supabase 发送重置邮件
2. 用户点击重置链接 → 跳转到重置密码页面
3. 用户设置新密码 → 密码更新完成

**注意**：当前实现使用 Supabase 内置邮件发送密码重置邮件。如需完全自定义模板，可在 Supabase 后台配置或使用 Resend 完全替代。

---

## 八、监控与分析

Resend 提供以下监控功能：

1. **送达率追踪** - 查看邮件送达情况
2. **打开率追踪** - 追踪用户打开邮件
3. **点击率追踪** - 追踪链接点击
4. **退信处理** - 自动处理无效邮箱

访问 [Resend Dashboard](https://resend.com/dashboard) 查看详细数据。

---

## 九、故障排查

### 邮件发送失败

1. 检查 API Key 是否正确
2. 检查发件人邮箱是否已验证
3. 查看 Resend Dashboard 的错误日志
4. 确认环境变量已正确加载

### 邮件进入垃圾箱

1. 确保 DNS 记录（SPF、DKIM、DMARC）配置正确
2. 使用自定义域名而非 resend.dev
3. 避免使用垃圾邮件敏感词
4. 保持合理的发送频率

### 本地开发不发送邮件

可以配置环境变量使用 Mock 模式：

```bash
# .env.local
RESEND_API_KEY=re_test_xxxxx  # 使用测试 API Key
```

---

## 十、成本估算

Resend 免费额度：
- 每月 3,000 封
- 每日最多 100 封

StyleSnap 初期预估：
- 100 用户 → 约 200 封/月（注册 + 密码重置）
- 1,000 用户 → 约 2,000 封/月
- 10,000 用户 → 约 20,000 封/月（免费额度内）

超出免费额度后：
- $0.90 / 每 1,000 封

---

## 十一、参考资料

- [Resend 官方文档](https://resend.com/docs)
- [React Email 文档](https://react.email/docs)
- [Resend GitHub](https://github.com/resendlabs/resend)
