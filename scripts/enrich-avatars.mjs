import { randomUUID } from 'node:crypto';
import { open, readFile, rename, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import {
  enrichAvatarBatch,
  readBatchSize,
  readDelayMs,
  validateBatchSize,
} from '../server/avatarPipeline.ts';
import {
  getServerSupabaseAdminClient,
  getServerSupabaseClient,
} from '../server/supabase.ts';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = resolve(SCRIPT_DIR, '..');
const STATE_PATH = resolve(PROJECT_DIR, '.avatar-enrichment-state.json');
const LOCK_PATH = `${STATE_PATH}.lock`;
const MAX_DAILY_LIMIT = 25;
const USERNAME_PATTERN = /^[a-zA-Z0-9._]+$/;

function usage() {
  console.log(`Local avatar enrichment

Usage:
  npm run avatars:dry-run
  npm run avatars:batch [-- --batch-size 3]
  npm run avatars:day [-- --batch-size 3]
  node --env-file-if-exists=.env.local --experimental-strip-types scripts/enrich-avatars.mjs --usernames name1,name2

Options:
  --dry-run             Preview eligible usernames without changes or requests
  --batch-size N        Profiles per batch (1-${10}; default: ENRICH_BATCH_SIZE or 3)
  --usernames LIST      Process these exact comma-separated usernames
  --all-for-day         Continue in batches until the local daily cap is reached
  --help                Show this help

Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY for dry runs.
Real runs also require SUPABASE_SERVICE_ROLE_KEY, which must stay private.`);
}

function parseArgs(args) {
  const options = { dryRun: false, allForDay: false };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--all-for-day') {
      options.allForDay = true;
    } else if (arg === '--batch-size' || arg === '--usernames') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${arg}.`);
      }
      index += 1;
      if (arg === '--batch-size') {
        const batchSize = Number(value);
        if (!validateBatchSize(batchSize)) {
          throw new Error('Batch size must be an integer from 1 to 10.');
        }
        options.batchSize = batchSize;
      } else {
        const usernames = value.split(',').map((name) => name.trim());
        if (
          usernames.some((name) => !USERNAME_PATTERN.test(name)) ||
          new Set(usernames.map((name) => name.toLowerCase())).size !==
            usernames.length
        ) {
          throw new Error('Usernames must be valid and unique.');
        }
        options.usernames = usernames;
      }
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.allForDay && options.usernames) {
    throw new Error('--all-for-day cannot be combined with --usernames.');
  }
  if (options.allForDay && options.dryRun) {
    throw new Error('--all-for-day cannot be combined with --dry-run.');
  }
  if (
    options.usernames &&
    options.usernames.length > (options.batchSize ?? readBatchSize())
  ) {
    throw new Error('The username count cannot exceed the batch size.');
  }
  return options;
}

function getDailyLimit() {
  const value = process.env.ENRICH_DAILY_REQUEST_LIMIT;
  const dailyLimit = value === undefined || value === '' ? 12 : Number(value);
  if (
    !Number.isInteger(dailyLimit) ||
    dailyLimit < 1 ||
    dailyLimit > MAX_DAILY_LIMIT
  ) {
    throw new Error(
      `ENRICH_DAILY_REQUEST_LIMIT must be from 1 to ${MAX_DAILY_LIMIT}.`,
    );
  }
  return dailyLimit;
}

function utcDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function loadState(today) {
  let content;
  try {
    content = await readFile(STATE_PATH, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT')
      return { version: 1, utcDate: today, requests: 0, lastRequestAt: null };
    throw error;
  }

  let saved;
  try {
    saved = JSON.parse(content);
  } catch {
    throw new Error(
      'The local quota state file is invalid; inspect or remove it before continuing.',
    );
  }
  if (
    saved?.version !== 1 ||
    typeof saved.utcDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(saved.utcDate) ||
    !Number.isInteger(saved.requests) ||
    saved.requests < 0 ||
    saved.requests > MAX_DAILY_LIMIT ||
    (saved.lastRequestAt !== null &&
      (typeof saved.lastRequestAt !== 'string' ||
        !Number.isFinite(Date.parse(saved.lastRequestAt)))) ||
    saved.utcDate > today
  ) {
    throw new Error(
      'The local quota state file is invalid; inspect or remove it before continuing.',
    );
  }
  return saved.utcDate === today
    ? saved
    : { version: 1, utcDate: today, requests: 0, lastRequestAt: null };
}

async function saveState(state) {
  const temporaryPath = `${STATE_PATH}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writePrivateFile(
      temporaryPath,
      `${JSON.stringify(state, null, 2)}\n`,
    );
    await rename(temporaryPath, STATE_PATH);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function writePrivateFile(path, contents) {
  const file = await open(path, 'wx', 0o600);
  try {
    await file.writeFile(contents, 'utf8');
    await file.sync();
  } finally {
    await file.close();
  }
}

async function acquireLock() {
  try {
    return await open(LOCK_PATH, 'wx', 0o600);
  } catch (error) {
    if (error?.code === 'EEXIST') {
      throw new Error(
        `Another avatar runner may be active. If it is stopped, remove ${LOCK_PATH} and retry.`,
      );
    }
    throw error;
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    usage();
    return;
  }

  const configuredBatchSize = options.batchSize ?? readBatchSize();
  const delayMs = readDelayMs();
  const dailyLimit = options.dryRun ? MAX_DAILY_LIMIT : getDailyLimit();
  let lock;
  try {
    if (!options.dryRun) lock = await acquireLock();
    let state = options.dryRun
      ? {
          version: 1,
          utcDate: utcDate(),
          requests: 0,
          lastRequestAt: null,
        }
      : await loadState(utcDate());
    const remainingQuota = options.dryRun
      ? MAX_DAILY_LIMIT
      : Math.max(0, dailyLimit - state.requests);
    if (!options.dryRun && remainingQuota === 0) {
      console.log(
        JSON.stringify({
          event: 'avatar_day_limit',
          requests: state.requests,
          dailyLimit,
        }),
      );
      return;
    }

    const usernames = options.usernames;
    if (!options.dryRun && usernames && usernames.length > remainingQuota) {
      throw new Error(
        `The remaining local daily quota is ${remainingQuota}; reduce the username list.`,
      );
    }

    const client = options.dryRun
      ? getServerSupabaseClient()
      : getServerSupabaseAdminClient();
    let firstBatch = true;
    while (firstBatch || options.allForDay) {
      firstBatch = false;
      const available = options.dryRun
        ? configuredBatchSize
        : Math.max(0, dailyLimit - state.requests);
      if (available === 0) break;
      const currentBatchSize = usernames
        ? usernames.length
        : Math.min(configuredBatchSize, available);
      const summary = await enrichAvatarBatch({
        client,
        batchSize: currentBatchSize,
        usernames,
        dryRun: options.dryRun,
        delayMs,
        onAttempt: async () => {
          const today = utcDate();
          if (state.utcDate !== today) {
            state = {
              version: 1,
              utcDate: today,
              requests: 0,
              lastRequestAt: null,
            };
          }
          if (state.requests >= dailyLimit) {
            throw new Error('The local daily request limit has been reached.');
          }
          if (state.lastRequestAt) {
            const elapsedMs = Math.max(
              0,
              Date.now() - Date.parse(state.lastRequestAt),
            );
            const remainingDelayMs = Math.max(0, delayMs - elapsedMs);
            if (remainingDelayMs > 0) {
              await sleep(remainingDelayMs);
            }
          }
          state.requests += 1;
          state.lastRequestAt = new Date().toISOString();
          await saveState(state);
        },
        onRateLimited: () => {
          console.log(
            JSON.stringify({
              event: 'avatar_provider_rate_limited',
              action: 'stopped',
            }),
          );
        },
      });
      console.log(
        JSON.stringify({ event: 'avatar_batch_summary', ...summary }),
      );
      if (
        options.dryRun ||
        !options.allForDay ||
        summary.rateLimited ||
        summary.processed === 0 ||
        summary.remaining === 0
      ) {
        break;
      }
    }

    if (!options.dryRun) {
      console.log(
        JSON.stringify({
          event: 'avatar_day_usage',
          requests: state.requests,
          dailyLimit,
        }),
      );
    }
  } finally {
    if (lock) {
      await lock.close();
      await rm(LOCK_PATH, { force: true });
    }
  }
}

run().catch((error) => {
  const message =
    error instanceof Error ? error.message : 'Avatar runner failed.';
  console.error(JSON.stringify({ event: 'avatar_runner_error', message }));
  process.exitCode = 1;
});
