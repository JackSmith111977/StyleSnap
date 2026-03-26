# 命令关键词模式定义

本文档定义用于检测重复命令模式的关键词匹配规则。

---

## 模式分类

### 1. 构建部署类 (deploy)

**关键词：**
- 中文：部署、构建、发布、上线
- 英文：deploy, build, publish

**典型命令示例：**
```
帮我构建并部署项目
部署到生产环境
构建 Docker 镜像并发布
```

---

### 2. Docker 容器类 (docker)

**关键词：**
- 中文：容器、镜像
- 英文：docker, container, image

**典型命令示例：**
```
帮我打包 Docker 镜像
运行容器并测试
```

---

### 3. CI/CD流水线类 (ci-cd)

**关键词：**
- 中文：流水线
- 英文：CI, CD, pipeline, github actions, gitlab ci

**典型命令示例：**
```
配置 CI 流水线
设置 GitHub Actions 自动部署
```

---

### 4. 代码审查类 (code-review)

**关键词：**
- 中文：审查、检查
- 英文：review, audit, lint, eslint, prettier

**典型命令示例：**
```
帮我审查这个 PR
检查一下代码质量
运行 ESLint 检查
```

---

### 5. 测试类 (test)

**关键词：**
- 中文：测试、单元测试、集成测试
- 英文：test, jest, vitest, mocha

**典型命令示例：**
```
运行测试用例
帮我写单元测试
```

---

### 6. 安全检查类 (security)

**关键词：**
- 中文：安全、漏洞
- 英文：security, vulnerability, scan, sast, dast

**典型命令示例：**
```
检查代码安全问题
扫描漏洞
```

---

### 7. Git 版本控制类 (git)

**关键词：**
- 中文：提交、分支、拉取、推送
- 英文：git, commit, push, pull, merge

**典型命令示例：**
```
帮我提交代码
创建一个新分支
推送到远程仓库
```

---

### 8. PR 管理类 (pr)

**关键词：**
- 中文：合并请求、代码审查
- 英文：PR, pull request

**典型命令示例：**
```
创建一个 Pull Request
审查这个 PR
```

---

### 9. 文档类 (doc)

**关键词：**
- 中文：文档、注释
- 英文：doc, documentation, readme, api doc

**典型命令示例：**
```
帮我写文档
给这个函数添加注释
生成 API 文档
```

---

### 10. 项目初始化类 (init)

**关键词：**
- 中文：初始化、配置、创建项目、脚手架
- 英文：init, setup, config

**典型命令示例：**
```
初始化一个新项目
配置开发环境
```

---

### 11. 依赖管理类 (dependency)

**关键词：**
- 中文：安装、依赖
- 英文：npm install, yarn add, pnpm add, package.json

**典型命令示例：**
```
安装这个依赖
更新 package.json
```

---

### 12. 调试排查类 (debug)

**关键词：**
- 中文：调试、日志、报错、排查
- 英文：debug, log, error

**典型命令示例：**
```
帮我调试这个问题
查看日志
排查错误原因
```

---

### 13. 性能优化类 (performance)

**关键词：**
- 中文：性能、优化
- 英文：performance, optimize, profiling, benchmark

**典型命令示例：**
```
优化这个函数的性能
性能分析
```

---

## 添加新图案

如需添加新的命令模式，编辑 `.claude/scripts/count-tracker.js` 中的 `COMMAND_PATTERNS` 对象：

```javascript
const COMMAND_PATTERNS = {
  '新类别': ['关键词 1', '关键词 2', '关键词 3'],
  // ...
};
```

---

## 阈值配置

修改 `.claude/command-counts.json` 中的 `threshold` 字段：

```json
{
  "threshold": 3,  // 修改此值
  "patterns": {}
}
```

---

*最后更新：2026-03-25*
