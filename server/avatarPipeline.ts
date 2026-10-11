import { Buffer } from 'node:buffer';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccountRow, Database } from './database.types';

export const AVATAR_MAX_BATCH_SIZE = 10;
export const AVATAR_MAX_ATTEMPTS = 5;

const AVATAR_BUCKET = 'avatars';
const IMAGE_TIMEOUT_MS = 10_000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 40_000_000;
const CLAIM_LEASE_MS = 10 * 60 * 1000;
const SELECT_COLUMNS =
  'id, username, avatar_status, avatar_attempts, avatar_last_attempt_at';

type AvatarStatus = AccountRow['avatar_status'];
type AvatarCandidate = Pick<
  AccountRow,
  | 'id'
  | 'username'
  | 'avatar_status'
  | 'avatar_attempts'
  | 'avatar_last_attempt_at'
>;
type AvatarClient = SupabaseClient<Database>;

export interface AvatarBatchSelection {
  rows: AvatarCandidate[];
  skipped: number;
  remaining: number;
}

export interface AvatarBatchOptions {
  client: AvatarClient;
  batchSize: number;
  usernames?: string[];
  dryRun?: boolean;
  fetchImpl?: typeof fetch;
  delayMinMs?: number;
  delayMaxMs?: number;
  random?: () => number;
  sleep?: (durationMs: number) => Promise<void>;
  now?: () => Date;
  log?: (event: AvatarFetchLog) => void;
}

export interface AvatarFetchLog {
  event: 'avatar_fetch';
  username: string;
  status: 'fetched' | 'failed' | 'skipped';
  durationMs: number;
}

export interface AvatarBatchSummary {
  processed: number;
  fetched: number;
  failed: number;
  skipped: number;
  remaining: number;
  preview?: string[];
}

export class AvatarPipelineError extends Error {
  constructor() {
    super('Avatar enrichment is temporarily unavailable.');
    this.name = 'AvatarPipelineError';
  }
}

export function validateBatchSize(value: number): boolean {
  return (
    Number.isInteger(value) && value >= 1 && value <= AVATAR_MAX_BATCH_SIZE
  );
}

export async function selectAvatarBatch(
  client: AvatarClient,
  batchSize: number,
  usernames?: string[],
  now = new Date(),
): Promise<AvatarBatchSelection> {
  if (!validateBatchSize(batchSize)) {
    throw new AvatarPipelineError();
  }

  const leaseCutoff = new Date(now.getTime() - CLAIM_LEASE_MS).toISOString();
  let selectionQuery = client
    .from('accounts')
    .select(SELECT_COLUMNS)
    .in('avatar_status', ['pending', 'failed'])
    .lt('avatar_attempts', AVATAR_MAX_ATTEMPTS)
    .or(
      `avatar_last_attempt_at.is.null,avatar_last_attempt_at.lt.${leaseCutoff}`,
    );

  if (usernames) {
    const orderedIds = usernames.map((username) => username.toLowerCase());
    selectionQuery = selectionQuery.in('id', orderedIds);
  } else {
    selectionQuery = selectionQuery
      .order('avatar_attempts', { ascending: true })
      .order('avatar_last_attempt_at', {
        ascending: true,
        nullsFirst: true,
      })
      .limit(batchSize);
  }

  const [selectionResult, countResult] = await Promise.all([
    selectionQuery,
    client
      .from('accounts')
      .select('id', { count: 'exact', head: true })
      .in('avatar_status', ['pending', 'failed'])
      .lt('avatar_attempts', AVATAR_MAX_ATTEMPTS),
  ]);

  if (selectionResult.error || countResult.error) {
    throw new AvatarPipelineError();
  }

  let rows = (selectionResult.data ?? []) as AvatarCandidate[];
  if (usernames) {
    const rowsById = new Map(rows.map((row) => [row.id, row]));
    rows = usernames.flatMap((username) => {
      const row = rowsById.get(username.toLowerCase());
      return row ? [row] : [];
    });
  }

  return {
    rows,
    skipped: usernames ? usernames.length - rows.length : 0,
    remaining: countResult.count ?? 0,
  };
}

function getEnv(): Record<string, string | undefined> {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env ?? {};
}

export function readBatchSize(value = getEnv().ENRICH_BATCH_SIZE): number {
  if (value === undefined || value === '') {
    return 3;
  }

  const batchSize = Number(value);
  if (!validateBatchSize(batchSize)) {
    throw new AvatarPipelineError();
  }
  return batchSize;
}

