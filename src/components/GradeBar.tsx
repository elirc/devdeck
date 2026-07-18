import { getIntervalPreviews } from '../scheduler';
import type { Grade, ReviewState } from '../types';

const GRADE_LABELS = ['Again', 'Hard', 'Good', 'Easy'] as const;
const GRADE_CLASSES = ['again', 'hard', 'good', 'easy'] as const;

export function GradeBar({
  state,
  onGrade,
  suggested,
}: {
  state: ReviewState;
  onGrade: (grade: Grade) => void;
  suggested?: Grade;
}) {
  const previews = getIntervalPreviews(state, Date.now());
  return (
    <div className="grade-bar">
      {([0, 1, 2, 3] as Grade[]).map(g => (
        <button
          key={g}
          type="button"
          className={`grade-btn grade-${GRADE_CLASSES[g]}${suggested === g ? ' suggested' : ''}`}
          onClick={() => {
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              navigator.vibrate(10);
            }
            onGrade(g);
          }}
        >
          <span className="grade-name">{GRADE_LABELS[g]}</span>
          <span className="grade-interval">{previews[g]}</span>
        </button>
      ))}
    </div>
  );
}
