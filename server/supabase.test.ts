import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getServerSupabaseClient,
  SupabaseConfigurationError,
} from './supabase';

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({ createClient: createClientMock }));

describe('getServerSupabaseClient', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    createClientMock.mockReset();
  });

  it('requires and uses the publishable key without accepting an elevated key', () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
    vi.stubEnv('SUPABASE_SECRET_KEY', 'sb_secret_must_not_be_used');

    expect(() => getServerSupabaseClient()).toThrow(SupabaseConfigurationError);
    expect(createClientMock).not.toHaveBeenCalled();

    const client = { marker: 'client' };
    createClientMock.mockReturnValue(client);
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_example');

    expect(getServerSupabaseClient()).toBe(client);
    expect(getServerSupabaseClient()).toBe(client);
    expect(createClientMock).toHaveBeenCalledOnce();
    expect(createClientMock).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'sb_publishable_example',
      {
        auth: {
          autoRefreshToken: false,
          detectSessionInUrl: false,
          persistSession: false,
        },
      },
    );
  });
});
