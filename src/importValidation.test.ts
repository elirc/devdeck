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
