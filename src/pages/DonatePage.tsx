import { EmptyState } from '../components/EmptyState';

export function DonatePage() {
  return (
    <section className="content-page" aria-labelledby="donate-title">
      <p className="eyebrow">More</p>
      <h1 id="donate-title">Donate</h1>
      <p className="page-description">
        This section will share donation destinations after their organizations
        and official payment pages have been reviewed. Check an organization’s
        current reports, fees, and eligibility details before contributing.
      </p>
      <EmptyState
        icon="♡"
        title="No donation destinations are published"
        description="Reviewed donation links will appear here when they are ready."
      />
    </section>
  );
}
