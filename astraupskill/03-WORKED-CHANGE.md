# The worked change: `validateImport` and `importData`

[Course index](README.md)

## Before and after

**Before:** import checked a few outer fields. Out-of-range scheduler values, malformed settings or duplicate card ids could be restored, and logs for cards that no longer exist were kept even though their states were dropped.

**After:** `validateImport` checks the whole payload before any write; states **and** logs for unknown cards are filtered consistently; bundled cards the backup does not cover get fresh states; and a rejected file leaves progress exactly as it was. (The same change also shortened one bundled card whose code snippet broke the 12-line content rule tested in `app.integration.test.ts:82`.)

## The replacement, line by line

```ts
// src/db.ts:166-201
export async function importData(payload: ExportData, now: number): Promise<number> {
  validateImport(payload);                                        // 170: throws before any write
  const knownIds = new Set(allCards.map((c) => c.id));
  const states = payload.reviewStates.filter((s) => knownIds.has(s.cardId));   // 172

  await db.transaction(
    "rw",
    [db.reviewStates, db.reviewLogs, db.settings, db.meta],       // 176: the tables in scope
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
        .map((l) => { const { id: _id, ...rest } = l; void _id; return rest; });   // 189-193
      if (logs.length > 0) await db.reviewLogs.bulkAdd(logs);

      await db.settings.put({ id: "settings", ...payload.settings });
      await db.meta.put({ ...payload.meta, id: "meta" });
    },
  );
  return states.length;                                           // 200
}
```

(The log-mapping lambda is condensed onto one line here; it spans lines 189-193 in the file.)

Things to notice:

1. **`validateImport` is called inside `importData`, not by the caller.** Every path into the database goes through it, including tests that call `importData` directly. A validator that callers must remember to call is a validator that eventually gets skipped.
2. **The tables listed on line 176 are the transaction's scope.** Touching a table not in that list inside the callback would fail. `cards` and `decks` are deliberately absent: an import never changes content.
3. **`clear()` then `bulkAdd()` is safe only because of the transaction.** Outside one, a failure after `clear()` would leave the user with no progress at all.
4. **Old log ids are stripped** (lines 189-193) so Dexie assigns fresh auto-increment keys. Re-using ids from a file could collide with keys Dexie generates later.
5. **`missing` cannot overlap `states`.** It is computed from the ids just restored, and the validator already rejected duplicate state ids, so `bulkAdd` will not hit a key collision. If either guard were removed, `bulkAdd` would throw a `ConstraintError` and the transaction would abort, which is safe but would reject a backup the user expected to work.
6. **The return value counts kept states**, not states in the file. That number becomes the success message.
7. **Settings and meta are restored as given.** `{ id: "settings", ...payload.settings }` writes whatever settings fields passed validation. The validator checks the known fields but does not reject extra ones, so an extra key in the file would be stored in the settings row.

## Predict, then run

For each edit to a freshly exported backup, write the outcome before you import. The answers were confirmed by running `validateImport` against a minimal valid payload (see [VERIFICATION.md](VERIFICATION.md)).

| Edit | Your prediction | Answer |
|---|---|---|
| none | | `Restored progress for 265 cards.` (every bundled card has a state in a fresh export) |
| first state's `due` → `-1` | | `Malformed backup: review state` |
| duplicate the first state | | `Malformed backup: review state` |
| `settings.newCardsPerDay` → `-1` | | `Malformed backup: settings` |
| `meta.lastReviewDay` → `"2025-02-30"` | | `Malformed backup: progress metadata` |
| `schemaVersion` → `2` | | `Malformed backup: unsupported schema version` |
| first log's `grade` → `2.5` | | `Malformed backup: review log` |
| `settings.enabledDeckIds` → `["no-such-deck"]` | | accepted: deck ids are only checked to be strings |
| keep only one state | | `Restored progress for 1 cards.`; the other 264 cards get fresh states |
| replace the whole file with `hello` | | a `SyntaxError` message from `JSON.parse` (the import never reaches `importData`) |

## The regression tests

[src/importValidation.test.ts](../src/importValidation.test.ts) has three tests, all running the real Dexie code against `fake-indexeddb` (imported on line 1). `beforeEach` (lines 4-8) deletes and reopens the database, then seeds it, so every test starts with 265 fresh states.

- **Lines 9-35, four malformations.** Each starts from `structuredClone(original)`, so mutations never leak between cases. After each rejection it re-exports and compares `reviewStates`, `settings` and `meta` to the original. That second half is what proves "nothing changed". A test that only checked the rejection would pass even if the code wrote first and validated afterwards.
- **Lines 36-61, a valid partial restore.** One state with `reps: 7` and two logs, one for an unknown card. Asserts: return value 1, the kept state has `reps` 7, more than one state exists afterwards (missing cards recreated), exactly one log survives.
- **Lines 62-80, three malformed settings.** Unknown card type, a numeric deck id, a string instead of an array.

Two things they do not check:

- **Which block failed.** Every case asserts only `/Malformed backup/`. A mutation meant to test the settings block would still pass if it were rejected by the states block for an unrelated reason. Exercise 1 fixes that.
- **Logs after a rejection.** The first test compares states, settings and meta, but not `reviewLogs`. Validation runs before the transaction, so logs cannot change today, but nothing would notice if that order were ever reversed.

The older round-trip and schema tests live in `src/app.integration.test.ts` (`export -> reset -> import round-trips progress exactly` at line 291, unknown-card states at 324, schema version at 333).

## Explain it back

In five minutes, without reading the code aloud: the original problem, why the validator is called inside `importData`, which line makes the import all-or-nothing, what happens to an unknown card's state and logs, and one gap (choose: block-only error messages, unknown deck ids, or ranges that do not match the scheduler).
