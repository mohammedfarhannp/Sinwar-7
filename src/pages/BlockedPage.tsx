import { AccountCardGrid } from '../components/AccountCardGrid';
import { DatasetNotice } from '../components/DatasetNotice';
import { EmptyState } from '../components/EmptyState';
import { accounts } from '../data/accounts';
import { useBlockedAccounts } from '../hooks/useBlockedAccounts';

export function BlockedPage() {
  const blocked = useBlockedAccounts();
  const blockedNames = new Set(blocked.usernames);
  const knownBlocked = accounts.filter((account) =>
    blockedNames.has(account.username.toLowerCase()),
  );
  const otherBlocked = blocked.usernames.filter(
    (username) => !accounts.some((account) => account.id === username),
  );

  return (
    <section
      className="content-page blocked-page"
      aria-labelledby="blocked-title"
    >
      <p className="eyebrow">Your personal checklist</p>
      <h1 id="blocked-title">Your block list</h1>
      <p className="page-description">
        This list is saved only in this browser. Adding an account here does not
        block it on Instagram.
      </p>
      <DatasetNotice />

      <p
        className="blocked-progress blocked-page-progress"
        role="status"
        aria-live="polite"
      >
        You’ve added {knownBlocked.length} / {accounts.length} profiles from the
        current directory to your list.
      </p>

      {blocked.storageError && (
        <p className="storage-error" role="alert">
          Your list could not be saved in this browser. Check its local storage
          settings and try again.
        </p>
      )}

      {blocked.usernames.length === 0 ? (
        <EmptyState
          title="Your list is empty"
          description="When you add a profile to your list, it will appear here."
          icon="✓"
        />
      ) : (
        <>
          {knownBlocked.length > 0 && (
            <AccountCardGrid
              accounts={knownBlocked}
              isBlocked={blocked.isBlocked}
              onAdd={blocked.addBlocked}
              onRemove={blocked.removeBlocked}
            />
          )}
          {otherBlocked.length > 0 && (
            <section
              className="unmatched-blocked"
              aria-labelledby="other-blocked-title"
            >
              <h2 id="other-blocked-title">Profiles outside this directory</h2>
              <ul>
                {otherBlocked.map((username) => (
                  <li key={username}>
                    <span>@{username}</span>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => blocked.removeBlocked(username)}
                    >
                      Remove from my list
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </section>
  );
}
