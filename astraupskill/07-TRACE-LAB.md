# Trace lab: DevDeck: safe progress restore

[Course index](README.md) · [Worked change](03-WORKED-CHANGE.md) · [Tests](04-TESTING-AND-DEBUGGING.md)

## Run it before you trace it

The first executable example from chapter 03, so the trace starts from something you have actually run:

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

Run it, watch what it prints, then follow the boundaries below with that exact scenario in mind.

## The concrete case

This lab connects one visible action to the code that accepts or rejects it. Use a disposable dataset and write your prediction before running the operation. The goal is to explain what each boundary contributes, not to memorize a sequence of clicks.

Export fresh progress, set one card reps to 7 and restore only that state: the card keeps 7 reps and missing cards receive new states. Include one unknown-card log: it is omitted. A negative due value, duplicate state ID, invalid study limit or impossible metadata date rejects before any stored progress changes.

## Write the record before touching the form

Bundled cards and decks provide learning content. ReviewState tracks cardId, ease, intervalDays, due, status, learningStepIndex, lapses and reps. ReviewLog records a grade/time. Settings and Meta hold study limits and streaks. Dexie wraps IndexedDB transactions.

Make a small table in your own notes with these columns: field, starting value, proposed value, and source of truth. Include identity even when the form does not display it. Include related rows or stored counters when the operation changes more than one fact. Mark a value as derived if the app recomputes it rather than storing it independently.

For example, an edit can change a title while preserving an ID. A status command can keep the same status while producing no new history. An import can contain many rows yet be rejected before any replacement begins. In each case, the meaningful observation is the promised resulting state. A success toast alone cannot establish which fields changed.

## Trace the real call path

### Boundary 1 — the settings screen hands over a file

`src/screens/Settings.tsx:128-136`: a hidden `<input type="file" accept="application/json">` whose `onChange` calls `onImportFile(file)` and immediately clears `e.target.value` so the same file can be chosen twice. Nothing is parsed here.

### Boundary 2 — the store reads and parses the file

`src/store.ts:292` `importBackup(file)`: `await file.text()`, then `JSON.parse(text) as ExportData`. The cast is a lie the compiler accepts; the real check is the next boundary. A file that is not JSON throws here and the UI shows the error.

### Boundary 3 — the payload is validated before any write

`src/importValidation.ts:3` `validateImport(payload)` checks `exportedAt`, every review state and log (types, ranges, duplicate card ids) and the `settings` block (`enabledCardTypes` against `ALL_CARD_TYPES`, `enabledDeckIds` as strings, lines 68-71). It returns a message or `null`; `importData` refuses to run when it is not `null`. The three tests in `src/importValidation.test.ts` exercise exactly this function.

### Boundary 4 — the database applies the import in one transaction

`src/db.ts:166` `importData(payload, now)` opens `db.transaction("rw", [reviewStates, reviewLogs, ...], ...)` (Dexie), clears the progress tables, re-inserts the validated states and logs, and skips logs for unknown cards. A throw inside the callback aborts the whole transaction: exercise 3 forces that and checks the old rows survive.

### Boundary 5 — the store re-reads and publishes

Back in `importBackup`: `seedAndLoad(now)` re-reads the database (bundled cards plus restored states) and `set({ states, settings, meta })` publishes the new snapshot to React. The UI never sees the parsed file directly; it sees what the database committed.

### Boundary 6 — the screen reports what happened

`importBackup` returns `Restored progress for N cards.`; the Settings screen shows it, or the thrown error's message for a rejected file. Because the count comes from `importData`'s return value, it reflects rows written, not rows in the file.

## Predict the regression scenarios

| Scenario from the executable suite | Prediction to write before running |
|---|---|
| rejects malformed nested values and duplicate card IDs before changing any progress | Initial records, request/input, expected result, and records that must remain unchanged. |
| valid restore keeps progress, omits unknown-card logs, and recreates missing states | Initial records, request/input, expected result, and records that must remain unchanged. |

Open the test file and identify the arrange, act and assert portions. Arrange creates the synthetic starting state. Act calls the real boundary. Assert reads the observable result. Some tests repeat a call or issue two calls together; explain why a single ordinary call would miss that defect. Tests may share a deliberate fixture within one suite, so read setup and earlier scenario state before copying one case into a standalone script.

## A successful request, described precisely

Start with a valid fixture from the test. Copy the values into your own learning notes rather than copying a personal record. State which fields are required, which may be omitted and which have a special meaning when empty. Execute the operation once. Compare the response with a fresh authoritative read, then compare the UI with that read. If the UI is still loading, wait for the actual expected condition instead of guessing a fixed delay.

