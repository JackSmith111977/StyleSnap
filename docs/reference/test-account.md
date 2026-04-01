# StyleSnap 测试账号

> 用于 E2E 测试和手动测试的专用测试账号

---

## 测试账号信息

| 字段 | 值 |
|------|-----|
| **邮箱** | `3526547131@qq.com` |
| **密码** | `test1234` |
| **用途** | E2E 测试、手动功能测试 |

---

## 使用场景

1. **点赞功能测试** - 测试已登录用户的点赞/取消点赞功能
2. **收藏功能测试** - 测试已登录用户的收藏/取消收藏功能
3. **评论功能测试** - 测试已登录用户的发表评论功能
4. **个人资料测试** - 测试个人资料编辑功能

---

## 注意事项

1. **不要修改密码** - 此账号用于所有测试场景，修改密码会导致测试失败
2. **不要删除账号** - 删除后需要重新创建并更新本文档
3. **测试数据清理** - 测试完成后，建议清理产生的测试数据（评论、收藏等）

---

## Supabase 查询

### 查看用户信息
```sql
SELECT * FROM auth.users WHERE email = '3526547131@qq.com';
SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users WHERE email = '3526547131@qq.com');
```

### 清理测试数据
```sql
-- 删除测试评论
DELETE FROM comments WHERE user_id = (SELECT id FROM auth.users WHERE email = '3526547131@qq.com');

-- 删除测试收藏
DELETE FROM favorites WHERE user_id = (SELECT id FROM auth.users WHERE email = '3526547131@qq.com');

-- 删除测试点赞
DELETE FROM likes WHERE user_id = (SELECT id FROM auth.users WHERE email = '3526547131@qq.com');
```

---

**创建日期**: 2026-04-01  
**最后更新**: 2026-04-01
