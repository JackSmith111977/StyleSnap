import { ImageResponse } from 'next/og'
import { getStyle } from '@/actions/styles'

/**
 * 动态 Open Graph 图片生成
 * 为每个风格详情页生成独立的分享图片
 */
export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params

    // 验证 ID 格式和长度
    if (!id || id.length < 8) {
      return new Response('Invalid style ID', { status: 400 })
    }

    const style = await getStyle(id)

    if (!style) {
      return new Response('风格不存在', { status: 404 })
    }

    // 获取预览图（如果有）
    const previewImages = style.preview_images as { light?: string; dark?: string } | null
    const previewUrl = previewImages?.light || null

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* 顶部品牌栏 */}
          <div
            style={{
              width: '100%',
              height: '80px',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '40px',
            }}
          >
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              StyleSnap
            </span>
          </div>

          {/* 主体内容 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              padding: '40px',
            }}
          >
            {/* 风格标题 */}
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#1a1a1a',
                textAlign: 'center',
              }}
            >
              {style.title}
            </span>

            {/* 风格描述 */}
            {style.description && (
              <span
                style={{
                  fontSize: '28px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  color: '#666666',
                  textAlign: 'center',
                  maxWidth: '800px',
                }}
              >
                {style.description.length > 100
                  ? `${style.description.substring(0, 100)}...`
                  : style.description}
              </span>
            )}
          </div>

          {/* 底部二维码提示 */}
          <div
            style={{
              width: '100%',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontSize: '20px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#1a1a1a',
              }}
            >
              扫码查看详情
            </span>
            <span
              style={{
                fontSize: '14px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                color: '#999999',
              }}
            >
              stylesnap.com/styles/{style.id.length >= 8 ? style.id.substring(0, 8) : style.id}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error: unknown) {
    console.error('Open Graph 图片生成失败:', error)
    return new Response('生成失败', { status: 500 })
  }
}
