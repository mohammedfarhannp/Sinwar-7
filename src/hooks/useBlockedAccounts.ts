import { useCallback, useEffect, useState } from 'react';
import {
  readBlockedState,
  writeBlockedState,
  BLOCKED_STORAGE_KEY,
} from '../lib/blockedStorage';
import type { BlockedState } from '../types/account';

interface UseBlockedAccountsResult {
  usernames: string[];
  storageError: boolean;
  isBlocked: (username: string) => boolean;
  addBlocked: (username: string) => void;
  removeBlocked: (username: string) => void;
}

function normalizeUsername(username: string): string {
  return username.trim().replace(/^@/, '').toLowerCase();
}

export function useBlockedAccounts(): UseBlockedAccountsResult {
  const [state, setState] = useState<BlockedState>(readBlockedState);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === BLOCKED_STORAGE_KEY || event.key === null) {
        setState(readBlockedState());
        setStorageError(false);
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateBlocked = useCallback(
    (username: string, shouldBlock: boolean) => {
      const normalizedUsername = normalizeUsername(username);
      if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
        return;
      }

      const usernames = new Set(state.usernames);
      const alreadyBlocked = usernames.has(normalizedUsername);
      if (alreadyBlocked === shouldBlock) {
        return;
      }

      if (shouldBlock) {
        usernames.add(normalizedUsername);
      } else {
        usernames.delete(normalizedUsername);
      }

      const nextState: BlockedState = {
        version: 1,
        usernames: [...usernames].sort(),
        updatedAt: new Date().toISOString(),
      };

      if (writeBlockedState(nextState)) {
        setState(nextState);
        setStorageError(false);
      } else {
        setStorageError(true);
      }
    },
    [state.usernames],
  );

  const isBlocked = useCallback(
    (username: string) => state.usernames.includes(normalizeUsername(username)),
    [state.usernames],
  );

  const addBlocked = useCallback(
    (username: string) => updateBlocked(username, true),
    [updateBlocked],
  );

  const removeBlocked = useCallback(
    (username: string) => updateBlocked(username, false),
    [updateBlocked],
  );

  return {
    usernames: state.usernames,
    storageError,
    isBlocked,
    addBlocked,
    removeBlocked,
  };
}
