import Fuse from 'fuse.js';
import { accounts } from '../data/accounts';
import {
  MIN_SEARCH_CHARACTERS,
  SEARCH_DISPLAY_NAME_WEIGHT,
  SEARCH_FUZZY_THRESHOLD,
  SEARCH_TAGS_WEIGHT,
  SEARCH_USERNAME_WEIGHT,
} from '../config/search';
import type { Account, AccountCategory } from '../types/account';

const fuse = new Fuse(accounts, {
  keys: [
    { name: 'username', weight: SEARCH_USERNAME_WEIGHT },
    { name: 'displayName', weight: SEARCH_DISPLAY_NAME_WEIGHT },
    { name: 'tags', weight: SEARCH_TAGS_WEIGHT },
  ],
  threshold: SEARCH_FUZZY_THRESHOLD,
  ignoreLocation: true,
  minMatchCharLength: MIN_SEARCH_CHARACTERS,
  includeScore: true,
});

export function normalizeSearchQuery(query: string): string {
  return query.trim().replace(/^@/, '').trim().toLowerCase();
}

export function searchAccounts(
  query: string,
  category?: AccountCategory | 'all',
): Account[] {
  const normalizedQuery = normalizeSearchQuery(query);
  const matchingAccounts =
    normalizedQuery.length === 0
      ? accounts.map((item) => ({ item, score: 0 }))
      : normalizedQuery.length < MIN_SEARCH_CHARACTERS
        ? []
        : fuse.search(normalizedQuery).map((result) => ({
            item: result.item,
            score: result.score ?? 1,
          }));

  const categoryFiltered = matchingAccounts.filter(
    ({ item }) => !category || category === 'all' || item.category === category,
  );

  if (normalizedQuery.length < MIN_SEARCH_CHARACTERS) {
    return categoryFiltered.map(({ item }) => item);
  }

  return categoryFiltered
    .sort((leftResult, rightResult) => {
      const leftUsername = leftResult.item.username.toLowerCase();
      const rightUsername = rightResult.item.username.toLowerCase();
      const leftRank =
        leftUsername === normalizedQuery
          ? 0
          : leftUsername.startsWith(normalizedQuery)
            ? 1
            : 2;
      const rightRank =
        rightUsername === normalizedQuery
          ? 0
          : rightUsername.startsWith(normalizedQuery)
            ? 1
            : 2;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      return (
        leftResult.score - rightResult.score ||
        leftResult.item.username.localeCompare(rightResult.item.username)
      );
    })
    .map(({ item }) => item);
}
