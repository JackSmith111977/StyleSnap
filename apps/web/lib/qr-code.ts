/**
 * 二维码生成工具
 * 使用 qrcode-generator 库生成二维码
 */

import qr from 'qrcode-generator'

/**
 * 二维码配置
 */
export interface QRCodeOptions {
  size?: number // 二维码尺寸（默认 256）
  margin?: number // 边距（默认 4）
  level?: 'L' | 'M' | 'Q' | 'H' // 容错级别
}

/**
 * 生成二维码 SVG
 * @param url - 二维码内容（URL）
 * @param options - 配置选项
 * @returns SVG 字符串
 */
export function generateQRCodeSVG(url: string, options: QRCodeOptions = {}): string {
  const {
    size = 256,
    margin = 4,
    level = 'M',
  } = options

  // 创建二维码实例
  const qrInstance = qr(0, level)
  qrInstance.addData(url)
  qrInstance.make()

  // 生成 SVG
  return qrInstance.createSvgTag({
    cellSize: size / (qrInstance.getModuleCount() + margin * 2),
    margin: margin,
    scalable: true,
  })
}

/**
 * 生成二维码 Canvas
 * @param url - 二维码内容（URL）
 * @param options - 配置选项
 * @returns Canvas 元素
 */
export function generateQRCodeCanvas(
  url: string,
  options: QRCodeOptions = {}
): HTMLCanvasElement | null {
  const {
    size = 256,
    margin = 4,
    level = 'M',
  } = options

  try {
    const qrInstance = qr(0, level)
    qrInstance.addData(url)
    qrInstance.make()

    const canvas = document.createElement('canvas')
    const cellSize = size / (qrInstance.getModuleCount() + margin * 2)
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // 填充背景（白色）
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // 绘制二维码
    ctx.fillStyle = '#000000'
    for (let row = 0; row < qrInstance.getModuleCount(); row++) {
      for (let col = 0; col < qrInstance.getModuleCount(); col++) {
        if (qrInstance.isDark(row, col)) {
          ctx.fillRect(
            (col + margin) * cellSize,
            (row + margin) * cellSize,
            cellSize,
            cellSize
          )
        }
      }
    }

    return canvas
  } catch (err) {
    console.error('二维码生成失败:', err)
    return null
  }
}

/**
 * 生成二维码图片 URL（Base64）
 * @param url - 二维码内容（URL）
 * @param options - 配置选项
 * @returns Base64 图片 URL
 */
export function generateQRCodeDataURL(url: string, options: QRCodeOptions = {}): string | null {
  if (typeof window === 'undefined') {
    return null // SSR 环境不支持
  }

  const canvas = generateQRCodeCanvas(url, options)
  if (!canvas) {
    return null
  }

  return canvas.toDataURL('image/png')
}

/**
 * 下载二维码图片
 * @param url - 二维码内容（URL）
 * @param filename - 文件名
 * @param options - 配置选项
 */
export function downloadQRCode(
  url: string,
  filename: string = 'qrcode.png',
  options: QRCodeOptions = {}
): void {
  if (typeof window === 'undefined') {
    return // SSR 环境不支持
  }

  const canvas = generateQRCodeCanvas(url, options)
  if (!canvas) {
    return
  }

  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}
