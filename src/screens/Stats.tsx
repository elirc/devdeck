import { useEffect, useState } from 'react';
import { getAllLogs } from '../db';
import { useStore } from '../store';
import type { ReviewLog } from '../types';

const DAY_MS = 86_400_000;
const MATURE_DAYS = 21;

function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function Stats() {
  const meta = useStore(s => s.meta);
  const decks = useStore(s => s.decks);
  const cards = useStore(s => s.cards);
  const states = useStore(s => s.states);
  const [logs, setLogs] = useState<ReviewLog[] | null>(null);

  useEffect(() => {
    void getAllLogs().then(setLogs);
  }, []);

  const now = Date.now();

  // Last 30 days of review counts (oldest first)
  const days: { key: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    days.push({ key: dayKey(now - i * DAY_MS), count: 0 });
  }
  let recent = 0;
  let recentCorrect = 0;
  if (logs) {
    const byKey = new Map(days.map(d => [d.key, d]));
    const cutoff = now - 30 * DAY_MS;
    for (const log of logs) {
      const bucket = byKey.get(dayKey(log.reviewedAt));
      if (bucket) bucket.count += 1;
      if (log.reviewedAt >= cutoff) {
        recent += 1;
        if (log.grade >= 2) recentCorrect += 1;
      }
    }
  }
  const maxCount = Math.max(1, ...days.map(d => d.count));
  const retention = recent > 0 ? Math.round((recentCorrect / recent) * 100) : null;

  // Per-deck maturity breakdown
  const deckStats = decks.map(deck => {
    let newCount = 0;
    let learning = 0;
    let young = 0;
    let mature = 0;
    let total = 0;
    for (const card of Object.values(cards)) {
      if (card.deckId !== deck.id) continue;
      total += 1;
      const st = states[card.id];
      if (!st || st.status === 'new') newCount += 1;
      else if (st.status === 'learning' || st.status === 'relearning') learning += 1;
      else if (st.intervalDays >= MATURE_DAYS) mature += 1;
      else young += 1;
    }
    return { deck, newCount, learning, young, mature, total };
  });

  return (
    <div className="screen stats">
      <h1 className="screen-title">Stats</h1>

      <div className="summary-grid">
        <div className="stat-box">
          <span className="stat-value">{meta.streak}</span>
          <span className="stat-label">day streak</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{meta.bestStreak}</span>
          <span className="stat-label">best streak</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{retention !== null ? `${retention}%` : '—'}</span>
          <span className="stat-label">retention (30d)</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{recent}</span>
          <span className="stat-label">reviews (30d)</span>
        </div>
      </div>

      <section>
        <h2 className="section-title">Reviews per day</h2>
        <div className="bar-chart" aria-label="Reviews per day, last 30 days">
          {days.map((d, i) => (
            <div key={i} className="bar-slot" title={`${d.count} reviews`}>
              <div
                className="bar"
                style={{ height: `${Math.max(d.count > 0 ? 8 : 2, (d.count / maxCount) * 100)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="bar-chart-labels">
          <span>30 days ago</span>
          <span>today</span>
        </div>
      </section>

      <section>
        <h2 className="section-title">Decks</h2>
        {deckStats.map(({ deck, newCount, learning, young, mature, total }) => (
          <div key={deck.id} className="deck-stat-row">
            <div className="deck-stat-head">
              <span className="deck-name">{deck.name}</span>
              <span className="deck-counts">
                {mature + young}/{total} seen
              </span>
            </div>
            <div className="deck-progress">
              {mature > 0 && (
                <div className="seg mature" style={{ flexGrow: mature }} title={`${mature} mature`} />
              )}
              {young > 0 && (
                <div className="seg young" style={{ flexGrow: young }} title={`${young} young`} />
              )}
              {learning > 0 && (
                <div className="seg learning" style={{ flexGrow: learning }} title={`${learning} learning`} />
              )}
              {newCount > 0 && (
                <div className="seg fresh" style={{ flexGrow: newCount }} title={`${newCount} new`} />
              )}
            </div>
          </div>
        ))}
        <div className="legend">
          <span><i className="dot mature" /> mature</span>
          <span><i className="dot young" /> young</span>
          <span><i className="dot learning" /> learning</span>
          <span><i className="dot fresh" /> new</span>
        </div>
      </section>
    </div>
  );
}
