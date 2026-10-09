import type { Account } from '../types/account';
import { ProfileCard } from './ProfileCard';
import { MotionConfig, motion } from 'motion/react';

interface AccountCardGridProps {
  accounts: Account[];
  isBlocked: (username: string) => boolean;
  onAdd: (username: string) => void;
  onRemove: (username: string) => void;
}

export function AccountCardGrid({
  accounts,
  isBlocked,
  onAdd,
  onRemove,
}: AccountCardGridProps) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div className="profile-grid" role="list" layout>
        {accounts.map((account) => (
          <motion.div
            className="profile-grid-item"
            role="listitem"
            key={account.id}
            layout
          >
            <ProfileCard
              account={account}
              isBlocked={isBlocked(account.username)}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  );
}
