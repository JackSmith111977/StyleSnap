# Supabase CLI 知识库

> 创建日期：2026-03-24
> 用途：AI 助手快速参考 Supabase CLI 命令

---

## 快速参考表

| 操作 | 命令 |
|------|------|
| 登录 | `supabase login` |
| 链接项目 | `supabase link --project-ref <ref>` |
| 推送迁移 | `supabase db push` |
| 拉取 Schema | `supabase db pull <name>` |
| 创建迁移 | `supabase migration new <name>` |
| 本地启动 | `supabase start` |
| 本地停止 | `supabase stop` |

---

## 核心命令

### 项目设置

```bash
supabase init                              # 初始化项目
supabase login                             # 登录账户
supabase link --project-ref <ref>          # 链接远程项目
supabase status                            # 查看状态
```

### 数据库迁移

```bash
supabase migration new <name>              # 创建迁移文件
supabase db push                           # 推送到云端
supabase db pull <name>                    # 从云端拉取
supabase db reset                          # 重置本地数据库
supabase migration list                    # 查看迁移历史
supabase migration repair <ver> --status applied      # 修复历史
```

### 本地开发

```bash
supabase start                             # 启动本地服务 (Docker)
supabase stop                              # 停止服务
supabase stop --no-backup                  # 停止并删除数据
supabase gen types typescript --local      # 生成 TS 类型
```

### 边缘函数

```bash
supabase functions new <name>              # 创建函数
supabase functions serve <name>            # 本地运行
supabase functions deploy <name>           # 部署到云端
```

### 密钥管理

```bash
supabase secrets set KEY=value             # 设置密钥
supabase secrets list                      # 列出密钥
supabase secrets unset KEY                 # 删除密钥
```

---

## 常见工作流

### 推送 Schema 变更到云端

```bash
# 1. 创建迁移文件
supabase migration new create_table

# 2. 编辑 SQL 文件

# 3. 推送
supabase db push
```

### 从云端同步 Schema

```bash
# 1. 链接项目
supabase link --project-ref <ref>

# 2. 拉取
supabase db pull sync_schema
```

### 执行单次 SQL（如触发器）

```bash
# 方式 A：迁移文件（推荐）
supabase migration new create_trigger
# 编辑 SQL 文件
supabase db push

# 方式 B：Dashboard 手动执行
# https://supabase.com/dashboard/project/<ref>/sql/new
```

---

## 重要注意事项

1. **没有 `db execute --file` 命令** - 使用 `db push` 推送迁移文件
2. **`db query --file` 仅用于本地** - 需要 `supabase start` 运行中
3. **远程执行 SQL 只能用 `db push` 或 Dashboard**
4. **迁移文件采用时间戳命名**
5. **推送前确保本地迁移历史是最新的**

---

## 错误排查

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `failed to connect to postgres` | 本地服务未启动 | `supabase start` |
| `unknown flag: --file` | 使用了不存在的命令 | 改用 `db push` |
| `migration already exists` | 迁移历史冲突 | `migration repair` |
| `Database error saving new user` | 缺少触发器 | 创建 `create_profile_on_signup` 触发器 |

---

## 参考链接

- 官方文档：https://supabase.com/docs/guides/cli
- 命令参考：https://supabase.com/docs/reference/cli
