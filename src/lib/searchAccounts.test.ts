import { describe, expect, it, vi } from 'vitest';
import { searchAccounts } from './searchAccounts';

vi.mock('../data/accounts', () => ({
  accounts: [
    {
      id: 'thegalshir',
      username: 'theGalShir',
      displayName: null,
      category: 'other',
      avatarUrl: null,
      avatarFallback: '',
      verifiedGuess: false,
      tags: [],
      addedAt: '2026-10-09',
    },
    {
      id: 'thegalshir_fan',
      username: 'thegalshir_fan',
      displayName: null,
      category: 'other',
      avatarUrl: null,
      avatarFallback: '',
      verifiedGuess: false,
      tags: [],
      addedAt: '2026-10-09',
    },
    {
      id: 'fan_thegal',
      username: 'fan_thegal',
      displayName: 'The Gal Shir',
      category: 'other',
      avatarUrl: null,
      avatarFallback: '',
      verifiedGuess: false,
      tags: [],
      addedAt: '2026-10-09',
    },
  ],
}));

describe('searchAccounts with the imported directory', () => {
  it('ranks exact usernames above prefixes and display-name matches', () => {
    expect(searchAccounts('@THEGALSHIR').map((account) => account.id)).toEqual([
      'thegalshir',
      'thegalshir_fan',
      'fan_thegal',
    ]);
  });

  it('returns all accounts for an empty query', () => {
    expect(searchAccounts('')).toHaveLength(3);
  });
});
