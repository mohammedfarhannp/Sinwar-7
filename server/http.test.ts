import { describe, expect, it } from 'vitest';
import { checkApiRateLimit, jsonResponse } from './http';

describe('jsonResponse', () => {
  it('sets no-store and security headers by default', () => {
    const response = jsonResponse({ ok: true });

    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });
});

describe('checkApiRateLimit', () => {
  it('returns 429 with a retry delay after the per-IP allowance is used', async () => {
    const address = '192.0.2.240';
    const makeRequest = () =>
      new Request('https://example.test/api/search', {
        headers: { 'x-real-ip': address },
      });

    for (let requestNumber = 0; requestNumber < 60; requestNumber += 1) {
      expect(checkApiRateLimit(makeRequest())).toBeUndefined();
    }

    const response = checkApiRateLimit(makeRequest());
    expect(response?.status).toBe(429);
    expect(response?.headers.get('Cache-Control')).toBe('no-store');
    expect(response?.headers.get('Retry-After')).toMatch(/^\d+$/);
    expect(response?.headers.get('X-Content-Type-Options')).toBe('nosniff');
    await expect(response?.json()).resolves.toEqual({
      error: 'Too many requests. Please try again shortly.',
    });
  });
});
