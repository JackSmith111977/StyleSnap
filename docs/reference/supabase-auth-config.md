# Supabase Auth 配置指南

## 密码重置 Token 过期配置

### 问题描述
默认情况下，Supabase 的密码重置 Token 过期时间可能过长，存在安全风险。

### 配置步骤

#### 方法 1：通过 Supabase Dashboard 配置（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择 StyleSnap 项目
3. 进入 **Authentication** > **Policies**
4. 找到 **Email Rate Limits** 或 **Token Settings**
5. 设置密码重置 Token 过期时间为 **3600 秒（1 小时）**

#### 方法 2：通过 Supabase CLI 配置

```bash
# 登录 Supabase
npx supabase login

# 链接项目
npx supabase link --project-ref <your-project-ref>

# 更新 Auth 配置
npx supabase config set auth.email.default_token_expiry 3600
```

#### 方法 3：通过管理 API 配置

```bash
curl -X PUT "https://<project-ref>.supabase.co/rest/v1/config/auth" \
  -H "apikey: <service-role-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": {
      "default_token_expiry": 3600
    }
  }'
```

### 验证配置

```sql
-- 在 Supabase SQL Editor 中运行
SELECT current_setting('auth.email_default_token_expiry') AS token_expiry;
```

期望输出：`3600`（1 小时）

---

## 邮箱验证 Token 过期配置

### 推荐配置
- 邮箱验证 Token 过期时间：**86400 秒（24 小时）**
- 理由：给用户足够时间完成验证，同时避免长期未验证账户堆积

---

## 其他安全配置建议

### 1. 速率限制

```json
{
  "rate_limit": {
    "email_sent": {
      "limit": 3,
      "period": 3600
    },
    "sms_sent": {
      "limit": 5,
      "period": 3600
    }
  }
}
```

### 2. 密码策略

```json
{
  "password": {
    "min_length": 8,
    "require_uppercase": true,
    "require_lowercase": true,
    "require_numbers": true,
    "require_symbols": false
  }
}
```

### 3. 会话管理

```json
{
  "sessions": {
    "inactivity_duration": 604800,
    "timebox": 2592000
  }
}
```

---

## 检查清单

- [ ] 密码重置 Token 过期时间设置为 1 小时
- [ ] 邮箱验证 Token 过期时间设置为 24 小时
- [ ] 速率限制已启用
- [ ] 密码最小长度至少 8 位
- [ ] RLS 策略已验证

---

## 参考文档

- [Supabase Auth 配置文档](https://supabase.com/docs/guides/auth)
- [Supabase Auth API](https://supabase.com/docs/reference/javascript/auth-onauthstatechange)
- [RLS 最佳实践](https://supabase.com/docs/guides/database/postgres/row-level-security)
