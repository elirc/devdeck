# Trace lab

[Course index](README.md) · [Worked change](03-WORKED-CHANGE.md) · [Tests](04-TESTING-AND-DEBUGGING.md)

Do this in the browser with devtools open, then repeat the key step as a test. You need: `npm run dev`, a few graded cards, and an exported backup copied to `good.json` and `bad.json`.

## Step 1: record the starting state

Devtools → Application → IndexedDB → `devdeck`. Note the number of rows in `reviewStates` (265) and `reviewLogs`, the `settings` row and the `meta` row. This is the authoritative before-state.

## Step 2: set breakpoints on the real path

In the Sources panel (Vite serves the TypeScript with source maps):

| Where | Why |
|---|---|
| `store.ts:294` (`JSON.parse`) | untrusted text becomes an object |
| `db.ts:170` (`validateImport(payload)`) | the last point before any write |
| `db.ts:178` (`reviewStates.clear()`) | the first write, inside the transaction |
| `db.ts:197` (`meta.put`) | the last write |
| `store.ts:299` (`set(...)`) | the UI is updated from the database |

## Step 3: a rejected import

Edit `bad.json`: set the first state's `due` to `-1`. Predict which breakpoints you will hit and what the Settings screen shows. Import it.

Expected: you stop at `store.ts:294` and `db.ts:170`. Step into `validateImport`; the states loop fails `number(s.due)` (line 43) and `fail("review state")` throws. You never reach `db.ts:178`. Settings shows `Malformed backup: review state`. IndexedDB is unchanged.

Predict, then try, three more:

| Edit to `bad.json` | Breakpoints hit | Message |
|---|---|---|
| `"schemaVersion": 2` | | |
| `meta.bestStreak` lower than `meta.streak` | | |
| whole file replaced by `hello` | | |

(Answers: schema → 294 and 170, `Malformed backup: unsupported schema version`; streaks → 294 and 170, `Malformed backup: progress metadata` from the check on line 83; `hello` → only 294, where `JSON.parse` throws a `SyntaxError` whose message is shown as is.)

## Step 4: a successful import, watched from inside

Import `good.json`. At `db.ts:178`, look at IndexedDB: nothing has changed yet. Step over `clear()` and refresh the IndexedDB view in devtools: depending on the browser, the table may still show the old rows, because other readers do not see a transaction's changes until it commits. Continue to `db.ts:197`, then let it run. Only after the transaction completes do all four tables show the new data together.

This is the transaction doing its job: no other reader ever observes "states cleared, logs not yet restored".

## Step 5: the same rejection as a test

```ts
it('rejects a negative due with the state message and changes nothing', async () => {
  const original = await buildExport();
  const bad = structuredClone(original);
  bad.reviewStates[0].due = -1;
  await expect(importData(bad, Date.now())).rejects.toThrow('Malformed backup: review state');
  expect((await buildExport()).reviewStates).toEqual(original.reviewStates);
});
```

Run `npx vitest run src/importValidation.test.ts -t "negative due"`. Then change `-1` to `0` and confirm the test fails because the import now succeeds, which proves the test is sensitive to the value it names.

## Step 6: when layers disagree

- **Message says "Restored progress for N cards" but Home shows fewer due cards than expected.** Read `settings.enabledDeckIds` and `enabledCardTypes` in IndexedDB; the queue filters on both (`src/queue.ts:49-50`). A backup from before a deck existed has that deck disabled.
- **N is lower than the number of states in the file.** Some `cardId`s are not bundled in this build and were filtered (`db.ts:172`).
- **Stats show fewer reviews than the file has logs.** Logs for unknown cards are filtered the same way (`db.ts:187-188`).
- **A graded card's progress is gone after a reload.** Not an import problem: grading persists with a fire-and-forget write whose errors are swallowed (`store.ts:177-183`). Check the console and storage quota.

## Final checkpoint

Close this guide. Using only the source and one test, explain in five minutes: where untrusted data enters, why the cast does not protect anything, which function rejects bad data and how it signals it, which line makes the replacement all-or-nothing, what happens to an unknown card's progress, and one gap the validator still has.
