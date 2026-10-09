import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cleanAccountSource,
  exceedsAccountDropLimit,
} from '../src/lib/accountCleaning.ts';
import { accountsSchema } from '../src/types/account.ts';
import { z } from 'zod';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = resolve(PROJECT_ROOT, 'data/raw/accounts_to_block.txt');
const ACCOUNTS_PATH = resolve(PROJECT_ROOT, 'src/data/accounts.json');
const REPORT_PATH = resolve(PROJECT_ROOT, 'data/reports/cleaning-report.json');
const BASELINE_PATH = resolve(
  PROJECT_ROOT,
  'data/reports/account-count-baseline.json',
);
const issueSchema = z.object({
  sourceLine: z.number().int().positive(),
  sourceValue: z.string(),
  action: z.enum(['skipped', 'included_with_warning']),
  reasons: z.array(z.string().min(1)).min(1),
});

const reportSchema = z.object({
  generatedAt: z.iso.datetime(),
  source: z.object({
    path: z.literal('data/raw/accounts_to_block.txt'),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  baseline: z.object({
    previousSuccessfulAccountCount: z.number().int().nonnegative().nullable(),
    maximumDropRatio: z.number().min(0).max(1),
  }),
  summary: z.object({
    sourceRows: z.number().int().nonnegative(),
    importedAccounts: z.number().int().nonnegative(),
    skippedRows: z.number().int().nonnegative(),
    invalidHandlesSkipped: z.number().int().nonnegative(),
    duplicatesSkipped: z.number().int().nonnegative(),
    blankRowsSkipped: z.number().int().nonnegative(),
    flaggedAccounts: z.number().int().nonnegative(),
    trimmedRows: z.number().int().nonnegative(),
    leadingAtSignsRemoved: z.number().int().nonnegative(),
  }),
  issues: z.array(issueSchema),
  limitations: z.array(z.string().min(1)),
});

const baselineSchema = z.object({
  version: z.literal(1),
  successfulAccountCount: z.number().int().nonnegative(),
  lastValidatedAt: z.iso.datetime().optional(),
});

async function readOptionalBaseline(): Promise<z.infer<
  typeof baselineSchema
> | null> {
  try {
    const text = await readFile(BASELINE_PATH, 'utf8');
    return baselineSchema.parse(JSON.parse(text));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw new Error(
      error instanceof Error
        ? `Could not read the account-count baseline: ${error.message}`
        : 'Could not read the account-count baseline.',
    );
  }
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

async function readJson(path: string): Promise<unknown> {
  const contents = await readFile(path, 'utf8');
  return JSON.parse(contents) as unknown;
}

async function main(): Promise<void> {
  const [sourceText, rawAccounts, rawReport, existingBaseline] =
    await Promise.all([
      readFile(SOURCE_PATH, 'utf8'),
      readJson(ACCOUNTS_PATH),
      readJson(REPORT_PATH),
      readOptionalBaseline(),
    ]);

  const accountsResult = accountsSchema.safeParse(rawAccounts);
  if (!accountsResult.success) {
    throw new Error('Generated accounts do not match the account schema.');
  }
  const report = reportSchema.parse(rawReport);
  const sourceHash = createHash('sha256')
    .update(sourceText, 'utf8')
    .digest('hex');

  if (sourceHash !== report.source.sha256) {
    throw new Error(
      'The raw account source changed after data:build. Run data:build again.',
    );
  }

  const cleanedSource = cleanAccountSource(sourceText);
  const expectedJson = JSON.stringify(cleanedSource.accounts);
  const actualJson = JSON.stringify(accountsResult.data);
  if (expectedJson !== actualJson) {
    throw new Error(
      'Generated accounts do not match the cleaned raw source. Run data:build again.',
    );
  }

  const { summary, issues } = report;
  if (
    summary.importedAccounts !== accountsResult.data.length ||
    summary.sourceRows !== summary.importedAccounts + summary.skippedRows ||
    summary.skippedRows !==
      summary.invalidHandlesSkipped +
        summary.duplicatesSkipped +
        summary.blankRowsSkipped ||
    issues.filter((issue) => issue.action === 'skipped').length !==
      summary.skippedRows ||
    issues.filter((issue) => issue.action === 'included_with_warning')
      .length !== summary.flaggedAccounts
  ) {
    throw new Error('Cleaning report counts do not match its flagged rows.');
  }

  const ids = new Set(accountsResult.data.map((account) => account.id));
  if (ids.size !== accountsResult.data.length) {
    throw new Error('Generated account ids are not unique.');
  }

  const previousCount =
    existingBaseline?.successfulAccountCount ??
    report.baseline.previousSuccessfulAccountCount;
  if (
    previousCount !== null &&
    exceedsAccountDropLimit(accountsResult.data.length, previousCount)
  ) {
    throw new Error(
      `Dataset contains ${accountsResult.data.length} accounts, more than 10% below the previous count of ${previousCount}.`,
    );
  }

  await writeJsonAtomically(BASELINE_PATH, {
    version: 1,
    successfulAccountCount: accountsResult.data.length,
    lastValidatedAt: new Date().toISOString(),
  });

  console.log(
    `Validated ${accountsResult.data.length} accounts; ${summary.skippedRows} source rows skipped and ${summary.flaggedAccounts} included with manual-review warnings.`,
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? `Account data validation failed: ${error.message}`
      : error,
  );
  process.exitCode = 1;
});
