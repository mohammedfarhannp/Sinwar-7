import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }

  return (
    <section className="hero motif" aria-labelledby="home-title">
      <p className="eyebrow">A personal checklist, at your own pace</p>
      <h1 id="home-title">Make space for choices that feel right to you.</h1>
      <p className="hero-copy">
        Search a community-maintained directory, review the information, and
        keep track of your own decisions on this device.
      </p>
      <form className="search-form" onSubmit={handleSubmit} role="search">
        <label className="sr-only" htmlFor="home-search">
          Search by name or username
        </label>
        <span className="search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a name or @username"
          autoComplete="off"
        />
        <button type="submit" className="primary-button">
          Search
        </button>
      </form>
      <p className="phase-note">
        Search results will be available in the next project phase.
      </p>
      <div className="hero-note">
        <span className="hero-note-mark" aria-hidden="true">
          ✓
        </span>
        <p>
          Your checklist will stay on this device. No account or automatic
          actions are part of this experience.
        </p>
      </div>
    </section>
  );
}
