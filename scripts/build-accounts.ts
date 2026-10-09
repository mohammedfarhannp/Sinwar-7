import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { accountsSchema } from '../src/types/account.ts';
import {
  cleanAccountSource,
  exceedsAccountDropLimit,
  MAXIMUM_DATASET_DROP_RATIO,
} from '../src/lib/accountCleaning.ts';
import { z } from 'zod';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = resolve(PROJECT_ROOT, 'data/raw/accounts_to_block.txt');
const ACCOUNTS_PATH = resolve(PROJECT_ROOT, 'src/data/accounts.json');
const REPORT_PATH = resolve(PROJECT_ROOT, 'data/reports/cleaning-report.json');
const BASELINE_PATH = resolve(
  PROJECT_ROOT,
  'data/reports/account-count-baseline.json',
);
const baselineSchema = z.object({
  version: z.literal(1),
  successfulAccountCount: z.number().int().nonnegative(),
  lastValidatedAt: z.iso.datetime().optional(),
});

async function readPreviousCount(): Promise<number | null> {
  let baselineContents: string | null = null;
  try {
    baselineContents = await readFile(BASELINE_PATH, 'utf8');
  } catch (error) {
    if (!(
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    )) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not read the account-count baseline: ${detail}`);
    }
  }

  if (baselineContents !== null) {
    return baselineSchema.parse(JSON.parse(baselineContents))
      .successfulAccountCount;
  }

  let existingContents: string | null = null;
  try {
    existingContents = await readFile(ACCOUNTS_PATH, 'utf8');
  } catch (error) {
    if (!(
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT'
    )) {
      throw new Error(
        error instanceof Error
          ? `Could not read the existing account dataset: ${error.message}`
          : 'Could not read the existing account dataset.',
      );
    }
    return null;
  }

  if (existingContents === null) {
    return null;
  }
  const existingAccounts = accountsSchema.parse(JSON.parse(existingContents));
  return existingAccounts.length;
}

async function writeJsonAtomically(
  path: string,
  value: unknown,
): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  try {
    await writeFile(
      temporaryPath,
      `${JSON.stringify(value, null, 2)}\n`,
      'utf8',
    );
    await rename(temporaryPath, path);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

async function main(): Promise<void> {
  const sourceText = await readFile(SOURCE_PATH, 'utf8');
  const cleaned = cleanAccountSource(sourceText);
  const validatedAccounts = accountsSchema.parse(cleaned.accounts);
  const previousSuccessfulAccountCount = await readPreviousCount();

  if (
    previousSuccessfulAccountCount !== null &&
    exceedsAccountDropLimit(
      validatedAccounts.length,
      previousSuccessfulAccountCount,
    )
  ) {
    throw new Error(
      `Dataset contains ${validatedAccounts.length} accounts, more than 10% below the previous count of ${previousSuccessfulAccountCount}. Outputs were not changed.`,
    );
  }

  const sourceHash = createHash('sha256')
    .update(sourceText, 'utf8')
    .digest('hex');
  const report = {
    generatedAt: new Date().toISOString(),
    source: {
      path: 'data/raw/accounts_to_block.txt',
      sha256: sourceHash,
    },
    baseline: {
      previousSuccessfulAccountCount,
      maximumDropRatio: MAXIMUM_DATASET_DROP_RATIO,
    },
    summary: cleaned.summary,
    issues: cleaned.issues,
    limitations: [
      'The source contains usernames only; display names and categories are not inferred.',
      'Imported records use the other category until editorial metadata is verified.',
      'No avatar enrichment or runtime image requests were made; initials are used as the fallback.',
      'verifiedGuess is false because verification status was not present in the source.',
    ],
  };

  await writeJsonAtomically(ACCOUNTS_PATH, validatedAccounts);
  await writeJsonAtomically(REPORT_PATH, report);

  console.log(
    `Built ${validatedAccounts.length} accounts from ${cleaned.summary.sourceRows} source rows; ${cleaned.summary.skippedRows} skipped and ${cleaned.summary.flaggedAccounts} included with manual-review warnings.`,
  );
  console.log(`Source SHA-256: ${sourceHash}`);
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? `Account data build failed: ${error.message}`
      : error,
  );
  process.exitCode = 1;
});
