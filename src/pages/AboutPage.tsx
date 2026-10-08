export function AboutPage() {
  return (
    <section className="content-page" aria-labelledby="about-title">
      <p className="eyebrow">About</p>
      <h1 id="about-title">A personal tool with a clear purpose.</h1>
      <p className="page-description">
        Sinwar-7 is planned as a calm directory and a private checklist. A
        listing is not a judgment, and each person can make their own choices.
      </p>
      <div className="information-card">
        <h2>Disclaimer</h2>
        <p>
          This is a community-maintained list. It is not affiliated with
          Instagram or Meta. Verify information independently.
        </p>
      </div>
      <div className="information-card">
        <h2>Methodology</h2>
        <p>
          Editorial sourcing and update practices will be documented as the
          directory and educational sections are built.
        </p>
      </div>
    </section>
  );
}
