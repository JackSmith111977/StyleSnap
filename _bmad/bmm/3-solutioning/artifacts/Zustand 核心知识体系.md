# Zustand 技术调研文档

> 版本：1.0
> 创建日期：2026-03-21
> 来源：Zustand 官方文档、社区最佳实践
> 用途：StyleSnap 项目状态管理技术选型与开发指南

---

## 目录

1. [概述](#1-概述)
2. [核心概念](#2-核心概念)
3. [快速入门](#3-快速入门)
4. [TypeScript 集成](#4-typescript-集成)
5. [中间件系统](#5-中间件系统)
6. [最佳实践](#6-最佳实践)
7. [StyleSnap 项目应用建议](#7-stylesnap-项目应用建议)

---

## 1. 概述

### 1.1 Zustand 是什么

**Zustand**（德语"状态"的意思，发音 /ˈzuːstænd/）是一个轻量级 React 状态管理库，由 React Spring 团队开发。

| 特性 | 描述 |
|------|------|
| **大小** | ~1KB (gzip) |
| **依赖** | 无外部依赖 |
| **最低要求** | React 16.8+ (Hooks) |
| **TypeScript** | 内置类型支持 |
| **核心 API** | `create()` 函数 |

### 1.2 核心优势

| 优势 | 说明 | 对比 Redux |
|------|------|------------|
| **极简 API** | 一个 `create` 函数搞定所有 | Redux 需要 action、reducer、store 配置 |
| **无需 Provider** | 直接导入 store 使用，无组件嵌套 | Redux 需要 `<Provider>` 包裹根组件 |
| **精准订阅** | 只订阅需要的状态片段 | Redux 默认整个 store 变化都触发重渲染 |
| **TypeScript 友好** | 内置类型推导，无需额外类型包 | Redux 需要手动定义 Action/State 类型 |
| **中间件生态** | persist、devtools、immer 等 | Redux 中间件配置复杂 |
| **跨框架兼容** | 可在 Vue、Svelte 甚至非框架中使用 | Redux 主要针对 React |

### 1.3 适用场景

**适合使用 Zustand**：
- 中小型 React 应用的全局状态管理
- 用户偏好设置（主题、语言）
- UI 状态（侧边栏展开/折叠、模态框）
- 跨组件共享的简单数据
- 配合 TanStack Query 使用（Zustand 管 UI 状态，Query 管服务端数据）

**不适合 Zustand**：
- 超大型企业应用（考虑 Redux Toolkit）
- 需要时间旅行调试的复杂场景
- 需要强大 DevTools 支持的团队

---

## 2. 核心概念

### 2.1 Store（状态容器）

Store 是 Zustand 的核心概念，包含状态和修改状态的方法。

```typescript
// 基础 store
import { create } from 'zustand'

const useStore = create((set) => ({
  // 状态
  count: 0,
  name: 'StyleSnap',

  // 方法
  increment: () => set((state) => ({ count: state.count + 1 })),
  setName: (newName) => set({ name: newName }),
}))
```

### 2.2 create() 函数

`create()` 是 Zustand 的核心 API，返回一个自定义 Hook。

**函数签名**：
```typescript
function create<T>(
  createState: StateCreator<T, [StoreMutatorsIdentifier, ...], []>
): UseBoundStore<StoreApi<T>>
```

**参数说明**：
- `createState`: 接收 `set`、`get`、`api` 三个参数的工厂函数

**返回值**：
- 自定义 Hook，可直接在组件中使用
- 包含 `getState()`、`setState()`、`subscribe()` 等静态方法

### 2.3 set() 方法

`set()` 类似于 React 的 `setState()`，但直接修改全局状态。

**使用方式**：
```typescript
// 方式 1：对象形式（浅合并）
set({ count: 1, name: 'new' })

// 方式 2：函数形式（可访问当前状态）
set((state) => ({ count: state.count + 1 }))

// 方式 3：部分更新（只更新指定字段）
set({ name: 'updated' }) // 其他字段保持不变
```

### 2.4 get() 方法

`get()` 在方法内部获取当前状态，不触发重渲染。

```typescript
const useStore = create((set, get) => ({
  count: 0,
  // 使用 get() 访问最新状态，无需依赖闭包
  incrementTwice: () => {
    const current = get().count
    set({ count: current + 1 })
    set({ count: get().count + 1 })
  },
}))
```

### 2.5 api 对象

`api` 提供底层 API，用于高级用法。

```typescript
const useStore = create((set, get, api) => ({
  // ...
}))

// api 提供的方法
api.getState()      // 获取当前状态
api.setState()      // 设置状态
api.subscribe()     // 订阅状态变化
api.destroy()       // 销毁 store
```

---

## 3. 快速入门

### 3.1 安装

```bash
npm install zustand
# 或
yarn add zustand
# 或
pnpm add zustand
```

### 3.2 创建 Store

```typescript
// src/store/counterStore.ts
import { create } from 'zustand'

interface CounterState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

### 3.3 在组件中使用

```typescript
// 方式 1：选择器形式（推荐 - 避免不必要重渲染）
function Counter() {
  const count = useCounterStore((state) => state.count)
  const increment = useCounterStore((state) => state.increment)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}

// 方式 2：解构形式（简洁但可能触发更多重渲染）
function Counter() {
  const { count, increment } = useCounterStore()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}
```

### 3.4 在非组件中使用

```typescript
// 在 utils 或事件回调中访问 store
import { useCounterStore } from './store/counterStore'

// 获取当前状态（不触发重渲染）
const currentCount = useCounterStore.getState().count

// 调用方法
useCounterStore.getState().increment()

// 订阅状态变化
const unsubscribe = useCounterStore.subscribe(
  (state) => state.count,
  (count) => console.log('Count changed:', count)
)

// 取消订阅
unsubscribe()
```

---

## 4. TypeScript 集成

### 4.1 基础类型定义

```typescript
import { create } from 'zustand'

// 定义状态和方法的类型
interface UserState {
  name: string
  age: number
  email: string | null
  isLoggedIn: boolean
  updateName: (name: string) => void
  updateAge: (age: number) => void
  login: (email: string) => void
  logout: () => void
}

// 创建带类型的 store
export const useUserStore = create<UserState>((set) => ({
  name: '',
  age: 0,
  email: null,
  isLoggedIn: false,
  updateName: (name) => set({ name }),
  updateAge: (age) => set({ age }),
  login: (email) => set({ email, isLoggedIn: true }),
  logout: () => set({ email: null, isLoggedIn: false }),
}))
```

### 4.2 类型推断技巧

**使用 `type` 自动推断**：
```typescript
import { create } from 'zustand'

type BearStore = {
  bears: number
  increase: () => void
  hibernate: () => void
}

// create 会自动推断类型
export const useBearStore = create<BearStore>((set) => ({
  bears: 0,
  increase: () => set((state) => ({ bears: state.bears + 1 })),
  hibernate: () => console.log('hmm...'),
}))
```

**使用 `combine` 中间件获得更好推断**：
```typescript
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

// combine 会自动推断 action 类型
export const useBearStore = create(
  combine(
    // 初始状态
    { bears: 0, bees: 0 },
    // actions
    (set, get) => ({
      increase: () => set((state) => ({ bears: state.bears + 1 })),
      addBees: (n: number) => set((state) => ({ bees: state.bees + n })),
    })
  )
)
```

### 4.3 复杂类型处理

```typescript
interface Product {
  id: string
  name: string
  price: number
}

interface CartState {
  items: Product[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) =>
    set((state) => ({ items: [...state.items, product] })),
  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((p) => p.id !== productId),
    })),
  clearCart: () => set({ items: [] }),
  total: () =>
    get().items.reduce((sum, item) => sum + item.price, 0),
}))
```

---

## 5. 中间件系统

### 5.1 中间件工作机制

Zustand 中间件采用**函数包装**模式：

```typescript
// 中间件基本结构
const myMiddleware = (createState, options) => {
  return (set, get, api) => {
    // 注入自定义逻辑
    const enhancedSet = (...args) => {
      // 前置逻辑
      set(...args)
      // 后置逻辑
    }
    return createState(enhancedSet, get, api)
  }
}
```

### 5.2 persist 中间件（持久化）

**用途**：将状态自动保存到 localStorage/sessionStorage，刷新不丢失。

**基础用法**：
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'theme-storage', // localStorage 中的 key
    }
  )
)
```

**配置选项**：
```typescript
persist(
  (set, get) => ({
    // ... state and actions
  }),
  {
    name: 'storage-key',           // 必填：localStorage key
    storage: localStorage,          // 可选：默认为 localStorage
    partialize: (state) =>          // 可选：只持久化部分状态
      ({ theme: state.theme }),
    onRehydrateStorage: () =>       // 可选：重新水合时的回调
      (state, error) => {
        if (error) console.log('hydration failed:', error)
        else console.log('hydration success:', state)
      },
    skipHydration: false,           // 可选：跳过初始水合
    migrate: (persistedState, version) => // 可选：版本迁移
      persistedState,               // 返回迁移后的状态
    version: 0,                     // 可选：持久化版本
  }
)
```

**自定义存储引擎**：
```typescript
// SessionStorage
persist(..., {
  name: 'session-storage',
  storage: sessionStorage,
})

// 异步存储（如 React Native AsyncStorage）
persist(..., {
  name: 'async-storage',
  storage: {
    getItem: async (name) => AsyncStorage.getItem(name),
    setItem: async (name, value) => AsyncStorage.setItem(name, value),
    removeItem: async (name) => AsyncStorage.removeItem(name),
  },
})
```

### 5.3 devtools 中间件（调试）

**用途**：在 Redux DevTools 中调试 Zustand store。

**基础用法**：
```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface CounterState {
  count: number
  increment: () => void
}

export const useCounterStore = create<CounterState>()(
  devtools(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: 'Counter Store',      // DevTools 中显示的名称
      enabled: true,              // 可选：生产环境禁用
      anonymousActionType: 'anonymous', // 未命名 action 的类型
    }
  )
)
```

**配合 persist 使用**：
```typescript
import { persist, devtools } from 'zustand/middleware'

export const useStore = create<StoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... state and actions
      }),
      { name: 'storage-key' }
    ),
    { name: 'My Store' }
  )
)
```

**中间件嵌套顺序很重要**：
```typescript
// ✅ 正确：devtools 在最外层
devtools(persist(..., { name: 'storage' }), { name: 'store' })

// ❌ 错误：devtools 在 persist 内部，调试可能不准确
persist(devtools(...), { name: 'storage' })
```

### 5.4 immer 中间件（简化不可变更新）

**用途**：使用可变语法更新不可变状态，减少嵌套展开操作。

**安装**：
```bash
npm install immer
```

**基础用法**：
```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface TodosState {
  todos: Array<{ id: string; text: string; done: boolean }>
  addTodo: (text: string) => void
  toggleTodo: (id: string) => void
}

export const useTodosStore = create<TodosState>()(
  immer((set) => ({
    todos: [],
    addTodo: (text) =>
      set((state) => {
        // 可直接"修改"状态，immer 会自动处理不可变性
        state.todos.push({ id: Date.now().toString(), text, done: false })
      }),
    toggleTodo: (id) =>
      set((state) => {
        const todo = state.todos.find((t) => t.id === id)
        if (todo) todo.done = !todo.done
      }),
  }))
)
```

**对比：无 immer 的写法**：
```typescript
// ❌ 繁琐的展开操作
addTodo: (text) => set((state) => ({
  todos: [
    ...state.todos,
    { id: Date.now().toString(), text, done: false }
  ]
}))

// ✅ immer 简化写法
addTodo: (text) => set((state) => {
  state.todos.push({ id: Date.now().toString(), text, done: false })
})
```

### 5.5 combine 中间件（类型推断辅助）

**用途**：帮助 TypeScript 更好地推断状态和 action 类型。

```typescript
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useBearStore = create(
  combine(
    // 初始状态 - 类型会自动推断
    { bears: 0, bees: 0, name: 'Bear Store' },
    // Actions - 类型也会自动推断
    (set, get) => ({
      increase: () => set((state) => ({ bears: state.bears + 1 })),
      addBees: (n: number) => set((state) => ({ bees: state.bees + n })),
      reset: () => set({ bears: 0, bees: 0 }),
    })
  )
)
```

### 5.6 redux 中间件（Redux 风格）

**用途**：使用 Redux 的 action/reducer 模式，适合从 Redux 迁移。

```typescript
import { create } from 'zustand'
import { redux } from 'zustand/middleware'

// Reducer
function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 }
    case 'DECREMENT':
      return { ...state, count: state.count - 1 }
    default:
      return state
  }
}

// Store
export const useStore = create(redux(reducer, initialState))
```

### 5.7 subscribeWithSelector 中间件（精确订阅）

**用途**：更精确地控制订阅，避免不必要重渲染。

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useStore = create(
  subscribeWithSelector((set, get) => ({
    count: 0,
    name: 'John',
    age: 30,
  }))
)

// 订阅特定值的变化
useStore.subscribe(
  (state) => state.count,  // 选择器
  (count) => console.log('Count changed:', count) // 回调
)

// 多条件订阅
useStore.subscribe(
  (state) => ({ count: state.count, name: state.name }),
  ({ count, name }) => console.log('Count or Name changed:', count, name),
  { equalityFn: shallow } // 浅比较
)
```

---

## 6. 最佳实践

### 6.1 Store 拆分原则

**按功能模块拆分**：
```
src/store/
├── themeStore.ts       # 主题相关
├── userStore.ts        # 用户认证
├── uiStore.ts          # UI 状态（侧边栏、模态框）
└── cartStore.ts        # 购物车（如有）
```

**示例**：
```typescript
// src/store/themeStore.ts
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface ThemeState {
  theme: 'light' | 'dark' | 'system'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set) => ({
        theme: 'system',
        toggleTheme: () =>
          set((state) => ({
            theme: state.theme === 'light' ? 'dark' : 'light'
          })),
        setTheme: (theme) => set({ theme }),
      }),
      { name: 'theme-storage' }
    ),
    { name: 'Theme Store' }
  )
)
```

### 6.2 状态选择器优化

**避免不必要重渲染**：
```typescript
// ❌ 不好：整个 store 变化都触发重渲染
const { count, name, items } = useStore()

