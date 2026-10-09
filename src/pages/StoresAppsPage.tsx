import { EmptyState } from '../components/EmptyState';

export function StoresAppsPage() {
  return (
    <section className="content-page" aria-labelledby="stores-apps-title">
      <p className="eyebrow">More</p>
      <h1 id="stores-apps-title">Stores &amp; apps</h1>
      <p className="page-description">
        This section will list official publisher pages and verified store
        listings. Check the publisher and app details before installing.
      </p>
      <EmptyState
        icon="▦"
        title="No apps or store listings are published"
        description="Verified publisher and store links will appear here when they are ready."
      />
    </section>
  );
}
