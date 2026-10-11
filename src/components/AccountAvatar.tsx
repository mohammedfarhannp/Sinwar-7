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
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(
    () => new Set(),
  );
  const remoteAvatarUrl = `https://unavatar.io/instagram/${encodeURIComponent(account.username)}?fallback=false`;
  const avatarUrl = account.avatarUrl;
  const imageUrl =
    (avatarUrl && !failedImageUrls.has(avatarUrl) && avatarUrl) ||
    (!failedImageUrls.has(remoteAvatarUrl) && remoteAvatarUrl) ||
    null;

  return (
    <span className={`avatar-ring avatar-ring-${size}`} aria-hidden="true">
      <span className="account-avatar">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() =>
              setFailedImageUrls((previous) => {
                const next = new Set(previous);
                next.add(imageUrl);
                return next;
              })
            }
          />
        ) : (
          <span className="avatar-initials">{getInitials(account)}</span>
        )}
      </span>
    </span>
  );
}
