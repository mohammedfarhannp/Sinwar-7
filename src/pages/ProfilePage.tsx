import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AccountAvatar } from '../components/AccountAvatar';
import { DatasetNotice } from '../components/DatasetNotice';
import { EmptyState } from '../components/EmptyState';
import { useAccountDetails } from '../hooks/useAccountDetails';
import { useBlockedAccounts } from '../hooks/useBlockedAccounts';
import type { Account } from '../types/account';

function formatCategory(category: Account['category']): string {
  return category[0].toUpperCase() + category.slice(1);
}

export function ProfilePage() {
  const { username } = useParams();
  const normalizedUsername = username?.replace(/^@/, '').toLowerCase();
  const details = useAccountDetails(normalizedUsername);
  const account = details.account;
  const blocked = useBlockedAccounts();
  const [copyMessage, setCopyMessage] = useState('');

  async function handleCopyProfileLink() {
    if (!navigator.clipboard?.writeText) {
      setCopyMessage('Copy is unavailable in this browser.');
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyMessage('Profile link copied.');
    } catch {
      setCopyMessage('Could not copy the profile link.');
    }
  }

  if (details.isLoading) {
    return (
      <section className="content-page" aria-labelledby="profile-loading-title">
        <p className="eyebrow">Profile</p>
        <h1 id="profile-loading-title">Loading profile details</h1>
        <p role="status" aria-live="polite">
          Looking up this account in the directory…
        </p>
      </section>
    );
  }

  if (!account) {
    return (
      <section className="content-page" aria-labelledby="profile-missing-title">
        <p className="eyebrow">Profile</p>
        <h1 id="profile-missing-title">Profile not found</h1>
        <EmptyState
          title="This profile isn’t in the directory"
          description="Search the directory for another name or username."
          icon="⌕"
        />
        <Link className="primary-button inline-button" to="/search">
          Search profiles
        </Link>
      </section>
    );
  }

  const isBlocked = blocked.isBlocked(account.username);

  return (
    <section
      className="content-page profile-detail"
      aria-labelledby="profile-title"
    >
      <p className="eyebrow">Profile details</p>
      <DatasetNotice />
      {details.usingLocalFallback && (
        <p className="search-data-count">
          Online lookup is unavailable. Showing details from the bundled
          directory.
        </p>
      )}
      <article className="profile-detail-card">
        <AccountAvatar account={account} size="profile" />
        <div className="profile-detail-copy">
          <h1 id="profile-title">
            {account.displayName ?? `@${account.username}`}
          </h1>
          <p className="profile-card-username">@{account.username}</p>
          <span className="category-chip">
            {formatCategory(account.category)}
          </span>
          {account.tags.length > 0 && (
            <ul className="tag-list" aria-label="Profile tags">
              {account.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="profile-detail-actions">
          <button
            type="button"
            className={`block-button${isBlocked ? ' block-button-active' : ''}`}
            onClick={() =>
              isBlocked
                ? blocked.removeBlocked(account.username)
                : blocked.addBlocked(account.username)
            }
            aria-pressed={isBlocked}
          >
            {isBlocked ? 'Remove from my block list' : 'Add to my block list'}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={handleCopyProfileLink}
          >
            Copy profile link
          </button>
        </div>
        {account.notes && <p className="profile-note">{account.notes}</p>}
        <p className="sr-only" role="status" aria-live="polite">
          {copyMessage}
        </p>
      </article>
      {blocked.storageError && (
        <p className="storage-error" role="alert">
          Your list could not be saved in this browser. Check its local storage
          settings and try again.
        </p>
      )}
      <Link className="text-link profile-back-link" to="/search">
        Back to search
      </Link>
    </section>
  );
}
