# Worked implementation and examples

[Course index](README.md)

## Before and after

**Before:** Import validation checked only a few outer fields; malformed scheduler values/settings or duplicate card IDs could enter a restore. Unknown-card logs were retained. One existing learning snippet exceeded its tested mobile length limit.

**After:** A complete import validator runs before the replacement transaction. It checks state/log/settings/meta values and unique card IDs; unknown-card states and logs are omitted consistently, missing known states are recreated, and rejected imports preserve progress. The long worked snippet was shortened without changing its behavior.

## Predict this example

Export fresh progress, set one card reps to 7 and restore only that state: the card keeps 7 reps and missing cards receive new states. Include one unknown-card log: it is omitted. A negative due value, duplicate state ID, invalid study limit or impossible metadata date rejects before any stored progress changes.

Before running anything, write the exact expected stored values and visible response. Include ids or record counts where they matter. Then run the focused tests and reproduce the matching UI/API action. Do not settle for seeing a success message: inspect the authoritative stored result as well.

## Actual implementation excerpt

The lines below are the ones Astra changed (compare `AstraOrganized2/astrafinalplan/implementation/batch04/backups/74/src` with `diff -r --strip-trailing-cr -w`): `validateImport` is the pure pre-replacement validator, and `importData` runs the clear-and-restore inside one Dexie transaction. The linked source is authoritative if you later edit the project.

```typescript
// src/importValidation.ts:3
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

// src/db.ts:166
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
```

## How to reason through the code

1. Identify the inputs. Distinguish data supplied by a caller from state read from storage or a trusted context.
2. Find the guard clauses. For each early return or thrown error, describe which invariant it protects and whether anything has already been written.
3. Find the candidate state or query. Explain whether it mutates an existing object or constructs a replacement.
4. Locate the persistence operation. For asynchronous code, follow the promise through success and rejection; for transactions, check that all related writes use the same transaction object.
5. Find the output or state publication. Ask what a repeated invocation would do after the first invocation succeeds.

Use this project-specific reasoning as your guide:

A backup is not trusted merely because it has the right version. A negative due time, impossible grade or duplicate card state can corrupt scheduling even if IndexedDB accepts the value. validateImport checks the full structure before importData opens its write transaction. The transaction then clears old progress and inserts the validated replacement, so an insertion failure rolls back the clear.

Content evolves independently of progress. The chosen policy ignores states and logs for card IDs no longer bundled, and creates new states for known cards absent from the backup. This preserves useful progress while avoiding orphan logs. The returned count means known states restored, not total cards after missing-state recreation.

The test uses fake-indexeddb to exercise the actual Dexie methods and compares stored state/settings/meta after rejected imports. Chromium is a separate check of actual browser startup and interaction. The existing content QA tests also protect the learning experience: a 15-line nested-conditional example was shortened to fit the existing 12-line rule while retaining the same four input outcomes. This app is a browser persistence study case; it does not contain a server CRUD API.

## Three variations to work through

**Normal variation — round trip.** Export progress, import the same file. Predict `Restored progress for N cards.` with N equal to the number of states in the file, and identical `due` values afterwards (read them in the Application tab, IndexedDB).

**Invalid variation — a duplicated card id.** Duplicate one entry in `states` in the exported file and import it. Predict the message from `validateImport` and that IndexedDB is unchanged (no transaction was opened). Then set `settings.enabledCardTypes` to `["nope"]`: predict the new test's outcome.

**Boundary variation — a failure after the clear.** In a scratch copy, throw inside `importData` after the clear (or reproduce exercise 3). Predict: the old states are still present after the error, because Dexie aborted the transaction; then remove the transaction wrapper and repeat to see the progress vanish. Restore it.

## Executable examples

These are the actual regression tests in [src/importValidation.test.ts](../src/importValidation.test.ts). Read each test as arrange → act → assert. Setup creates a controlled initial state, the action exercises the application code, and assertions compare observable behavior with an independently stated expectation.

```typescript
import "fake-indexeddb/auto";
import { beforeEach, it, expect } from "vitest";
import { db, seedAndLoad, buildExport, importData } from "./db";
beforeEach(async () => {
  await db.delete();
  await db.open();
  await seedAndLoad(Date.now());
});
it("rejects malformed nested values and duplicate card IDs before changing any progress", async () => {
  const original = await buildExport();
  for (const mutate of [
    (p: typeof original) => {
      p.reviewStates[0].due = -1;
    },
    (p: typeof original) => {
      p.reviewStates.push({ ...p.reviewStates[0] });
    },
    (p: typeof original) => {
      p.settings.newCardsPerDay = -1;
    },
    (p: typeof original) => {
      p.meta.lastReviewDay = "2025-02-30";
    },
  ]) {
    const bad = structuredClone(original);
    mutate(bad);
    await expect(importData(bad, Date.now())).rejects.toThrow(
      /Malformed backup/,
    );
    const after = await buildExport();
    expect(after.reviewStates).toEqual(original.reviewStates);
    expect(after.settings).toEqual(original.settings);
    expect(after.meta).toEqual(original.meta);
  }
});
it("valid restore keeps progress, omits unknown-card logs, and recreates missing states", async () => {
  const backup = await buildExport();
  const kept = backup.reviewStates[0];
  kept.reps = 7;
  backup.reviewStates = [kept];
  backup.reviewLogs = [
    {
      cardId: kept.cardId,
      reviewedAt: Date.now(),
      grade: 2,
      msTaken: 100,
      statusBefore: "new",
    },
    {
      cardId: "removed-card",
      reviewedAt: Date.now(),
      grade: 2,
      msTaken: 100,
      statusBefore: "new",
    },
  ];
  expect(await importData(backup, Date.now())).toBe(1);
  expect((await db.reviewStates.get(kept.cardId))?.reps).toBe(7);
  expect(await db.reviewStates.count()).toBeGreaterThan(1);
  expect(await db.reviewLogs.count()).toBe(1);
});
it("rejects malformed enabled card types or deck ids before changing any progress", async () => {
  const original = await buildExport();
  for (const mutate of [
    (p: typeof original) => {
      (p.settings as any).enabledCardTypes = ["not-a-type"];
    },
    (p: typeof original) => {
      (p.settings as any).enabledDeckIds = [42];
    },
    (p: typeof original) => {
      (p.settings as any).enabledCardTypes = "concept";
    },
  ]) {
    const bad = structuredClone(original);
    mutate(bad);
    await expect(importData(bad, Date.now())).rejects.toThrow(/Malformed backup/);
    expect((await buildExport()).settings).toEqual(original.settings);
  }
});
```

## Explain it back

Give a five-minute walkthrough: the original problem, one invariant, the exact changed function, the most revealing failure test, and one remaining limitation. You should be able to explain why the implementation is correct for the worked example without reading the code aloud line by line.
