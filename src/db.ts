import { validateImport } from "./importValidation";
// DevDeck — Dexie persistence layer
import Dexie, { type Table } from "dexie";
import type {
  Card,
  Deck,
  ExportData,
  Meta,
  ReviewLog,
  ReviewState,
  Settings,
} from "./types";
import { ALL_CARD_TYPES, SCHEMA_VERSION } from "./types";
import { createNewReviewState } from "./scheduler";
import { allCards, allDecks } from "./content";

type SettingsRow = Settings & { id: string };

class DevDeckDB extends Dexie {
  cards!: Table<Card, string>;
  decks!: Table<Deck, string>;
  reviewStates!: Table<ReviewState, string>;
  reviewLogs!: Table<ReviewLog, number>;
  settings!: Table<SettingsRow, string>;
  meta!: Table<Meta, string>;

  constructor() {
    super("devdeck");
    this.version(1).stores({
      cards: "id, deckId, type",
      decks: "id",
      reviewStates: "cardId, due, status",
      reviewLogs: "++id, cardId, reviewedAt",
      settings: "id",
      meta: "id",
    });
  }
}

export const db = new DevDeckDB();

export function defaultSettings(): Settings {
  return {
    newCardsPerDay: 10,
    maxReviewsPerDay: 200,
    enabledCardTypes: [...ALL_CARD_TYPES],
    enabledDeckIds: allDecks.map((d) => d.id),
    theme: "dark",
  };
}

export function defaultMeta(): Meta {
  return {
    id: "meta",
    lastReviewDay: null,
    streak: 0,
    bestStreak: 0,
    schemaVersion: SCHEMA_VERSION,
    newIntroDay: null,
    newIntroCount: 0,
  };
}

/**
 * Seed bundled content on first launch; on later launches merge in any
 * new card ids shipped with an app update without touching progress.
 */
export async function seedAndLoad(now: number): Promise<{
  decks: Deck[];
  cards: Card[];
  states: ReviewState[];
  settings: Settings;
  meta: Meta;
}> {
  await db.transaction(
    "rw",
    [db.cards, db.decks, db.reviewStates, db.settings, db.meta],
    async () => {
      await db.decks.bulkPut(allDecks);
      await db.cards.bulkPut(allCards);
      const existing = new Set(
        await db.reviewStates.toCollection().primaryKeys(),
      );
      const missing = allCards
        .filter((c) => !existing.has(c.id))
        .map((c) => createNewReviewState(c.id, now));
      if (missing.length > 0) await db.reviewStates.bulkAdd(missing);
      const settings = await db.settings.get("settings");
      if (!settings)
        await db.settings.add({ id: "settings", ...defaultSettings() });
      const meta = await db.meta.get("meta");
      if (!meta) await db.meta.add(defaultMeta());
    },
  );

  const [decks, cards, states, settingsRow, meta] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.reviewStates.toArray(),
    db.settings.get("settings"),
    db.meta.get("meta"),
  ]);
  const { id: _id, ...settings } = settingsRow ?? {
    id: "settings",
    ...defaultSettings(),
  };
  void _id;
  return {
    decks: decks.sort((a, b) => a.order - b.order),
    cards,
    states,
    settings,
    meta: meta ?? defaultMeta(),
  };
}

/** Persist a single graded review atomically (state + log). */
export async function saveReview(
  state: ReviewState,
  log: ReviewLog,
): Promise<void> {
  await db.transaction("rw", [db.reviewStates, db.reviewLogs], async () => {
    await db.reviewStates.put(state);
    await db.reviewLogs.add(log);
  });
}

export async function putMeta(meta: Meta): Promise<void> {
  await db.meta.put(meta);
}

export async function putSettings(settings: Settings): Promise<void> {
  await db.settings.put({ id: "settings", ...settings });
}

export async function getAllLogs(): Promise<ReviewLog[]> {
  return db.reviewLogs.toArray();
}

export async function buildExport(): Promise<ExportData> {
  const [reviewStates, reviewLogs, settingsRow, meta] = await Promise.all([
    db.reviewStates.toArray(),
    db.reviewLogs.toArray(),
    db.settings.get("settings"),
    db.meta.get("meta"),
  ]);
  const { id: _id, ...settings } = settingsRow ?? {
    id: "settings",
    ...defaultSettings(),
  };
  void _id;
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: Date.now(),
    reviewStates,
    reviewLogs,
    settings,
    meta: meta ?? defaultMeta(),
  };
}

/**
 * Full restore from an export payload. States for unknown card ids are
 * ignored gracefully; cards missing a state afterwards are re-created as new.
 */
export async function importData(
  payload: ExportData,
  now: number,
): Promise<number> {
  validateImport(payload);
  const knownIds = new Set(allCards.map((c) => c.id));
  const states = payload.reviewStates.filter((s) => knownIds.has(s.cardId));

  await db.transaction(
    "rw",
    [db.reviewStates, db.reviewLogs, db.settings, db.meta],
    async () => {
      await db.reviewStates.clear();
      await db.reviewStates.bulkAdd(states);
      const restored = new Set(states.map((s) => s.cardId));
      const missing = allCards
        .filter((c) => !restored.has(c.id))
        .map((c) => createNewReviewState(c.id, now));
      if (missing.length > 0) await db.reviewStates.bulkAdd(missing);

      await db.reviewLogs.clear();
      const logs = payload.reviewLogs
        .filter((l) => knownIds.has(l.cardId))
        .map((l) => {
          const { id: _id, ...rest } = l;
          void _id;
          return rest;
        });
      if (logs.length > 0) await db.reviewLogs.bulkAdd(logs);

      await db.settings.put({ id: "settings", ...payload.settings });
      await db.meta.put({ ...payload.meta, id: "meta" });
    },
  );
  return states.length;
}

/** Wipe all progress (states, logs, streaks) but keep content. */
export async function resetProgress(now: number): Promise<void> {
  await db.transaction(
    "rw",
    [db.reviewStates, db.reviewLogs, db.meta],
    async () => {
      await db.reviewStates.clear();
      await db.reviewStates.bulkAdd(
        allCards.map((c) => createNewReviewState(c.id, now)),
      );
      await db.reviewLogs.clear();
      await db.meta.put(defaultMeta());
    },
  );
}
