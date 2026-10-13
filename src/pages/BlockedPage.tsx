import { useEffect, useState } from 'react';
import { AccountCardGrid } from '../components/AccountCardGrid';
import { DatasetNotice } from '../components/DatasetNotice';
import { EmptyState } from '../components/EmptyState';
import { ProfileSkeletonGrid } from '../components/ProfileSkeletonGrid';
import { SEARCH_RESULT_PAGE_SIZE } from '../config/search';
import { loadAccountDirectory } from '../data/accountDirectory';
import { useBlockedAccounts } from '../hooks/useBlockedAccounts';
import type { Account } from '../types/account';

export function BlockedPage() {
  const [visibleCount, setVisibleCount] = useState(SEARCH_RESULT_PAGE_SIZE);
  const [accounts, setAccounts] = useState<Account[] | null>(null);
  const [hasDirectoryError, setHasDirectoryError] = useState(false);
  const blocked = useBlockedAccounts();

  useEffect(() => {
    let isActive = true;
    void loadAccountDirectory()
      .then((directory) => {
        if (isActive) {
          setAccounts(directory);
        }
      })
      .catch(() => {
        if (isActive) {
          setHasDirectoryError(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const isLoadingDirectory = accounts === null && !hasDirectoryError;
  const directory = accounts ?? [];
  const blockedNames = new Set(blocked.usernames);
  const knownAccountIds = new Set(directory.map((account) => account.id));
  const knownBlocked = directory.filter((account) =>
    blockedNames.has(account.username.toLowerCase()),
  );
  const visibleBlocked = knownBlocked.slice(0, visibleCount);
  const otherBlocked =
    accounts === null
      ? []
      : blocked.usernames.filter((username) => !knownAccountIds.has(username));

  return (
    <section
      className="content-page blocked-page"
      aria-labelledby="blocked-title"
    >
      <p className="eyebrow">Keep your choice visible</p>
      <h1 id="blocked-title">Your Blockout list</h1>
      <p className="page-description">
        This personal record is saved only in this browser. Adding an account
        here does not unfollow, block, report, or contact it on Instagram; use
        Instagram’s controls to take those actions.
      </p>
      <DatasetNotice />

      <p
        className="blocked-progress blocked-page-progress"
        role="status"
        aria-live="polite"
      >
        {isLoadingDirectory
          ? `Checking ${blocked.usernames.length.toLocaleString()} saved names against the directory…`
          : hasDirectoryError
            ? `${blocked.usernames.length.toLocaleString()} saved names are on this device; the directory could not be loaded.`
            : `You’ve added ${knownBlocked.length} / ${directory.length} profiles from the current directory to your Blockout list.`}
      </p>

      {blocked.storageError && (
        <p className="storage-error" role="alert">
          Your Blockout list could not be saved in this browser. Check its local
          storage settings and try again.
        </p>
      )}

      {blocked.usernames.length === 0 ? (
        <EmptyState
          title="Your Blockout list is empty"
          description="Find an account, review its public statements, and add it here if you choose."
          icon="✓"
        />
      ) : isLoadingDirectory ? (
        <ProfileSkeletonGrid />
      ) : (
        <>
          {!hasDirectoryError && knownBlocked.length > 0 && (
            <>
              <AccountCardGrid
                accounts={visibleBlocked}
                isBlocked={blocked.isBlocked}
                onAdd={blocked.addBlocked}
                onRemove={blocked.removeBlocked}
              />
              {knownBlocked.length > visibleBlocked.length && (
                <div className="search-pagination">
                  <p>
                    Showing {visibleBlocked.length.toLocaleString()} of{' '}
                    {knownBlocked.length.toLocaleString()} profiles on your
                    list.
                  </p>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      setVisibleCount((currentCount) =>
                        Math.min(
                          currentCount + SEARCH_RESULT_PAGE_SIZE,
                          knownBlocked.length,
                        ),
                      )
                    }
                  >
                    Show more profiles
                  </button>
                </div>
              )}
            </>
          )}
          {(hasDirectoryError ? blocked.usernames : otherBlocked).length >
            0 && (
            <section
              className="unmatched-blocked"
              aria-labelledby="other-blocked-title"
            >
              <h2 id="other-blocked-title">
                {hasDirectoryError
                  ? 'Saved usernames'
                  : 'Profiles outside this directory'}
              </h2>
              {hasDirectoryError && (
                <p>
                  The directory is unavailable, so these names could not be
                  checked against it.
                </p>
              )}
              <ul>
                {(hasDirectoryError ? blocked.usernames : otherBlocked).map(
                  (username) => (
                    <li key={username}>
                      <span>@{username}</span>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => blocked.removeBlocked(username)}
                      >
                        Remove from Blockout list
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </section>
          )}
        </>
      )}
    </section>
  );
}
