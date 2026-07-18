/**
 * DevDeck — comprehensive test suite
 *
 * Covers everything beyond the pure-unit suites (scheduler.test.ts, queue.test.ts):
 *
 *  1. Content QA        — automated validation of all 265 bundled cards
 *  2. Scheduler+Queue   — integration of SM-2 scheduling with queue building
 *  3. Database          — Dexie persistence: seeding, reviews, export/import/reset
 *                         (runs against fake-indexeddb, no browser needed)
 *  4. Store             — full session flows through the Zustand store
 *  5. Date helpers      — streak / daily-cap day-boundary logic
 *
 * The manual QA checklist (PWA install, offline, visuals) lives in TESTING.md.
 */
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { allCards, allDecks } from './content';
import type { Card, Grade, ReviewState, Settings } from './types';
import { createNewReviewState, schedule } from './scheduler';
import { buildQueue, getDueCounts } from './queue';
import {
  buildExport,
  db,
  defaultMeta,
  defaultSettings,
  importData,
  putMeta,
  resetProgress,
  saveReview,
  seedAndLoad,
} from './db';
import { localDayStr, newIntroducedToday, useStore } from './store';

const NOW = new Date(2026, 5, 1, 12, 0, 0).getTime(); // local noon
const MIN = 60_000;
const DAY = 86_400_000;
const CLOZE_MARKER = /\{\{c\d+::[^{}]+\}\}/g;

// ---------------------------------------------------------------------------
// 1. Content QA — every bundled card is validated automatically
// ---------------------------------------------------------------------------

