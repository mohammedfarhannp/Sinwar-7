import { z } from 'zod';
import { accountSchema, accountsSchema } from '../types/account';
import type { Account, AccountCategory } from '../types/account';

const searchResponseSchema = z.object({
  results: accountsSchema,
  total: z.number().int().nonnegative(),
});

const accountResponseSchema = z.object({
  account: accountSchema.nullable(),
});

export type AccountSearchResponse = z.infer<typeof searchResponseSchema>;

let hasLoggedFallback = false;

export function logAccountApiFallback(): void {
  if (hasLoggedFallback) {
    return;
  }

  hasLoggedFallback = true;
  console.info('account_api_fallback');
}

export async function searchAccountsApi(
  query: string,
  category: AccountCategory | 'all',
  offset: number,
  limit: number,
  signal: AbortSignal,
): Promise<AccountSearchResponse> {
  const parameters = new URLSearchParams({
    q: query,
    category,
    offset: String(offset),
    limit: String(limit),
  });
  const response = await fetch(`/api/search?${parameters}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error('Account search is unavailable.');
  }

  return searchResponseSchema.parse(await response.json());
}

export async function getAccountApi(
  username: string,
  signal: AbortSignal,
): Promise<Account | null> {
  const response = await fetch(`/api/account/${encodeURIComponent(username)}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error('Account details are unavailable.');
  }

  return accountResponseSchema.parse(await response.json()).account;
}
