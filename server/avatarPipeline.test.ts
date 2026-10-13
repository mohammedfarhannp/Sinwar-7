import { describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import type { AccountRow, Database } from './database.types';
import { enrichAvatarBatch, selectAvatarBatch } from './avatarPipeline';

type Candidate = Pick<
  AccountRow,
  | 'id'
  | 'username'
  | 'avatar_status'
  | 'avatar_attempts'
  | 'avatar_last_attempt_at'
>;

interface QueryResult {
  data: Candidate[] | null;
  error: null;
  count: number | null;
}

function createClient(rows: Candidate[]) {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const updates: unknown[] = [];
  const from = vi.fn(() => {
    let matchingRows = [...rows];
    let headOnly = false;
    const record = (method: string, args: unknown[]) => {
      calls.push({ method, args });
    };
    const query: Record<string, unknown> = {};
    const chain = (method: string, args: unknown[]) => {
      record(method, args);
      return query;
    };

    query.select = (column: string, options?: { head?: boolean }) => {
      headOnly = options?.head ?? false;
      return chain('select', [column, options]);
    };
    query.in = (column: string, values: string[]) => {
      record('in', [column, values]);
      if (column === 'avatar_status') {
        matchingRows = matchingRows.filter((row) =>
          values.includes(row.avatar_status),
        );
      }
      if (column === 'id') {
        matchingRows = matchingRows.filter((row) => values.includes(row.id));
      }
      return query;
    };
    query.lt = (column: string, value: number) => {
      record('lt', [column, value]);
      if (column === 'avatar_attempts') {
        matchingRows = matchingRows.filter(
          (row) => row.avatar_attempts < value,
        );
      }
      return query;
    };
    query.or = (...args: unknown[]) => chain('or', args);
    query.order = (column: string, options?: { nullsFirst?: boolean }) => {
      record('order', [column, options]);
      matchingRows.sort((left, right) => {
        if (column === 'avatar_attempts') {
          return left.avatar_attempts - right.avatar_attempts;
        }
        if (!left.avatar_last_attempt_at) return -1;
        if (!right.avatar_last_attempt_at) return 1;
        return left.avatar_last_attempt_at.localeCompare(
          right.avatar_last_attempt_at,
        );
      });
      return query;
    };
    query.limit = (limit: number) => {
      record('limit', [limit]);
      matchingRows = matchingRows.slice(0, limit);
      return query;
    };
    query.update = (values: unknown) => {
      updates.push(values);
      return chain('update', [values]);
    };
    query.eq = (...args: unknown[]) => chain('eq', args);
    query.maybeSingle = () => Promise.resolve({ data: null, error: null });
    query.then = (
      onfulfilled?: (result: QueryResult) => unknown,
      onrejected?: (reason: unknown) => unknown,
    ) =>
      Promise.resolve({
        data: headOnly ? null : matchingRows,
        error: null,
        count: headOnly ? matchingRows.length : null,
      }).then(onfulfilled, onrejected);
    return query;
  });
  const client = { from } as unknown as SupabaseClient<Database>;
  return { client, calls, from, updates };
}

function row(
  username: string,
  status: Candidate['avatar_status'],
  attempts: number,
  lastAttempt: string | null,
): Candidate {
  return {
    id: username.toLowerCase(),
    username,
    avatar_status: status,
    avatar_attempts: attempts,
    avatar_last_attempt_at: lastAttempt,
  };
}

function createWorkerClient(rows: Candidate[]) {
  const accounts = rows.map((candidate) => ({
    ...candidate,
    avatar_url: null as string | null,
    avatar_error: null as string | null,
  }));
  const updates: unknown[] = [];
  const uploads: string[] = [];

  const from = vi.fn(() => {
    const filters = new Map<string, unknown>();
    const setFilters = new Map<string, unknown[]>();
    const lessThan = new Map<string, number>();
    const orderings: Array<{ column: string; nullsFirst: boolean }> = [];
    let limit: number | undefined;
    let headOnly = false;
    let updateValues: Record<string, unknown> | undefined;
    let selectedColumns = '*';
    const query: Record<string, unknown> = {};

    const matchingRows = () => {
      let result = accounts.filter((account) => {
        for (const [column, value] of filters) {
          if (account[column as keyof typeof account] !== value) return false;
        }
        for (const [column, values] of setFilters) {
          if (!values.includes(account[column as keyof typeof account])) {
            return false;
          }
        }
        for (const [column, value] of lessThan) {
          if ((account[column as keyof typeof account] as number) >= value) {
            return false;
          }
        }
        return true;
      });

      for (const { column, nullsFirst } of orderings) {
        result = [...result].sort((left, right) => {
          const leftValue = left[column as keyof typeof left];
          const rightValue = right[column as keyof typeof right];
          if (column === 'avatar_attempts') {
            return (leftValue as number) - (rightValue as number);
          }
          if (leftValue === null && rightValue === null) return 0;
          if (leftValue === null) return nullsFirst ? -1 : 1;
          if (rightValue === null) return nullsFirst ? 1 : -1;
          return String(leftValue).localeCompare(String(rightValue));
        });
      }
      return limit === undefined ? result : result.slice(0, limit);
    };

    query.select = (columns: string, options?: { head?: boolean }) => {
      selectedColumns = columns;
      headOnly = options?.head ?? false;
      return query;
    };
    query.update = (values: Record<string, unknown>) => {
      updateValues = values;
      updates.push(values);
      return query;
    };
    query.in = (column: string, values: unknown[]) => {
      setFilters.set(column, values);
      return query;
    };
    query.eq = (column: string, value: unknown) => {
      filters.set(column, value);
      return query;
    };
    query.lt = (column: string, value: number) => {
      lessThan.set(column, value);
      return query;
    };
    query.or = (expression: string) => {
      const cutoff = expression.split('.lt.')[1];
      if (cutoff) {
        const selected = matchingRows().filter(
          (account) =>
            account.avatar_last_attempt_at === null ||
            Date.parse(account.avatar_last_attempt_at) < Date.parse(cutoff),
        );
        setFilters.set(
          'id',
          selected.map((account) => account.id),
        );
      }
      return query;
    };
    query.order = (column: string, options?: { nullsFirst?: boolean }) => {
      orderings.push({ column, nullsFirst: options?.nullsFirst ?? false });
      return query;
    };
    query.limit = (value: number) => {
      limit = value;
      return query;
    };
    query.maybeSingle = async () => {
      const account = matchingRows()[0];
      if (!account || !updateValues) return { data: null, error: null };
      Object.assign(account, updateValues);
      const selected = Object.fromEntries(
        selectedColumns
          .split(',')
          .map((column) => column.trim())
          .filter((column) => column in account)
          .map((column) => [column, account[column as keyof typeof account]]),
      );
      return { data: selected, error: null };
    };
    query.then = (
      onfulfilled?: (result: {
        data: typeof accounts | null;
        error: null;
        count: number | null;
      }) => unknown,
      onrejected?: (reason: unknown) => unknown,
    ) => {
      const result = matchingRows();
      return Promise.resolve({
        data: headOnly ? null : result,
        error: null,
        count: headOnly ? result.length : null,
      }).then(onfulfilled, onrejected);
    };
    return query;
  });

  const storage = {
    from: vi.fn(() => ({
      upload: vi.fn(async (path: string) => {
        uploads.push(path);
        return { data: { path }, error: null };
      }),
      getPublicUrl: (path: string) => ({
        data: {
          publicUrl: `https://example.supabase.co/storage/v1/object/public/avatars/${path}`,
        },
      }),
    })),
  };
  return {
    client: { from, storage } as unknown as SupabaseClient<Database>,
    accounts,
    updates,
    uploads,
  };
}

describe('selectAvatarBatch', () => {
  it('orders eligible rows and excludes fetched or exhausted accounts', async () => {
    const client = createClient([
      row('recent', 'pending', 1, '2025-12-31T21:00:00.000Z'),
      row('fresh', 'pending', 0, null),
      row('retry', 'failed', 0, '2025-12-31T20:00:00.000Z'),
      row('exhausted', 'failed', 5, '2025-12-31T20:00:00.000Z'),
      row('alreadydone', 'fetched', 0, null),
    ]);

    const selection = await selectAvatarBatch(
      client.client,
      3,
      undefined,
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(selection.rows.map(({ username }) => username)).toEqual([
      'fresh',
      'retry',
      'recent',
    ]);
    expect(selection.remaining).toBe(3);
    expect(selection.skipped).toBe(0);
    expect(client.calls).toContainEqual({
      method: 'lt',
      args: ['avatar_attempts', 5],
    });
    expect(client.calls).toContainEqual({ method: 'limit', args: [3] });
    expect(client.calls).toContainEqual({
      method: 'order',
      args: ['avatar_last_attempt_at', { ascending: true, nullsFirst: true }],
    });
  });

  it('uses requested eligible usernames in request order and skips exhausted or missing names', async () => {
    const client = createClient([
      row('second', 'failed', 1, '2025-12-31T20:00:00.000Z'),
      row('first', 'pending', 0, null),
      row('exhausted', 'failed', 5, null),
    ]);

    const selection = await selectAvatarBatch(
      client.client,
      3,
      ['Second', 'missing', 'first', 'exhausted'],
      new Date('2026-01-01T00:00:00.000Z'),
    );

    expect(selection.rows.map(({ username }) => username)).toEqual([
      'second',
      'first',
    ]);
    expect(selection.skipped).toBe(2);
    expect(client.calls).toContainEqual({
      method: 'in',
      args: ['id', ['second', 'missing', 'first', 'exhausted']],
    });
    expect(client.calls).not.toContainEqual({ method: 'limit', args: [3] });
  });

  it('keeps dry runs read-only', async () => {
    const client = createClient([row('pending', 'pending', 0, null)]);
    const fetchImpl = vi.fn();

    const summary = await enrichAvatarBatch({
      client: client.client,
      batchSize: 3,
      dryRun: true,
      fetchImpl,
    });

    expect(summary).toEqual({
      processed: 0,
      fetched: 0,
      failed: 0,
      skipped: 0,
      remaining: 1,
      rateLimited: false,
      preview: ['pending'],
    });
    expect(client.updates).toHaveLength(0);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('processes three profiles per batch, stores WebP URLs, then selects the next three', async () => {
    const client = createWorkerClient(
      ['one', 'two', 'three', 'four', 'five', 'six'].map((username) =>
        row(username, 'pending', 0, null),
      ),
    );
    const png = await sharp({
      create: {
        width: 2,
        height: 2,
        channels: 3,
        background: '#ce1126',
      },
    })
      .png()
      .toBuffer();
    const requested: string[] = [];
    let activeRequests = 0;
    let maxActiveRequests = 0;
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      requested.push(String(input));
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      activeRequests -= 1;
      return new Response(new Uint8Array(png), {
        status: 200,
        headers: { 'content-type': 'image/png' },
      });
    });
    const options = {
      client: client.client,
      batchSize: 3,
      fetchImpl,
      delayMs: 3000,
      sleep: vi.fn(async () => {}),
      now: () => new Date('2026-01-01T00:00:00.000Z'),
      log: vi.fn(),
    };

    const firstBatch = await enrichAvatarBatch(options);
    const secondBatch = await enrichAvatarBatch(options);

    expect(firstBatch).toEqual({
      processed: 3,
      fetched: 3,
      failed: 0,
      skipped: 0,
      remaining: 3,
      rateLimited: false,
    });
    expect(secondBatch).toEqual({
      processed: 3,
      fetched: 3,
      failed: 0,
      skipped: 0,
      remaining: 0,
      rateLimited: false,
    });
    expect(
      requested.map((url) =>
        decodeURIComponent(url.match(/instagram\/([^?]+)/)?.[1] ?? ''),
      ),
    ).toEqual(['one', 'two', 'three', 'four', 'five', 'six']);
    expect(maxActiveRequests).toBe(1);
    expect(client.uploads).toEqual([
      'one.webp',
      'two.webp',
      'three.webp',
      'four.webp',
      'five.webp',
      'six.webp',
    ]);
    expect(
      client.accounts.every((account) => account.avatar_status === 'fetched'),
    ).toBe(true);
    expect(
      client.accounts.every((account) => account.avatar_attempts === 1),
    ).toBe(true);
    expect(
      client.accounts.every((account) =>
        account.avatar_url?.endsWith(`${account.username}.webp`),
      ),
    ).toBe(true);
    expect(client.updates).toHaveLength(12);
    expect(options.sleep).toHaveBeenCalledTimes(4);
    expect(options.sleep).toHaveBeenCalledWith(3000);
  });

  it('stops the batch after a provider rate limit', async () => {
    const client = createWorkerClient(
      ['one', 'two', 'three'].map((username) =>
        row(username, 'pending', 0, null),
      ),
    );
    const fetchImpl = vi.fn(async () => new Response(null, { status: 429 }));
    const onRateLimited = vi.fn();
    const onAttempt = vi.fn();
    const summary = await enrichAvatarBatch({
      client: client.client,
      batchSize: 3,
      fetchImpl,
      onAttempt,
      onRateLimited,
      sleep: vi.fn(async () => {}),
      log: vi.fn(),
    });

    expect(summary).toEqual({
      processed: 1,
      fetched: 0,
      failed: 1,
      skipped: 2,
      remaining: 3,
      rateLimited: true,
    });
    expect(onAttempt).toHaveBeenCalledOnce();
    expect(onRateLimited).toHaveBeenCalledOnce();
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(client.uploads).toHaveLength(0);
  });
});
