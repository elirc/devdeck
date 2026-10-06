# Exercises, easy to hard

[Course index](README.md) · [Solutions](06-SOLUTIONS-AND-REVIEW.md)

Work on a branch. Put Dexie-touching tests in `src/importValidation.test.ts` (or `app.integration.test.ts`), keeping `import "fake-indexeddb/auto"` as the first import and the existing `beforeEach`. Every **Check** was confirmed against the code as it is now: "today" checks pass on the current code, "after" checks describe what a correct solution produces.

## Exercise 0: predict nine imports (warm-up, no code)

**Goal:** fill in the prediction column of the table in chapter 3 using only `importValidation.ts` and `db.ts`, including the line of the `fail(...)` call for each rejection.

**Check:** compare with the answer column. Every miss points to a helper you misread.

## Exercise 1: make each rejection name its block (easy)

**Goal:** the tests at `src/importValidation.test.ts:9-35` and `62-80` assert only `/Malformed backup/`. Make every case assert the exact message, so a case rejected for the wrong reason fails.

**Hints:** turn each mutation list into `[mutate, expectedMessage]` pairs, or into `it.each`. Keep `structuredClone(original)` per case and keep the "nothing changed" assertions.

**Check:** all seven cases pass with these messages: `due = -1` → `Malformed backup: review state`; duplicated state → `Malformed backup: review state`; `newCardsPerDay = -1` → `Malformed backup: settings`; `lastReviewDay = "2025-02-30"` → `Malformed backup: progress metadata`; the three settings mutations in the third test → `Malformed backup: settings`. Then temporarily change the `day` helper's last clause (`importValidation.ts:19`) to `true` and confirm only the `2025-02-30` case fails. Restore it.

## Exercise 2: pin two gaps with characterization tests (easy)

**Goal:** record current behaviour so that changing it later is a decision, not an accident.

1. A backup whose `settings.enabledDeckIds` is `["no-such-deck"]` imports successfully and that value is stored.
2. A backup with one state's `ease` set to `1.0` imports successfully, although the scheduler's floor is 1.3.

**Hints:** start from `await buildExport()`, mutate, `await importData(backup, Date.now())`, then read back with `buildExport()` or `db.reviewStates.get(id)`. Name each test so a reader knows it documents a gap.

**Check:** both pass today. After `importData`, `(await buildExport()).settings.enabledDeckIds` equals `["no-such-deck"]`, and the state's `ease` reads back as `1`.

## Exercise 3: decide what to do with unknown deck ids (medium)

**Goal:** unknown **card** ids are filtered out on import (`db.ts:172`); unknown **deck** ids are kept. Make the two consistent, and decide how.

Options: drop unknown deck ids during import (the same policy as cards), or reject the file. Write one sentence on why. Hint for the decision: decks can be removed in a future build exactly as cards can, and a backup from that build's predecessor should still restore.

**Hints:** if you filter, do it in `importData` (the validator throws, it does not transform), using `allDecks` from `./content`, and do not mutate the caller's `payload`.

**Check (filter policy):** after importing a backup whose `enabledDeckIds` is `["js-fundamentals", "no-such-deck"]`, the stored settings have exactly `["js-fundamentals"]`. Your exercise 2 test 1 now fails; update it on purpose.

## Exercise 4: preview before replacing (medium)

**Goal:** a valid file currently replaces all progress the moment it is chosen. Add a pure `previewImport(payload)` in `db.ts` that validates and returns `{ restored, ignoredStates, ignoredLogs, recreated }` without opening a transaction, and show it in a `window.confirm` (or a small dialog) before `importBackup` calls `importData`.

**Hints:** reuse `validateImport`, `allCards` and the same `knownIds` filter `importData` uses. `recreated` is the number of bundled cards with no state in the file.

**Check:** for a backup built from a fresh export, cut to one known state plus one state for `"removed-card"`, and with one log for each, the preview is `{ restored: 1, ignoredStates: 1, ignoredLogs: 1, recreated: 264 }` (265 bundled cards minus the one restored), and `(await buildExport()).reviewStates` is unchanged after calling it.

## Exercise 5: a friendly message for a non-JSON file (medium)

**Goal:** importing a file that is not JSON shows whatever `JSON.parse` throws (for example `Unexpected token 'h', "hello" is not valid JSON`). Make `importBackup` (`src/store.ts:292-301`) report `That file is not a DevDeck backup (not valid JSON).` instead, and leave validator messages unchanged.

**Hints:** wrap only the `JSON.parse` call. Test the store directly: `await useStore.getState().importBackup(new File(['hello'], 'x.json'))`. Node 20+ has a global `File`, and the suite runs in Node.

**Check:** that call rejects with exactly your new message, and a `due: -1` backup still rejects with `Malformed backup: review state`.

## Exercise 6: prove the transaction rolls back (hard)

**Goal:** every rejection in the current suite happens before the transaction opens. Write the missing test: make the import fail **after** `reviewStates.clear()` has run, and show that all progress survives.

**Hints:**
- `vi.spyOn(db.reviewLogs, 'bulkAdd').mockRejectedValueOnce(new Error('disk full'))` makes the log insert fail late in the callback, after states have been cleared and re-added. Restore it with `mockRestore()`.
- Use a backup that has at least one log for a known card, or `bulkAdd` is never called (`db.ts:194` skips it for an empty list). Grade a review into the database first with `saveReview`, or add a log to the payload.
- Capture `await buildExport()` before the import, and compare `reviewStates`, `reviewLogs`, `settings` and `meta` afterwards.

**Check:** `importData` rejects with `disk full`, and all four exported collections equal their pre-import values. Then, to see the test is meaningful, temporarily move the `bulkAdd(logs)` call outside the `db.transaction(...)` block and watch the states comparison still pass but the logs comparison fail (the clear committed, the insert did not). Restore the code. Write down which Dexie behaviour made the first run pass: a rejected promise from the transaction callback aborts the transaction.

## Exercise 7: new decks for existing users (hard, design + test)

**Goal:** `seedAndLoad` writes default settings only when no settings row exists (`db.ts:88-90`). So when an update ships a new deck, existing users, and anyone restoring an older backup, have that deck **disabled** until they find it in Settings. Decide whether that is right and implement your choice.

**Hints:** to tell "the user turned this deck off" apart from "this deck did not exist when the settings were saved", you need to remember which decks the user has *seen*: for example a `knownDeckIds` list stored alongside the settings. Think about the schema version: does this change the backup format?

**Check (today):** in a test, seed, then `await db.settings.put({ id: 'settings', ...defaultSettings(), enabledDeckIds: ['js-fundamentals'] })`, call `seedAndLoad` again, and the returned `settings.enabledDeckIds` is still `['js-fundamentals']`. **Check (after):** a deck that was not in the known list when settings were saved comes back enabled; a deck the user explicitly disabled stays disabled.

## Exercise 8: learner-created cards (stretch, design only)

**Goal:** design editable, learner-created cards without breaking import. Write a one-page note covering: where custom cards live (a `source` field or a separate table), how `seedAndLoad` avoids overwriting them, how a custom card gets an id that survives export and import, what a backup must now contain (cards as well as progress), how `SCHEMA_VERSION` changes and how version-1 files are migrated, and how `importData`'s "unknown card" filter must change.

**Check:** a reviewer can answer from your note alone: "I export on my phone and import on a new laptop; are my custom cards and their progress there?"

## Completion rubric

Score each 0 (cannot explain), 1 (with help) or 2 (independently): the import trace, the validator blocks, why validate-then-transact needs both halves, the test design from exercises 1 and 6, a gap you pinned, and a policy decision you justified (exercise 3 or 7).
