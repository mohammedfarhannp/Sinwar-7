import { describe, expect, it } from 'vitest';
import {
  cleanAccountSource,
  DATASET_ADDED_AT,
  exceedsAccountDropLimit,
} from './accountCleaning.ts';

describe('cleanAccountSource', () => {
  it('normalizes handles while preserving casing and flags invalid rows', () => {
    const result = cleanAccountSource(
      ' @Some_Handle \r\nsome_handle\nbroken?\nbradleycooperroffical\n\n',
    );

    expect(result.accounts).toHaveLength(2);
    expect(result.accounts[0]).toMatchObject({
      id: 'some_handle',
      username: 'Some_Handle',
      category: 'other',
      addedAt: DATASET_ADDED_AT,
    });
    expect(result.accounts[1]).toMatchObject({
      id: 'bradleycooperroffical',
      notes: expect.stringContaining('not auto-corrected'),
    });
    expect(result.summary).toMatchObject({
      sourceRows: 5,
      importedAccounts: 2,
      skippedRows: 3,
      invalidHandlesSkipped: 1,
      duplicatesSkipped: 1,
      blankRowsSkipped: 1,
      flaggedAccounts: 1,
      trimmedRows: 1,
      leadingAtSignsRemoved: 1,
    });
    expect(result.issues).toHaveLength(4);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceLine: 3,
          sourceValue: 'broken?',
          action: 'skipped',
        }),
        expect.objectContaining({
          sourceLine: 4,
          sourceValue: 'bradleycooperroffical',
          action: 'included_with_warning',
        }),
      ]),
    );
  });

  it('ignores a terminal line ending without reporting a phantom blank row', () => {
    const result = cleanAccountSource('handle\n');

    expect(result.summary.sourceRows).toBe(1);
    expect(result.summary.blankRowsSkipped).toBe(0);
    expect(result.accounts[0]?.username).toBe('handle');
  });

  it('allows a 10% count decrease but rejects a larger one', () => {
    expect(exceedsAccountDropLimit(90, 100)).toBe(false);
    expect(exceedsAccountDropLimit(89, 100)).toBe(true);
  });
});
