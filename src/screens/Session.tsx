import { useEffect, useState } from 'react';
import { CardView, isGradable } from '../components/CardView';
import { useStore } from '../store';
import type { Grade } from '../types';

export function Session() {
  const session = useStore(s => s.session);
  const cards = useStore(s => s.cards);
  const states = useStore(s => s.states);
  const gradeCurrent = useStore(s => s.gradeCurrent);
  const abandonSession = useStore(s => s.abandonSession);

  const currentId = session?.currentId ?? null;
  const [revealed, setRevealed] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [mcqChoice, setMcqChoice] = useState<number | null>(null);
  const [tick, setTick] = useState(() => Date.now());

  // Reset per-card interaction state whenever the card changes
  useEffect(() => {
    setRevealed(false);
    setStepIdx(-1);
    setMcqChoice(null);
  }, [currentId]);

  useEffect(() => {
    const t = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const card = currentId ? cards[currentId] : undefined;
  const state = currentId ? states[currentId] : undefined;

  const elapsed = session ? tick - session.startedAt : 0;
  const timeUp = session?.budgetMs != null && elapsed >= session.budgetMs;
  const progress =
    session?.budgetMs != null ? Math.min(1, elapsed / session.budgetMs) : 0;

  const onGrade = (grade: Grade) => gradeCurrent(grade, timeUp);
  const onReveal = () => setRevealed(true);
  const onNextStep = () => setStepIdx(i => i + 1);
  const onChoose = (i: number) => setMcqChoice(i);

  // Desktop keyboard shortcuts: Space = reveal/next, 1-4 = grade
  useEffect(() => {
    if (!card) return;
    const handler = (e: KeyboardEvent) => {
      const gradable = isGradable(card, revealed, stepIdx, mcqChoice);
      if (e.key === ' ') {
        e.preventDefault();
        if (!gradable) {
          if (card.type === 'worked-example') setStepIdx(i => i + 1);
          else if (card.type !== 'mcq') setRevealed(true);
        }
      } else if (gradable && ['1', '2', '3', '4'].includes(e.key)) {
        gradeCurrent((Number(e.key) - 1) as Grade, timeUp);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [card, revealed, stepIdx, mcqChoice, timeUp, gradeCurrent]);

  if (!session || !card || !state) return null;

  const exit = () => {
    if (window.confirm('End this session? Everything you graded is already saved.')) {
      abandonSession();
    }
  };

  return (
    <div className="screen session">
      <header className="session-header">
        <button type="button" className="exit-btn" onClick={exit} aria-label="End session">
          End
        </button>
        <span className="session-count">{session.reviewed} done</span>
        {timeUp && <span className="time-up">last card</span>}
      </header>
      {session.budgetMs != null && (
        <div className="time-track">
          <div className="time-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      <CardView
        card={card}
        state={state}
        revealed={revealed}
        stepIdx={stepIdx}
        mcqChoice={mcqChoice}
        onReveal={onReveal}
        onNextStep={onNextStep}
        onChoose={onChoose}
        onGrade={onGrade}
      />
    </div>
  );
}
