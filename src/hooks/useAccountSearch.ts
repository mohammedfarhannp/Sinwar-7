import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  MIN_SEARCH_CHARACTERS,
  SEARCH_RESULT_PAGE_SIZE,
} from '../config/search';
import { normalizeSearchQuery, searchAccounts } from '../lib/searchAccounts';
import { logAccountApiFallback, searchAccountsApi } from '../lib/accountApi';
import type { Account, AccountCategory } from '../types/account';

type SearchState = {
  key: string;
  results: Account[];
  total: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  usingLocalFallback: boolean;
};

const EMPTY_STATE: SearchState = {
  key: '',
  results: [],
  total: 0,
  isLoading: true,
  isLoadingMore: false,
  usingLocalFallback: false,
};

export function useAccountSearch(
  query: string,
  category: AccountCategory | 'all',
) {
  const normalizedQuery = normalizeSearchQuery(query);
  const searchKey = JSON.stringify([normalizedQuery, category]);
  const [state, setState] = useState<SearchState>(EMPTY_STATE);
  const generation = useRef(0);
  const activeControllers = useRef(new Set<AbortController>());

  useEffect(() => {
    const requestGeneration = ++generation.current;
    const controllers = activeControllers.current;
    controllers.forEach((controller) => controller.abort());
    controllers.clear();

    if (
      normalizedQuery.length > 0 &&
      normalizedQuery.length < MIN_SEARCH_CHARACTERS
    ) {
      return;
    }

    const controller = new AbortController();
    controllers.add(controller);

    void searchAccountsApi(
      normalizedQuery,
      category,
      0,
      SEARCH_RESULT_PAGE_SIZE,
      controller.signal,
    )
      .then((response) => {
        if (requestGeneration !== generation.current) {
          return;
        }
        setState({
          key: searchKey,
          results: response.results,
          total: response.total,
          isLoading: false,
          isLoadingMore: false,
          usingLocalFallback: false,
        });
      })
      .catch(() => {
        if (
          controller.signal.aborted ||
          requestGeneration !== generation.current
        ) {
          return;
        }

        logAccountApiFallback();
        const fallbackResults = searchAccounts(query, category);
        setState({
          key: searchKey,
          results: fallbackResults.slice(0, SEARCH_RESULT_PAGE_SIZE),
          total: fallbackResults.length,
          isLoading: false,
          isLoadingMore: false,
          usingLocalFallback: true,
        });
      })
      .finally(() => controllers.delete(controller));

    return () => {
      controller.abort();
      controllers.forEach((activeController) => activeController.abort());
      controllers.clear();
    };
  }, [category, normalizedQuery, query, searchKey]);

  const isTooShortQuery =
    normalizedQuery.length > 0 &&
    normalizedQuery.length < MIN_SEARCH_CHARACTERS;
  const currentState = useMemo(
    () =>
      state.key === searchKey
        ? state
        : isTooShortQuery
          ? { ...EMPTY_STATE, key: searchKey, isLoading: false }
          : EMPTY_STATE,
    [isTooShortQuery, searchKey, state],
  );

  const loadMore = useCallback(async () => {
    if (
      currentState.isLoading ||
      currentState.isLoadingMore ||
      currentState.results.length >= currentState.total
    ) {
      return;
    }

    const requestGeneration = generation.current;
    const offset = currentState.results.length;
    setState((previous) =>
      previous.key === searchKey
        ? { ...previous, isLoadingMore: true }
        : previous,
    );

    if (currentState.usingLocalFallback) {
      const fallbackResults = searchAccounts(query, category);
      setState((previous) =>
        previous.key === searchKey
          ? {
              ...previous,
              results: fallbackResults.slice(
                0,
                offset + SEARCH_RESULT_PAGE_SIZE,
              ),
              isLoadingMore: false,
            }
          : previous,
      );
      return;
    }

    const controller = new AbortController();
    activeControllers.current.add(controller);
    try {
      const response = await searchAccountsApi(
        normalizedQuery,
        category,
        offset,
        SEARCH_RESULT_PAGE_SIZE,
        controller.signal,
      );
      if (requestGeneration !== generation.current) {
        return;
      }
      setState((previous) =>
        previous.key === searchKey
          ? {
              ...previous,
              results: [...previous.results, ...response.results],
              total: response.total,
              isLoadingMore: false,
            }
          : previous,
      );
    } catch {
      if (
        controller.signal.aborted ||
        requestGeneration !== generation.current
      ) {
        return;
      }
      logAccountApiFallback();
      const fallbackResults = searchAccounts(query, category);
      setState((previous) =>
        previous.key === searchKey
          ? {
              ...previous,
              results: fallbackResults.slice(
                0,
                offset + SEARCH_RESULT_PAGE_SIZE,
              ),
              total: fallbackResults.length,
              isLoadingMore: false,
              usingLocalFallback: true,
            }
          : previous,
      );
    } finally {
      activeControllers.current.delete(controller);
    }
  }, [category, currentState, normalizedQuery, query, searchKey]);

  return {
    ...currentState,
    loadMore,
  };
}
