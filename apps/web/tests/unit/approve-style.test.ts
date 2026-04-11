import { describe, it, expect, vi, beforeEach } from 'vitest'
import { approveStyle } from '@/actions/admin/approve-style'
import { rejectStyle } from '@/actions/admin/reject-style'

// Mock dependencies
vi.mock('@/actions/admin/check-admin-role', () => ({
  requireAdmin: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/email-review', () => ({
  sendReviewApprovedEmail: vi.fn(),
  sendReviewRejectedEmail: vi.fn(),
}))

const { requireAdmin } = await import('@/actions/admin/check-admin-role')
const { createClient } = await import('@/lib/supabase/server')
const { sendReviewApprovedEmail, sendReviewRejectedEmail } = await import('@/lib/email-review')

const mockRequireAdmin = vi.mocked(requireAdmin)
const mockCreateClient = vi.mocked(createClient)
const mockSendApprovedEmail = vi.mocked(sendReviewApprovedEmail)
const mockSendRejectedEmail = vi.mocked(sendReviewRejectedEmail)

function makeMockSupabase(
  singleResult: { data: Record<string, unknown> | null; error: unknown | null }
) {
  const chain = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(singleResult),
  }
  return {
    from: vi.fn().mockReturnValue(chain),
  }
}

describe('approveStyle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdmin.mockResolvedValue({ role: 'admin', userId: 'test-admin-uuid' })
  })

  it('should return error when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('PERMISSION_DENIED: 需要管理员权限'))

    const result = await approveStyle({ styleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('需要管理员权限')
  })

  it('should return error for invalid styleId format', async () => {
    const result = await approveStyle({ styleId: 'invalid' })

    expect(result.success).toBe(false)
    expect(result.error).toContain('无效的风格 ID')
  })

  it('should return error when style already reviewed', async () => {
    const mock = makeMockSupabase({ data: null, error: null })
    mockCreateClient.mockResolvedValue(mock as unknown as ReturnType<typeof createClient>)

    const result = await approveStyle({ styleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(result.success).toBe(false)
    expect(result.error).toBe('该风格已被其他管理员审核')
  })

  it('should succeed when approve succeeds', async () => {
    const mockData = { id: 'style-1', author_id: 'author-1', title: 'Test Style' }
    const mock = makeMockSupabase({ data: mockData, error: null })

    // Mock profile query (email sending will fail gracefully)
    const profileChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: new Error('mock: profile not found'),
      }),
    }
    ;(mock as unknown as Record<string, unknown>).from = vi
      .fn()
      .mockImplementation((table: string) => (table === 'styles' ? {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      } : profileChain))

    mockCreateClient.mockResolvedValue(mock as unknown as ReturnType<typeof createClient>)

    const result = await approveStyle({ styleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })
})

describe('rejectStyle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireAdmin.mockResolvedValue({ role: 'admin', userId: 'test-admin-uuid' })
  })

  it('should return error when not admin', async () => {
    mockRequireAdmin.mockRejectedValue(new Error('PERMISSION_DENIED: 需要管理员权限'))

    const result = await rejectStyle({
      styleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      reviewNotes: 'test',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('需要管理员权限')
  })

  it('should return error when style already reviewed', async () => {
    const mock = makeMockSupabase({ data: null, error: null })
    mockCreateClient.mockResolvedValue(mock as unknown as ReturnType<typeof createClient>)

    const result = await rejectStyle({
      styleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      reviewNotes: '配色不完整',
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('该风格已被其他管理员审核')
  })

  it('should succeed when reject succeeds', async () => {
    const mockData = { id: 'style-1', author_id: 'author-1', title: 'Test Style' }
    const mock = makeMockSupabase({ data: mockData, error: null })

    const profileChain = {
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('no profile') }),
    }
    ;(mock as unknown as Record<string, unknown>).from = vi
      .fn()
      .mockImplementation((table: string) => (table === 'styles' ? {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
      } : profileChain))

    mockCreateClient.mockResolvedValue(mock as unknown as ReturnType<typeof createClient>)

    const result = await rejectStyle({
      styleId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      reviewNotes: '配色不完整',
    })

    expect(result.success).toBe(true)
    expect(result.error).toBeUndefined()
  })
})
