import { beforeEach, describe, expect, it, vi } from 'vitest';

const { enrichAvatarBatchMock, getAdminClientMock } = vi.hoisted(() => ({
  enrichAvatarBatchMock: vi.fn(),
  getAdminClientMock: vi.fn(),
}));

vi.mock('./supabase', () => ({
  getServerSupabaseAdminClient: getAdminClientMock,
  SupabaseConfigurationError: class SupabaseConfigurationError extends Error {},
}));

vi.mock('./avatarPipeline', () => ({
  AVATAR_MAX_BATCH_SIZE: 10,
  AvatarPipelineError: class AvatarPipelineError extends Error {},
  enrichAvatarBatch: enrichAvatarBatchMock,
  readBatchSize: vi.fn(() => 3),
  readDelayRange: vi.fn(() => ({ min: 2000, max: 3000 })),
}));

import { handleAdminAvatarRequest } from './avatarRoute';

describe('handleAdminAvatarRequest', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv('ADMIN_SECRET', 'admin-secret');
    getAdminClientMock.mockReset();
    getAdminClientMock.mockReturnValue({ marker: 'admin-client' });
    enrichAvatarBatchMock.mockReset();
  });

  it('rejects missing and wrong admin headers before creating a client', async () => {
    const missing = await handleAdminAvatarRequest(
      new Request('https://example.test/api/admin/enrich-avatars', {
        method: 'POST',
      }),
    );
    const wrong = await handleAdminAvatarRequest(
      new Request('https://example.test/api/admin/enrich-avatars', {
        method: 'POST',
        headers: { 'x-admin-secret': 'wrong-secret' },
      }),
    );

    expect(missing.status).toBe(401);
    expect(wrong.status).toBe(401);
    expect(getAdminClientMock).not.toHaveBeenCalled();
    expect(enrichAvatarBatchMock).not.toHaveBeenCalled();
  });

  it('returns the dry-run preview for an authorized request', async () => {
    enrichAvatarBatchMock.mockResolvedValue({
      processed: 0,
      fetched: 0,
      failed: 0,
      skipped: 0,
      remaining: 4,
      preview: ['first', 'second', 'third'],
    });
    const response = await handleAdminAvatarRequest(
      new Request('https://example.test/api/admin/enrich-avatars?dryRun=1', {
        method: 'POST',
        headers: {
          'x-admin-secret': 'admin-secret',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ batchSize: 3 }),
      }),
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      processed: 0,
      fetched: 0,
      failed: 0,
      skipped: 0,
      remaining: 4,
      preview: ['first', 'second', 'third'],
    });
    expect(enrichAvatarBatchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        client: { marker: 'admin-client' },
        batchSize: 3,
        dryRun: true,
        delayMinMs: 2000,
        delayMaxMs: 3000,
      }),
    );
  });
});
