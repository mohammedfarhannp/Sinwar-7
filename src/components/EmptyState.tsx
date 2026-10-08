import { useId, type ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = '○',
}: EmptyStateProps) {
  const titleId = useId();

  return (
    <section className="empty-state" aria-labelledby={titleId}>
      <span className="empty-state-icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
    </section>
  );
}
