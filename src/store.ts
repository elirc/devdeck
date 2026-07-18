// DevDeck — application store (Zustand)
import { create } from 'zustand';
import type {
  Card,
  Deck,
  ExportData,
  Grade,
  Meta,
  ReviewState,
  SessionSummary,
  Settings,
} from './types';
import { schedule } from './scheduler';
import { buildQueue } from './queue';
import {
  buildExport,
  defaultMeta,
  defaultSettings,
  importData,
  putMeta,
  putSettings,
  resetProgress,
  saveReview,
  seedAndLoad,
} from './db';

export type Route = 'home' | 'session' | 'summary' | 'stats' | 'settings';

const DAY_MS = 86_400_000;

export function localDayStr(t: number): string {
  const d = new Date(t);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function newIntroducedToday(meta: Meta, now: number): number {
  return meta.newIntroDay === localDayStr(now) ? meta.newIntroCount : 0;
}

interface ActiveSession {
  budgetMs: number | null; // null = "until done"
  startedAt: number;
  queue: string[];
  /** learning cards that will come back later in this session */
  delayed: { cardId: string; due: number }[];
  currentId: string | null;
  cardShownAt: number;
  reviewed: number;
  correct: number;
  newIntroduced: number;
}

interface AppStore {
  ready: boolean;
  route: Route;
  decks: Deck[];
  cards: Record<string, Card>;
  states: Record<string, ReviewState>;
  settings: Settings;
  meta: Meta;
  session: ActiveSession | null;
  lastSummary: SessionSummary | null;
  lastBudgetMs: number | null;
  updateApp: (() => void) | null;

  init: () => Promise<void>;
  setRoute: (route: Route) => void;
  startSession: (budgetMs: number | null) => void;
  gradeCurrent: (grade: Grade, endAfterCurrent: boolean) => void;
  abandonSession: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  exportBackup: () => Promise<void>;
  importBackup: (file: File) => Promise<string>;
  wipeProgress: () => Promise<void>;
  setUpdateApp: (fn: () => void) => void;
}

function pickNext(
  queue: string[],
  delayed: { cardId: string; due: number }[],
  now: number
): string | null {
  const dueIdx = delayed.findIndex(d => d.due <= now);
  if (dueIdx !== -1) {
    delayed.sort((a, b) => a.due - b.due);
    const first = delayed[0];
    if (first.due <= now) {
      delayed.shift();
      return first.cardId;
    }
  }
  if (queue.length > 0) return queue.shift() ?? null;
  if (delayed.length > 0) {
    // Nothing else left: serve learning cards early rather than dropping them
    delayed.sort((a, b) => a.due - b.due);
    return delayed.shift()?.cardId ?? null;
  }
  return null;
}

export const useStore = create<AppStore>((set, get) => ({
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

  init: async () => {
    const now = Date.now();
    const loaded = await seedAndLoad(now);
    const cards: Record<string, Card> = {};
    for (const c of loaded.cards) cards[c.id] = c;
    const states: Record<string, ReviewState> = {};
    for (const s of loaded.states) states[s.cardId] = s;
    set({
      ready: true,
      decks: loaded.decks,
      cards,
      states,
      settings: loaded.settings,
      meta: loaded.meta,
    });
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      void navigator.storage.persist();
    }
  },

  setRoute: route => set({ route }),

  startSession: budgetMs => {
    const s = get();
    const now = Date.now();
    const queued = buildQueue(
      Object.values(s.states),
      Object.values(s.cards),
      s.settings,
      now,
      newIntroducedToday(s.meta, now)
    );
    if (queued.length === 0) return;
    const queue = queued.map(q => q.cardId);
    const currentId = queue.shift() ?? null;
    set({
      route: 'session',
      lastBudgetMs: budgetMs,
      session: {
        budgetMs,
        startedAt: now,
        queue,
        delayed: [],
        currentId,
        cardShownAt: now,
        reviewed: 0,
        correct: 0,
        newIntroduced: 0,
      },
    });
  },

  gradeCurrent: (grade, endAfterCurrent) => {
    const s = get();
    const sess = s.session;
    if (!sess?.currentId) return;
    const now = Date.now();
    const cardId = sess.currentId;
    const prev = s.states[cardId];
    const next = schedule(prev, grade, now);

    void saveReview(next, {
      cardId,
      reviewedAt: now,
      grade,
      msTaken: Math.max(0, now - sess.cardShownAt),
      statusBefore: prev.status,
    }).catch(() => undefined);

    // Streak + daily new-card accounting
    const today = localDayStr(now);
    const meta: Meta = { ...s.meta };
    if (meta.lastReviewDay !== today) {
      const yesterday = localDayStr(now - DAY_MS);
      meta.streak = meta.lastReviewDay === yesterday ? meta.streak + 1 : 1;
      meta.bestStreak = Math.max(meta.bestStreak, meta.streak);
      meta.lastReviewDay = today;
    }
    if (prev.status === 'new') {
      if (meta.newIntroDay === today) {
        meta.newIntroCount += 1;
      } else {
        meta.newIntroDay = today;
        meta.newIntroCount = 1;
      }
    }
    void putMeta(meta).catch(() => undefined);

    const states = { ...s.states, [cardId]: next };
    const queue = [...sess.queue];
    const delayed = [...sess.delayed];
    if (next.status === 'learning' || next.status === 'relearning') {
      delayed.push({ cardId, due: next.due });
    }
    const reviewed = sess.reviewed + 1;
    const correct = sess.correct + (grade >= 2 ? 1 : 0);
    const newIntroduced = sess.newIntroduced + (prev.status === 'new' ? 1 : 0);

    const finish = () => {
      set({
        states,
        meta,
        session: null,
        route: 'summary',
        lastSummary: {
          reviewed,
          correct,
          newIntroduced,
          durationMs: now - sess.startedAt,
        },
      });
    };

    if (endAfterCurrent) {
      finish();
      return;
    }
    const nextId = pickNext(queue, delayed, now);
    if (nextId === null) {
      finish();
      return;
    }
    set({
      states,
      meta,
      session: {
        ...sess,
        queue,
        delayed,
        currentId: nextId,
        cardShownAt: now,
        reviewed,
        correct,
        newIntroduced,
      },
    });
  },

  abandonSession: () => {
    const sess = get().session;
    if (!sess) return;
    if (sess.reviewed > 0) {
      set({
        session: null,
        route: 'summary',
        lastSummary: {
          reviewed: sess.reviewed,
          correct: sess.correct,
          newIntroduced: sess.newIntroduced,
          durationMs: Date.now() - sess.startedAt,
        },
      });
    } else {
      set({ session: null, route: 'home' });
    }
  },

  updateSettings: patch => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    void putSettings(settings).catch(() => undefined);
  },

  exportBackup: async () => {
    const payload = await buildExport();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdeck-backup-${localDayStr(Date.now())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importBackup: async file => {
    const text = await file.text();
    const payload = JSON.parse(text) as ExportData;
    const restored = await importData(payload, Date.now());
    const loaded = await seedAndLoad(Date.now());
    const states: Record<string, ReviewState> = {};
    for (const st of loaded.states) states[st.cardId] = st;
    set({ states, settings: loaded.settings, meta: loaded.meta });
    return `Restored progress for ${String(restored)} cards.`;
  },

  wipeProgress: async () => {
    await resetProgress(Date.now());
    const loaded = await seedAndLoad(Date.now());
    const states: Record<string, ReviewState> = {};
    for (const st of loaded.states) states[st.cardId] = st;
    set({ states, meta: loaded.meta });
  },

  setUpdateApp: fn => set({ updateApp: fn }),
}));
