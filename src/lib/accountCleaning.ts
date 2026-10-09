import { accountSchema, type Account } from '../types/account.ts';

export const DATASET_ADDED_AT = '2026-10-09';
export const MAXIMUM_DATASET_DROP_RATIO = 0.1;

const USERNAME_PATTERN = /^[A-Za-z0-9._]+$/;
const MANUAL_REVIEW_HANDLES = new Set(['bradleycooperroffical']);

export interface CleaningIssue {
  sourceLine: number;
  sourceValue: string;
  action: 'skipped' | 'included_with_warning';
  reasons: string[];
}

export interface CleanedAccountData {
  accounts: Account[];
  issues: CleaningIssue[];
  summary: {
    sourceRows: number;
    importedAccounts: number;
    skippedRows: number;
    invalidHandlesSkipped: number;
    duplicatesSkipped: number;
    blankRowsSkipped: number;
    flaggedAccounts: number;
    trimmedRows: number;
    leadingAtSignsRemoved: number;
  };
}

export function exceedsAccountDropLimit(
  currentCount: number,
  previousCount: number,
): boolean {
  return (
    previousCount > 0 &&
    currentCount < previousCount * (1 - MAXIMUM_DATASET_DROP_RATIO)
  );
}

function sourceLines(sourceText: string): string[] {
  const lines = sourceText.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/);
  if (lines.at(-1) === '') {
    lines.pop();
  }
  return lines;
}

export function cleanAccountSource(sourceText: string): CleanedAccountData {
  const lines = sourceLines(sourceText);
  const accounts: Account[] = [];
  const issues: CleaningIssue[] = [];
  const firstOccurrence = new Map<string, number>();
  let invalidHandlesSkipped = 0;
  let duplicatesSkipped = 0;
  let blankRowsSkipped = 0;
  let flaggedAccounts = 0;
  let trimmedRows = 0;
  let leadingAtSignsRemoved = 0;

  for (const [index, sourceValue] of lines.entries()) {
    const trimmedValue = sourceValue.trim();
    const sourceLine = index + 1;

    if (trimmedValue !== sourceValue) {
      trimmedRows += 1;
    }

    if (!trimmedValue) {
      blankRowsSkipped += 1;
      issues.push({
        sourceLine,
        sourceValue,
        action: 'skipped',
        reasons: ['Blank source row.'],
      });
      continue;
    }

    let username = trimmedValue;
    if (username.startsWith('@')) {
      username = username.slice(1);
      leadingAtSignsRemoved += 1;
    }

    if (!USERNAME_PATTERN.test(username)) {
      invalidHandlesSkipped += 1;
      issues.push({
        sourceLine,
        sourceValue,
        action: 'skipped',
        reasons: [
          'Handle contains characters outside the allowed letters, numbers, period, and underscore set.',
        ],
      });
      continue;
    }

    const id = username.toLowerCase();
    const previousLine = firstOccurrence.get(id);
    if (previousLine !== undefined) {
      duplicatesSkipped += 1;
      issues.push({
        sourceLine,
        sourceValue,
        action: 'skipped',
        reasons: [`Case-insensitive duplicate of source line ${previousLine}.`],
      });
      continue;
    }
    firstOccurrence.set(id, sourceLine);

    const isManualReviewHandle = MANUAL_REVIEW_HANDLES.has(id);
    if (isManualReviewHandle) {
      flaggedAccounts += 1;
      issues.push({
        sourceLine,
        sourceValue,
        action: 'included_with_warning',
        reasons: [
          'Matches the known possible-typo review list; not auto-corrected.',
        ],
      });
    }

    const parsedAccount = accountSchema.parse({
      id,
      username,
      displayName: null,
      category: 'other',
      avatarUrl: null,
      avatarFallback: '',
      verifiedGuess: false,
      tags: [],
      addedAt: DATASET_ADDED_AT,
      ...(isManualReviewHandle
        ? {
            notes:
              'Source handle is flagged as a possible typo for manual review; it was not auto-corrected.',
          }
        : {}),
    });
    accounts.push(parsedAccount);
  }

  return {
    accounts,
    issues,
    summary: {
      sourceRows: lines.length,
      importedAccounts: accounts.length,
      skippedRows: invalidHandlesSkipped + duplicatesSkipped + blankRowsSkipped,
      invalidHandlesSkipped,
      duplicatesSkipped,
      blankRowsSkipped,
      flaggedAccounts,
      trimmedRows,
      leadingAtSignsRemoved,
    },
  };
}
