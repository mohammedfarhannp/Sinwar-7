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
          Timeline entries are a concise selection, checked against the public
          records linked on each entry, including United Nations resolutions,
          reports, and court documents. Legal findings are attributed to the
          body that issued them. Dates and descriptions may be revised when
          source records are corrected or new records become available, and
          historical interpretations can differ.
        </p>
      </div>
    </section>
  );
}
