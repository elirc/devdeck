# DevDeck: safe progress restore

DevDeck is an offline spaced-repetition PWA (React 19, Vite 8, Zustand, Dexie over IndexedDB) with 265 bundled flashcards across 11 decks for learning JS/TS, web fundamentals, React and tooling. This course uses one real feature as its worked example: **restoring progress from a JSON backup**. You will learn how the app refuses a malformed backup before touching any stored data, how it applies a valid one inside a single IndexedDB transaction, and where the validator still accepts data the app itself would never produce.

## What you will be able to do

- Trace a backup file from the Settings screen to the four Dexie tables it replaces.
- Explain why `JSON.parse(text) as ExportData` checks nothing, and what `validateImport` checks instead.
- Explain why the import is all-or-nothing, and which line makes it so.
- Predict which validator message a malformed backup produces.
- Write tests against the real Dexie code using `fake-indexeddb`, including one that forces a failure halfway through the transaction.

## Prerequisites

TypeScript (union types, `unknown`, type guards), `async`/`await`, and React state basics. No prior Dexie or IndexedDB knowledge is assumed; chapter 2 covers what you need.

## Start the project

```powershell
npm install
npm run dev        # Vite prints the local URL
npm test           # vitest run: 4 test files, no browser needed (fake-indexeddb)
npm run typecheck  # tsc -b; the 265 cards are typed, so this checks content too
npm run build
```

All data lives in IndexedDB under the page's origin, so a different host or port starts empty. Grade a few cards, then **Settings → Export backup** to get a real file to experiment with.

`package.json` declares `"typescript": "~6.0.2"`, Vite 8 and Vitest 4; the lockfile is committed, so `npm install` reproduces them. The course was verified on Node 22.

## Reading order

1. [Codebase map and the import trace](01-CODEBASE-MAP.md)
2. [Concepts, explained through this code](02-CONCEPTS.md)
3. [The worked change: `validateImport` and `importData`](03-WORKED-CHANGE.md)
4. [Tests, gaps and debugging](04-TESTING-AND-DEBUGGING.md)
5. [Exercises, easy to hard](05-PRACTICE.md)
6. [Solutions and reviewer notes](06-SOLUTIONS-AND-REVIEW.md)
7. [Trace lab](07-TRACE-LAB.md)
8. [Verification record and limits](VERIFICATION.md)

The repository also has [TESTING.md](../TESTING.md) (what every test file covers, plus a manual QA checklist) and [HANDOFF.md](../HANDOFF.md) (the original build plan, now historical).

## Your first session (about 90 minutes)

1. Run the app, grade five cards, export a backup and open the JSON. Find one `reviewStates` entry and the `meta` block.
2. Read chapter 1 with [src/importValidation.ts](../src/importValidation.ts) and [src/db.ts](../src/db.ts) open side by side.
3. Change one state's `due` to `-1` in your file and import it. Read the message, then confirm your progress is unchanged.
4. Run `npx vitest run src/importValidation.test.ts` and find the test that covers what you just did.
5. Do exercise 1 in chapter 5.

## Scope

The course covers backup import (`importBackup` → `validateImport` → `importData`). The scheduler, queue and screens appear only where they explain an import decision. Exercises are learner work; none of them is implemented in the repository.