// ✅ 推荐：只订阅需要的字段
const count = useStore((state) => state.count)
const name = useStore((state) => state.name)
const items = useStore((state) => state.items)
```

**使用浅比较**：
```typescript
import { shallow } from 'zustand/shallow'

// 订阅多个字段时使用浅比较
const { count, name } = useStore(
  (state) => ({ count: state.count, name: state.name }),
  shallow
)
```

### 6.3 异步操作处理

**推荐模式**：
```typescript
interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const user = await authApi.login(email, password)
      set({ user, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  logout: () => {
    set({ user: null })
    // 清除持久化状态
    useAuthStore.persist.clearStorage()
  },
}))
```

### 6.4 Store 组合（无 combine 中间件）

```typescript
// 组合多个 store
const useCombinedStore = () => {
  const theme = useThemeStore((s) => s.theme)
  const user = useUserStore((s) => s.user)
  const ui = useUiStore((s) => s.sidebarOpen)

  return { theme, user, sidebarOpen: ui }
}
```

### 6.5 测试

**单元测试示例**：
```typescript
import { describe, it, expect } from 'vitest'
import { useCounterStore } from './counterStore'

describe('Counter Store', () => {
  it('should increment count', () => {
    useCounterStore.getState().increment()
    expect(useCounterStore.getState().count).toBe(1)
  })

  it('should reset count', () => {
    useCounterStore.getState().reset()
    expect(useCounterStore.getState().count).toBe(0)
  })
})
```

---

## 7. StyleSnap 项目应用建议

### 7.1 推荐 Store 结构

基于 StyleSnap 的需求（PRD + APP_FLOW），推荐以下 Store 划分：

```
src/stores/
├── theme.store.ts      # 应用主题（深色/浅色模式）
├── auth.store.ts       # 用户认证状态
├── ui.store.ts         # UI 状态（侧边栏、模态框、菜单）
├── style-view.store.ts # 风格浏览状态（筛选、排序、搜索）
└── index.ts            # 统一导出
```

### 7.2 各 Store 详细设计

#### theme.store.ts

```typescript
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark' // 系统解析后的实际主题
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        theme: 'system',
        resolvedTheme: 'light',

        toggleTheme: () => {
          const current = get().theme
          set({
            theme: current === 'light' ? 'dark' : current === 'dark' ? 'system' : 'light'
          })
        },

        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'stylesnap-theme',
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: 'Theme Store' }
  )
)
```

#### auth.store.ts

```typescript
import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null

  login: (email: string, password: string) => Promise<void>
  loginWithOAuth: (provider: 'github' | 'google') => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isLoggedIn: false,
        isLoading: false,
        error: null,

        login: async (email, password) => {
          set({ isLoading: true, error: null })
          // 实际实现调用 Supabase Auth
          try {
            // const { data, error } = await supabase.auth.signInWithPassword(...)
            // if (error) throw error
            // set({ user: data.user, token: data.session.access_token, isLoggedIn: true, isLoading: false })
          } catch (err) {
            set({ error: err.message, isLoading: false })
          }
        },

        loginWithOAuth: async (provider) => {
          // OAuth 登录实现
        },

        register: async (email, password) => {
          set({ isLoading: true, error: null })
          // 注册实现
        },

        logout: () => {
          set({ user: null, token: null, isLoggedIn: false })
          useAuthStore.persist.clearStorage()
        },

        clearError: () => set({ error: null }),
      }),
      {
        name: 'stylesnap-auth',
        partialize: (state) => ({
          token: state.token,
          isLoggedIn: state.isLoggedIn
        }),
      }
    ),
    { name: 'Auth Store' }
  )
)
```

#### ui.store.ts

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // 导航
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // 模态框
  activeModal: 'login' | 'register' | 'submit-style' | null
  openModal: (modal: 'login' | 'register' | 'submit-style') => void
  closeModal: () => void

  // 视图模式
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),

    activeModal: null,
    openModal: (modal) => set({ activeModal: modal }),
    closeModal: () => set({ activeModal: null }),

    viewMode: 'grid',
    setViewMode: (mode) => set({ viewMode: mode }),
  }), { name: 'UI Store' })
)
```

