# Supabase CLI 技术调研报告

> 调研日期：2026-03-24
> 文档版本：1.0
> 用途：StyleSnap 项目 Supabase CLI 使用指南

---

## 一、核心结论

### 正确的数据库迁移命令

| 操作 | 正确命令 | 说明 |
|------|----------|------|
| **链接远程项目** | `supabase link --project-ref <project-id>` | 关联本地与云端项目 |
| **推送迁移到云端** | `supabase db push` | 应用本地迁移文件到远程数据库 |
| **拉取远程 Schema** | `supabase db pull <migration-name>` | 从远程数据库拉取 Schema 变更 |
| **重置本地数据库** | `supabase db reset` | 重建本地数据库并应用所有迁移 |
| **执行 SQL 文件** | 无直接命令 | 需使用 `db push` 或手动在 Dashboard 执行 |
| **本地启动服务** | `supabase start` | 启动完整本地开发环境（Docker） |

### 重要发现

1. **没有 `supabase db execute --file` 命令** - 这是之前错误的根源
2. **远程数据库执行 SQL 的正确方式**：
   - 方式 A：创建迁移文件 → `supabase db push`
   - 方式 B：在 Supabase Dashboard → SQL Editor 手动执行
3. **`supabase db query --file` 仅适用于本地数据库** - 需要本地 Docker 服务运行

---

## 二、完整命令参考

### 2.1 项目初始化

```bash
# 初始化 Supabase 项目（创建 supabase/ 目录和 config.toml）
supabase init

# 登录 Supabase 账户
supabase login

# 链接到远程项目
supabase link --project-ref <project-id>

# 查看链接状态
supabase status
```

### 2.2 数据库迁移

```bash
# 创建新迁移文件
supabase migration new <migration-name>

# 推送迁移到远程数据库
supabase db push

# 拉取远程 Schema 到本地迁移文件
supabase db pull <migration-name>

# 重置本地数据库（删除所有数据并重新应用迁移）
supabase db reset

# 查看迁移历史
supabase migration list

# 修复迁移历史（当本地与远程不一致时）
supabase migration repair <version> --status applied

# 合并多个迁移为单个文件
supabase migration squash <version>
```

### 2.3 本地开发

```bash
# 启动本地 Supabase 服务（Docker）
supabase start

# 停止服务
supabase stop

# 停止并删除所有数据（不备份）
supabase stop --no-backup

# 查看服务状态
supabase status

# 生成数据库类型（TypeScript）
supabase gen types typescript --local
```

### 2.4 边缘函数

```bash
# 创建新函数
supabase functions new <function-name>

# 本地运行函数
supabase functions serve <function-name>

# 部署函数到云端
supabase functions deploy <function-name>

# 部署所有函数
supabase functions deploy --all
```

### 2.5 密钥管理

```bash
# 设置环境变量（云端）
supabase secrets set KEY=value

# 列出所有密钥
supabase secrets list

# 删除密钥
supabase secrets unset KEY
```

### 2.6 存储管理

```bash
# 上传文件到存储桶
supabase storage upload --bucket <bucket-name> --file <local-path> --path <remote-path>

# 下载文件
supabase storage download --bucket <bucket-name> --path <remote-path> --file <local-path>

# 列出文件
supabase storage ls --bucket <bucket-name> --path <remote-path>
```

---

## 三、正确的工作流程

### 3.1 本地开发 → 推送云端

```bash
# 1. 在本地创建并编辑迁移文件
supabase migration new create_profiles_table

# 编辑 supabase/migrations/<timestamp>_create_profiles_table.sql

# 2. 本地测试（可选，需要启动 Docker）
supabase start
supabase db reset

# 3. 推送到远程数据库
supabase db push
```

### 3.2 云端修改 → 拉取本地

