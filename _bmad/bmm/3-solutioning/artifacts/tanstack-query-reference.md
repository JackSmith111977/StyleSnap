# TanStack Query - Agent 参考

> 用途：服务端状态管理 API 规范与最佳实践
> 来源：`knowledge-base/tech-stack/tanstack-query-vs-swr.md`

---

## 快速参考

### 安装
```bash
pnpm add @tanstack/react-query
```

### 基础用法
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 数据查询
const { data, isLoading, error } = useQuery({
  queryKey: ['todos', { status: 'pending' }],
  queryFn: fetchTodos,
})

// 数据突变
const mutation = useMutation({
  mutationFn: createTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})
```

### 配置
```typescript
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 分钟
      gcTime: 1000 * 60 * 60,    // 1 小时
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## 最佳实践

1. **queryKey 命名**：使用数组格式 `['entity', { filters }]`
2. **缓存策略**：根据数据更新频率设置 `staleTime`
3. **错误处理**：始终处理 `error` 状态
4. **依赖注入**：在 `QueryClientProvider` 中配置

---

## 常见模式

### 依赖查询
```typescript
const { data: user } = useQuery({
  queryKey: ['user', userId],
  queryFn: () => fetchUser(userId),
  enabled: !!userId, // 仅在 userId 存在时执行
})
```

### 乐观更新
```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] })
    const previousTodos = queryClient.getQueryData(['todos'])
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo])
    return { previousTodos }
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previousTodos)
  },
})
```
