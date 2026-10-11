import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './search';
import { SupabaseConfigurationError } from '../server/supabase';

const { getServerSupabaseClientMock } = vi.hoisted(() => ({
  getServerSupabaseClientMock: vi.fn(),
}));

vi.mock('../server/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../server/supabase')>();
  return {
    ...actual,
    getServerSupabaseClient: getServerSupabaseClientMock,
  };
});

const account = {
  id: 'alice_example',
  username: 'alice_example',
  displayName: 'Alice Example',
  category: 'other',
  avatarUrl: null,
  avatarFallback: 'A',
  verifiedGuess: false,
  tags: [],
  addedAt: '2026-10-09',
};

function makeRequest(path: string, address: string) {
  return new Request(`https://example.test${path}`, {
    headers: { 'x-real-ip': address },
  });
}

describe('GET /api/search', () => {
  beforeEach(() => {
    getServerSupabaseClientMock.mockReset();
  });

  it('normalizes the query and returns validated, uncached results', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { results: [account], total: 1 },
      error: null,
    });
    getServerSupabaseClientMock.mockReturnValue({ rpc });

    const response = await GET(
      makeRequest(
        '/api/search?q=%40ALICE_Example&category=all&limit=5&offset=2',
        '192.0.2.41',
      ),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(await response.json()).toEqual({ results: [account], total: 1 });
    expect(rpc).toHaveBeenCalledWith('search_accounts', {
      search_query: 'alice_example',
      category_filter: null,
      result_limit: 5,
      result_offset: 2,
    });
  });

  it('rejects unknown and repeated query keys before calling Supabase', async () => {
    const rpc = vi.fn();
    getServerSupabaseClientMock.mockReturnValue({ rpc });

    const unknownKey = await GET(
      makeRequest('/api/search?q=alice&debug=true', '192.0.2.42'),
    );
    const repeatedKey = await GET(
      makeRequest('/api/search?q=alice&q=other', '192.0.2.43'),
    );

    expect(unknownKey.status).toBe(400);
    expect(repeatedKey.status).toBe(400);
    expect(await unknownKey.json()).toEqual({
      error: 'Invalid search parameters.',
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('returns a generic unavailable response for upstream errors', async () => {
    getServerSupabaseClientMock.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'private database detail' },
      }),
    });

    const response = await GET(
      makeRequest('/api/search?q=alice', '192.0.2.44'),
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: 'Search is temporarily unavailable.',
    });
  });

  it('returns a generic configuration response without leaking input', async () => {
    getServerSupabaseClientMock.mockImplementation(() => {
      throw new SupabaseConfigurationError();
    });

    const response = await GET(
      makeRequest('/api/search?q=privatequery', '192.0.2.45'),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error: 'Search is temporarily unavailable.',
    });
  });
});