export function readDelayRange(
  minValue = getEnv().ENRICH_DELAY_MS_MIN,
  maxValue = getEnv().ENRICH_DELAY_MS_MAX,
): { min: number; max: number } {
  const min =
    minValue === undefined || minValue === '' ? 2000 : Number(minValue);
  const max =
    maxValue === undefined || maxValue === '' ? 3000 : Number(maxValue);
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    min < 0 ||
    max < min ||
    max > 10_000
  ) {
    throw new AvatarPipelineError();
  }
  return { min, max };
}

function defaultSleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

function defaultLogger(event: AvatarFetchLog): void {
  console.log(JSON.stringify(event));
}

async function countRemaining(client: AvatarClient): Promise<number> {
  const { count, error } = await client
    .from('accounts')
    .select('id', { count: 'exact', head: true })
    .in('avatar_status', ['pending', 'failed'])
    .lt('avatar_attempts', AVATAR_MAX_ATTEMPTS);
  if (error) {
    throw new AvatarPipelineError();
  }
  return count ?? 0;
}

interface ClaimedAvatar {
  id: string;
  username: string;
  attempts: number;
}

async function claimAvatar(
  client: AvatarClient,
  row: AvatarCandidate,
  now: Date,
): Promise<ClaimedAvatar | null> {
  const leaseCutoff = new Date(now.getTime() - CLAIM_LEASE_MS).toISOString();
  const { data, error } = await client
    .from('accounts')
    .update({
      avatar_attempts: row.avatar_attempts + 1,
      avatar_last_attempt_at: now.toISOString(),
      avatar_error: null,
    })
    .eq('id', row.id)
    .eq('avatar_attempts', row.avatar_attempts)
    .in('avatar_status', ['pending', 'failed'])
    .or(
      `avatar_last_attempt_at.is.null,avatar_last_attempt_at.lt.${leaseCutoff}`,
    )
    .select('id, username, avatar_attempts')
    .maybeSingle();

  if (error) {
    throw new AvatarPipelineError();
  }
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    username: data.username,
    attempts: data.avatar_attempts,
  };
}

async function writeAvatarResult(
  client: AvatarClient,
  avatar: ClaimedAvatar,
  status: Extract<AvatarStatus, 'fetched' | 'failed'>,
  attemptedAt: Date,
  values: { avatarUrl?: string; error?: string } = {},
): Promise<void> {
  const { data, error } = await client
    .from('accounts')
    .update({
      avatar_url: status === 'fetched' ? (values.avatarUrl ?? null) : null,
      avatar_status: status,
      avatar_attempts: avatar.attempts,
      avatar_last_attempt_at: attemptedAt.toISOString(),
      avatar_error:
        status === 'failed' ? (values.error ?? 'fetch_failed') : null,
    })
    .eq('id', avatar.id)
    .eq('avatar_attempts', avatar.attempts)
    .select('id')
    .maybeSingle();

  if (error || !data) {
    throw new AvatarPipelineError();
  }
}

