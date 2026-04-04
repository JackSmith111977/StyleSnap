# 03 - 邮件服务选型调研

> 调研日期：2026-03-20
> 状态：已完成
> 用途：StyleSnap 用户认证、通知邮件服务选型

---

## 一、调研概述

StyleSnap 需要事务性邮件服务（Transactional Email）用于以下场景：
- 用户注册验证邮件
- 密码重置邮件
- 系统通知邮件
- 订阅通讯（Newsletter）

**选型核心考量：**
1. 送达率（Deliverability）
2. 开发者体验（DX）
3. 定价合理性
4. 免费额度
5. 与 Next.js/Node.js 生态集成

---

## 二、主流邮件服务对比

### 2.1 核心服务商横向对比

| 服务商 | 免费额度 | 付费起点 | 超额单价 | 特色 | 适用场景 |
|--------|----------|----------|----------|------|----------|
| **Resend** | 3,000/月 | $20/月 (5 万) | $0.90/千封 | 开发者体验最佳、React Email 集成 | 初创公司、Next.js 项目 |
| **SendGrid** | 3,000/月 (100/天) | $20/月 (5 万) | $0.90/千封 | 功能全面、品牌知名 | 中小企业、混合营销 |
| **Postmark** | 100/月 (测试) | $15/月 (1 万) | $1.20-1.80/千封 | 送达率最高、专注于事务邮件 | 关键业务邮件 |
| **AWS SES** | 无 (EC2 内免费) | $0.10/千封 | $0.10/千封 | 价格最低、可定制 | 大规模发送、技术团队 |
| **Mailgun** | 5,000/月 (首月) | $35/月 | 需咨询 | 功能强大、验证 API | 企业级应用 |
| **Brevo (Sendinblue)** | 300/天 | $25/月 | 按量付费 | 邮件 + 短信双渠道 | 营销 + 事务混合 |

---

### 2.2 详细对比分析

#### 1. Resend ⭐ 推荐

**定位**：面向开发者的现代化邮件 API

**优势：**
- 🎯 开发者体验最佳：简洁 API、完善的 SDK
- 🔗 与 React Email 深度集成，可用 JSX 写邮件模板
- 📊 内置分析面板，追踪送达率、打开率
- 🚀 专为 Next.js/Node.js 优化
- 💰 免费额度充足（3,000/月）

**劣势：**
- 相对年轻，社区生态不如老牌服务商
- 仅支持事务性邮件（无营销邮件功能）

**定价详情：**
| 计划 | 价格 | 额度 | 超额单价 |
|------|------|------|----------|
| Free | $0 | 3,000/月 (100/天) | - |
| Pro | $20/月 | 50,000/月 | $0.90/千封 |
| Scale | $90/月 | 100,000/月 | $0.90/千封 |
| Enterprise | 定制 | 定制 | 定制 |

