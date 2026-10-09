import type { FormEvent, KeyboardEvent } from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  compact?: boolean;
}

export function SearchBar({
  query,
  onQueryChange,
  onSubmit,
  compact = false,
}: SearchBarProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape' && query) {
      event.preventDefault();
      onQueryChange('');
    }
  }

  return (
    <form
      className={`search-form${compact ? ' search-form-compact' : ''}`}
      onSubmit={onSubmit}
      role="search"
    >
      <label className="sr-only" htmlFor="account-search">
        Search by name or username
      </label>
      <span className="search-icon" aria-hidden="true">
        ⌕
      </span>
      <input
        id="account-search"
        data-account-search
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search a name or @username"
        autoComplete="off"
        aria-keyshortcuts="Control+K Meta+K"
      />
      <button type="submit" className="primary-button">
        Search
      </button>
    </form>
  );
}
