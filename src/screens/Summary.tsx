import { useEffect } from 'react';
import { useStore } from '../store';

export function Summary() {
  const lastSummary = useStore(s => s.lastSummary);
  const lastBudgetMs = useStore(s => s.lastBudgetMs);
  const meta = useStore(s => s.meta);
  const startSession = useStore(s => s.startSession);
  const setRoute = useStore(s => s.setRoute);

  useEffect(() => {
    if (!lastSummary) setRoute('home');
  }, [lastSummary, setRoute]);

  if (!lastSummary) return null;

  const accuracy =
    lastSummary.reviewed > 0
      ? Math.round((lastSummary.correct / lastSummary.reviewed) * 100)
      : 0;
  const minutes = Math.max(1, Math.round(lastSummary.durationMs / 60_000));

  return (
    <div className="screen summary">
      <h1 className="summary-title">Nice work</h1>
      <div className="summary-grid">
        <div className="stat-box">
          <span className="stat-value">{lastSummary.reviewed}</span>
          <span className="stat-label">cards</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{accuracy}%</span>
          <span className="stat-label">accuracy</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{lastSummary.newIntroduced}</span>
          <span className="stat-label">new</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{minutes}m</span>
          <span className="stat-label">spent</span>
        </div>
      </div>
      {meta.streak > 0 && (
        <p className="summary-streak">{meta.streak}-day streak — keep it going.</p>
      )}
      <div className="summary-actions">
        <button
          type="button"
          className="primary-btn"
          onClick={() => startSession(lastBudgetMs)}
        >
          Keep going
        </button>
        <button type="button" className="secondary-btn" onClick={() => setRoute('home')}>
          Done
        </button>
      </div>
    </div>
  );
}
