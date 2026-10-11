import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './[username]';
import { SupabaseConfigurationError } from '../../server/supabase';

const { getServerSupabaseClientMock } = vi.hoisted(() => ({
  getServerSupabaseClientMock: vi.fn(),
}));

vi.mock('../../server/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../server/supabase')>();
  return {
    ...actual,
    getServerSupabaseClient: getServerSupabaseClientMock,
  };
});

const accountRow = {
  id: 'alice_example',
  username: 'Alice_Example',
  display_name: 'Alice Example',
  category: 'other',
  avatar_url: null,
  avatar_fallback: 'A',
  verified_guess: false,
  tags: [],
  added_at: '2026-10-09',
  notes: null,
};

function makeRequest(path: string, address: string) {
  return new Request(`https://example.test/api/account/${path}`, {
    headers: { 'x-real-ip': address },
  });
}

function setupAccountLookup(data: unknown, error: unknown = null) {
  const maybeSingle = vi.fn().mockResolvedValue({ data, error });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  getServerSupabaseClientMock.mockReturnValue({ from });
  return { from, select, eq, maybeSingle };
}

describe('GET /api/account/:username', () => {
  beforeEach(() => {
    getServerSupabaseClientMock.mockReset();
  });

  it('normalizes the lookup and maps a row with public cache and security headers', async () => {
    const lookup = setupAccountLookup(accountRow);

    const response = await GET(makeRequest('ALICE_Example', '192.0.2.51'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe(
      'public, s-maxage=86400, stale-while-revalidate=3600',
    );
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(lookup.eq).toHaveBeenCalledWith('id', 'alice_example');
    expect(await response.json()).toEqual({
      account: {
        id: 'alice_example',
        username: 'Alice_Example',
        displayName: 'Alice Example',
        category: 'other',
        avatarUrl: null,
        avatarFallback: 'A',
        verifiedGuess: false,
        tags: [],
        addedAt: '2026-10-09',
      },
    });
  });

  it('rejects invalid encoded usernames without querying Supabase', async () => {
    const from = vi.fn();
    getServerSupabaseClientMock.mockReturnValue({ from });

    const response = await GET(makeRequest('%25invalid', '192.0.2.52'));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: 'Invalid account username.',
    });
    expect(from).not.toHaveBeenCalled();
  });

  it('returns a private no-store response when no account exists', async () => {
    setupAccountLookup(null);

    const response = await GET(makeRequest('unknown_account', '192.0.2.53'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ account: null });
  });

  it('returns a generic response for invalid rows and missing configuration', async () => {
    setupAccountLookup({ ...accountRow, category: 'unexpected' });
    const invalidRowResponse = await GET(
      makeRequest('alice_example', '192.0.2.54'),
    );
    getServerSupabaseClientMock.mockImplementation(() => {
      throw new SupabaseConfigurationError();
    });
    const missingConfigResponse = await GET(
      makeRequest('alice_example', '192.0.2.55'),
    );

    expect(invalidRowResponse.status).toBe(502);
    expect(await invalidRowResponse.json()).toEqual({
      error: 'Account details are unavailable.',
    });
    expect(missingConfigResponse.status).toBe(503);
    expect(await missingConfigResponse.json()).toEqual({
      error: 'Account details are unavailable.',
    });
  });

  it('does not expose database errors', async () => {
    setupAccountLookup(null, { message: 'private database detail' });

    const response = await GET(makeRequest('alice_example', '192.0.2.56'));

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Account details are unavailable.',
    });
  });
});
