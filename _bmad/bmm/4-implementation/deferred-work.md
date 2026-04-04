# Deferred Work

## Deferred from: code review story-6-3-share-functionality (2026-04-04)

- **魔法数字过多** — `share-image-generator.tsx` 中大量硬编码数值（1080、760、540、48、32 等），建议提取为常量对象
- **组件过长 - ShareImageGenerator** — 单个组件 261 行，`generateShareImage` 函数超过 120 行，建议拆分为更小的 Hook 和纯函数
- **重复样式代码** — Open Graph 图片和分享 Canvas 图片都定义了相似的 "StyleSnap" 品牌样式，建议提取为共享常量
- **剪贴板权限无细化处理** — `share-modal.tsx` 中 catch 块未区分 `NotAllowedError` 和其他错误类型
- **二维码数据过长失败** — `qr-code.ts` 中生成二维码时未验证 URL 长度，超长 URL 可能超过二维码容量
- **快速连续点击分享按钮** — `share-button.tsx` 无防抖/节流处理，可能打开多个重叠弹窗
- **SSR/CSR 环境不一致风险** — `qr-code.ts` 中 `generateQRCodeCanvas` 缺少 `typeof window === 'undefined'` 检查

---