```bash
# 1. 在 Supabase Dashboard 手动修改 Schema

# 2. 拉取到本地迁移文件
supabase db pull sync_schema

# 3. 提交迁移文件到版本控制
git add supabase/migrations/
```

### 3.3 执行单次 SQL（如创建触发器）

```bash
# 方式 A：创建迁移文件（推荐）
# 1. 创建迁移文件
supabase migration new create_auth_trigger

# 2. 编辑 SQL 文件
# 编辑 supabase/migrations/<timestamp>_create_auth_trigger.sql

# 3. 推送到云端
supabase db push

# 方式 B：Dashboard 手动执行
# 1. 访问 https://supabase.com/dashboard/project/<ref>/sql/new
# 2. 粘贴 SQL 并执行
```

---

## 四、常见问题修复

### 4.1 触发器不存在

**症状**：注册时报 `Database error saving new user`

**修复**：

```sql
-- 创建迁移文件
DROP FUNCTION IF EXISTS create_profile_on_signup() CASCADE;

CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    -- 必需：显式设置 search_path，否则 SECURITY DEFINER 函数找不到 public  schema 中的表
    SET LOCAL search_path = public;

    INSERT INTO profiles (id, username, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://avatar.vercel.sh/' || NEW.email),
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS create_profile_on_signup ON auth.users;

CREATE TRIGGER create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_profile_on_signup();
```

```bash
# 推送迁移
supabase db push
```

**关键注意事项**：

| 问题 | 原因 | 修复 |
|------|------|------|
| `relation "profiles" does not exist` | SECURITY DEFINER 函数的 `search_path` 默认为 `pg_catalog` | 函数定义时添加 `SET search_path = public` |
| `permission denied for table profiles` | `supabase_auth_admin` 没有 profiles 表权限 | `GRANT ALL ON profiles TO supabase_auth_admin` |
| `new row violates row-level security policy` | profiles 表启用 RLS 但没有允许 INSERT 的策略 | 创建 `FOR INSERT WITH CHECK (true)` 策略 |

完整修复流程请参考：[docs/guides/supabase-auth-trigger-fix.md](../../docs/guides/supabase-auth-trigger-fix.md)

### 4.2 迁移历史不一致

**症状**：`db push` 提示迁移已存在或版本冲突

**修复**：

```bash
# 查看迁移历史
supabase migration list

# 修复特定迁移状态
supabase migration repair <version> --status applied

# 或者重置迁移历史（危险操作）
supabase migration repair <version> --status not_applied
```

### 4.3 本地 Docker 无法启动

**症状**：`supabase start` 失败

**修复**：

```bash
# 停止并清理所有容器
supabase stop --no-backup

# 重启 Docker Desktop

# 重新启动
supabase start
```

---

## 五、项目目录结构

```
project-root/
├── supabase/
│   ├── config.toml              # Supabase 项目配置
│   ├── migrations/              # 数据库迁移文件
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_create_storage_buckets.sql
│   │   └── 0003_create_auth_trigger.sql
│   ├── functions/               # 边缘函数
│   ├── seed.sql                 # 初始数据
│   └── .gitignore
├── apps/
│   └── web/
│       ├── .env.local           # 环境变量（不提交到 Git）
│       └── ...
└── .env.example                 # 环境变量示例
```

---

## 六、参考链接

| 资源 | URL |
|------|-----|
| Supabase CLI 官方文档 | https://supabase.com/docs/guides/cli |
| CLI 入门指南 | https://supabase.com/docs/guides/local-development/cli/getting-started |
| CLI 命令参考 | https://supabase.com/docs/reference/cli |
| 数据库迁移 | https://supabase.com/docs/guides/cli/managing-environments |
| GitHub 仓库 | https://github.com/supabase/cli |

---

## 七、版本信息

| 组件 | 版本 |
|------|------|
| Supabase CLI | 2.x (最新) |
| Docker Engine | 20.10.0+ |
| Node.js | 20.9+ |
| pnpm | 9.x |
