import { getDueCounts, getPerDeckCounts } from '../queue';
import { newIntroducedToday, useStore } from '../store';

const BUDGETS = [5, 10, 15] as const;

export function Home() {
  const decks = useStore(s => s.decks);
  const cards = useStore(s => s.cards);
  const states = useStore(s => s.states);
  const settings = useStore(s => s.settings);
  const meta = useStore(s => s.meta);
  const startSession = useStore(s => s.startSession);
  const updateSettings = useStore(s => s.updateSettings);

  const now = Date.now();
  const introToday = newIntroducedToday(meta, now);
  const cardList = Object.values(cards);
  const stateList = Object.values(states);
  const counts = getDueCounts(stateList, cardList, settings, now, introToday);
  const perDeck = getPerDeckCounts(stateList, cardList, settings, now, introToday);
  const total = counts.due + counts.new;

  const toggleDeck = (deckId: string) => {
    const enabled = settings.enabledDeckIds.includes(deckId)
      ? settings.enabledDeckIds.filter(id => id !== deckId)
      : [...settings.enabledDeckIds, deckId];
    updateSettings({ enabledDeckIds: enabled });
  };

  return (
    <div className="screen home">
      <header className="home-header">
        <h1 className="logo">DevDeck</h1>
        {meta.streak > 0 && (
          <span className="streak-chip">{meta.streak}-day streak</span>
        )}
      </header>

      <div className="due-summary">
        {total > 0 ? (
          <>
            <span className="due-big">{counts.due}</span>
            <span className="due-label">
              due{counts.new > 0 ? ` · ${counts.new} new` : ''}
            </span>
          </>
        ) : (
          <span className="all-done">All caught up. Come back later.</span>
        )}
      </div>

      <div className="session-buttons">
        {BUDGETS.map(min => (
          <button
            key={min}
            type="button"
            className="session-btn"
            disabled={total === 0}
            onClick={() => startSession(min * 60_000)}
          >
            <span className="session-min">{min}</span>
            <span className="session-unit">min</span>
          </button>
        ))}
      </div>
      {total > 0 && total < 10 && (
        <button
          type="button"
          className="until-done-btn"
          onClick={() => startSession(null)}
        >
          Finish all {total} — no timer
        </button>
      )}

      <section className="deck-list">
        <h2 className="section-title">Decks</h2>
        {decks.map(deck => {
          const enabled = settings.enabledDeckIds.includes(deck.id);
          const dc = perDeck.get(deck.id);
          return (
            <div key={deck.id} className={`deck-row${enabled ? '' : ' disabled'}`}>
              <div className="deck-info">
                <span className="deck-name">{deck.name}</span>
                <span className="deck-counts">
                  {enabled && dc
                    ? `${dc.due} due · ${dc.new} new`
                    : 'off'}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                className={`toggle${enabled ? ' on' : ''}`}
                onClick={() => toggleDeck(deck.id)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
