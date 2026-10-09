import { accounts } from '../data/accounts';
import type { Account, AccountCategory } from '../types/account';
import { searchAccountsInDataset } from './searchAccountsCore';

export { normalizeSearchQuery } from './searchQuery';

export function searchAccounts(
  query: string,
  category?: AccountCategory | 'all',
): Account[] {
  return searchAccountsInDataset(accounts, query, category);
}
