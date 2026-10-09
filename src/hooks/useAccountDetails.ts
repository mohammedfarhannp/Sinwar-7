import { useEffect, useState } from 'react';
import { logAccountApiFallback } from '../lib/accountApiFallback';
import { getAccountApi } from '../lib/accountApi';
import type { Account } from '../types/account';

type DetailsState = {
  username: string;
  account: Account | null;
  isLoading: boolean;
  usingLocalFallback: boolean;
  hasError: boolean;
};

export function useAccountDetails(username: string | undefined) {
  const [state, setState] = useState<DetailsState>({
    username: '',
    account: null,
    isLoading: true,
    usingLocalFallback: false,
    hasError: false,
  });

  useEffect(() => {
    if (!username) {
      return;
    }

    const controller = new AbortController();
    const normalizedUsername = username.toLowerCase();

    void getAccountApi(normalizedUsername, controller.signal)
      .then((account) => {
        if (!controller.signal.aborted) {
          setState({
            username: normalizedUsername,
            account,
            isLoading: false,
            usingLocalFallback: false,
            hasError: false,
          });
        }
      })
      .catch(async () => {
        if (controller.signal.aborted) {
          return;
        }
        logAccountApiFallback();
        try {
          const { loadAccountDirectory } =
            await import('../data/accountDirectory');
          const accounts = await loadAccountDirectory();
          if (controller.signal.aborted) {
            return;
          }
          const account = accounts.find(
            (item) => item.id === normalizedUsername,
          );
          setState({
            username: normalizedUsername,
            account: account ?? null,
            isLoading: false,
            usingLocalFallback: true,
            hasError: false,
          });
        } catch {
          if (!controller.signal.aborted) {
            setState({
              username: normalizedUsername,
              account: null,
              isLoading: false,
              usingLocalFallback: false,
              hasError: true,
            });
          }
        }
      });

    return () => controller.abort();
  }, [username]);

  const normalizedUsername = username?.toLowerCase() ?? '';
  if (!normalizedUsername) {
    return {
      username: '',
      account: null,
      isLoading: false,
      usingLocalFallback: false,
      hasError: false,
    };
  }

  return state.username === normalizedUsername
    ? state
    : {
        username: normalizedUsername,
        account: null,
        isLoading: Boolean(normalizedUsername),
        usingLocalFallback: false,
        hasError: false,
      };
}
