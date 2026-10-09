import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountCardGrid } from '../components/AccountCardGrid';
import { DatasetNotice } from '../components/DatasetNotice';
import { EmptyState } from '../components/EmptyState';
import { ProfileSkeletonGrid } from '../components/ProfileSkeletonGrid';
import { SearchBar } from '../components/SearchBar';
import { MIN_SEARCH_CHARACTERS, SEARCH_DEBOUNCE_MS } from '../config/search';
import { IS_DEMO_DATASET, accounts } from '../data/accounts';
import { useAccountSearch } from '../hooks/useAccountSearch';
import { useBlockedAccounts } from '../hooks/useBlockedAccounts';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { normalizeSearchQuery } from '../lib/searchAccounts';
import { ACCOUNT_CATEGORIES, type AccountCategory } from '../types/account';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(routeQuery);
  const [selectedCategory, setSelectedCategory] = useState<
    AccountCategory | 'all'
  >('all');
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const blocked = useBlockedAccounts();
  const normalizedQuery = normalizeSearchQuery(debouncedQuery);
  const isQueryTooShort =
    normalizedQuery.length > 0 &&
    normalizedQuery.length < MIN_SEARCH_CHARACTERS;
  const accountSearch = useAccountSearch(debouncedQuery, selectedCategory);
  const results = accountSearch.results;

  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (trimmedQuery) {
      nextParams.set('q', trimmedQuery);
    } else {
      nextParams.delete('q');
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedQuery, searchParams, setSearchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    const nextParams = new URLSearchParams(searchParams);
    if (trimmedQuery) {
      nextParams.set('q', trimmedQuery);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <section
      className="content-page search-page"
      aria-labelledby="search-title"
    >
      <p className="eyebrow">Search the directory</p>
      <h1 id="search-title">Find a profile</h1>
      <p className="page-description">
        Search by username, then use category filters to narrow the list. Review
        each profile and decide for yourself what to do.
      </p>
      <SearchBar
        compact
        query={query}
        onQueryChange={setQuery}
        onSubmit={handleSubmit}
      />
      <p className="search-shortcut-note">
        Tip: press <kbd>Ctrl</kbd>+<kbd>K</kbd> or <kbd>⌘</kbd>+<kbd>K</kbd> to
        focus search. Press <kbd>Esc</kbd> to clear it.
      </p>
      <DatasetNotice />

      <div
        className="category-filter"
        role="group"
        aria-label="Filter by category"
      >
        <button
          type="button"
          className="filter-chip"
          aria-pressed={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        >
          All categories
        </button>
        {ACCOUNT_CATEGORIES.map((category) => (
          <button
            type="button"
            className="filter-chip"
            aria-pressed={selectedCategory === category}
            key={category}
            onClick={() => setSelectedCategory(category)}
          >
            {category[0].toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      <p
        className="search-results-count"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {isQueryTooShort
          ? `Type at least ${MIN_SEARCH_CHARACTERS} characters to search.`
          : accountSearch.isLoading
            ? 'Searching the directory…'
            : `${accountSearch.total.toLocaleString()} ${accountSearch.total === 1 ? 'profile' : 'profiles'} found${
                normalizedQuery ? ` for “${debouncedQuery.trim()}”` : ''
              }${IS_DEMO_DATASET ? ' in the preview dataset' : ''}${
                results.length < accountSearch.total
                  ? ` Showing ${results.length.toLocaleString()}.`
                  : ''
              }`}
      </p>

      {blocked.storageError && (
        <p className="storage-error" role="alert">
          Your list could not be saved in this browser. Check its local storage
          settings and try again.
        </p>
      )}

      {!isQueryTooShort && accountSearch.isLoading && results.length === 0 && (
        <ProfileSkeletonGrid />
      )}

      {!isQueryTooShort && results.length > 0 && (
        <AccountCardGrid
          accounts={results}
          isBlocked={blocked.isBlocked}
          onAdd={blocked.addBlocked}
          onRemove={blocked.removeBlocked}
        />
      )}

      {!isQueryTooShort && results.length < accountSearch.total && (
        <div className="search-pagination">
          <p>
            Showing {results.length.toLocaleString()} of{' '}
            {accountSearch.total.toLocaleString()} profiles.
          </p>
          <button
            type="button"
            className="secondary-button"
            disabled={accountSearch.isLoadingMore}
            onClick={() => void accountSearch.loadMore()}
          >
            {accountSearch.isLoadingMore
              ? 'Loading more…'
              : 'Show more profiles'}
          </button>
        </div>
      )}

      {!isQueryTooShort &&
        !accountSearch.isLoading &&
        accountSearch.total === 0 && (
          <EmptyState
            title="No matching profiles"
            description="Try a different name, username, or spelling."
            icon="⌕"
          />
        )}

      <p className="search-data-count">
        {accountSearch.usingLocalFallback
          ? `Online search is unavailable. Using the bundled directory of ${accounts.length.toLocaleString()} profiles.`
          : `${accounts.length.toLocaleString()} profiles currently available in this directory.`}
      </p>
    </section>
  );
}
