---
template-type: team-norms
name: 团队规范模板
description: 用于创建团队编码规范 Skill 模板
---

# [团队/项目] 编码规范

## 用途

当用户需要遵循 [团队/项目] 编码规范时，自动使用此 Skill。

**适用场景：**
- 新成员入职
- 代码审查参考
- 统一代码风格

---

## 命名规范

### 变量命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | 小驼峰 | `userName`, `totalCount` |
| 常量 | 大写下划线 | `MAX_COUNT`, `API_URL` |
| 函数 | 小驼峰 + 动词开头 | `getUser`, `calculateTotal` |
| 类 | 大驼峰 | `UserService`, `OrderItem` |

---

### 文件命名

| 文件类型 | 规范 | 示例 |
|----------|------|------|
| 组件文件 | 大驼峰 | `UserProfile.tsx` |
| 工具函数 | 小驼峰 | `dateUtils.ts` |
| 测试文件 | `.test` 后缀 | `user.test.ts` |

---

## 代码格式

### 缩进规则

- 使用 [2/4] 空格缩进
- 不使用 Tab

### 行长度

- 单行不超过 [80/100/120] 字符
- 过长需换行

### 换行规则

```[语言]
// 好的示例
const longVariableName =
  someLongValue;

// 避免的示例
const longVariableName = someLongValueThatExceedsMaxLength;
```

---

## 注释规范

### 文件头注释

```[语言]
/**
 * @file [文件名]
 * @description [文件描述]
 * @author [作者]
 */
```

### 函数注释

```[语言]
/**
 * [函数描述]
 * @param {[类型]} [参数名] [参数描述]
 * @returns {[类型]} [返回值描述]
 */
```

---

## 最佳实践

### 实践 1：[实践名称]

**说明：** [描述]

**示例：**
```[语言]
// 推荐做法
```

---

## 反模式

### 避免 1：[反模式名称]

**说明：** [为什么不推荐]

**避免：**
```[语言]
// 不推荐的做法
```

---

## Git 提交规范

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式 |
| refactor | 重构 |
| test | 测试 |
| chore | 构建/工具 |

### 示例

```
feat(user): 新增用户注册功能

- 添加注册表单组件
- 实现注册 API 接口

Closes #123
```

---

## 检查清单

代码提交前检查：

- [ ] 符合命名规范
- [ ] 符合代码格式
- [ ] 包含必要注释
- [ ] 通过 lint 检查
- [ ] 提交消息规范

---

## 工具配置

### ESLint 配置

```json
{
  "rules": {
    // 规则配置
  }
}
```

### Prettier 配置

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2
}
```

---

*模板版本：1.0.0*