async function readBoundedImage(response: Response): Promise<Buffer> {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
    await response.body?.cancel();
    throw new Error('image_too_large');
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('empty_image');
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      total += value.byteLength;
      if (total > MAX_IMAGE_BYTES) {
        await reader.cancel();
        throw new Error('image_too_large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  if (total === 0) {
    throw new Error('empty_image');
  }

  return Buffer.concat(
    chunks.map((chunk) => Buffer.from(chunk)),
    total,
  );
}

type FetchResult =
  | { kind: 'image'; bytes: Buffer }
  | { kind: 'error'; code: string; rateLimited?: boolean };

async function fetchAvatar(
  username: string,
  fetchImpl: typeof fetch,
): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);
  try {
    const response = await fetchImpl(
      `https://unavatar.io/instagram/${encodeURIComponent(username)}?fallback=false`,
      { signal: controller.signal, headers: { accept: 'image/*' } },
    );
    if (response.status === 429) {
      await response.body?.cancel();
      return { kind: 'error', code: 'rate_limited', rateLimited: true };
    }
    if (response.status !== 200) {
      await response.body?.cancel();
      return { kind: 'error', code: `http_${response.status}` };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!/^image\//i.test(contentType)) {
      await response.body?.cancel();
      return { kind: 'error', code: 'unexpected_content_type' };
    }

    try {
      return { kind: 'image', bytes: await readBoundedImage(response) };
    } catch (error) {
      return {
        kind: 'error',
        code: error instanceof Error ? error.message : 'invalid_image_body',
      };
    }
  } catch (error) {
    return {
      kind: 'error',
      code:
        error instanceof Error && error.name === 'AbortError'
          ? 'timeout'
          : 'request_failed',
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function processAvatar(
  client: AvatarClient,
  avatar: ClaimedAvatar,
  fetchImpl: typeof fetch,
  now: () => Date,
): Promise<{ status: 'fetched' | 'failed'; rateLimited: boolean }> {
  const attemptedAt = now();
  const result = await fetchAvatar(avatar.username, fetchImpl);
  if (result.kind === 'error') {
    await writeAvatarResult(client, avatar, 'failed', attemptedAt, {
      error: result.code.slice(0, 100),
    });
    return { status: 'failed', rateLimited: result.rateLimited ?? false };
  }

  let webp: Buffer;
  try {
    webp = await sharp(result.bytes, {
      limitInputPixels: MAX_IMAGE_PIXELS,
      failOn: 'error',
    })
      .rotate()
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    await writeAvatarResult(client, avatar, 'failed', attemptedAt, {
      error: 'invalid_image',
    });
    return { status: 'failed', rateLimited: false };
  }

  const objectPath = `${avatar.username}.webp`;
  const { error: uploadError } = await client.storage
    .from(AVATAR_BUCKET)
    .upload(objectPath, webp, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: true,
    });
  if (uploadError) {
    await writeAvatarResult(client, avatar, 'failed', attemptedAt, {
      error: 'storage_upload_failed',
    });
    return { status: 'failed', rateLimited: false };
  }

  const { data } = client.storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
  await writeAvatarResult(client, avatar, 'fetched', attemptedAt, {
    avatarUrl: data.publicUrl,
  });
  return { status: 'fetched', rateLimited: false };
}

export async function enrichAvatarBatch(
  options: AvatarBatchOptions,
): Promise<AvatarBatchSummary & { preview?: string[] }> {
  const selection = await selectAvatarBatch(
    options.client,
    options.batchSize,
    options.usernames,
    options.now?.() ?? new Date(),
  );

  if (options.dryRun) {
    return {
      processed: 0,
      fetched: 0,
      failed: 0,
      skipped: selection.skipped,
      remaining: selection.remaining,
      preview: selection.rows.map((row) => row.username),
    };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date());
  const sleep = options.sleep ?? defaultSleep;
  const random = options.random ?? Math.random;
  const log = options.log ?? defaultLogger;
  const delayMin = options.delayMinMs ?? readDelayRange().min;
  const delayMax = options.delayMaxMs ?? readDelayRange().max;
  let processed = 0;
  let fetched = 0;
  let failed = 0;
  let skipped = selection.skipped;

  for (let index = 0; index < selection.rows.length; index += 1) {
    const row = selection.rows[index];
    const startedAt = Date.now();
    let claimed: ClaimedAvatar | null;
    try {
      claimed = await claimAvatar(options.client, row, now());
    } catch {
      skipped += 1;
      log({
        event: 'avatar_fetch',
        username: row.username,
        status: 'skipped',
        durationMs: Date.now() - startedAt,
      });
      continue;
    }

    if (!claimed) {
      skipped += 1;
      log({
        event: 'avatar_fetch',
        username: row.username,
        status: 'skipped',
        durationMs: Date.now() - startedAt,
      });
      continue;
    }

    processed += 1;
    let outcome: { status: 'fetched' | 'failed'; rateLimited: boolean };
    try {
      outcome = await processAvatar(options.client, claimed, fetchImpl, now);
    } catch {
      failed += 1;
      try {
        await writeAvatarResult(options.client, claimed, 'failed', now(), {
          error: 'processing_failed',
        });
      } catch {
        // The claim lease allows recovery if Storage or Postgres is unavailable.
      }
      log({
        event: 'avatar_fetch',
        username: row.username,
        status: 'failed',
        durationMs: Date.now() - startedAt,
      });
      continue;
    }

    if (outcome.status === 'fetched') {
      fetched += 1;
    } else {
      failed += 1;
    }
    log({
      event: 'avatar_fetch',
      username: row.username,
      status: outcome.status,
      durationMs: Date.now() - startedAt,
    });

    if (outcome.rateLimited) {
      const unprocessed = selection.rows.slice(index + 1);
      skipped += unprocessed.length;
      for (const skippedRow of unprocessed) {
        log({
          event: 'avatar_fetch',
          username: skippedRow.username,
          status: 'skipped',
          durationMs: 0,
        });
      }
      break;
    }

    if (index < selection.rows.length - 1) {
      const delay = delayMin + Math.floor(random() * (delayMax - delayMin + 1));
      await sleep(delay);
    }
  }

  return {
    processed,
    fetched,
    failed,
    skipped,
    remaining: await countRemaining(options.client),
  };
}
