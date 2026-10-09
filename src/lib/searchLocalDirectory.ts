import { loadAccountDirectory } from '../data/accountDirectory';
import type { AccountCategory } from '../types/account';
import { searchAccountsInDataset } from './searchAccountsCore';

export async function searchLocalDirectory(
  query: string,
  category: AccountCategory | 'all',
) {
  const accounts = await loadAccountDirectory();
  return searchAccountsInDataset(accounts, query, category);
}
