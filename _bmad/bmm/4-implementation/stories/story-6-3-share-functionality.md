---
title: '分享功能 - Story 6.3'
type: 'feature'
created: '2026-04-04'
status: 'review'
context: ['_bmad/bmm/3-solutioning/epics.md', '_bmad/bmm/3-solutioning/architecture.md', '_bmad/bmm/4-implementation/artifacts/FRONTEND_GUIDELINES.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** 用户发现喜欢的风格后，无法便捷地分享到社交媒体或与朋友分享，限制了平台的传播性和用户获取。

**Approach:** 在风格详情页添加分享功能，支持复制链接、生成分享图（含预览图、名称、二维码）、社交媒体分享（Twitter/LinkedIn/微信），提供下载分享图选项。

## Boundaries & Constraints

**Always:**
- 使用 Server Component 生成分享页面的 Open Graph 元数据
- 分享链接必须包含 UTM 参数用于追踪（utm_source, utm_medium）
- 分享图生成使用 canvas 或 html-to-image 库
- 分享图尺寸固定为 1080x1080 PNG 格式
- 二维码使用 qrcode 库生成，链接指向风格详情页
- Toast 反馈操作结果

**Ask First:**
- 是否需要分享计数功能（记录每次分享）
- 是否需要自定义分享图的模板/样式

**Never:**
- 不允许分享未发布/下架的风格
- 不允许生成包含敏感信息的分享图
- 不允许分享到未授权的第三方平台

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| HAPPY_PATH | 用户点击分享按钮 | 显示分享弹窗，包含复制链接、生成图片、社交媒体选项 | N/A |
| COPY_LINK | 用户点击复制链接 | 复制带 UTM 参数的 URL 到剪贴板，显示成功 Toast | 复制失败时降级为手动选中 |
| GENERATE_IMAGE | 用户点击生成分享图 | 生成 1080x1080 PNG，包含预览图、名称、二维码 | 生成失败时显示错误提示 |
| SHARE_SOCIAL | 用户选择社交媒体 | 在新窗口打开分享页面，预填标题和链接 | 窗口被拦截时提示用户 |
| DOWNLOAD_IMAGE | 用户下载分享图 | 下载 PNG 文件到本地 | 下载失败时提供备用方案 |
| BROWSER_UNSUPPORTED | 浏览器不支持某些 API | 降级为手动操作（如手动保存） | 优雅降级 |

## Code Map

- `apps/web/components/share/share-button.tsx` -- 分享按钮（新建）
- `apps/web/components/share/share-modal.tsx` -- 分享弹窗（新建）
- `apps/web/components/share/share-image-generator.tsx` -- 分享图生成组件（新建）
- `apps/web/components/share/social-share-buttons.tsx` -- 社交媒体分享按钮（新建）
- `apps/web/lib/share.ts` -- 分享工具函数（新建）
- `apps/web/lib/qr-code.ts` -- 二维码生成工具（新建）
- `apps/web/app/styles/[id]/page.tsx` -- 添加分享按钮（修改）
- `apps/web/app/styles/[id]/opengraph-image.tsx` -- 动态 Open Graph 图片（新建）

## Developer Context

### 技术栈要求
- **分享图生成**: `html-to-image` 或 `canvas` API
- **二维码生成**: `qrcode` 或 `qrcode-generator` 库
- **Open Graph**: Next.js 16 动态图片生成功能
- **剪贴板**: Clipboard API（降级方案：自动选中文本）
- **状态管理**: 本地组件状态即可

### 架构合规要求
- 文件结构遵循 `FRONTEND_GUIDELINES.md` 规范
- 样式使用 CSS Modules + Tailwind CSS 4.x
- 组件命名：PascalCase 动词 + 名词（如 `ShareButton`, `ShareModal`）
- Server Action 必须返回统一格式：`{ success: boolean, data?: T, error?: string }`
- 所有用户输入必须服务端验证

### 分享图设计规范
- 尺寸：1080x1080px（正方形，适配社交媒体）
- 内容布局：
  - 顶部：StyleSnap Logo
  - 中部：风格预览图（浅色/深色模式）
  - 底部：风格名称、描述摘要、二维码
- 配色：使用风格的主色调作为强调色
- 字体：与平台一致的字体系统

### UTM 参数规范
```
utm_source=social       // 分享来源（twitter, linkedin, wechat, copy）
utm_medium=share        // 分享媒介
utm_campaign=style_{id} // 活动/风格 ID
```

## Tasks & Acceptance

**Execution:**
- [x] `lib/share.ts` -- 创建分享工具函数 -- UTM 参数生成、分享链接构建
- [x] `lib/qr-code.ts` -- 创建二维码生成工具 -- 生成风格详情页二维码
- [x] `components/share/share-button.tsx` -- 分享按钮组件 -- 触发分享弹窗
- [x] `components/share/share-modal.tsx` -- 分享弹窗主组件 -- 整合所有分享选项
- [x] `components/share/share-image-generator.tsx` -- 分享图生成组件 -- canvas 绘制、下载功能
- [x] `components/share/social-share-buttons.tsx` -- 社交媒体分享按钮 -- Twitter/LinkedIn/微信
- [x] `app/styles/[id]/opengraph-image.tsx` -- 动态 Open Graph 图片 -- SEO 优化
- [x] `app/styles/[id]/page.tsx` -- 集成分享功能 -- 在详情页添加分享按钮
- [x] Toast 通知 -- 成功/失败反馈（使用 Sonner）
- [x] 错误处理 -- 所有错误场景的用户提示

**Acceptance Criteria:**
- Given 用户查看风格详情页，When 页面加载，Then 系统显示分享按钮（通常在标题旁或固定操作栏）
- Given 用户点击分享按钮，When 弹窗打开，Then 系统显示三种分享选项：复制链接、生成分享图、社交媒体分享
- Given 用户点击"复制链接"，When 用户想分享链接，Then 系统复制带 UTM 参数的 URL 到剪贴板，显示"链接已复制"Toast
- Given 用户点击"生成分享图"，When 用户想生成图片，Then 系统生成包含风格预览图、名称、二维码的 1080x1080 PNG 图片，提供下载选项
- Given 用户点击社交媒体图标（Twitter/LinkedIn/微信），When 用户选择平台，Then 系统在新窗口打开对应分享页面，预填风格名称和链接
- Given 浏览器不支持 Clipboard API，When 用户尝试复制，Then 系统自动选中 URL 文本，提示"请手动复制"

## Verification

**Commands:**
- `pnpm typecheck` -- expected: 无 TypeScript 错误
- `pnpm lint` -- expected: 无 ESLint 错误
- `pnpm build` -- expected: 构建成功

**Manual checks (if no CLI):**
- 访问风格详情页，分享按钮正常显示
- 点击分享按钮，弹窗正常打开并显示所有选项
- 复制链接功能正常，URL 包含 UTM 参数
- 生成分享图功能正常，图片质量清晰，二维码可扫描
- 社交媒体分享正常打开对应平台分享页面
- 在移动端测试分享功能正常

## File List

**New Files:**
- `apps/web/lib/share.ts`
- `apps/web/lib/qr-code.ts`
- `apps/web/components/share/share-button.tsx`
- `apps/web/components/share/share-modal.tsx`
- `apps/web/components/share/share-image-generator.tsx`
- `apps/web/components/share/social-share-buttons.tsx`
- `apps/web/components/share/share.module.css`
- `apps/web/components/share/index.ts`
- `apps/web/app/styles/[id]/opengraph-image.tsx`

**Modified Files:**
- `apps/web/app/styles/[id]/page.tsx`
- `apps/web/package.json`

## Change Log

- 2026-04-04: Story 实施完成
  - 创建所有分享功能组件和工具函数
  - 集成到风格详情页
  - 安装依赖：qrcode-generator
  - 构建验证：pnpm build 成功 (15.9s)

## Dev Agent Record

### Implementation Summary

Story 6.3 分享功能已完成实施，包括：
1. **工具函数**：`lib/share.ts`（UTM 参数、分享链接生成）、`lib/qr-code.ts`（二维码生成）
2. **组件**：ShareButton、ShareModal、ShareImageGenerator、SocialShareButtons
3. **Open Graph 图片**：动态生成 1200x630 的分享预览图
4. **集成**：风格详情页添加分享按钮

### Technical Decisions
- 使用 `canvas` API 生成 1080x1080 分享图（不依赖外部库）
- 使用 `qrcode-generator` 生成二维码
- 使用 `sonner` Toast 提供用户反馈
- 剪贴板复制提供降级方案（createElement + execCommand）

</frozen-after-approval>
