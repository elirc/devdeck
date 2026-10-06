# Solutions and reviewer notes

[Course index](README.md) · [Exercises](05-PRACTICE.md)

Reference approaches, not the only correct answers. None of these changes is applied to the repository.

## Exercise 1

```ts
type Backup = Awaited<ReturnType<typeof buildExport>>;

it.each<[string, (p: Backup) => void, string]>([
  ['a negative due', (p) => { p.reviewStates[0].due = -1; }, 'Malformed backup: review state'],
  ['a duplicate state', (p) => { p.reviewStates.push({ ...p.reviewStates[0] }); }, 'Malformed backup: review state'],
  ['a negative new-card limit', (p) => { p.settings.newCardsPerDay = -1; }, 'Malformed backup: settings'],
  ['an impossible review day', (p) => { p.meta.lastReviewDay = '2025-02-30'; }, 'Malformed backup: progress metadata'],
])('rejects %s and changes nothing', async (_name, mutate, message) => {
  const original = await buildExport();
  const bad = structuredClone(original);
  mutate(bad);
  await expect(importData(bad, Date.now())).rejects.toThrow(message);
  const after = await buildExport();
  expect(after.reviewStates).toEqual(original.reviewStates);
  expect(after.reviewLogs).toEqual(original.reviewLogs);
  expect(after.settings).toEqual(original.settings);
  expect(after.meta).toEqual(original.meta);
});
```

Adding the `reviewLogs` comparison closes the second gap noted in chapter 3. `toThrow(string)` matches a substring; for an exact match use `rejects.toThrow(new RegExp(\`^${message}$\`))`, or catch the error and compare `.message`.

## Exercise 2

```ts
it('accepts unknown deck ids (no reference check yet)', async () => {
  const backup = await buildExport();
  backup.settings.enabledDeckIds = ['no-such-deck'];
  await importData(backup, Date.now());
  expect((await buildExport()).settings.enabledDeckIds).toEqual(['no-such-deck']);
});

it('accepts ease below the scheduler floor (validator range is 1-10)', async () => {
  const backup = await buildExport();
  backup.reviewStates[0].ease = 1.0;
  await importData(backup, Date.now());
  expect((await db.reviewStates.get(backup.reviewStates[0].cardId))?.ease).toBe(1);
});
```

## Exercise 3 (filter policy)

```ts
// in importData, before the transaction
const knownDecks = new Set(allDecks.map((d) => d.id));
const settings = {
  ...payload.settings,
  enabledDeckIds: payload.settings.enabledDeckIds.filter((id) => knownDecks.has(id)),
};
// inside the transaction
await db.settings.put({ id: "settings", ...settings });
```

`allDecks` is already exported from `./content`; add it to the existing import. Review points: the caller's payload is not mutated; the policy matches the card policy; the commit message says *why* filtering beats rejecting (backups from older builds should still restore).

## Exercise 4

```ts
export function previewImport(payload: unknown) {
  validateImport(payload);
  const knownIds = new Set(allCards.map((c) => c.id));
  const restoredIds = new Set(payload.reviewStates.filter((s) => knownIds.has(s.cardId)).map((s) => s.cardId));
  return {
    restored: restoredIds.size,
    ignoredStates: payload.reviewStates.length - restoredIds.size,
    ignoredLogs: payload.reviewLogs.filter((l) => !knownIds.has(l.cardId)).length,
    recreated: allCards.filter((c) => !restoredIds.has(c.id)).length,
  };
}
```

Because `validateImport` is an assertion function, `payload` is typed as `ExportData` after the first line, with no cast. Review points: no `db.` call anywhere in the function; the counts use the same filter as `importData`, ideally by extracting one shared helper so the preview cannot drift from the real import.

## Exercise 5

```ts
importBackup: async file => {
  const text = await file.text();
  let payload: ExportData;
  try {
    payload = JSON.parse(text) as ExportData;
  } catch {
    throw new Error('That file is not a DevDeck backup (not valid JSON).');
  }
  const restored = await importData(payload, Date.now());
  // ...unchanged
},
```

