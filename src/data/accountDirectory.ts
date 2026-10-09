import accountDataUrl from './accounts.json?url';
import type { Account } from '../types/account';

let directoryPromise: Promise<Account[]> | undefined;

function isAccountCollection(value: unknown): value is Account[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof item.id === 'string' &&
        'username' in item &&
        typeof item.username === 'string' &&
        'category' in item &&
        typeof item.category === 'string' &&
        'tags' in item &&
        Array.isArray(item.tags),
    )
  );
}

export function loadAccountDirectory(): Promise<Account[]> {
  if (!directoryPromise) {
    directoryPromise = fetch(accountDataUrl, {
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('The local directory is unavailable.');
        }
        return response.json() as Promise<unknown>;
      })
      .then((payload) => {
        if (!isAccountCollection(payload)) {
          throw new Error('The local directory data is invalid.');
        }
        return payload;
      })
      .catch((error: unknown) => {
        directoryPromise = undefined;
        throw error;
      });
  }

  return directoryPromise;
}
