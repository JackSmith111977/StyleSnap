'use client'

import { useState, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { updateProfile, uploadAvatar, deleteAvatar } from '@/actions/profiles'
import type { Profile } from '@/actions/profiles'
import { Upload, Trash2, User } from 'lucide-react'

interface ProfileFormProps {
  initialProfile: Profile
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [avatarUploadPending, setAvatarUploadPending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    username: initialProfile.username || '',
    full_name: initialProfile.full_name || '',
    bio: initialProfile.bio || '',
  })

  const handleSubmit = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result.success) {
        setMessage({ type: 'success', text: '资料更新成功' })
      } else {
        setMessage({ type: 'error', text: result.error || '更新失败' })
      }
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    console.log('[profile-form] handleAvatarChange 触发:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      hasFile: !!file,
    })

    if (!file) {
      console.log('[profile-form] 没有选择文件')
      return
    }

    console.log('[profile-form] 文件验证通过，设置 pending 状态')
    setAvatarUploadPending(true)
    setMessage(null)

    const formData = new FormData()
    formData.append('avatar', file)
    console.log('[profile-form] FormData 已创建，准备调用 uploadAvatar')

    startTransition(async () => {
      console.log('[profile-form] 开始调用 uploadAvatar Server Action')
      const result = await uploadAvatar(formData)
      console.log('[profile-form] uploadAvatar 返回结果:', result)
      if (result.success) {
        console.log('[profile-form] 上传成功，刷新页面')
        setMessage({ type: 'success', text: '头像上传成功' })
        // 刷新页面显示新头像
        window.location.reload()
      } else {
        console.error('[profile-form] 上传失败:', result.error)
        setMessage({ type: 'error', text: result.error || '上传失败' })
      }
      setAvatarUploadPending(false)
      console.log('[profile-form] 重置 pending 状态')
    })
  }

  const handleDeleteAvatar = () => {
    if (!confirm('确定要删除头像吗？')) return

    startTransition(async () => {
      const result = await deleteAvatar()
      if (result.success) {
        setMessage({ type: 'success', text: '头像已删除' })
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: result.error || '删除失败' })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* 头像卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>头像</CardTitle>
          <CardDescription>上传你的个人头像</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {/* 头像预览 */}
            <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {initialProfile.avatar_url ? (
                <img
                  src={initialProfile.avatar_url}
                  alt={initialProfile.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={avatarUploadPending || isPending}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploadPending || isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {avatarUploadPending ? '上传中...' : '上传头像'}
                </Button>
                {initialProfile.avatar_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAvatar}
                    disabled={avatarUploadPending || isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除头像
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                支持 JPG、PNG、GIF、WebP 格式，最大 2MB
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
          <CardDescription>修改你的个人资料信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 用户名 */}
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              用户名只能包含字母、数字和下划线，长度 3-20 个字符
            </p>
          </div>

          {/* 昵称 */}
          <div className="space-y-2">
            <Label htmlFor="full_name">昵称</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="请输入昵称"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              昵称不能超过 50 个字符
            </p>
          </div>

          {/* 简介 */}
          <div className="space-y-2">
            <Label htmlFor="bio">简介</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="介绍一下自己吧"
              rows={4}
              disabled={isPending}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              简介不能超过 200 个字符
            </p>
          </div>

          {/* 消息提示 */}
          {message && (
            <div
              className={`text-sm ${
                message.type === 'success'
                  ? 'text-green-600'
                  : 'text-destructive'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* 保存按钮 */}
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '保存中...' : '保存更改'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