**集成示例：**
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'StyleSnap <noreply@stylesnap.com>',
  to: 'user@example.com',
  subject: '验证您的邮箱',
  html: '<p>点击链接验证邮箱</p>',
});
```

---

#### 2. SendGrid (Twilio)

**定位**：全功能邮件服务平台

**优势：**
- 🏢 品牌知名度高，Twilio 旗下产品
- 📧 支持事务邮件 + 营销邮件
- 🌍 全球数据中心，送达率高
- 📚 文档丰富，社区活跃
- 🔧 提供 Web API、SMTP、SDK 多种接入方式

**劣势：**
- 免费账户有每日发送限制（100 封/天）
- 共享 IP 声誉可能受其他用户影响
- 界面相对复杂

**定价详情：**
| 计划 | 价格 | 额度 | 超额单价 |
|------|------|------|----------|
| Free | $0 | 3,000/月 (100/天) | - |
| Essentials | $20/月 | 50,000/月 | $0.90/千封 |
| Pro | $89.95/月 | 100,000/月 | $0.90/千封 |
| Premier | 定制 | 定制 | 定制 |

---

#### 3. Postmark (ActiveCampaign)

**定位**：专注于事务性邮件的高送达率服务

**优势：**
- ⚡ 送达率行业领先（~99%）
- 🚀 发送速度快（秒级）
- 📊 详细的投递报告和分析
- 🔒 专注于事务邮件，不与营销邮件共享 IP

**劣势：**
- 💸 价格较高（$1.20-1.80/千封）
- 🐌 免费额度极低（仅 100/月用于测试）
- 📧 不支持营销邮件

**定价详情：**
| 计划 | 价格 | 额度 | 超额单价 |
|------|------|------|----------|
| Trial | $0 | 100/月 | 不可超额 |
| Basic | $15/月 | 10,000/月 | $1.80/千封 |
| Pro | $16.50/月 | 10,000/月 | $1.30/千封 |
| Platform | $18/月 | 10,000/月 | $1.20/千封 |

---

#### 4. AWS SES

**定位**：AWS 提供的低成本邮件基础设施

**优势：**
- 💰 价格最低（$0.10/千封）
- ☁️ 与 AWS 生态无缝集成
- 📈 可扩展性极强
- 🔐 企业级安全性

**劣势：**
- 🛠️ 配置复杂，需要 DNS、DKIM、SPF 等设置
- 📉 新账户默认沙盒模式，需申请生产配额
- 📊 分析功能较基础
- 🧑‍💻 需要一定的技术能力

**定价详情：**
| 项目 | 价格 |
|------|------|
| 发送邮件 | $0.10/千封 |
| 接收邮件 | $0.10/千封 |
| 存储 (S3) | $0.12/GB |

**注意**：从 EC2 发送到 SES 免费（每月 62,000 封）

---

#### 5. Mailgun

**定位**：企业级邮件自动化平台

**优势：**
- 🔧 功能强大，支持复杂路由规则
- 📧 邮件验证 API
- 📊 详细分析报表
- 🌍 全球数据中心

**劣势：**
- 💸 定价较复杂，需咨询销售
- 🏢 更偏向企业客户，小公司可能功能过剩

**定价详情：**
| 计划 | 价格 | 额度 |
|------|------|------|
| Free (首月) | $0 | 5,000/月 |
| Foundation | $35/月 | 50,000/月 |
| Growth | 定制 | 定制 |
| Enterprise | 定制 | 定制 |

---

### 2.3 国内邮件服务对比

| 服务商 | 免费额度 | 付费定价 | 超额单价 | 特点 | 适用场景 |
|--------|----------|----------|----------|------|----------|
| **腾讯云 SES** | 1,000/月 (新用户) | 阶梯计费 | ¥0.0019/封 (~$0.26/千封) | 微信生态集成、送达率 97%+、API 响应<200ms | 国内业务、外贸企业 |
| **阿里云邮件推送** | 200/天 (新用户 50 万) | 资源包 | ¥0.0017/封 (~$0.24/千封) | 钉钉集成、电商场景优化 | 阿里生态、电商 |
| **网易企业邮箱** | 无免费 API | ¥1000/年起 (5 用户) | - | 25 年技术沉淀、反垃圾 99.95% | 传统企业、办公邮箱 |
| **263 企业邮箱** | 无 | 定制报价 | - | 政企客户多、安全合规 | 政企单位、高安全需求 |

---

#### 1. 腾讯云 SES ⭐ 国内推荐

**定位**：腾讯云提供的企业级邮件推送服务

**优势：**
- 📊 送达率 97%+，智能反垃圾算法
- ⚡ API 响应 <200ms，日处理峰值 500 万封
- 🔗 与微信、企业微信、短信多通道集成
- 🌍 支持全球 200+ 国家/地区
- 🛡️ 通过 GDPR、等保三级认证
- 💰 新用户赠送 1,000 封/月 免费额度

**定价详情：**
| 资源包 | 价格 | 单价 |
|--------|------|------|
| 5 万封 | ¥90 | ¥0.0018/封 |
| 50 万封 | ¥840 | ¥0.0017/封 |
| 100 万封 | ¥1,590 | ¥0.0016/封 |
| 500 万封 | ¥7,750 | ¥0.0015/封 |

**劣势：**
- 免费额度较少（仅新用户）
- 国际送达率略低于 SendGrid/Resend

---

#### 2. 阿里云邮件推送

**定位**：阿里云提供的批量邮件发送服务

**优势：**
- 💰 价格较低（¥0.0017/封 起）
- 🔗 与钉钉深度集成
- 📦 新用户首月赠送 50 万封免费额度
- 📊 支持详细数据报表

**定价详情：**
| 资源包 | 价格 | 单价 |
|--------|------|------|
| 5 万封 | ¥85 | ¥0.0017/封 |
| 50 万封 | ¥800 | ¥0.0016/封 |
| 100 万封 | ¥1,500 | ¥0.0015/封 |

**劣势：**
- 主要面向营销邮件，事务邮件优化较少
- 文档和 SDK 不如腾讯云完善

---

#### 3. 网易企业邮箱

**定位**：老牌企业邮箱服务商

**优势：**
- 🏆 25 年技术沉淀，稳定性高
- 🛡️ 反垃圾拦截率 99.95%
- 📧 提供完整的企业邮箱服务（不仅是 API）

**定价详情：**
| 版本 | 价格 | 用户数 |
|------|------|--------|
| 基础版 | ¥1,000/年 | 5 用户 |
| 商务版 | ¥3,000/年 | 20 用户 |
| 精英版 | ¥12,500/年 | 100 用户 |

**劣势：**
- 无按量付费选项
- 主要面向企业邮箱，非事务邮件 API

---

### 2.4 国内外服务对比总结

| 维度 | 国际服务商 (Resend/SendGrid) | 国内服务商 (腾讯云/阿里云) |
|------|-----------------------------|---------------------------|
| **价格** | $0.90-1.80/千封 | ¥0.0015-0.0019/封 (~$0.21-0.27/千封) |
| **免费额度** | 3,000/月 起 | 1,000/月 或 新用户赠送 |
| **国内送达率** | 一般（可能被墙） | 优秀（97%+） |
| **国际送达率** | 优秀（99%+） | 良好（95%+） |
| **开发者体验** | 优秀（完善 SDK/文档） | 良好 |
| **合规性** | GDPR 等国际标准 | 等保三级、国内合规 |
| **生态集成** | GitHub、Slack 等 | 微信、钉钉、企业微信 |

---

### 2.5 StyleSnap 选型建议（更新）

#### 场景 A：主要面向国内用户

**推荐：腾讯云 SES**

**理由：**
1. 国内送达率最优（97%+）
2. 价格低廉（约国际服务商 1/3 价格）
3. 可与微信生态结合（如后续需要）
4. 符合国内合规要求

#### 场景 B：面向全球用户

**推荐：Resend**

**理由：**
1. 国际送达率优秀
2. 开发者体验最佳
3. 与 Next.js 生态深度集成
4. 免费额度充足

#### 场景 C：混合方案（推荐）

**主通道：Resend**（国际用户 + 开发体验）
**备用通道：腾讯云 SES**（国内用户兜底）

通过 DNS 智能解析或根据用户地域选择发信通道，确保全球送达率。

---

## 三、StyleSnap 选型建议

### 3.1 推荐方案

**首选：Resend**

**理由：**
1. ✅ 免费额度充足（3,000/月），适合项目初期
2. ✅ 与 Next.js 生态深度集成，开发体验佳
3. ✅ React Email 支持，可用 JSX 编写邮件模板
4. ✅ 定价透明合理，升级路径清晰
5. ✅ 分析面板完善，便于监控送达率

**备选：SendGrid**

**适用场景：**
- 需要营销邮件功能（Newsletter）
- 需要 SMTP 接入方式
- 团队已有 Twilio 生态

**备选：AWS SES**

**适用场景：**
- 已有 AWS 基础设施
- 邮件发送量极大（10 万+/月）
- 团队有运维能力处理复杂配置

---

### 3.2 成本估算

假设 StyleSnap 的邮件发送场景：

| 阶段 | 用户规模 | 月发送量 | Resend 成本 | 腾讯云 SES 成本 | AWS SES 成本 |
|------|----------|----------|-------------|-----------------|--------------|
| **初期** | 100 用户 | 500 封 | $0 (Free) | $0 (新用户赠送) | ~$0.05 |
| **成长期** | 1,000 用户 | 5,000 封 | $0 (Free) | ~$1.30 | ~$0.50 |
| **扩展期** | 10,000 用户 | 50,000 封 | $20 (Pro) | ~$13 | ~$5 |
| **成熟期** | 100,000 用户 | 500,000 封 | ~$90 (Scale) | ~$105 | ~$50 |

**注**：腾讯云 SES 价格按 ¥0.0017/封 折算，约 $0.26/千封，为国际服务商的 1/3-1/7。

---

### 3.3 集成方案

#### Next.js + Resend 集成

```typescript
// lib/email.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY!);

