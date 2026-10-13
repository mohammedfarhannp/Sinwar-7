import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccountCardGrid } from '../components/AccountCardGrid';
import { DatasetNotice } from '../components/DatasetNotice';
import { EmptyState } from '../components/EmptyState';
import { ProfileSkeletonGrid } from '../components/ProfileSkeletonGrid';
import { SearchBar } from '../components/SearchBar';
import { loadAccountDirectory } from '../data/accountDirectory';
import { useBlockedAccounts } from '../hooks/useBlockedAccounts';
import type { Account } from '../types/account';

const FEATURED_ACCOUNT_COUNT = 6;

export function HomePage() {
  const [query, setQuery] = useState('');
  const [featuredAccounts, setFeaturedAccounts] = useState<Account[]>([]);
  const [directoryCount, setDirectoryCount] = useState(0);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [hasFeaturedError, setHasFeaturedError] = useState(false);
  const navigate = useNavigate();
  const blocked = useBlockedAccounts();

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeaturedAccounts() {
      try {
        const accounts = await loadAccountDirectory();
        if (controller.signal.aborted) {
          return;
        }
        setFeaturedAccounts(accounts.slice(0, FEATURED_ACCOUNT_COUNT));
        setDirectoryCount(accounts.length);
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        setHasFeaturedError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingFeatured(false);
        }
      }
    }

    void loadFeaturedAccounts();
    return () => controller.abort();
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(
      trimmedQuery
        ? `/search?q=${encodeURIComponent(trimmedQuery)}`
        : '/search',
    );
  }

  return (
    <div className="home-page">
      <section className="hero motif" aria-labelledby="home-title">
        <p className="eyebrow">Operation Blockout · Boycott for Gaza</p>
        <h1 id="home-title">Don’t reward silence with your attention.</h1>
        <p className="hero-copy">
          Operation Blockout is a collective boycott of public figures people
          believe have stayed silent about the genocide in Gaza. Find an
          account, check their public statements, then decide where your
          follows, views, and spending go.
        </p>
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
        />
        <p className="phase-note">
          Search a username, review the account, and choose whether to boycott
          or block. Press Ctrl/⌘+K to focus search.
        </p>
        <DatasetNotice />
        <div className="hero-note">
          <span className="hero-note-mark" aria-hidden="true">
            ✓
          </span>
          <div>
            <p>
              Your Blockout list stays on this device. This site does not
              unfollow, block, report, or contact anyone for you.
            </p>
            <p className="blocked-progress" aria-live="polite">
              {isLoadingFeatured || hasFeaturedError
                ? `You have ${blocked.usernames.length} profiles on your Blockout list.`
                : `You’ve added ${blocked.usernames.length} / ${directoryCount} profiles to your Blockout list.`}
            </p>
          </div>
        </div>
        {blocked.storageError && (
          <p className="storage-error" role="alert">
            Your Blockout list could not be saved in this browser. Check its
            local storage settings and try again.
          </p>
        )}
      </section>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Take a closer look</p>
            <h2 id="featured-title">From the directory</h2>
          </div>
          <Link className="text-link" to="/search">
            Search all accounts
          </Link>
        </div>
        {isLoadingFeatured && <ProfileSkeletonGrid />}
        {!isLoadingFeatured && featuredAccounts.length > 0 && (
          <AccountCardGrid
            accounts={featuredAccounts}
            isBlocked={blocked.isBlocked}
            onAdd={blocked.addBlocked}
            onRemove={blocked.removeBlocked}
          />
        )}
        {!isLoadingFeatured && hasFeaturedError && (
          <EmptyState
            title="The directory sample is unavailable"
            description="Check your connection and reload the page to try again."
          />
        )}
      </section>
    </div>
  );
}
