import { z } from 'zod';
import { jsonResponse } from './http';
import { isAdminAuthorized, isCronAuthorized } from './avatarAuth';
import {
  AVATAR_MAX_BATCH_SIZE,
  AvatarPipelineError,
  enrichAvatarBatch,
  readBatchSize,
  readDelayRange,
} from './avatarPipeline';
import {
  getServerSupabaseAdminClient,
  SupabaseConfigurationError,
} from './supabase';

type RuntimeGlobal = typeof globalThis & {
  process?: { env?: Record<string, string | undefined> };
};

const usernameSchema = z.string().regex(/^[A-Za-z0-9._]{1,30}$/);
const commandSchema = z
  .object({
    batchSize: z.number().int().min(1).max(AVATAR_MAX_BATCH_SIZE).optional(),
    usernames: z
      .array(usernameSchema)
      .min(1)
      .max(AVATAR_MAX_BATCH_SIZE)
      .refine(
        (usernames) =>
          new Set(usernames.map((username) => username.toLowerCase())).size ===
          usernames.length,
        'Usernames must be unique.',
      )
      .optional(),
  })
  .strict();

class InvalidRequestError extends Error {}

function getEnvironment(): Record<string, string | undefined> {
  return (globalThis as RuntimeGlobal).process?.env ?? {};
}

function parseDryRun(url: URL): boolean {
  const values = url.searchParams.getAll('dryRun');
  if (
    values.length > 1 ||
    (values.length === 1 && values[0] !== '1' && values[0] !== '0') ||
    [...url.searchParams.keys()].some((key) => key !== 'dryRun')
  ) {
    throw new InvalidRequestError();
  }
  return values[0] === '1';
}

async function readAdminCommand(request: Request) {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    throw new InvalidRequestError();
  }

  const bodyText = await request.text();
  if (bodyText.length > 16_384) {
    throw new InvalidRequestError();
  }

  let rawBody: unknown = {};
  if (bodyText.trim()) {
    try {
      rawBody = JSON.parse(bodyText);
    } catch {
      throw new InvalidRequestError();
    }
  }
  const parsed = commandSchema.safeParse(rawBody);
  if (!parsed.success) {
    throw new InvalidRequestError();
  }
  return parsed.data;
}

async function execute(request: Request, mode: 'cron' | 'admin') {
  const env = getEnvironment();
  const authorized =
    mode === 'cron'
      ? isCronAuthorized(request, env.CRON_SECRET)
      : isAdminAuthorized(request, env.ADMIN_SECRET);
  if (!authorized) {
    return jsonResponse({ error: 'Unauthorized.' }, 401, 'no-store');
  }

  try {
    const url = new URL(request.url);
    const dryRun = parseDryRun(url);
    const command =
      mode === 'admin' ? await readAdminCommand(request) : undefined;
    const batchSize = command?.batchSize ?? readBatchSize();
    const delays = readDelayRange();
    const summary = await enrichAvatarBatch({
      client: getServerSupabaseAdminClient(),
      batchSize,
      usernames: command?.usernames,
      dryRun,
      delayMinMs: delays.min,
      delayMaxMs: delays.max,
    });
    return jsonResponse(summary, 200, 'no-store');
  } catch (error: unknown) {
    if (error instanceof InvalidRequestError) {
      return jsonResponse(
        { error: 'Invalid enrichment request.' },
        400,
        'no-store',
      );
    }
    if (error instanceof SupabaseConfigurationError) {
      return jsonResponse(
        { error: 'Avatar enrichment is not configured.' },
        503,
        'no-store',
      );
    }
    if (error instanceof AvatarPipelineError) {
      return jsonResponse(
        { error: 'Avatar enrichment is temporarily unavailable.' },
        502,
        'no-store',
      );
    }
    return jsonResponse(
      { error: 'Avatar enrichment is temporarily unavailable.' },
      502,
      'no-store',
    );
  }
}

export function handleCronAvatarRequest(request: Request): Promise<Response> {
  return execute(request, 'cron');
}

export function handleAdminAvatarRequest(request: Request): Promise<Response> {
  return execute(request, 'admin');
}
