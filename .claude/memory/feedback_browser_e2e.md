---
name: E2E 验证使用可见浏览器
description: 使用 Playwright MCP 进行 E2E 验证时必须使用可见浏览器模式 (headless: false)
type: feedback
---

**规则：** 每次使用 Playwright MCP 进行 E2E 功能验证时，必须设置 `headless: false` 以可见模式启动浏览器。

**Why:** 用户需要能够实际看到浏览器窗口来确认验证过程在进行中，增加调试透明度和信任感。

**How to apply:** 
- 调用 `browser_eval start` 时始终添加参数 `headless: false`
- 示例：`browser_eval start` + `browser: chrome` + `headless: false`
