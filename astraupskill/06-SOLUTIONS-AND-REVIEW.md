# Solutions and engineering review

[Course index](README.md) · [Practice prompts](05-PRACTICE.md)

Attempt each exercise before using these notes. These are solution approaches and review criteria, not claims that every extension has been implemented. The actual completed behavior is described in the worked-change chapter.

## Check a solution the same way the course checks its own

Every solution below should survive the same check chapter 03 runs; run it after your change and compare the result to the expected observations in chapter 03:

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

## Existing implementation

A complete import validator runs before the replacement transaction. It checks state/log/settings/meta values and unique card IDs; unknown-card states and logs are omitted consistently, missing known states are recreated, and rejected imports preserve progress. The long worked snippet was shortened without changing its behavior.

The key model is: Bundled cards and decks provide learning content. ReviewState tracks cardId, ease, intervalDays, due, status, learningStepIndex, lapses and reps. ReviewLog records a grade/time. Settings and Meta hold study limits and streaks. Dexie wraps IndexedDB transactions.

The worked fixture should behave as follows: Export fresh progress, set one card reps to 7 and restore only that state: the card keeps 7 reps and missing cards receive new states. Include one unknown-card log: it is omitted. A negative due value, duplicate state ID, invalid study limit or impossible metadata date rejects before any stored progress changes.

## Extension solutions

### Exercise 1

**Prompt:** Preview how many states will be restored, ignored and recreated.

**Approach:** Validate first, compare IDs with the bundled content and show all three counts without writing.

**Review:** the preview must call `validateImport` first and compute the three counts (restored = states whose card exists, ignored = logs for unknown cards, recreated = bundled cards with no state) without opening a transaction; a test asserts the counts for a fixture with one unknown card and that `importData` was not called.

### Exercise 2

**Prompt:** Explain one scheduler field with an before/after grade example.

**Approach:** Pick an existing schedule test and trace due/status/intervalDays for Again versus Good using a fixed clock.

**Review:** the explanation must trace one scheduler field (`intervalDays`, `due` or `status`) through an existing test with a fixed clock, showing the before and after values for `Again` versus `Good`; it must reference the actual function in `src/scheduler.ts` and match the numbers the test asserts.

### Exercise 3

**Prompt:** Force an IndexedDB insert failure after clear and verify rollback.

**Approach:** Use a transaction hook or invalid storage operation in an isolated database and compare all affected tables with the original export.

**Review:** use a `Dexie` hook or an invalid operation inside `importData`'s callback to throw after the clear, then compare every affected table with the original export; the test must show the old rows are still there, and you must name the Dexie mechanism (transaction abort) that made it so.

### Exercise 4

**Prompt:** Add editable learner-created cards with stable identity.

**Approach:** Separate bundled content from learner-owned content, avoid overwriting custom cards in seedAndLoad and define how exports include card definitions and progress references.

**Review:** the design must separate bundled cards from learner-created cards (a `source` field or a separate table), keep `seedAndLoad` from overwriting custom cards, give custom cards a stable id that survives export and import, and state how progress references a card that was later edited.

## Review questions with answer guidance

**Why not trust input just because it came from this UI?** A caller can bypass the UI, a saved file can be edited, and older data can have a different shape. Validate at the boundary that owns the operation.

**Why keep the id stable?** It identifies the same domain record across views and edits. Changing it can create duplicates, disconnect child records or make reconciliation impossible.

**What makes the failure test meaningful?** It observes the promised state invariant. For this project, explain exactly why the failing scenario in [src/importValidation.test.ts](../src/importValidation.test.ts) would detect the original or a plausible regression.

**What does the test not prove?** A bounded suite does not prove all concurrency, browsers, deployment configurations or unrelated domain behavior. Name the real limitation from this lesson instead of adding a generic disclaimer.

**When should you extract a helper?** When it isolates a coherent responsibility, makes an invariant clearer or enables a meaningful test without duplicating application logic. A pure validator and a shared persistence boundary are common examples, but do not abstract solely to increase the number of files.

## A sample change explanation

“The previous behavior was: Import validation checked only a few outer fields; malformed scheduler values/settings or duplicate card IDs could enter a restore. Unknown-card logs were retained. One existing learning snippet exceeded its tested mobile length limit. I changed the implementation so that: A complete import validator runs before the replacement transaction. It checks state/log/settings/meta values and unique card IDs; unknown-card states and logs are omitted consistently, missing known states are recreated, and rejected imports preserve progress. The long worked snippet was shortened without changing its behavior. The strongest evidence is the regression that exercises the worked fixture and checks authoritative state. A remaining design question is the final stretch exercise.”

Replace that explanation with your own words and actual test results. A strong junior engineer can connect a concrete user problem to code, verification and a clearly stated limit. Completing that explanation independently is the final checkpoint for this course.
