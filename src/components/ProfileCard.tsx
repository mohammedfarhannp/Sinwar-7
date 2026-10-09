import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountAvatar } from './AccountAvatar';
import type { Account } from '../types/account';

interface ProfileCardProps {
  account: Account;
  isBlocked: boolean;
  onAdd: (username: string) => void;
  onRemove: (username: string) => void;
}

function formatCategory(category: Account['category']): string {
  return category[0].toUpperCase() + category.slice(1);
}

export function ProfileCard({
  account,
  isBlocked,
  onAdd,
  onRemove,
}: ProfileCardProps) {
  const [copyMessage, setCopyMessage] = useState('');

  async function handleCopyUsername() {
    if (!navigator.clipboard?.writeText) {
      setCopyMessage('Copy is unavailable in this browser.');
      return;
    }

    try {
      await navigator.clipboard.writeText(`@${account.username}`);
      setCopyMessage('Username copied.');
    } catch {
      setCopyMessage('Could not copy the username.');
    }
  }

  return (
    <article className="profile-card">
      <Link
        className="profile-card-main"
        to={`/profile/${encodeURIComponent(account.username)}`}
        aria-label={`View ${account.displayName ?? `@${account.username}`} profile`}
      >
        <AccountAvatar account={account} />
        <span className="profile-card-name">
          {account.displayName ?? `@${account.username}`}
        </span>
        <span className="profile-card-username">@{account.username}</span>
      </Link>
      <span className="category-chip">{formatCategory(account.category)}</span>
      <div className="profile-card-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={handleCopyUsername}
          aria-label={`Copy @${account.username}`}
        >
          Copy username
        </button>
        <button
          type="button"
          className={`block-button${isBlocked ? ' block-button-active' : ''}`}
          onClick={() =>
            isBlocked ? onRemove(account.username) : onAdd(account.username)
          }
          aria-pressed={isBlocked}
        >
          {isBlocked ? 'Remove from my list' : 'Add to my block list'}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {copyMessage}
      </p>
    </article>
  );
}
