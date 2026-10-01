import { ALL_CARD_TYPES, SCHEMA_VERSION, type ExportData } from "./types";
/** Validate the entire import before opening the replacement transaction. */
export function validateImport(
  payload: unknown,
): asserts payload is ExportData {
  const object = (v: unknown): v is Record<string, any> =>
    !!v && typeof v === "object" && !Array.isArray(v);
  const text = (v: unknown) =>
    typeof v === "string" && v.length > 0 && v.length <= 200;
  const number = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  const integer = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    number(v, min, max) && Number.isInteger(v);
  const day = (v: unknown) =>
    v === null ||
    (typeof v === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      Number.isFinite(Date.parse(v)) &&
      new Date(v).toISOString().slice(0, 10) === v);
  const statuses = ["new", "learning", "review", "relearning"];
  const fail = (field: string): never => {
    throw new Error(`Malformed backup: ${field}`);
  };
  if (!object(payload) || payload.schemaVersion !== SCHEMA_VERSION)
    fail("unsupported schema version");
  const p = payload as Record<string, any>;
  if (
    !number(p.exportedAt) ||
    !Array.isArray(p.reviewStates) ||
    !Array.isArray(p.reviewLogs) ||
    p.reviewStates.length > 100000 ||
    p.reviewLogs.length > 1000000
  )
    fail("review arrays");
  const ids = new Set<string>();
  for (const s of p.reviewStates) {
    if (
      !object(s) ||
      !text(s.cardId) ||
      ids.has(s.cardId) ||
      !number(s.ease, 1, 10) ||
      !number(s.intervalDays) ||
      !number(s.due) ||
      !statuses.includes(s.status) ||
      !integer(s.learningStepIndex, 0, 100) ||
      !integer(s.lapses) ||
      !integer(s.reps)
    )
      fail("review state");
    ids.add(s.cardId);
  }
  for (const l of p.reviewLogs)
    if (
      !object(l) ||
      !text(l.cardId) ||
      !number(l.reviewedAt) ||
      !integer(l.grade, 0, 3) ||
      !number(l.msTaken) ||
      !statuses.includes(l.statusBefore)
    )
      fail("review log");
  const s = p.settings;
  if (
    !object(s) ||
    !integer(s.newCardsPerDay, 0, 10000) ||
    !integer(s.maxReviewsPerDay, 0, 100000) ||
    !["light", "dark"].includes(s.theme) ||
    !Array.isArray(s.enabledCardTypes) ||
    !s.enabledCardTypes.every((t: any) => ALL_CARD_TYPES.includes(t)) ||
    !Array.isArray(s.enabledDeckIds) ||
    !s.enabledDeckIds.every(text)
  )
    fail("settings");
  const m = p.meta;
  if (
    !object(m) ||
    m.id !== "meta" ||
    m.schemaVersion !== SCHEMA_VERSION ||
    !day(m.lastReviewDay) ||
    !day(m.newIntroDay) ||
    !integer(m.streak) ||
    !integer(m.bestStreak) ||
    m.bestStreak < m.streak ||
    !integer(m.newIntroCount)
  )
    fail("progress metadata");
}
