# Tests, gaps and debugging

[Course index](README.md)

## Run the checks

```powershell
npm test                                         # all four files
npx vitest run src/importValidation.test.ts      # just the import tests
npx vitest run -t "round-trips"                  # tests whose name matches
npm run test:watch
npm run typecheck
```

Vitest is configured in [vite.config.ts](../vite.config.ts) with `environment: 'node'` and `include: ['src/**/*.test.ts']`. There is no browser and no jsdom: tests that touch Dexie import `fake-indexeddb/auto` first, which installs an in-memory IndexedDB implementation in Node.

## What is in the suite

Static count as of 2026-10-06 (counting `it(` calls; no `it.each` is used):

| File | Tests | Covers |
|---|---|---|
| `src/scheduler.test.ts` | 21 | SM-2 steps, graduation, lapses, ease floor, interval caps, fuzz, previews |
| `src/queue.test.ts` | 9 | queue ordering, new-card interleaving and caps, filters, day boundary |
| `src/app.integration.test.ts` | 30 | content QA over all 265 cards, scheduler+queue lifecycles, Dexie seeding/export/import, full store sessions, date helpers |
| `src/importValidation.test.ts` | 3 | the worked change: malformed payloads change nothing; partial restore |

63 tests in total. [TESTING.md](../TESTING.md) describes each group in more detail.

## What the import tests prove, and what they do not

They prove, against the real Dexie code:

- the listed malformations are rejected and leave states, settings and meta identical;
- a valid partial restore keeps the restored state, recreates the rest, and drops logs for unknown cards;
- (in `app.integration.test.ts`) a full export → reset → import cycle restores states, logs and streaks exactly.

They do not prove:

- **which validator block rejected each case** (all assert `/Malformed backup/`);
- that `reviewLogs` are untouched after a rejected import (not compared);
- **atomicity under a failure inside the transaction**. Every rejection in the suite happens before the transaction opens. No test makes the callback fail after `clear()` and checks that the old rows survive. Exercise 6 writes that test;
- anything about `importBackup` in the store: the non-JSON path and the success message are untested.

### Gaps the validator accepts today

Each of these was confirmed by calling `validateImport` directly on a minimal valid payload; each is **accepted**:

| Input | Why | Effect today |
|---|---|---|
| `settings.enabledDeckIds: ["no-such-deck"]` | deck ids only checked to be strings | an empty per-deck counter; no visible harm |
| `settings.enabledDeckIds: []` or `enabledCardTypes: []` | empty arrays pass `every` | sessions have nothing to show until settings are changed |
| `settings.newCardsPerDay: 0` or `5000` | range 0-10,000 | the UI stepper (1-50) would never produce these |
| state `ease: 1.0` | range 1-10 | the scheduler's floor is 1.3 |
| state `status: "review"` with `learningStepIndex: 99` | fields checked independently | ignored by the scheduler for review cards |
| `meta.streak: 5` with `lastReviewDay: null` | no cross-field check except `bestStreak >= streak` | the next review resets the streak to 1 |
| `exportedAt: 0` | any finite number ≥ 0 | not used after import |

None of these is a crash. They show that a validator is a set of beliefs about the producer, and that beliefs drift unless tests pin them.

## Debugging a rejected import

1. **Read the block name.** The message names one of six blocks (schema, review arrays, review state, review log, settings, progress metadata). Use the table in chapter 2 to jump to the right lines of `importValidation.ts`.
2. **Find the record.** The message does not say which record. Bisect: delete half of the `reviewStates` (or logs) from a copy of the file and import again; repeat until one remains. Then remove fields from that record one by one.
3. **Check the helper, not just the value.** If a date "looks fine", run `new Date('2025-02-29').toISOString()` in Node. If a number looks fine, check whether it must be an integer.
4. **Reproduce in a test.** Start from `buildExport()` in a test, apply the one change, and assert the exact message. That is faster and more reliable than clicking through Settings.

## Debugging an import that "worked" but looks wrong

- Open devtools → Application → IndexedDB → `devdeck`, and read `reviewStates`, `settings` and `meta` directly. That is the source of truth.
- If storage is right but Home shows unexpected counts, look at `settings.enabledDeckIds` and `enabledCardTypes`: the queue filters on both (`src/queue.ts:49-50`). A backup from before a deck existed will have that deck disabled.
- If the count in the success message is lower than the number of states in your file, some `cardId`s did not match bundled cards and were filtered out (`db.ts:172`).

## Reading a failing assertion

`expected [ …265 items… ] to deeply equal [ …265 items… ]` after a rejected import means something **was** written. Before reading the diff, check the order in `importData`: is `validateImport` still the first statement? Then check whether the failing mutation actually reached the validator: a mutation that makes `JSON.parse`-level or schema-level checks fail never exercises the block you meant to test.