The cast is still there, but now it sits directly before a call that validates. Review point: the `try` wraps only the parse, so validator errors keep their own messages.

## Exercise 6

```ts
it('a failure after clear() rolls back every progress table', async () => {
  const card = (await buildExport()).reviewStates[0];
  await saveReview({ ...card, reps: 1 }, { cardId: card.cardId, reviewedAt: Date.now(), grade: 2, msTaken: 100, statusBefore: 'new' });
  const before = await buildExport();

  const spy = vi.spyOn(db.reviewLogs, 'bulkAdd').mockRejectedValueOnce(new Error('disk full'));
  try {
    await expect(importData(structuredClone(before), Date.now())).rejects.toThrow('disk full');
  } finally {
    spy.mockRestore();
  }

  const after = await buildExport();
  expect(after.reviewStates).toEqual(before.reviewStates);
  expect(after.reviewLogs).toEqual(before.reviewLogs);
  expect(after.settings).toEqual(before.settings);
  expect(after.meta).toEqual(before.meta);
});
```

Add `vi` and `saveReview` to the test file's imports. The reason it passes: Dexie aborts a transaction whose callback rejects, and IndexedDB then discards every change made inside it, including `clear()`. The "move `bulkAdd` outside the transaction" experiment is what proves the test can fail.

## Exercise 7

One workable design: store `knownDeckIds` next to the settings (or in `meta`). In `seedAndLoad`, for every deck in `allDecks` that is not in `knownDeckIds`, add it to `enabledDeckIds` and to `knownDeckIds`. A user who disables a deck removes it from `enabledDeckIds` but not from `knownDeckIds`, so it stays off. Review points: the backup format changes, so either bump `SCHEMA_VERSION` with a migration or make the new field optional and derive it on import; and say what happens when a v1 backup without the field is restored.

## Exercise 8

A strong note separates bundled cards (immutable, id-stable, shipped with the app) from learner cards (a new table, ids generated once with `crypto.randomUUID()` and never changed), adds a `cards` array to `ExportData` under `SCHEMA_VERSION = 2` with a `migrate` step for version 1 files, and changes the unknown-card filter in `importData` to "known = bundled ∪ cards in this backup".

## Things a senior reviewer would flag in the current code

Verified observations, not changes made by this course.

1. **Writes after grading are fire-and-forget with errors swallowed.** `gradeCurrent` calls `void saveReview(...).catch(() => undefined)` (`src/store.ts:177-183`) and `void putMeta(meta).catch(() => undefined)` a few lines later. If IndexedDB rejects (quota, private mode), the UI shows the card as graded and nothing tells the user it was not saved. The transaction inside `saveReview` keeps the two writes consistent with each other; it cannot make the user aware they both failed.
2. **Error messages name a block, not a record.** "Malformed backup: review log" for a 5,000-log file sends the user hunting.
3. **Validator ranges are not derived from the scheduler** (ease 1-10 vs a 1.3 floor and no ceiling; `newCardsPerDay` 0-10,000 vs a 1-50 stepper). Chapter 2, section 6.
4. **New decks start disabled for existing users** (exercise 7), and unknown deck ids survive import (exercise 3).
5. **No confirmation before a destructive import.** Reset asks twice (`Settings.tsx:47-52`); import, which also replaces all progress, asks nothing.
6. **The raw `JSON.parse` error reaches the user** (exercise 5).

## Review questions

**Why call `validateImport` inside `importData` rather than in the store?** So every path into the database is validated, including tests and any future caller.

**Why filter unknown cards instead of rejecting the file?** Card sets change between builds; rejecting would make every older backup unusable after any content change.

**What does the suite not prove?** That a failure inside the transaction rolls back (until exercise 6), that the store's non-JSON path behaves, and anything about real browsers' IndexedDB quotas. Name these in a PR instead of writing "not production ready".
