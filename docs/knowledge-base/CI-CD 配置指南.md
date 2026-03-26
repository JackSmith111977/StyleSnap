# CI/CD 知识体系完全指南

> 版本：1.0
> 创建日期：2026-03-23
> 基于：GitHub Actions、GitLab CI、Jenkins 官方文档及行业最佳实践

---

## 目录

1. [CI/CD 基础概念](#1-cicd-基础概念)
2. [核心组件与流程](#2-核心组件与流程)
3. [主流工具对比](#3-主流工具对比)
4. [GitHub Actions 实战](#4-github-actions-实战)
5. [最佳实践](#5-最佳实践)
6. [常见问题与排查](#6-常见问题与排查)

---

## 1. CI/CD 基础概念

### 1.1 什么是 CI/CD

**CI/CD** = **Continuous Integration**（持续集成）+ **Continuous Delivery/Deployment**（持续交付/部署）

是一种自动化软件交付流程，使团队能够**快速、可靠、一致**地交付代码变更。

```
┌─────────────────────────────────────────────────────────────┐
│                    CI/CD Pipeline                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  开发 → 提交 → 构建 → 测试 → 部署 → 监控 → 反馈             │
│          │                                              │
│          └─────────── 自动化 ───────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 为什么需要 CI/CD

| 传统开发 | CI/CD 开发 |
|---------|-----------|
| 数周/月集成一次 | 每天多次集成 |
| 手动测试，容易遗漏 | 自动化测试，每次都跑 |
| 部署复杂，容易出错 | 一键部署，自动回滚 |
| 问题几天后才发现 | 提交后几分钟就知道 |
| 发布是"大事件" | 发布是日常操作 |

### 1.3 CI 与 CD 的区别

#### Continuous Integration（持续集成）

**定义**：开发者频繁地将代码变更合并到主干分支，每次合并触发自动构建和测试。

**核心实践**：
- ✅ 主干开发（Trunk-Based Development）
- ✅ 自动化构建和测试
- ✅ 快速反馈（构建时间 < 10 分钟）
- ✅ 失败立即修复

```yaml
# CI 示例：每次 push 触发
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

#### Continuous Delivery（持续交付）

**定义**：代码通过所有测试后，**准备好**发布到生产环境，但需要**手动确认**。

**核心实践**：
- ✅ 自动化部署到类生产环境
- ✅ 手动审批门（Manual Approval Gate）
- ✅ 一键发布能力

```yaml
# CD 示例：需要手动审批
jobs:
  deploy-staging:
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - run: deploy-to-staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    # 需要手动点击批准
    steps:
      - run: deploy-to-prod
```

#### Continuous Deployment（持续部署）

**定义**：代码通过所有测试后，**自动**发布到生产环境，无需人工干预。

**核心实践**：
- ✅ 完全自动化
- ✅ 自动化回滚
- ✅ 特性开关（Feature Flags）

```
┌─────────────────────────────────────────────────────────────┐
│              Delivery vs Deployment                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Continuous Delivery:                                        │
│  代码 → 测试 → 预发布 → [人工审批] → 生产                   │
│                                                              │
│  Continuous Deployment:                                      │
│  代码 → 测试 → 预发布 → 生产 (全自动)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 核心组件与流程

### 2.1 CI/CD Pipeline 组成

```
┌─────────────────────────────────────────────────────────────┐
│                  CI/CD Pipeline 阶段                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Source      → 获取代码（Git Checkout）                  │
│  2. Build       → 编译/构建（npm build, mvn package）       │
│  3. Test        → 运行测试（unit, integration, e2e）        │
│  4. Stage       → 部署到预发布环境                          │
│  5. Deploy      → 部署到生产环境                            │
│  6. Monitor     → 监控和反馈                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 各阶段详解

#### 阶段 1：Source（源代码）

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
    with:
      fetch-depth: 0  # 获取完整历史
```

**作用**：从 Git 仓库拉取代码到-runner

#### 阶段 2：Build（构建）

```yaml
steps:
  - name: Setup Node.js
    uses: actions/setup-node@v4
    with:
      node-version: '20'
      cache: 'pnpm'

  - name: Install dependencies
    run: pnpm install --frozen-lockfile

  - name: Build
    run: pnpm build
```

**作用**：安装依赖、编译代码、生成构建产物

#### 阶段 3：Test（测试）

```yaml
steps:
  - name: Run unit tests
    run: pnpm test -- --coverage

  - name: Run E2E tests
    run: pnpm test:e2e

  - name: Upload coverage
    uses: codecov/codecov-action@v3
    with:
      files: coverage/lcov.info
```

**测试金字塔**：
```
        /\
       /  \    E2E Tests (少量)
      /────\
     /      \  Integration Tests
    /────────\
   /          \ Unit Tests (大量)
  /────────────\
```

#### 阶段 4：Stage（预发布）

```yaml
deploy-staging:
  runs-on: ubuntu-latest
  environment: staging
  steps:
    - run: vercel --token ${{ secrets.VERCEL_TOKEN }} --preview
```

**作用**：部署到与生产环境一致的环境，进行最终验证

#### 阶段 5：Deploy（部署）

```yaml
deploy-production:
  runs-on: ubuntu-latest
  environment:
    name: production
    url: https://stylesnap.vercel.app
  needs: [ci, deploy-staging]
  steps:
    - run: vercel --token ${{ secrets.VERCEL_TOKEN }} --prod
```

**作用**：部署到生产环境，对用户可见

### 2.3 触发器类型

| 触发器 | 事件 | 示例 |
|--------|------|------|
| **Push** | 代码推送 | `on: push` |
| **Pull Request** | PR 创建/更新 | `on: pull_request` |
| **Schedule** | 定时执行 | `on: schedule: - cron: '0 0 * * *'` |
| **Manual** | 手动触发 | `on: workflow_dispatch` |
| **Release** | 发布版本 | `on: release: types: [published]` |
| **Workflow Run** | 其他工作流完成 | `on: workflow_run` |

---

## 3. 主流工具对比

### 3.1 工具全景图

| 工具 | 类型 | 托管方式 | 配置方式 | 学习曲线 |
|------|------|---------|---------|---------|
| **GitHub Actions** | 云原生 | SaaS | YAML | 低 |
| **GitLab CI** | 一体化 | SaaS/自托管 | YAML | 中 |
| **Jenkins** | 传统 | 自托管 | Groovy/DSL | 高 |
| **CircleCI** | 云原生 | SaaS/自托管 | YAML | 低 |
| **Vercel** | 垂直领域 | SaaS | 自动/配置 | 极低 |

### 3.2 详细对比

#### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
```

| 优势 | 劣势 |
|------|------|
| ✅ 与 GitHub 深度集成 | ❌ 私有库免费额度有限 |
| ✅ 配置简单，YAML 格式 | ❌ 复杂流程调试困难 |
| ✅ 丰富的 Marketplace | ❌ 自托管-runner 维护成本 |
| ✅ 免费额度充足（2000 分钟/月） | |

**适用场景**：开源项目、中小团队、GitHub 托管项目

---

#### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm ci
    - npm run build

test:
  stage: test
  script:
    - npm test
```

| 优势 | 劣势 |
|------|------|
| ✅ 一体化 DevOps 平台 | ❌ 自托管部署复杂 |
| ✅ 原生 Container Registry | ❌ 社区资源少于 GitHub |
| ✅ 强大的 Kubernetes 集成 | ❌ UI 配置较复杂 |
| ✅ 免费私有库 + CI | |

**适用场景**：已使用 GitLab、需要一体化平台、私有化部署

---

#### Jenkins

```groovy
// Jenkinsfile
pipeline {
  agent any
  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
  }
}
```

| 优势 | 劣势 |
|------|------|
| ✅ 高度可定制 | ❌ 配置复杂（Groovy） |
| ✅ 丰富的插件生态 | ❌ 维护成本高 |
| ✅ 完全自托管控制 | ❌ 学习曲线陡峭 |
| ✅ 适合大型 enterprise | ❌ UI 老旧 |

**适用场景**：大型企业、复杂流水线、私有化部署、合规要求

---

#### Vercel（前端专项）

```json
// vercel.json（可选配置）
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

| 优势 | 劣势 |
|------|------|
| ✅ 零配置部署 | ❌ 仅限前端/Node.js |
| ✅ 自动 Preview 部署 | ❌ 定制能力有限 |
| ✅ 全球 CDN | ❌ 价格较高 |
| ✅ Next.js 原生支持 | |

**适用场景**：前端项目、Next.js、快速部署需求

---

### 3.3 选型建议

| 团队规模 | 推荐方案 | 理由 |
|---------|---------|------|
| **个人/小团队** | GitHub Actions + Vercel | 零运维、快速启动 |
| **中型团队** | GitHub Actions 企业版 | 扩展性好、生态丰富 |
| **大型企业** | Jenkins/GitLab 自托管 | 完全控制、合规审计 |
| **前端专项** | Vercel/Netlify | 最优性能、零配置 |

---

## 4. GitHub Actions 实战

### 4.1 基础语法

```yaml
# 工作流文件名：.github/workflows/ci.yml

name: 工作流名称  # 必需

on:  # 必需 - 触发器
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:  # 必需 - 作业定义
  job-id:  # 作业 ID
    runs-on: ubuntu-latest  # 必需 - 运行器
    steps:  # 必需 - 步骤
      - name: 步骤名称  # 可选 - 显示名称
        uses: action@version  # 使用 Action
      - run: echo "Hello"  # 运行命令
```

### 4.2 常用 Action

| Action | 用途 | 示例 |
|--------|------|------|
| `actions/checkout@v4` | 检出代码 | `uses: actions/checkout@v4` |
| `actions/setup-node@v4` | 配置 Node.js | `with: node-version: '20'` |
| `actions/upload-artifact@v4` | 上传产物 | `with: path: dist/` |
| `actions/download-artifact@v4` | 下载产物 | `with: name: build` |
| `actions/cache@v4` | 缓存 | `with: path: node_modules` |

### 4.3 环境变量和密钥

```yaml
env:  # 工作流级别环境变量
  NODE_ENV: production

jobs:
  build:
    env:  # 作业级别环境变量
      API_URL: https://api.example.com
    steps:
      - env:  # 步骤级别环境变量
        SECRET_KEY: ${{ secrets.API_KEY }}  # 从 Secrets 读取
        run: echo $SECRET_KEY
```

**Secrets 配置**：
```
Settings → Actions and workflows → Repository secrets
添加：VERCEL_TOKEN, SUPABASE_KEY 等
```

### 4.4 完整示例：StyleSnap CI/CD

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  # ========== CI 阶段 ==========
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage/lcov.info
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Build
        run: pnpm build

  # ========== E2E 测试 ==========
  e2e:
    needs: ci
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: pnpm install
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: pnpm test:e2e

  # ========== Preview 部署（PR） ==========
  deploy-preview:
    needs: [ci, e2e]
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--preview'

  # ========== Production 部署（main 分支） ==========
  deploy-production:
    needs: [ci, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: production
      url: https://stylesnap.vercel.app
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 5. 最佳实践

### 5.1 Pipeline 设计原则

| 原则 | 说明 | 实施建议 |
|------|------|---------|
| **快速反馈** | CI 构建应在 10 分钟内完成 | 并行执行、缓存优化 |
| **幂等性** | 多次执行结果一致 | 避免状态依赖、清理环境 |
| **原子性** | 每个作业单一职责 | 一个 job 做一件事 |
| **可重复性** | 本地可复现 CI 结果 | 使用容器、固定版本 |
| **安全性** | 保护密钥和凭据 | 使用 Secrets、最小权限 |

### 5.2 缓存优化

```yaml
- name: Cache node_modules
  uses: actions/cache@v4
  with:
    path: |
      node_modules
      ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
    restore-keys: |
      ${{ runner.os }}-pnpm-
```

**缓存策略**：
- 优先缓存依赖（node_modules、.pnpm-store）
- 使用 lock 文件哈希作为 key
- 设置 fallback restore-keys

### 5.3 并行执行

```yaml
# 矩阵策略 - 多 Node 版本测试
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

### 5.4 错误处理

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    continue-on-error: ${{ matrix.experimental }}
    steps:
      - run: ./build.sh

    post:
      always:
        - run: echo "Build finished"
      failure:
        - run: notify-slack  # 失败时通知
      success:
        - run: cleanup  # 成功时清理
```

### 5.5 安全实践

```yaml
# ❌ 错误：密钥硬编码
- run: deploy --token abc123

# ✅ 正确：使用 Secrets
- run: deploy --token ${{ secrets.DEPLOY_TOKEN }}

# ✅ 正确：限制权限
permissions:
  contents: read
  deployments: write
```

### 5.6 分支策略

```
main (受保护)
  ├── develop (开发分支)
  │   ├── feature/* (功能分支)
  │   └── fix/* (修复分支)
  └── release/* (发布分支)

CI/CD 映射：
- feature/* → Preview 部署 + 基础 CI
- develop → Staging 部署 + 完整测试
- main → Production 部署
```

---

## 6. 常见问题与排查

### 6.1 故障排查清单

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 构建失败 | 依赖安装失败 | 检查网络、使用镜像、清理缓存 |
| 测试失败 | 环境变量缺失 | 检查 Secrets 配置 |
| 部署失败 | 凭据过期 | 更新 Token、检查权限 |
| 运行缓慢 | 未使用缓存 | 配置 actions/cache |
| 权限错误 | Runner 权限不足 | 检查 permissions 配置 |

### 6.2 调试技巧

```yaml
# 启用调试日志
env:
  ACTIONS_RUNNER_DEBUG: true
  ACTIONS_STEP_DEBUG: true

# 失败时 SSH 调试
- name: Debug on failure
  if: failure()
  run: |
    echo "Debug info:"
    env
    ls -la
```

### 6.3 性能优化

```yaml
# 1. 减少检出深度
- uses: actions/checkout@v4
  with:
    fetch-depth: 1

# 2. 使用并发
- run: pnpm test -- --concurrency=4

# 3. 跳过不必要的变更
on:
  push:
    paths-ignore:
      - '**/*.md'
      - 'docs/**'
```

---

## 附录

### A. 术语表

| 术语 | 说明 |
|------|------|
| **Pipeline** | 完整的 CI/CD 流程 |
| **Job** | Pipeline 中的一个阶段 |
| **Step** | Job 中的单个操作 |
| **Action** | 可重用的 Step 单元 |
| **Runner** | 执行 Job 的服务器 |
| **Artifact** | 构建产物 |
| **Secret** | 加密的环境变量 |

### B. 参考文档

- [GitHub Actions 官方文档](https://docs.github.com/en/actions)
- [GitLab CI 文档](https://docs.gitlab.com/ee/ci/)
- [Jenkins 文档](https://www.jenkins.io/doc/)
- [Vercel 文档](https://vercel.com/docs)
- [CI/CD 最佳实践](https://www.atlassian.com/continuous-delivery)

### C. 模板仓库

- [actions/starter-workflows](https://github.com/actions/starter-workflows)
- [awesome-github-actions](https://github.com/sdras/awesome-actions)

---

## 修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-23 | StyleSnap Team | 初始版本 |
