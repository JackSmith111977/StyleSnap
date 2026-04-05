# ESLint 错误修复清单

**当前状态**: 41 个错误，308 个警告

## 错误分类

### 1. 未使用变量/导入 (no-unused-vars) - 约 35 个

| 文件 | 错误 | 行号 |
|------|------|------|
| `app/profile/[id]/page.tsx` | `previewUrl` 未使用 | 29 |
| `components/auth/user-menu.tsx` | `loading` 未使用 | 10 |
| `components/collection/collection-detail.tsx` | `cn` 未使用 | 13 |
| `components/collection/collection-list.tsx` | `Search`, `Button`, `Plus`, `Link` 未使用 | 13,5,7,8 |
| `components/export/export-modal.tsx` | `error` 未使用 (catch) | 64 |
| `components/export/tokens-copy-button.tsx` | `X` 未使用 | 5 |
| `components/favorites/add-to-collection-modal.tsx` | `activeMenu` 未使用 | 25 |
| `components/favorites/favorites-sidebar.tsx` | `useMemo` 未使用 | 3 |
| `components/follow/follow-stats.tsx` | `cn` 未使用 | 4 |
| `components/preview/card-drop-preview.tsx` | `styleName`, `styleDescription` 未使用 (参数) | 19,20 |
| `components/preview/detail-tabs.tsx` | `styleId` 未使用 (参数) | 16 |
| `components/preview/edit-control-panel.tsx` | `useCallback` 未使用 | 8 |
| `components/preview/fullscreen-preview.tsx` | `useState` 未使用 | 3 |
| `components/preview/live-preview-editor.tsx` | `generateCssVariablesCode` 未使用 | 10 |
| `components/preview/preview-mode-toggle.tsx` | `err` 未使用 (catch) | 75 |
| `components/preview/style-preview/preview-content.tsx` | `useState` 未使用 | 3 |
| `components/share/share-modal.tsx` | `shouldShow` 未使用 | 19 |
| `components/submit/style-submission-form.tsx` | `Link`, `Share2`, `downloadQRCode`, `CodeEditor` 未使用 | 4,4,7,11 |
| `components/submit/style-submission-form.tsx` | `uploadedLightUrl`, `uploadedDarkUrl` 未使用 | 110,111 |
| `hooks/use-auth.ts` | `error` 未使用 (catch) | 55 |
| `lib/code-export/main-export.ts` | `format`, `styleName`, `cssInJsLibrary` 未使用 | 28 |
| `lib/code-export/main-export.ts` | `scssFull` 未使用 | 43 |
| `lib/code-export/tokens-export.ts` | `format` 未使用 | 206 |
| `lib/code-export/zip-generator.ts` | `filename` 未使用 | 17 |
| `lib/share.ts` | `title`, `url` 未使用 (参数) | 39,45 |
| `lib/share.ts` | `data` 未使用 | 53 |

### 2. any 类型 (no-explicit-any) - 1 个

| 文件 | 行号 |
|------|------|
| `tests/e2e/epic-4-social-interaction.spec.ts` | 20 |

### 3. 测试文件错误 - 3 个

| 文件 | 错误 |
|------|------|
| `tests/e2e/get-style-id.spec.ts` | `expect` 未使用 |
| `tests/global.setup.ts` | `page` 未使用 (参数) |
| `tests/unit/search-box.test.ts` | (多个警告) |
| `tests/unit/setup.ts` | (多个警告) |

### 4. 其他错误

| 文件 | 错误 |
|------|------|
| `app/styles/[id]/opengraph-image.tsx` | 需要检查 |

---

## 子 Agent 分工

### Agent 1: 组件文件 - 未使用导入/变量 (15 个文件)
**文件**:
- `components/auth/user-menu.tsx`
- `components/collection/collection-detail.tsx`
- `components/collection/collection-list.tsx`
- `components/export/export-modal.tsx`
- `components/export/tokens-copy-button.tsx`
- `components/favorites/add-to-collection-modal.tsx`
- `components/favorites/favorites-sidebar.tsx`
- `components/follow/follow-stats.tsx`
- `components/preview/card-drop-preview.tsx`
- `components/preview/detail-tabs.tsx`
- `components/preview/edit-control-panel.tsx`
- `components/preview/fullscreen-preview.tsx`
- `components/preview/live-preview-editor.tsx`
- `components/preview/preview-mode-toggle.tsx`
- `components/preview/style-preview/preview-content.tsx`

### Agent 2: 页面和表单组件 (4 个文件)
**文件**:
- `app/profile/[id]/page.tsx`
- `app/styles/[id]/opengraph-image.tsx`
- `components/share/share-modal.tsx`
- `components/submit/style-submission-form.tsx`

### Agent 3: Hooks 和工具库 (6 个文件)
**文件**:
- `hooks/use-auth.ts`
- `lib/code-export/main-export.ts`
- `lib/code-export/tokens-export.ts`
- `lib/code-export/zip-generator.ts`
- `lib/share.ts`
- `lib/storage.ts`

### Agent 4: 测试文件 (5 个文件)
**文件**:
- `tests/e2e/epic-4-social-interaction.spec.ts`
- `tests/e2e/get-style-id.spec.ts`
- `tests/global.setup.ts`
- `tests/unit/search-box.test.ts`
- `tests/unit/setup.ts`