Record the stable ID and one changed field. Record at least one field that must remain the same. If the operation creates a child, record the parent ID stored on the child. If it updates an aggregate, compute the expected aggregate by hand. If it restores a backup, count retained, ignored and recreated records according to this project’s documented policy. These observations make a small example reusable when the implementation changes.

## A rejected request, described precisely

Now change one value to a rejected case named in the test suite. Keep everything else identical. Predict where validation fails. Run it and capture both the feedback and the authoritative state afterward. Compare the saved record, related rows and relevant counters with their pre-request values. A controlled error is useful only if the application also preserves the intended state.

Do not assume that all failures have the same status or message. Invalid input, missing records, conflicts and infrastructure errors represent different conditions. Read this app’s handler or parser to see the actual result. Browser-only parsers return a success/error union or throw an import error rather than returning an HTTP status. Translate the same correctness idea into the contract this app actually exposes.

## Read the storage boundary

This app uses Dexie/IndexedDB. validateImport checks the whole payload before importData opens a transaction across progress tables. The tests exercise the actual Dexie methods using fake-indexeddb.

Place a breakpoint immediately before the first write and another after the final write or publish step. On the success path, note what changed between those points. On the rejected-input path, the first write should never be reached when validation promises pre-write rejection. On a transactional failure path, some statements may execute and then roll back; reaching a write statement does not mean its effect committed.

An await marks a place where another operation can run. It does not itself define a transaction. When the test uses Promise.all, sketch request A and request B in two columns. Show where each acquires a lock or reads state. The test should accept either winner while insisting on the same final invariant. For synchronous or browser-only validation, explain why concurrency is outside the tested function rather than borrowing a database explanation that does not apply.

## Explain the design tradeoff

A backup is not trusted merely because it has the right version. A negative due time, impossible grade or duplicate card state can corrupt scheduling even if IndexedDB accepts the value. validateImport checks the full structure before importData opens its write transaction. The transaction then clears old progress and inserts the validated replacement, so an insertion failure rolls back the clear.

Content evolves independently of progress. The chosen policy ignores states and logs for card IDs no longer bundled, and creates new states for known cards absent from the backup. This preserves useful progress while avoiding orphan logs. The returned count means known states restored, not total cards after missing-state recreation.

The test uses fake-indexeddb to exercise the actual Dexie methods and compares stored state/settings/meta after rejected imports. Chromium is a separate check of actual browser startup and interaction. The existing content QA tests also protect the learning experience: a 15-line nested-conditional example was shortened to fit the existing 12-line rule while retaining the same four input outcomes. This app is a browser persistence study case; it does not contain a server CRUD API.

## Change one requirement independently

**Practice task:** Preview how many states will be restored, ignored and recreated.

Before implementation, write three acceptance criteria: an ordinary successful case, a rejected or cancelled case, and a case that preserves existing behavior. Identify the smallest file boundary that owns the rule. Keep the existing regression suite; add a test only when it observes a new promise. Do not reproduce the implementation line by line inside the assertion, because both copies can contain the same mistake.

After a first attempt, compare your design with this hint: Validate first, compare IDs with the bundled content and show all three counts without writing.

## Debug a disagreement between layers

If the form and response disagree, inspect the request payload before editing the database code. If the response and database disagree, inspect the mapper, transaction and read query. If a test fails before an HTTP request is logged, inspect startup, environment variables and the test fixture. Missing dependencies, a busy port or an unavailable database are different from a failed business assertion. Preserve the first useful error and fix that cause before interpreting later cascading failures.

When a date looks wrong, distinguish a calendar label from an instant and check the serialization boundary. When an optional field will not clear, distinguish omission from an explicit empty/null value. When a list seems to lose a record, inspect filtering, sorting and pagination before assuming deletion. When history duplicates, compare desired-state commands with commands that represent a new event. These are diagnostic questions to apply to the actual fields above.

## Final independent checkpoint

Close this guide and give a five-minute walkthrough using only the application source and one test. Explain the user-visible problem, the input contract, the identity model, the write boundary, a failed operation and the remaining limitation. Then modify the worked fixture and predict the result without running it. Reopen the guide only after writing your answer.

A useful review note includes the exact command run, its result, and the boundary it covers. Keep browser interaction, simulated storage tests, real HTTP/database tests and compile checks distinct. The [verification page](VERIFICATION.md) records this delivery’s evidence. Exercises and proposed extensions in this course remain learner work; they are not counted as implemented features.
