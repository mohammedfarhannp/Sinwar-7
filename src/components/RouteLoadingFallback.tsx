export function RouteLoadingFallback() {
  return (
    <section
      className="content-page"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="eyebrow">Loading</p>
      <h1>Opening this section</h1>
      <p className="page-description">The page is loading.</p>
    </section>
  );
}
