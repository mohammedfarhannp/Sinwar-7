interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="content-page" aria-labelledby="placeholder-title">
      <p className="eyebrow">Sinwar-7</p>
      <h1 id="placeholder-title">{title}</h1>
      <p className="page-description">{description}</p>
      <div className="placeholder-card">
        <span className="placeholder-icon" aria-hidden="true">
          ◌
        </span>
        <p>This section is part of the phased project plan.</p>
      </div>
    </section>
  );
}
