# Supabase Auth 邮箱配置指南

> 解决 `email rate limit exceeded` 错误

---

## 问题描述

使用 Supabase 内置 SMTP 服务发送邮件时，遇到错误：
```
Error: email rate limit exceeded
```

**根本原因**：Supabase 的内置 SMTP 服务有严格的速率限制（约 4 封邮件/小时），用于保护邮件声誉。

---

## 解决方案

### 方案 1：配置自定义 SMTP 服务器（推荐用于生产环境）

1. **获取 Resend SMTP 凭据**
   - 访问 [Resend Dashboard](https://resend.com/domains)
   - 选择你的域名
   - 获取 SMTP 配置：
     ```
     Host: smtp.resend.com
     Port: 587
     Username: resend
     Password: [你的 Resend API Key]
     ```

2. **在 Supabase Dashboard 配置 SMTP**
   - 访问 Supabase Dashboard
   - 进入 `Authentication` → `Settings` → `SMTP Settings`
   - 点击 `Configure SMTP`
   - 填写配置：
     ```
     Sender email: noreply@yourdomain.com
     Sender name: StyleSnap
     Host: smtp.resend.com
     Port Number: 587
     Username: resend
     Password: [你的 Resend API Key]
     ```
   - 勾选 `Enable secure connection (STARTTLS)`
   - 点击 `Save`

3. **验证配置**
   - 在 Supabase Dashboard 发送测试邮件
   - 检查是否收到邮件

---

### 方案 2：开发环境禁用邮箱验证（仅用于开发）

**注意**：此方案仅适用于开发环境，不要用于生产环境！

1. **在 Supabase Dashboard 禁用邮箱验证**
   - 访问 Supabase Dashboard
   - 进入 `Authentication` → `Settings` → `Email Auth`
   - 找到 `Confirm email` 选项
   - 取消勾选 `Enable email confirmations`
   - 保存设置

2. **或者使用环境变量控制**
   ```env
   # 开发环境
   NEXT_PUBLIC_SUPABASE_DISABLE_EMAIL_CONFIRMATION=true
   ```

---

### 方案 3：等待速率限制重置（临时方案）

- Supabase 的速率限制通常是 **每小时重置**
- 等待 1 小时后再试

---

## Resend API 替代方案

如果 SMTP 配置复杂，可以直接使用 Resend HTTP API 发送验证邮件：

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'StyleSnap <noreply@yourdomain.com>',
  to: 'user@example.com',
  subject: '验证您的邮箱',
  html: '<p>点击链接验证邮箱...</p>',
})
```

**注意**：这需要你自己处理邮件模板和验证链接生成。

---

## 参考链接

- [Supabase 自定义 SMTP 配置](https://supabase.com/docs/guides/auth/auth-smtp)
- [Resend SMTP 配置](https://resend.com/docs/send-with-smtp)
- [Supabase 邮箱验证](https://supabase.com/docs/guides/auth/auth-email-otp)
