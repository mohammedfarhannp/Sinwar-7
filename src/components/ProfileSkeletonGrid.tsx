const SKELETON_COUNT = 6;

export function ProfileSkeletonGrid() {
  return (
    <div
      className="profile-skeleton-grid"
      role="status"
      aria-label="Loading accounts"
      aria-busy="true"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <article
          className="profile-skeleton-card"
          key={index}
          aria-hidden="true"
        >
          <span className="skeleton-block skeleton-avatar" />
          <span className="skeleton-block skeleton-line skeleton-name" />
          <span className="skeleton-block skeleton-line skeleton-handle" />
          <span className="skeleton-block skeleton-chip" />
        </article>
      ))}
    </div>
  );
}
