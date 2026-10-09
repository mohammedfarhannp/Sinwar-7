const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_BUCKET_LIMIT = 5_000;

type RateLimitBucket = { resetAt: number; count: number };
const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function jsonResponse(
  body: unknown,
  status = 200,
  cacheControl = 'no-store',
  additionalHeaders?: Record<string, string>,
): Response {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': cacheControl,
      'Referrer-Policy': 'no-referrer',
      'X-Content-Type-Options': 'nosniff',
      ...additionalHeaders,
    },
  });
}

function getClientAddress(request: Request): string {
  const directAddress = request.headers.get('x-real-ip')?.trim();
  if (directAddress) {
    return directAddress;
  }

  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  );
}

export function checkApiRateLimit(request: Request): Response | undefined {
  const now = Date.now();
  const address = getClientAddress(request);
  let existingBucket = rateLimitBuckets.get(address);

  if (!existingBucket && rateLimitBuckets.size >= RATE_LIMIT_BUCKET_LIMIT) {
    for (const [bucketAddress, bucket] of rateLimitBuckets) {
      if (bucket.resetAt <= now) {
        rateLimitBuckets.delete(bucketAddress);
      }
    }

    while (rateLimitBuckets.size >= RATE_LIMIT_BUCKET_LIMIT) {
      const oldestAddress = rateLimitBuckets.keys().next().value;
      if (oldestAddress === undefined) {
        break;
      }
      rateLimitBuckets.delete(oldestAddress);
    }
  }

  existingBucket = rateLimitBuckets.get(address);
  if (!existingBucket || existingBucket.resetAt <= now) {
    rateLimitBuckets.set(address, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return undefined;
  }

  if (existingBucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existingBucket.resetAt - now) / 1_000),
    );
    return jsonResponse(
      { error: 'Too many requests. Please try again shortly.' },
      429,
      'no-store',
      { 'Retry-After': String(retryAfterSeconds) },
    );
  }

  existingBucket.count += 1;
  return undefined;
}
