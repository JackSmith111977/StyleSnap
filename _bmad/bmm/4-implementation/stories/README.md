# BMad Stories 索引

> 最后更新：2026-04-04
> 状态：已创建 13 个故事到 BMad 标准格式

---

## 故事列表

### Epic 2: 风格浏览与发现

| Story | 文件 | 状态 | 说明 |
|-------|------|------|------|
| 2.5 | `story-2-5-advanced-filtering.md` | ready-for-dev | 高级筛选功能 |

### Epic 3: 风格详情与代码使用

| Story | 文件 | 状态 | 说明 |
|-------|------|------|------|
| 3.1 | `story-3-1-style-detail-page.md` | done | 风格详情页基础 |
| 3.2 | `story-3-2-design-tokens-display.md` | done | 设计变量展示 |
| 3.3 | `story-3-3-code-snippet-display.md` | done | 代码片段展示 |
| 3.4 | `story-3-4-code-copy.md` | done | 代码复制功能 |
| 3.5 | `story-3-5-related-styles.md` | done | 相关推荐 |

### Epic 4: 社交互动 - 收藏与点赞

| Story | 文件 | 状态 | 说明 |
|-------|------|------|------|
| 4.1 | `story-4-1-favorite-style.md` | done | 收藏风格 |
| 4.2 | `story-4-2-like-style.md` | done | 点赞风格 |
| 4.3 | `story-4-3-my-favorites-page.md` | done | 我的收藏页 |

### Epic 5: 社交互动 - 评论系统

| Story | 文件 | 状态 | 说明 |
|-------|------|------|------|
| 5.1 | `story-5-1-create-comment.md` | done | 发表评论 |
| 5.2 | `story-5-2-reply-comment.md` | done | 回复评论 |
| 5.3 | `story-5-3-comment-list-display.md` | done | 评论列表展示 |
| 5.4 | `story-5-4-delete-comment.md` | done | 删除评论 |
| E2E | `tests/e2e/epic-5-comment-system.spec.ts` | done | E2E 测试（8 个测试用例） |

---

## 目录结构

```
_bmad/
├── bmm/
│   ├── 3-solutioning/
│   │   ├── architecture.md    # 架构决策文档
│   │   └── epics.md           # Epics & Stories
│   └── 4-implementation/
│       └── stories/           # 标准格式 Spec
│           ├── README.md
│           ├── story-2-5-advanced-filtering.md
│           ├── story-3-1-style-detail-page.md
│           ├── story-3-2-design-tokens-display.md
│           ├── story-3-3-code-snippet-display.md
│           ├── story-3-4-code-copy.md
│           ├── story-3-5-related-styles.md
│           ├── story-4-1-favorite-style.md
│           ├── story-4-2-like-style.md
│           ├── story-4-3-my-favorites-page.md
│           ├── story-5-1-create-comment.md
│           ├── story-5-2-reply-comment.md
│           ├── story-5-3-comment-list-display.md
│           └── story-5-4-delete-comment.md
```

---

## Spec 格式说明

采用 BMad 标准 spec-template.md 模板：
- **Frontmatter** - title, type, status, context 元数据
- **Frozen 区块** - Intent/Boundaries/I/O 使用 `<frozen-after-approval>` 包装
- **Code Map** - 明确文件路径和角色说明
- **Verification** - 命令和手动检查分离

---

## 原始位置参考

原始 spec 文档已从 `_bmad-output/` 清理，内容迁移至上述位置。
