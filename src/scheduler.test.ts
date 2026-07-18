import { describe, expect, it } from 'vitest';
import { createNewReviewState, getIntervalPreviews, schedule } from './scheduler';
import type { ReviewState } from './types';

const MIN = 60_000;
const DAY = 86_400_000;
const NOW = 1_750_000_000_000;
const NO_FUZZ = 0.5; // seed 0.5 => fuzz factor 1.0

function reviewState(overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    cardId: 'c1',
    ease: 2.5,
    intervalDays: 10,
    due: NOW,
    status: 'review',
    learningStepIndex: 0,
    lapses: 0,
    reps: 5,
    ...overrides,
  };
}

describe('learning steps', () => {
  it('new card graded Good moves to step 2 (10 min)', () => {
    const next = schedule(createNewReviewState('c1', NOW), 2, NOW);
    expect(next.status).toBe('learning');
    expect(next.learningStepIndex).toBe(1);
    expect(next.due).toBe(NOW + 10 * MIN);
  });

  it('new card graded Again stays at step 0 (1 min)', () => {
    const next = schedule(createNewReviewState('c1', NOW), 0, NOW);
    expect(next.status).toBe('learning');
    expect(next.learningStepIndex).toBe(0);
    expect(next.due).toBe(NOW + 1 * MIN);
  });

  it('Hard repeats the current step at 1.5x', () => {
    const next = schedule(createNewReviewState('c1', NOW), 1, NOW);
    expect(next.learningStepIndex).toBe(0);
    expect(next.due).toBe(NOW + 1.5 * MIN);
  });

  it('Good on the final step graduates with a 1-day interval', () => {
    const learning = reviewState({ status: 'learning', learningStepIndex: 1, intervalDays: 0 });
    const next = schedule(learning, 2, NOW);
    expect(next.status).toBe('review');
    expect(next.intervalDays).toBe(1);
    expect(next.due).toBe(NOW + 1 * DAY);
  });

  it('Easy graduates immediately with a 4-day interval', () => {
    const next = schedule(createNewReviewState('c1', NOW), 3, NOW);
    expect(next.status).toBe('review');
    expect(next.intervalDays).toBe(4);
    expect(next.due).toBe(NOW + 4 * DAY);
  });

  it('does not modify ease during learning', () => {
    const next = schedule(createNewReviewState('c1', NOW), 0, NOW);
    expect(next.ease).toBe(2.5);
  });
});

describe('review grading', () => {
  it('Good multiplies interval by ease', () => {
    const next = schedule(reviewState(), 2, NOW, NO_FUZZ);
    expect(next.intervalDays).toBe(25); // max(11, round(10 * 2.5))
    expect(next.ease).toBe(2.5);
    expect(next.due).toBe(NOW + 25 * DAY);
  });

  it('Hard uses 1.2x and drops ease by 0.15', () => {
    const next = schedule(reviewState(), 1, NOW, NO_FUZZ);
    expect(next.intervalDays).toBe(12); // max(11, round(10 * 1.2))
    expect(next.ease).toBeCloseTo(2.35);
  });

  it('Easy applies a 1.3x bonus and raises ease by 0.15', () => {
    const next = schedule(reviewState(), 3, NOW, NO_FUZZ);
    expect(next.intervalDays).toBe(33); // round(10 * 2.5 * 1.3)
    expect(next.ease).toBeCloseTo(2.65);
  });

  it('interval always grows by at least 1 day', () => {
    const next = schedule(reviewState({ intervalDays: 1, ease: 1.3 }), 1, NOW, NO_FUZZ);
    expect(next.intervalDays).toBe(2); // max(2, round(1 * 1.2) = 1)
  });

  it('Again lapses: ease -0.2, relearning, interval preserved for re-graduation', () => {
    const next = schedule(reviewState({ lapses: 1 }), 0, NOW);
    expect(next.status).toBe('relearning');
    expect(next.lapses).toBe(2);
    expect(next.ease).toBeCloseTo(2.3);
    expect(next.due).toBe(NOW + 10 * MIN);
    expect(next.intervalDays).toBe(10);
  });

  it('ease never drops below 1.3', () => {
    const next = schedule(reviewState({ ease: 1.3 }), 0, NOW);
    expect(next.ease).toBe(1.3);
    const hard = schedule(reviewState({ ease: 1.35 }), 1, NOW, NO_FUZZ);
    expect(hard.ease).toBe(1.3);
  });

  it('interval is capped at 365 days', () => {
    const next = schedule(reviewState({ intervalDays: 300 }), 2, NOW, NO_FUZZ);
    expect(next.intervalDays).toBe(365);
  });

  it('fuzz shifts intervals >= 3 days by up to ±5%', () => {
    const low = schedule(reviewState(), 2, NOW, 0); // factor 0.95
    expect(low.intervalDays).toBe(24); // round(25 * 0.95)
    const high = schedule(reviewState(), 2, NOW, 1); // factor 1.05
    expect(high.intervalDays).toBe(26);
  });
});

describe('relearning', () => {
  it('Good re-graduates at half the previous interval', () => {
    const relearning = reviewState({ status: 'relearning', intervalDays: 10 });
    const next = schedule(relearning, 2, NOW);
    expect(next.status).toBe('review');
    expect(next.intervalDays).toBe(5);
  });

  it('re-graduation interval is at least 1 day', () => {
    const relearning = reviewState({ status: 'relearning', intervalDays: 1 });
    const next = schedule(relearning, 2, NOW);
    expect(next.intervalDays).toBe(1);
  });

  it('Again during relearning goes back to step 0', () => {
    const relearning = reviewState({ status: 'relearning', intervalDays: 10 });
    const next = schedule(relearning, 0, NOW);
    expect(next.status).toBe('relearning');
    expect(next.due).toBe(NOW + 10 * MIN);
  });
});

describe('interval previews', () => {
  it('formats previews for a new card', () => {
    const p = getIntervalPreviews(createNewReviewState('c1', NOW), NOW);
    expect(p[0]).toBe('1m');
    expect(p[2]).toBe('10m');
    expect(p[3]).toBe('4d');
  });

  it('formats previews for a mature review card', () => {
    const p = getIntervalPreviews(reviewState({ intervalDays: 100 }), NOW);
    expect(p[0]).toBe('10m');
    expect(p[2]).toMatch(/mo$/); // ~250 days => months
  });
});

describe('bookkeeping', () => {
  it('increments reps on every grade', () => {
    const next = schedule(reviewState({ reps: 7 }), 2, NOW, NO_FUZZ);
    expect(next.reps).toBe(8);
  });

  it('does not mutate the input state', () => {
    const state = reviewState();
    schedule(state, 0, NOW);
    expect(state.status).toBe('review');
    expect(state.lapses).toBe(0);
  });
});
