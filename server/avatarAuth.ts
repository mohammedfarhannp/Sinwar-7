import { timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';

export function matchesSecret(
  suppliedValue: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!suppliedValue || !expectedSecret) {
    return false;
  }

  const supplied = Buffer.from(suppliedValue, 'utf8');
  const expected = Buffer.from(expectedSecret, 'utf8');
  if (supplied.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(supplied, expected);
}

export function isCronAuthorized(
  request: Request,
  cronSecret: string | undefined,
): boolean {
  return matchesSecret(
    request.headers.get('authorization'),
    cronSecret ? `Bearer ${cronSecret}` : undefined,
  );
}

export function isAdminAuthorized(
  request: Request,
  adminSecret: string | undefined,
): boolean {
  return matchesSecret(request.headers.get('x-admin-secret'), adminSecret);
}