describe('content QA: bundled card library', () => {
  it('ships 265 cards across 11 decks', () => {
    expect(allCards).toHaveLength(265);
    expect(allDecks).toHaveLength(11);
  });

  it('card ids are unique', () => {
    const ids = allCards.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('deck ids and display orders are unique', () => {
    expect(new Set(allDecks.map(d => d.id)).size).toBe(allDecks.length);
    expect(new Set(allDecks.map(d => d.order)).size).toBe(allDecks.length);
  });

  it('every card belongs to a defined deck', () => {
    const deckIds = new Set(allDecks.map(d => d.id));
    for (const card of allCards) {
      expect(deckIds.has(card.deckId), `${card.id} -> ${card.deckId}`).toBe(true);
    }
  });

  it('every deck has at least 10 cards', () => {
    for (const deck of allDecks) {
      const count = allCards.filter(c => c.deckId === deck.id).length;
      expect(count, deck.id).toBeGreaterThanOrEqual(10);
    }
  });

  it('tags are present and lowercase-kebab', () => {
    for (const card of allCards) {
      expect(card.tags.length, card.id).toBeGreaterThan(0);
      for (const tag of card.tags) {
        expect(tag, `${card.id} tag "${tag}"`).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });

  it('code snippets stay phone-sized (max 12 lines)', () => {
    for (const card of allCards) {
      const snippets: string[] = [];
      if (card.type === 'predict-output' || card.type === 'cloze') snippets.push(card.code);
      if (card.type === 'mcq' && card.code !== undefined) snippets.push(card.code);
      if (card.type === 'worked-example') {
        for (const step of card.steps) if (step.code !== undefined) snippets.push(step.code);
      }
      for (const code of snippets) {
        expect(code.split('\n').length, card.id).toBeLessThanOrEqual(12);
      }
    }
  });

  it('predict-output cards have a non-empty answer and explanation', () => {
    for (const card of allCards) {
      if (card.type !== 'predict-output') continue;
      expect(card.answer.trim().length, card.id).toBeGreaterThan(0);
      expect(card.explanation.trim().length, card.id).toBeGreaterThan(0);
    }
  });

  it('cloze cards contain at least one well-formed marker and no stray braces', () => {
    for (const card of allCards) {
      if (card.type !== 'cloze') continue;
      const matches = card.code.match(CLOZE_MARKER) ?? [];
      expect(matches.length, card.id).toBeGreaterThan(0);
      // After removing valid markers, no marker syntax should remain
      const leftover = card.code.replace(CLOZE_MARKER, '');
      expect(leftover.includes('{{'), `${card.id} has malformed marker`).toBe(false);
      expect(card.explanation.trim().length, card.id).toBeGreaterThan(0);
    }
  });

  it('mcq cards have 2-4 choices, a valid answer index, and an explanation', () => {
    for (const card of allCards) {
      if (card.type !== 'mcq') continue;
      expect(card.choices.length, card.id).toBeGreaterThanOrEqual(2);
      expect(card.choices.length, card.id).toBeLessThanOrEqual(4);
      expect(card.correctIndex, card.id).toBeGreaterThanOrEqual(0);
      expect(card.correctIndex, card.id).toBeLessThan(card.choices.length);
      expect(card.explanation.trim().length, card.id).toBeGreaterThan(0);
      if (card.code !== undefined) expect(card.language, card.id).toBeDefined();
    }
  });

  it('worked examples have a title, prompt, and at least two steps with text', () => {
    for (const card of allCards) {
      if (card.type !== 'worked-example') continue;
      expect(card.title.trim().length, card.id).toBeGreaterThan(0);
      expect(card.prompt.trim().length, card.id).toBeGreaterThan(0);
      expect(card.steps.length, card.id).toBeGreaterThanOrEqual(2);
      for (const step of card.steps) {
        expect(step.text.trim().length, card.id).toBeGreaterThan(0);
      }
    }
  });

  it('qa cards have a question and an answer', () => {
    for (const card of allCards) {
      if (card.type !== 'qa') continue;
      expect(card.question.trim().length, card.id).toBeGreaterThan(0);
      expect(card.answer.trim().length, card.id).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Scheduler + queue integration
// ---------------------------------------------------------------------------

describe('scheduler + queue integration', () => {
  const card: Card = {
    id: 'sim-1',
    deckId: 'd1',
    type: 'qa',
    tags: ['sim'],
    createdAt: 0,
    question: 'q',
    answer: 'a',
  };
  const settings: Settings = { ...defaultSettings(), enabledDeckIds: ['d1'] };

  it('a new card moves through learning, leaves today, and returns when due', () => {
    let state = createNewReviewState('sim-1', NOW);
    // New card is offered
    expect(buildQueue([state], [card], settings, NOW, 0)).toHaveLength(1);

    // Good -> learning, due in 10 min: gone from an immediate queue
    state = schedule(state, 2, NOW);
    expect(state.status).toBe('learning');
    expect(buildQueue([state], [card], settings, NOW, 0)).toHaveLength(0);

    // Good at the 10-min mark -> graduates to review, due tomorrow
    state = schedule(state, 2, state.due);
    expect(state.status).toBe('review');
    expect(state.intervalDays).toBe(1);
    expect(buildQueue([state], [card], settings, NOW + 11 * MIN, 0)).toHaveLength(0);

    // Tomorrow it is due again
    const tomorrow = state.due;
    expect(buildQueue([state], [card], settings, tomorrow, 0).map(q => q.cardId)).toEqual([
      'sim-1',
    ]);
    expect(getDueCounts([state], [card], settings, tomorrow, 0).due).toBe(1);
  });

  it('a lapsed mature card relearns and re-graduates at half interval', () => {
    let state: ReviewState = {
      cardId: 'sim-1',
      ease: 2.5,
      intervalDays: 20,
      due: NOW,
      status: 'review',
      learningStepIndex: 0,
      lapses: 0,
      reps: 10,
    };
    state = schedule(state, 0, NOW); // Again -> lapse
    expect(state.status).toBe('relearning');
    expect(state.lapses).toBe(1);
    // Due in 10 minutes, so back in the queue mid-session
    expect(buildQueue([state], [card], settings, NOW, 0)).toHaveLength(0);
    expect(buildQueue([state], [card], settings, NOW + 11 * MIN, 0)).toHaveLength(1);
    // Re-graduation halves the old 20-day interval
    state = schedule(state, 2, state.due);
    expect(state.status).toBe('review');
    expect(state.intervalDays).toBe(10);
  });

  it('scheduler never produces an invalid state across 500 seeded-random grades', () => {
    let seed = 42;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    let state = createNewReviewState('x', NOW);
    let now = NOW;
    for (let i = 0; i < 500; i++) {
      const grade = Math.floor(rnd() * 4) as Grade;
      state = schedule(state, grade, now, rnd());
      expect(state.ease).toBeGreaterThanOrEqual(1.3);
      expect(state.intervalDays).toBeLessThanOrEqual(365);
      expect(state.due).toBeGreaterThan(now);
      expect(['learning', 'review', 'relearning']).toContain(state.status);
      now = state.due; // always review exactly when due
    }
    expect(state.reps).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// 3. Database integration (Dexie on fake-indexeddb)
// ---------------------------------------------------------------------------

describe('database integration', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  it('first launch seeds every card with a fresh review state', async () => {
    const loaded = await seedAndLoad(NOW);
    expect(loaded.cards).toHaveLength(allCards.length);
    expect(loaded.states).toHaveLength(allCards.length);
    expect(loaded.states.every(s => s.status === 'new')).toBe(true);
    expect(loaded.decks.map(d => d.id)).toEqual(allDecks.map(d => d.id));
    expect(loaded.settings.newCardsPerDay).toBe(10);
    expect(loaded.meta.streak).toBe(0);
  });

  it('re-seeding on a later launch never clobbers progress', async () => {
    await seedAndLoad(NOW);
    const first = allCards[0];
    const graded = schedule(createNewReviewState(first.id, NOW), 2, NOW);
    await saveReview(graded, {
      cardId: first.id,
      reviewedAt: NOW,
      grade: 2,
      msTaken: 1200,
      statusBefore: 'new',
    });

    const again = await seedAndLoad(NOW + DAY);
    const found = again.states.find(s => s.cardId === first.id);
    expect(found?.status).toBe('learning');
    expect(again.states).toHaveLength(allCards.length);
    expect(await db.reviewLogs.count()).toBe(1);
  });

  it('saveReview persists the state and appends a log', async () => {
    await seedAndLoad(NOW);
    const id = allCards[3].id;
    const next = schedule(createNewReviewState(id, NOW), 0, NOW);
    await saveReview(next, {
      cardId: id,
      reviewedAt: NOW,
      grade: 0,
      msTaken: 900,
      statusBefore: 'new',
    });
    const stored = await db.reviewStates.get(id);
    expect(stored?.status).toBe('learning');
    const logs = await db.reviewLogs.toArray();
    expect(logs).toHaveLength(1);
    expect(logs[0].grade).toBe(0);
    expect(logs[0].statusBefore).toBe('new');
  });

  it('export -> reset -> import round-trips progress exactly', async () => {
    await seedAndLoad(NOW);
    const id = allCards[0].id;
    const graded = schedule(createNewReviewState(id, NOW), 3, NOW); // Easy -> review, 4d
    await saveReview(graded, {
      cardId: id,
      reviewedAt: NOW,
      grade: 3,
      msTaken: 800,
      statusBefore: 'new',
    });
    await putMeta({ ...defaultMeta(), streak: 3, bestStreak: 5, lastReviewDay: '2026-06-01' });

    const backup = await buildExport();
    expect(backup.reviewStates).toHaveLength(allCards.length);
    expect(backup.reviewLogs).toHaveLength(1);

    await resetProgress(NOW);
    const wiped = await seedAndLoad(NOW);
    expect(wiped.states.every(s => s.status === 'new')).toBe(true);
    expect(wiped.meta.streak).toBe(0);
    expect(await db.reviewLogs.count()).toBe(0);

    const restoredCount = await importData(backup, NOW);
    expect(restoredCount).toBe(allCards.length);
    const after = await seedAndLoad(NOW);
    expect(after.states.find(s => s.cardId === id)?.status).toBe('review');
    expect(after.states.find(s => s.cardId === id)?.intervalDays).toBe(4);
    expect(after.meta.streak).toBe(3);
    expect(after.meta.bestStreak).toBe(5);
    expect(await db.reviewLogs.count()).toBe(1);
  });

  it('import silently drops states for card ids that no longer exist', async () => {
    await seedAndLoad(NOW);
    const backup = await buildExport();
    backup.reviewStates.push(createNewReviewState('deleted-card-999', NOW));
    await importData(backup, NOW);
    expect(await db.reviewStates.get('deleted-card-999')).toBeUndefined();
    expect(await db.reviewStates.count()).toBe(allCards.length);
  });

  it('import rejects an unsupported schema version', async () => {
    await seedAndLoad(NOW);
    const backup = await buildExport();
    await expect(importData({ ...backup, schemaVersion: 999 }, NOW)).rejects.toThrow(
      /version/i
    );
  });
});

// ---------------------------------------------------------------------------
// 4. Store integration — complete session flows
// ---------------------------------------------------------------------------

describe('store integration: session flows', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    useStore.setState({
      ready: false,
      route: 'home',
      decks: [],
      cards: {},
      states: {},
      settings: defaultSettings(),
      meta: defaultMeta(),
      session: null,
      lastSummary: null,
      lastBudgetMs: null,
      updateApp: null,
    });
  });

  it('init loads content, states, and marks the app ready', async () => {
    await useStore.getState().init();
    const s = useStore.getState();
    expect(s.ready).toBe(true);
    expect(Object.keys(s.cards)).toHaveLength(allCards.length);
    expect(Object.keys(s.states)).toHaveLength(allCards.length);
    expect(s.decks).toHaveLength(allDecks.length);
  });

  it('runs a complete first session: 10 new cards, learning re-entry, summary', async () => {
    await useStore.getState().init();
    useStore.getState().startSession(5 * MIN);

    let s = useStore.getState();
    expect(s.route).toBe('session');
    expect(s.session?.currentId).toBeTruthy();
    expect(s.lastBudgetMs).toBe(5 * MIN);

    // Grade Good until the session ends. Each of the 10 new cards enters
    // learning (due +10 min), is served early once the main queue empties,
    // and graduates on its second Good -> exactly 20 reviews.
    let guard = 0;
    while (useStore.getState().session !== null && guard < 100) {
      useStore.getState().gradeCurrent(2, false);
      guard++;
    }

    s = useStore.getState();
    expect(guard).toBe(20);
    expect(s.session).toBeNull();
    expect(s.route).toBe('summary');
    expect(s.lastSummary?.reviewed).toBe(20);
    expect(s.lastSummary?.correct).toBe(20);
    expect(s.lastSummary?.newIntroduced).toBe(10);

    // All 10 introduced cards graduated to review
    const graduated = Object.values(s.states).filter(st => st.status === 'review');
    expect(graduated).toHaveLength(10);

    // Streak + daily new-card accounting
    expect(s.meta.streak).toBe(1);
    expect(s.meta.bestStreak).toBe(1);
    expect(newIntroducedToday(s.meta, Date.now())).toBe(10);

    // Every grade was persisted (writes are fire-and-forget, so wait)
    await vi.waitFor(async () => {
      expect(await db.reviewLogs.count()).toBe(20);
    });
  });

  it('daily new-card cap: a second session offers no more new cards', async () => {
    await useStore.getState().init();
    useStore.getState().startSession(null);
    let guard = 0;
    while (useStore.getState().session !== null && guard < 100) {
      useStore.getState().gradeCurrent(3, false); // Easy -> graduate immediately
      guard++;
    }
    expect(guard).toBe(10); // 10 new cards, one grade each

    // Cap consumed: nothing left to start
    const s = useStore.getState();
    const counts = getDueCounts(
      Object.values(s.states),
      Object.values(s.cards),
      s.settings,
      Date.now(),
      newIntroducedToday(s.meta, Date.now())
    );
    expect(counts.new).toBe(0);
    expect(counts.due).toBe(0);
    useStore.getState().startSession(null);
    expect(useStore.getState().session).toBeNull(); // refuses to start empty
  });

  it('soft cutoff: endAfterCurrent finishes after the graded card', async () => {
    await useStore.getState().init();
    useStore.getState().startSession(5 * MIN);
    useStore.getState().gradeCurrent(2, true); // time is up
    const s = useStore.getState();
    expect(s.session).toBeNull();
    expect(s.route).toBe('summary');
    expect(s.lastSummary?.reviewed).toBe(1);
  });

  it('abandoning with zero reviews returns home; with reviews shows summary', async () => {
    await useStore.getState().init();
    useStore.getState().startSession(5 * MIN);
    useStore.getState().abandonSession();
    expect(useStore.getState().route).toBe('home');
    expect(useStore.getState().lastSummary).toBeNull();

    useStore.getState().startSession(5 * MIN);
    useStore.getState().gradeCurrent(2, false);
    useStore.getState().abandonSession();
    const s = useStore.getState();
    expect(s.route).toBe('summary');
    expect(s.lastSummary?.reviewed).toBe(1);
  });

  it('updateSettings applies in memory and persists', async () => {
    await useStore.getState().init();
    useStore.getState().updateSettings({ newCardsPerDay: 5, theme: 'light' });
    expect(useStore.getState().settings.newCardsPerDay).toBe(5);
    await vi.waitFor(async () => {
      const row = await db.settings.get('settings');
      expect(row?.newCardsPerDay).toBe(5);
      expect(row?.theme).toBe('light');
    });
  });

  it('wipeProgress resets states, meta, and logs', async () => {
    await useStore.getState().init();
    useStore.getState().startSession(null);
    useStore.getState().gradeCurrent(2, true);
    await vi.waitFor(async () => {
      expect(await db.reviewLogs.count()).toBe(1);
    });

    await useStore.getState().wipeProgress();
    const s = useStore.getState();
    expect(Object.values(s.states).every(st => st.status === 'new')).toBe(true);
    expect(s.meta.streak).toBe(0);
    expect(await db.reviewLogs.count()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Date helpers — day boundaries drive streaks and the daily cap
// ---------------------------------------------------------------------------

describe('date helpers', () => {
  it('localDayStr formats local dates as YYYY-MM-DD with zero padding', () => {
    expect(localDayStr(new Date(2026, 0, 5, 23, 30).getTime())).toBe('2026-01-05');
    expect(localDayStr(new Date(2026, 11, 31, 0, 0).getTime())).toBe('2026-12-31');
  });

  it('newIntroducedToday counts only the current local day', () => {
    const noon = new Date(2026, 0, 5, 12).getTime();
    const meta = { ...defaultMeta(), newIntroDay: '2026-01-05', newIntroCount: 7 };
    expect(newIntroducedToday(meta, noon)).toBe(7);
    expect(newIntroducedToday(meta, noon + DAY)).toBe(0); // next day resets
    expect(newIntroducedToday(defaultMeta(), noon)).toBe(0); // never introduced
  });
});
