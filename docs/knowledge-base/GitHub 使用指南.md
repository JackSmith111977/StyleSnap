# GitHub 使用指南 - StyleSnap

> 版本：1.0
> 创建日期：2026-03-22

---

## 目录

1. [添加 Topics 标签](#1-添加-topics-标签)
2. [添加开源许可证](#2-添加开源许可证)
3. [常见开源许可证对比](#3-常见开源许可证对比)
4. [推荐配置](#4-推荐配置)

---

## 1. 添加 Topics 标签

Topics 是 GitHub 仓库的分类标签，帮助其他人发现和了解你的项目。

### 操作步骤

1. 打开仓库页面：https://github.com/JackSmith111977/StyleSnap

2. 在仓库名称下方，找到 **Topics** 区域（如果还没有 topics，会显示 "Add topics" 按钮）

3. 点击 **齿轮图标** 或 **Add topics** 按钮

4. 输入 topics（每个 topic 后按回车或逗号分隔）

5. 点击 **Save changes**

### 推荐 Topics

为 StyleSnap 项目推荐以下 topics：

```
nextjs typescript tailwindcss supabase design-system frontend react open-source china web-development ui-components
```

| Topic | 说明 |
|-------|------|
| `nextjs` | Next.js 框架 |
| `typescript` | TypeScript 语言 |
| `tailwindcss` | Tailwind CSS 样式 |
| `supabase` | Supabase 数据库 |
| `design-system` | 设计系统 |
| `frontend` | 前端开发 |
| `react` | React 库 |
| `open-source` | 开源项目 |
| `china` | 中文项目 |
| `web-development` | Web 开发 |
| `ui-components` | UI 组件库 |

### Topics 规则

- 最多 20 个 topics
- 每个 topic 最多 35 个字符
- 只能使用小写字母、数字和连字符（-）
- 不能包含空格

---

## 2. 添加开源许可证

开源许可证告诉其他人可以如何使用、修改和分发你的代码。

### 操作步骤

1. 打开仓库页面：https://github.com/JackSmith111977/StyleSnap

2. 点击 **Add file** 按钮 → 选择 **Create new file**

3. 在文件名输入框中输入：`LICENSE`（全部大写）

4. 输入文件名后，右侧会出现 **Choose a license template** 按钮，点击它

5. 在弹出的许可证选择页面中，选择 **MIT License**（推荐）

6. 填写许可证信息：
   - **Year**: `2026`
   - **Full name**: `JackSmith111977` 或你的真实姓名/组织名

7. 点击 **Review and submit**

8. 填写提交信息：`feat: add MIT License`

9. 选择 **Commit directly to the main branch**

10. 点击 **Commit changes**

### 许可证文件位置

许可证文件应放在仓库根目录，文件名可以是：
- `LICENSE`（推荐，行业惯例）
- `LICENSE.txt`
- `LICENSE.md`

---

## 3. 常见开源许可证对比

### 3.1 MIT License（推荐）

**特点**：
- ✅ 最宽松的许可证之一
- ✅ 允许商业使用、修改、分发、私有使用
- ✅ 只需保留版权和许可声明
- ❌ 不提供专利保护

**适用场景**：
- 个人项目
- 希望广泛传播和使用的项目
- 不想限制他人使用方式

**知名项目**：jQuery, Rails, React, Vue.js

### 3.2 Apache License 2.0

**特点**：
- ✅ 类似 MIT 的宽松条款
- ✅ 明确授予专利使用权
- ✅ 保护用户免受专利诉讼
- ✅ 允许商业使用、修改、分发

**适用场景**：
- 涉及专利技术的项目
- 企业级开源项目
- 需要专利保护的大型项目

**知名项目**：Apache HTTP Server, Kubernetes, TensorFlow

### 3.3 GPL-3.0 License

**特点**：
- ✅ 确保软件始终开源
- ✅ 要求修改后的代码也必须开源（Copyleft）
- ❌ 不允许闭源商用
- ❌ 有"传染性"（衍生作品必须同样开源）

**适用场景**：
- 希望确保项目始终开源
- 鼓励社区贡献
- 不希望被闭源商用

**知名项目**：Linux 内核，Git, GCC

### 3.4 BSD-3-Clause

**特点**：
- ✅ 类似 MIT 的宽松许可证
- ✅ 不允许使用贡献者名字做广告
- ✅ 允许商业使用、修改、分发

**适用场景**：
- 学术项目
- 希望保护作者名誉的项目

**知名项目**：Go, Nginx, Redis

### 3.5 许可证对比表

| 特性 | MIT | Apache-2.0 | GPL-3.0 | BSD-3 |
|------|-----|------------|---------|-------|
| 商业使用 | ✅ | ✅ | ✅ | ✅ |
| 修改代码 | ✅ | ✅ | ✅ | ✅ |
| 分发代码 | ✅ | ✅ | ✅ | ✅ |
| 私有使用 | ✅ | ✅ | ❌ | ✅ |
| 专利授权 | ❌ | ✅ | ✅ | ❌ |
| 衍生作品开源 | ❌ | ❌ | ✅ | ❌ |
| 保留版权声明 | ✅ | ✅ | ✅ | ✅ |
| 宽松程度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |

---

## 4. 推荐配置

### 4.1 StyleSnap 推荐配置

**许可证**：MIT License

**理由**：
1. StyleSnap 是个人开源项目，希望广泛传播
2. 不涉及专利技术
3. 不限制他人使用方式（包括商用）
4. 简洁易懂，法律风险低

**Topics**：
```
nextjs typescript tailwindcss supabase design-system frontend react open-source china web-development ui-components shadcn
```

### 4.2 操作流程

```
1. 添加 Topics（5 分钟）
   └→ https://github.com/JackSmith111977/StyleSnap → 点击齿轮图标 → 输入 topics → Save

2. 添加 MIT License（5 分钟）
   └→ Add file → Create new file → 输入 LICENSE → Choose a license template
   └→ 选择 MIT License → 填写年份和姓名 → Review and submit → Commit changes

3. 验证（1 分钟）
   └→ 检查仓库页面是否显示 topics
   └→ 检查仓库是否显示 MIT License 徽章
```

### 4.3 后续可选配置

| 配置项 | 说明 | 优先级 |
|--------|------|--------|
| **GitHub Actions CI/CD** | 自动化测试和部署 | P1 |
| **Issue Templates** | 规范 Issue 提交格式 | P1 |
| **Pull Request Templates** | 规范 PR 提交流程 | P1 |
| **README 徽章** | 展示项目状态、许可证等 | P2 |
| **Release 版本管理** | 管理项目发布版本 | P2 |
| **贡献指南 (CONTRIBUTING.md)** | 指导他人如何贡献代码 | P2 |
| **行为准则 (CODE_OF_CONDUCT.md)** | 社区行为规范 | P3 |

---

## 附录：快速链接

- [GitHub Topics 官方文档](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)
- [GitHub 许可证文档](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Choose a License](https://choosealicense.com/) - 帮助你选择开源许可证
- [GitHub 仓库设置](https://github.com/JackSmith111977/StyleSnap/settings) - StyleSnap 仓库设置页
