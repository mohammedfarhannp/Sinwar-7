import { describe, expect, it } from 'vitest';
import { isAdminAuthorized, isCronAuthorized } from './avatarAuth';

describe('avatar route authentication', () => {
  it('accepts the configured admin secret header', () => {
    const request = new Request('https://example.test/api/admin/enrich', {
      headers: { 'x-admin-secret': 'correct-secret' },
    });

    expect(isAdminAuthorized(request, 'correct-secret')).toBe(true);
  });

  it('rejects a wrong admin secret', () => {
    const request = new Request('https://example.test/api/admin/enrich', {
      headers: { 'x-admin-secret': 'wrong-secret' },
    });

    expect(isAdminAuthorized(request, 'correct-secret')).toBe(false);
  });

  it('rejects a missing admin header or missing server secret', () => {
    const request = new Request('https://example.test/api/admin/enrich');

    expect(isAdminAuthorized(request, 'correct-secret')).toBe(false);
    expect(isAdminAuthorized(request, undefined)).toBe(false);
  });

  it('accepts only the configured bearer token for cron', () => {
    const authorized = new Request('https://example.test/api/cron/enrich', {
      headers: { authorization: 'Bearer cron-secret' },
    });
    const wrong = new Request('https://example.test/api/cron/enrich', {
      headers: { authorization: 'Bearer other-secret' },
    });
    const missing = new Request('https://example.test/api/cron/enrich');

    expect(isCronAuthorized(authorized, 'cron-secret')).toBe(true);
    expect(isCronAuthorized(wrong, 'cron-secret')).toBe(false);
    expect(isCronAuthorized(missing, 'cron-secret')).toBe(false);
  });
});
