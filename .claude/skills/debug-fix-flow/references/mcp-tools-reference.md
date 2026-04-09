# MCP 工具速查

**返回主文件：** [SKILL.md](../SKILL.md)

---

## Next.js DevTools MCP

### 发现服务器

```
nextjs_index
```

返回：
```json
{
  "servers": [
    {
      "port": 3000,
      "pid": 12345,
      "url": "http://localhost:3000",
      "tools": ["get_errors", "get_routes", "get_logs", ...]
    }
  ]
}
```

### 获取错误

```
nextjs_call port=3000 toolName="get_errors"
```

返回：
```json
{
  "configErrors": [],
  "sessionErrors": [
    {
      "type": "browser",
      "message": "...",
      "stack": "..."
    }
  ]
}
```

### 获取路由

```
nextjs_call port=3000 toolName="get_routes"
```

### 获取日志

```
nextjs_call port=3000 toolName="get_logs"
```

---

## Playwright MCP

### 导航到页面

```
browser_navigate url="http://localhost:3000/profile"
```

### 获取页面快照

```
browser_snapshot
```

### 点击元素

```
browser_click ref="e123" element="按钮描述"
```

### 填写表单

```
browser_fill_form fields=[
  {"ref": "e1", "value": "值"},
  {"ref": "e2", "value": "值"}
]
```

### 文件上传

```
browser_file_upload paths=["/path/to/file.png"]
```

### 获取控制台消息

```
browser_console_messages level="debug" all=true
```

### 截图

```
browser_take_screenshot filename="apps/web/tests/results/mcp-screenshots/bug-reports/debug-issue.png"
```

### 执行 JS

```
browser_eval action="evaluate" script="() => { return document.title }"
```

### 关闭浏览器

```
browser_close
```

---

## Browser Tools MCP

### 获取控制台消息

```
browser_eval action="console_messages" errorsOnly=false
```

### 获取网络请求

```
browser_eval action="network_requests" filter="/api/.*"
```

---

## 使用示例

### 完整调试流程

```bash
# 1. 启动开发服务器
pnpm dev

# 2. 发现服务器
nextjs_index

# 3. 获取错误
nextjs_call port=3000 toolName="get_errors"

# 4. 导航到问题页面
browser_navigate url="http://localhost:3000/profile"

# 5. 获取页面快照
browser_snapshot

# 6. 执行问题操作
browser_click ref="e65" element="上传头像按钮"

# 7. 获取控制台消息
browser_console_messages level="debug" all=true

# 8. 分析日志，定位问题
# ...

# 9. 关闭浏览器
browser_close
```

---

## 常见问题

### Q: nextjs_index 找不到服务器

**A**: 确保已运行 `pnpm dev`，然后重试

### Q: browser_navigate 失败

**A**: 检查 URL 是否正确，确保开发服务器正在运行

### Q: 控制台消息为空

**A**: 设置 `all=true` 获取所有消息，或先执行操作再获取
