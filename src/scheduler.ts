// DevDeck — SM-2 Spaced Repetition Scheduler
// Pure function module — no I/O, fully unit-testable

import type { ReviewState, Grade } from './types';

// Learning steps in milliseconds
const LEARNING_STEPS_MS = [1 * 60 * 1000, 10 * 60 * 1000]; // 1 min, 10 min
const RELEARNING_STEPS_MS = [10 * 60 * 1000]; // 10 min

const DAY_MS = 86_400_000;
const MIN_EASE = 1.3;
const MAX_INTERVAL_DAYS = 365;

/**
 * Apply a ±5% random fuzz to intervals ≥ 3 days to avoid review clumping.
 * Uses a deterministic seed based on cardId hash for reproducibility in tests
 * when called with the optional seed parameter.
 */
function fuzzInterval(intervalDays: number, seed?: number): number {
  if (intervalDays < 3) return intervalDays;
  const rand = seed !== undefined ? seed : Math.random();
  const fuzz = 1 + (rand - 0.5) * 0.1; // ±5%
  return Math.max(1, Math.round(intervalDays * fuzz));
}

function clampEase(ease: number): number {
  return Math.max(MIN_EASE, ease);
}

function clampInterval(days: number): number {
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, days));
}

function getLearningSteps(status: ReviewState['status']): number[] {
  return status === 'relearning' ? RELEARNING_STEPS_MS : LEARNING_STEPS_MS;
}

/**
 * Core scheduler: given a review state + grade + current time,
 * returns the updated ReviewState. Pure function.
 */
export function schedule(
  state: ReviewState,
  grade: Grade,
  now: number,
  fuzzSeed?: number
): ReviewState {
  const next = { ...state };
  next.reps = state.reps + 1;

  if (state.status === 'new' || state.status === 'learning' || state.status === 'relearning') {
    return scheduleLearning(state, next, grade, now);
  } else {
    return scheduleReview(state, next, grade, now, fuzzSeed);
  }
}

function scheduleLearning(
  prev: ReviewState,
  next: ReviewState,
  grade: Grade,
  now: number
): ReviewState {
  const steps = getLearningSteps(prev.status === 'new' ? 'learning' : prev.status);
  const isRelearning = prev.status === 'relearning';

  // If status is 'new', transition to 'learning'
  if (prev.status === 'new') {
    next.status = 'learning';
  }

  switch (grade) {
    case 0: // Again — back to step 0
      next.learningStepIndex = 0;
      next.due = now + steps[0];
      if (isRelearning) {
        next.status = 'relearning';
      }
      break;

    case 1: // Hard — repeat current step, interval × 1.5
      next.learningStepIndex = prev.learningStepIndex;
      const currentStep = steps[Math.min(prev.learningStepIndex, steps.length - 1)];
      next.due = now + Math.round(currentStep * 1.5);
      break;

    case 2: // Good — next step; after final step, graduate
      if (prev.learningStepIndex >= steps.length - 1) {
        // Graduate
        return graduate(prev, next, now, 1, isRelearning);
      } else {
        next.learningStepIndex = prev.learningStepIndex + 1;
        next.due = now + steps[next.learningStepIndex];
      }
      break;

    case 3: // Easy — graduate immediately with 4-day interval
      return graduate(prev, next, now, 4, isRelearning);
  }

  return next;
}

function graduate(
  prev: ReviewState,
  next: ReviewState,
  now: number,
  intervalDays: number,
  isRelearning: boolean
): ReviewState {
  next.status = 'review';
  next.learningStepIndex = 0;

  if (isRelearning) {
    // On re-graduation, interval = max(1, round(prevInterval × 0.5))
    // but if graduating via Easy, use 4 days minimum
    if (intervalDays === 4) {
      next.intervalDays = Math.max(4, Math.round(prev.intervalDays * 0.5));
    } else {
      next.intervalDays = Math.max(1, Math.round(prev.intervalDays * 0.5));
    }
  } else {
    next.intervalDays = intervalDays;
  }

  next.due = now + next.intervalDays * DAY_MS;
  return next;
}

function scheduleReview(
  prev: ReviewState,
  next: ReviewState,
  grade: Grade,
  now: number,
  fuzzSeed?: number
): ReviewState {
  const prevInterval = prev.intervalDays;

  switch (grade) {
    case 0: { // Again — lapse
      next.lapses = prev.lapses + 1;
      next.ease = clampEase(prev.ease - 0.20);
      next.status = 'relearning';
      next.learningStepIndex = 0;
      next.due = now + RELEARNING_STEPS_MS[0];
      // intervalDays stays as prev for re-graduation calculation
      next.intervalDays = prevInterval;
      break;
    }

    case 1: { // Hard
      next.ease = clampEase(prev.ease - 0.15);
      const hardInterval = Math.max(prevInterval + 1, Math.round(prevInterval * 1.2));
      next.intervalDays = clampInterval(fuzzInterval(hardInterval, fuzzSeed));
      next.due = now + next.intervalDays * DAY_MS;
      break;
    }

    case 2: { // Good
      const goodInterval = Math.max(prevInterval + 1, Math.round(prevInterval * prev.ease));
      next.intervalDays = clampInterval(fuzzInterval(goodInterval, fuzzSeed));
      next.due = now + next.intervalDays * DAY_MS;
      break;
    }

    case 3: { // Easy
      next.ease = prev.ease + 0.15;
      const easyInterval = Math.round(prevInterval * prev.ease * 1.3);
      next.intervalDays = clampInterval(fuzzInterval(easyInterval, fuzzSeed));
      next.due = now + next.intervalDays * DAY_MS;
      break;
    }
  }

  return next;
}

/**
 * Get human-readable interval preview strings for all grades.
 * Used on the grade buttons (e.g., "Again <10m · Hard 2d · Good 4d · Easy 8d")
 */
export function getIntervalPreviews(
  state: ReviewState,
  now: number
): Record<Grade, string> {
  const previews = {} as Record<Grade, string>;
  for (const grade of [0, 1, 2, 3] as Grade[]) {
    const nextState = schedule(state, grade, now, 0.5); // use 0.5 for no fuzz in preview
    const diffMs = nextState.due - now;
    previews[grade] = formatInterval(diffMs);
  }
  return previews;
}

function formatInterval(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return '<1m';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.round(days / 365)}y`;
}

/**
 * Create a fresh ReviewState for a new card.
 */
export function createNewReviewState(cardId: string, now: number): ReviewState {
  return {
    cardId,
    ease: 2.5,
    intervalDays: 0,
    due: now,
    status: 'new',
    learningStepIndex: 0,
    lapses: 0,
    reps: 0,
  };
}
