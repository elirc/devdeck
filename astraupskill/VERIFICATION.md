# Verification record and limits

[Course index](README.md)

## Original delivery (September 8, 2026)

The import-validation change was verified in an isolated working copy before being applied here. Recorded results:

| Check | Result |
|---|---|
| `npm run build` | Passed |
| `npm test` | Passed |
| `npm run typecheck` | Passed |
| Chromium: import a malformed backup through Settings | Rejected through the real import screen |
| Chromium: 390px viewport | Document width 390px (layout smoke check only) |

The change added the first two tests in `src/importValidation.test.ts`; a later fix pass added the third (settings). It also shortened one bundled card's code snippet to satisfy the existing 12-line content rule. Toolchain: Node 22.16.0. The logs, screenshots and pre-change backups from that run were kept outside this repository and are not available here.

## Course refinement (October 6, 2026)

The course text was rewritten against the code at this commit, and `TESTING.md` and `HANDOFF.md` received dated status corrections. No source or test files were changed.

- **Paths:** every file linked or cited exists in the repository (scripted check); line citations were spot-checked against the current files.
- **Test inventory:** a static count of `it(` calls gives 63 tests in 4 files (scheduler 21, queue 9, integration 30, import validation 3). The earlier record above said "62 cases across 4 files"; the source now has 63. The suite was **not** run during this refinement (no `npm install`).
- **Card inventory:** 265 card ids across 11 deck files in `src/content/`, matching the `ships 265 cards across 11 decks` test.
- **Validator behaviour** claimed in chapters 2-4 was confirmed by running the unmodified `validateImport` under Node 22's `--experimental-strip-types` against a minimal valid payload with one mutation at a time. Rejections and their messages matched the tables in chapters 3 and 5; the "accepted today" gaps (unknown or empty deck ids, empty card types, `newCardsPerDay` 0 and 5000, `ease` 1.0, `learningStepIndex` 99 on a review card, a streak with no review day, `exportedAt` 0) were all accepted.
- **Not executed:** the Dexie-level exercise checks (exercises 2-7 need `npm install` for Dexie, Vitest and `fake-indexeddb`). Their expected results were derived from reading `db.ts`, `store.ts` and the existing tests. Exercise 6's outcome rests on Dexie's documented behaviour that a rejected transaction callback aborts the transaction.

## Limits

- Exercises are learner work; none is implemented in the repository.
- The automated tests use `fake-indexeddb`, which models IndexedDB semantics in Node. They do not exercise real browser quotas, private-mode restrictions or service-worker behaviour.
- This is a focused course on one import boundary, not an audit of the scheduler, queue or content.
