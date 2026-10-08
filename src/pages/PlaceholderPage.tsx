import { EmptyState } from '../components/EmptyState';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="content-page" aria-labelledby="placeholder-title">
      <p className="eyebrow">Sinwar-7</p>
      <h1 id="placeholder-title">{title}</h1>
      <EmptyState
        icon="◌"
        title="This section is coming soon"
        description={description}
      />
    </section>
  );
}
