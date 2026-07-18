import { describe, expect, it } from 'vitest';
import { buildQueue, getDueCounts } from './queue';
import { ALL_CARD_TYPES } from './types';
import type { Card, ReviewState, Settings } from './types';

const MIN = 60_000;
const DAY = 86_400_000;
// Fixed local-noon timestamp so "end of day" behaves predictably
const NOW = new Date(2026, 6, 7, 12, 0, 0).getTime();

function qaCard(id: string, deckId = 'd1'): Card {
  return { id, deckId, type: 'qa', tags: [], createdAt: 0, question: 'q', answer: 'a' };
}

function state(cardId: string, overrides: Partial<ReviewState> = {}): ReviewState {
  return {
    cardId,
    ease: 2.5,
    intervalDays: 0,
    due: NOW,
    status: 'new',
    learningStepIndex: 0,
    lapses: 0,
    reps: 0,
    ...overrides,
  };
}

function settings(overrides: Partial<Settings> = {}): Settings {
  return {
    newCardsPerDay: 10,
    maxReviewsPerDay: 200,
    enabledCardTypes: [...ALL_CARD_TYPES],
    enabledDeckIds: ['d1'],
    theme: 'dark',
    ...overrides,
  };
}

describe('buildQueue', () => {
  it('puts due learning cards before reviews', () => {
    const cards = [qaCard('l1'), qaCard('r1')];
    const states = [
      state('r1', { status: 'review', due: NOW - DAY, intervalDays: 3 }),
      state('l1', { status: 'learning', due: NOW - MIN }),
    ];
    const q = buildQueue(states, cards, settings(), NOW, 0);
    expect(q.map(x => x.cardId)).toEqual(['l1', 'r1']);
  });

  it('orders reviews by due date (most overdue first)', () => {
    const cards = [qaCard('a'), qaCard('b'), qaCard('c')];
    const states = [
      state('a', { status: 'review', due: NOW - 1 * DAY }),
      state('b', { status: 'review', due: NOW - 3 * DAY }),
      state('c', { status: 'review', due: NOW - 2 * DAY }),
    ];
    const q = buildQueue(states, cards, settings(), NOW, 0);
    expect(q.map(x => x.cardId)).toEqual(['b', 'c', 'a']);
  });

  it('interleaves roughly one new card per four reviews', () => {
    const cards = [
      ...['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].map(id => qaCard(id)),
      qaCard('n1'),
      qaCard('n2'),
    ];
    const states = [
      ...['r1', 'r2', 'r3', 'r4', 'r5', 'r6'].map((id, i) =>
        state(id, { status: 'review' as const, due: NOW - (10 - i) * MIN })
      ),
      state('n1'),
      state('n2'),
    ];
    const q = buildQueue(states, cards, settings(), NOW, 0);
    expect(q.map(x => x.cardId)).toEqual(['r1', 'r2', 'r3', 'r4', 'n1', 'r5', 'r6', 'n2']);
  });

  it('respects the daily new-card cap minus cards already introduced', () => {
    const cards = [qaCard('n1'), qaCard('n2'), qaCard('n3')];
    const states = cards.map(c => state(c.id));
    const q = buildQueue(states, cards, settings({ newCardsPerDay: 3 }), NOW, 2);
    expect(q).toHaveLength(1);
  });

  it('excludes reviews due after today and learning cards not yet due', () => {
    const cards = [qaCard('r1'), qaCard('l1')];
    const states = [
      state('r1', { status: 'review', due: NOW + 2 * DAY }),
      state('l1', { status: 'learning', due: NOW + 5 * MIN }),
    ];
    const q = buildQueue(states, cards, settings({ newCardsPerDay: 0 }), NOW, 0);
    expect(q).toHaveLength(0);
  });

  it('includes reviews due later today', () => {
    const cards = [qaCard('r1')];
    const states = [state('r1', { status: 'review', due: NOW + 60 * MIN })];
    const q = buildQueue(states, cards, settings(), NOW, 0);
    expect(q).toHaveLength(1);
  });

  it('filters by enabled decks and card types', () => {
    const cards = [qaCard('a', 'd1'), qaCard('b', 'd2')];
    const states = [
      state('a', { status: 'review', due: NOW - DAY }),
      state('b', { status: 'review', due: NOW - DAY }),
    ];
    const byDeck = buildQueue(states, cards, settings({ enabledDeckIds: ['d2'] }), NOW, 0);
    expect(byDeck.map(x => x.cardId)).toEqual(['b']);
    const byType = buildQueue(states, cards, settings({ enabledCardTypes: ['mcq'] }), NOW, 0);
    expect(byType).toHaveLength(0);
  });

  it('caps reviews at maxReviewsPerDay', () => {
    const ids = Array.from({ length: 10 }, (_, i) => `r${i}`);
    const cards = ids.map(id => qaCard(id));
    const states = ids.map(id => state(id, { status: 'review' as const, due: NOW - DAY }));
    const q = buildQueue(states, cards, settings({ maxReviewsPerDay: 5, newCardsPerDay: 0 }), NOW, 0);
    expect(q).toHaveLength(5);
  });
});

describe('getDueCounts', () => {
  it('matches queue-building logic', () => {
    const cards = [qaCard('l1'), qaCard('r1'), qaCard('r2'), qaCard('n1'), qaCard('n2')];
    const states = [
      state('l1', { status: 'learning', due: NOW - MIN }),
      state('r1', { status: 'review', due: NOW - DAY }),
      state('r2', { status: 'review', due: NOW + 3 * DAY }), // not today
      state('n1'),
      state('n2'),
    ];
    const counts = getDueCounts(states, cards, settings({ newCardsPerDay: 1 }), NOW, 0);
    expect(counts.due).toBe(2); // l1 + r1
    expect(counts.learning).toBe(1);
    expect(counts.new).toBe(1); // capped
  });
});