#### style-view.store.ts

```typescript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type SortOption = 'newest' | 'popular' | 'favorites' | 'likes'
export type ViewMode = 'grid' | 'list'

interface StyleViewFilters {
  searchQuery: string
  category: string | null
  tags: string[]
  colors: string[]
  sort: SortOption
  viewMode: ViewMode
}

interface StyleViewState extends StyleViewFilters {
  setSearchQuery: (query: string) => void
  setCategory: (category: string | null) => void
  toggleTag: (tag: string) => void
  toggleColor: (color: string) => void
  setSort: (sort: SortOption) => void
  setViewMode: (mode: ViewMode) => void
  resetFilters: () => void
}

const initialState: StyleViewFilters = {
  searchQuery: '',
  category: null,
  tags: [],
  colors: [],
  sort: 'newest',
  viewMode: 'grid',
}

export const useStyleViewStore = create<StyleViewState>()(
  devtools((set) => ({
    ...initialState,

    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategory: (category) => set({ category }),
    toggleTag: (tag) =>
      set((state) => ({
        tags: state.tags.includes(tag)
          ? state.tags.filter((t) => t !== tag)
          : [...state.tags, tag],
      })),
    toggleColor: (color) =>
      set((state) => ({
        colors: state.colors.includes(color)
          ? state.colors.filter((c) => c !== color)
          : [...state.colors, color],
      })),
    setSort: (sort) => set({ sort }),
    setViewMode: (mode) => set({ viewMode: mode }),
    resetFilters: () => set(initialState),
  }), { name: 'Style View Store' })
)
```

