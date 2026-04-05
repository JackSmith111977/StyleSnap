# 生产状态恢复检查清单

**返回主文件：** [SKILL.md](../SKILL.md)

---

## 调试日志清理

- [ ] 移除所有 `console.log` 语句
- [ ] 移除所有 `console.debug` 语句
- [ ] 保留必要的 `console.error`（错误处理）
- [ ] 保留必要的 `console.warn`（警告提示）

### 检查命令
```bash
# 检查是否有遗留的 console.log
grep -r "console\.log" apps/web/components/ apps/web/actions/ apps/web/lib/
```

---

## 测试文件清理

- [ ] 删除测试产生的临时文件
- [ ] 删除调试截图（除非需要保留）
- [ ] 清理浏览器缓存文件

### 常见临时文件
- `test-avatar.png`
- `test-*.png`
- `.playwright-mcp/` 中的临时文件

---

## 代码质量验证

- [ ] pnpm typecheck 通过
- [ ] pnpm lint 通过
- [ ] pnpm build 通过
- [ ] 无 TypeScript 错误
- [ ] 无 ESLint 错误
- [ ] 构建成功

### 验证命令
```bash
pnpm typecheck && pnpm lint && pnpm build
```

---

## Git 状态检查

- [ ] 所有更改已暂存
- [ ] 没有未暂存的更改（除了调试报告）
- [ ] 提交信息清晰完整

### 检查命令
```bash
git status
git diff --staged
```

---

## 提交信息检查

提交信息应包含：
- [ ] 问题简述（fix: 开头）
- [ ] 问题根因
- [ ] 解决方案
- [ ] 调试报告位置

### 示例
```
fix: 头像上传功能修复

- 问题根因：getCurrentUser() 未正确处理认证状态
- 解决方案：修复 auth.ts 中的 getUser 调用
- 调试报告：docs/main/P6_AVATAR_UPLOAD_DEBUG_REPORT.md

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## 文档化检查

- [ ] 调试报告已创建
- [ ] 调试报告位置正确（docs/main/）
- [ ] 调试报告内容完整
- [ ] 调试报告已添加到 Git

---

## 推送检查

- [ ] 本地提交已完成
- [ ] 远程分支已更新
- [ ] Git push 成功

### 推送命令
```bash
git push
```

---

## 最终确认

**修复完成确认**:
- [ ] 问题已修复
- [ ] 代码已提交
- [ ] 文档已创建
- [ ] 已推送到远程仓库

**经验沉淀**:
- [ ] 是否需要更新相关 Skill？
- [ ] 是否需要更新 CLAUDE.md？
- [ ] 是否需要添加团队规范？

---

## 恢复失败处理

### 如果清理后发现问题仍在
1. 检查是否有遗漏的调试代码
2. 重新运行验证流程
3. 如仍无法解决，返回阶段 1 重新分析

### 如果 Git 推送失败
1. 检查网络连接
2. 检查分支状态
3. 检查是否有冲突