// 发送验证邮件
export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  return resend.emails.send({
    from: 'StyleSnap <noreply@stylesnap.com>',
    to: email,
    subject: '验证您的邮箱 - StyleSnap',
    html: `
      <h1>欢迎使用 StyleSnap</h1>
      <p>点击下方链接验证您的邮箱：</p>
      <a href="${verificationUrl}">验证邮箱</a>
      <p>如非本人操作，请忽略此邮件。</p>
    `,
  });
}

// 发送密码重置邮件
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  return resend.emails.send({
    from: 'StyleSnap <noreply@stylesnap.com>',
    to: email,
    subject: '重置密码 - StyleSnap',
    html: `
      <h1>密码重置</h1>
      <p>点击下方链接重置密码：</p>
      <a href="${resetUrl}">重置密码</a>
      <p>链接 1 小时后失效。</p>
    `,
  });
}
```

#### Next.js + 腾讯云 SES 集成

```typescript
// lib/email-tencent.ts
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// 腾讯云 SES 兼容 AWS SDK v3
const client = new SESClient({
  region: 'ap-guangzhou', // 根据实际区域调整
  endpoint: 'https://ses.tencentcloudapi.com',
  credentials: {
    accessKeyId: process.env.TENCENT_SECRET_ID!,
    secretAccessKey: process.env.TENCENT_SECRET_KEY!,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const command = new SendEmailCommand({
    Source: 'StyleSnap <noreply@stylesnap.com>',
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: '验证您的邮箱 - StyleSnap', Charset: 'UTF-8' },
      Body: {
        Html: {
          Data: `
            <h1>欢迎使用 StyleSnap</h1>
            <p>点击下方链接验证您的邮箱：</p>
            <a href="${verificationUrl}">验证邮箱</a>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  });

  return client.send(command);
}
```

#### 多通道路由（根据用户地域选择服务商）

```typescript
// lib/email-router.ts
import { sendViaResend } from './email-resend';
import { sendViaTencent } from './email-tencent';

// 根据用户邮箱域名判断路由
function shouldUseDomesticProvider(email: string): boolean {
  const domesticDomains = ['qq.com', '163.com', '126.com', 'sina.com', 'foxmail.com'];
  const domain = email.split('@')[1]?.toLowerCase();

  // 国内域名或使用国内 IP 时走腾讯云
  return domesticDomains.includes(domain) || process.env.USER_REGION === 'cn';
}

export async function sendEmail(email: string, subject: string, html: string) {
  if (shouldUseDomesticProvider(email)) {
    return sendViaTencent(email, subject, html);
  } else {
    return sendViaResend(email, subject, html);
  }
}
```

#### 使用 React Email 编写模板

```tsx
// emails/verification-email.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  verificationUrl: string;
}

export const VerificationEmail = ({
  verificationUrl,
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Preview>验证您的 StyleSnap 邮箱</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>欢迎使用 StyleSnap</Heading>
        <Text style={text}>
          点击下方链接验证您的邮箱：
        </Text>
        <Link href={verificationUrl} style={button}>
          验证邮箱
        </Link>
        <Text style={footer}>
          如非本人操作，请忽略此邮件。
        </Text>
      </Container>
    </Body>
  </Html>
);
```

---

## 四、实施建议

### 4.1 域名配置

无论选择哪家服务商，都需要配置以下 DNS 记录：

| 记录类型 | 名称 | 值 | 用途 |
|----------|------|-----|------|
| TXT | `@` | `v=spf1 include:服务商 -all` | SPF 发件人验证 |
| TXT | `selector._domainkey` | DKIM 密钥 | DKIM 签名 |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine;` | DMARC 策略 |

### 4.2 发件人设置

- **发件人地址**：`noreply@stylesnap.com`
- **发件人名称**：`StyleSnap`
- **回复地址**：`support@stylesnap.com`

### 4.3 监控与优化

- 监控送达率（目标 > 95%）
- 监控退信率（目标 < 2%）
- 监控垃圾邮件投诉率（目标 < 0.1%）
- 定期清理无效邮箱

---

## 五、参考资料

- [Resend 官方文档](https://resend.com/docs)
- [SendGrid 官方文档](https://sendgrid.com/docs)
- [Postmark 官方文档](https://postmarkapp.com/developer)
- [AWS SES 官方文档](https://docs.aws.amazon.com/ses/latest/)
- [React Email](https://react.email)