### 7.3 配合 TanStack Query 使用

```typescript
// 推荐架构：Zustand 管 UI 状态，TanStack Query 管服务端数据

// ✅ 正确：职责分离
// Zustand: UI 状态
const { sidebarOpen, toggleSidebar } = useUIStore()
const { theme } = useThemeStore()

// TanStack Query: 服务端数据
const { data: styles, isLoading } = useQuery({
  queryKey: ['styles', filters],
  queryFn: () => fetchStyles(filters),
})

// ❌ 错误：用 Zustand 存储服务端数据
const { styles, fetchStyles } = useStyleStore() // 不推荐
```

### 7.4 中间件配置建议

| Store | 推荐中间件 | 说明 |
|-------|-----------|------|
| theme | persist + devtools | 主题需要持久化 |
| auth | persist + devtools | Token 需要持久化 |
| ui | devtools | UI 状态不需要持久化 |
| style-view | devtools | 筛选状态不需要持久化 |

### 7.5 包体积优化

```typescript
// 按需导入中间件
import { persist } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// 不使用：
// import * as middleware from 'zustand/middleware' // 会导入所有中间件
```

---

## 附录 A：常见问题 FAQ

### Q1: Zustand 和 Context API 有什么区别？

| 特性 | Zustand | Context API |
|------|---------|-------------|
| **重渲染** | 只重渲染订阅的状态 | 整个 Provider 下的组件都重渲染 |
| **Provider** | 不需要 | 需要嵌套 Provider |
| **用法** | Hook 形式 | useContext Hook |
| **性能** | 更优 | 大量状态时性能下降 |

### Q2: 如何处理状态依赖？

```typescript
// 使用 get() 获取最新状态
const useStore = create((set, get) => ({
  count: 0,
  doubled: 0,
  increment: () => {
    set({ count: get().count + 1 })
    set({ doubled: get().count * 2 })
  },
}))
```

### Q3: 如何在多个 Store 之间共享状态？

```typescript
// 方案 1：在一个 store 中访问另一个 store
const useStoreA = create((set, get) => ({
  value: 0,
  updateFromStoreB: () => {
    const valueFromB = useStoreB.getState().value
    set({ value: valueFromB })
  },
}))

// 方案 2：使用 subscribe 监听变化
useStoreB.subscribe(
  (state) => state.value,
  (value) => useStoreA.getState().updateFromB(value)
)
```

---

## 附录 B：参考资料

- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand 官方文档](https://zustand.docs.pmnd.rs/)
- [Zustand 中间件列表](https://github.com/pmndrs/zustand#middlewares)
- [React Query vs Zustand](https://tkdodo.eu/blog/why-you-want-react-query-with-zustand)

---

## 文档修订历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|----------|
| 1.0 | 2026-03-21 | StyleSnap Team | 初始版本 |
