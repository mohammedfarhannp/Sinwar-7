import { useState } from 'react';
import type { Account } from '../types/account';

interface AccountAvatarProps {
  account: Account;
  size?: 'card' | 'profile';
}

function getInitials(account: Account): string {
  const source = account.displayName?.trim() || account.username;
  const initials = source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || '?';
}

export function AccountAvatar({ account, size = 'card' }: AccountAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = account.avatarUrl;

  return (
    <span className={`avatar-ring avatar-ring-${size}`} aria-hidden="true">
      <span className="account-avatar">
        {avatarUrl && !imageFailed ? (
          <img
            src={avatarUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="avatar-initials">{getInitials(account)}</span>
        )}
      </span>
    </span>
  );
}
