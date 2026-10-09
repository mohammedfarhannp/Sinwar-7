import { useState } from 'react';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import { timelineEntries, timelineEras } from '../data/timeline';

export function StoryPage() {
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const visibleEntries = timelineEntries.filter(
    (entry) => selectedEra === null || entry.era === selectedEra,
  );
  const reduceMotion = prefersReducedMotion ?? true;

  return (
    <MotionConfig reducedMotion="user">
      <section
        className="content-page story-page"
        aria-labelledby="story-title"
      >
        <p className="eyebrow">History</p>
        <h1 id="story-title">A timeline of Palestinian history</h1>
        <p className="page-description story-description">
          Selected events, agreements, and public records that have shaped
          Palestinian history and the Israeli-Palestinian conflict. Each entry
          links to its sources; dates and summaries are kept concise.
        </p>

        <div className="story-filter-block">
          <p className="story-filter-label" id="story-filter-label">
            Filter by period
          </p>
          <div
            className="story-filter"
            role="group"
            aria-labelledby="story-filter-label"
          >
            <button
              className="filter-chip"
              type="button"
              aria-pressed={selectedEra === null}
              onClick={() => setSelectedEra(null)}
            >
              All periods
            </button>
            {timelineEras.map((era) => (
              <button
                className="filter-chip"
                type="button"
                key={era}
                aria-pressed={selectedEra === era}
                onClick={() => setSelectedEra(era)}
              >
                {era}
              </button>
            ))}
          </div>
        </div>

        <p className="story-result-count" role="status" aria-live="polite">
          {selectedEra
            ? `Showing ${visibleEntries.length} ${visibleEntries.length === 1 ? 'entry' : 'entries'} for ${selectedEra}.`
            : `Showing all ${visibleEntries.length} timeline entries.`}
        </p>

        <ol className="story-timeline" aria-label="Timeline events">
          {visibleEntries.map((entry, index) => (
            <motion.li
              key={entry.id}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.42,
                delay: Math.min((index % 3) * 0.04, 0.08),
              }}
            >
              <article className="timeline-card">
                <time className="timeline-date" dateTime={entry.date}>
                  {entry.dateLabel}
                </time>
                <h2>{entry.title}</h2>
                <p className="timeline-summary">{entry.summary}</p>
                <p className="timeline-detail">{entry.detail}</p>
                <details className="timeline-sources">
                  <summary>Sources ({entry.sources.length})</summary>
                  <ul>
                    {entry.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.label}
                          <span className="external-link-note">
                            {' '}
                            (opens in a new tab)
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              </article>
            </motion.li>
          ))}
        </ol>
      </section>
    </MotionConfig>
  );
}
