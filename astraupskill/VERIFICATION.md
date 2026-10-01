# Verification: DevDeck: safe progress restore

[Course index](README.md)

Verified September 8, 2026 in isolated working copies before application to the original folder.

| Check | Result |
|---|---|
| build | Passed |
| tests | Passed |
| typecheck | Passed |
| Chromium interaction | Passed |

Automated test cases: **2 delivered by this change** plus **1** added in the fix pass (settings branch) (`src/importValidation.test.ts`). The inherited DevDeck suite totals 62 cases across 4 files including these two; it was re-run as a regression gate, not authored here.

## Tested behavior

Export fresh progress, set one card reps to 7 and restore only that state: the card keeps 7 reps and missing cards receive new states. Include one unknown-card log: it is omitted. A negative due value, duplicate state ID, invalid study limit or impossible metadata date rejects before any stored progress changes.

The course contains additional hand-worked examples and optional exercises. These are not counted as implemented tests.

## Environment and scope

Node 22.16.0 and dependencies installed in the isolated verification workspace were used. The exact dependency versions are recorded with the batch evidence. Floating dependency declarations remain floating; a clean dependency install was not repeated in every original folder.

The built React app was opened in a fresh Chromium browser context. A malformed backup was rejected through its real import screen. Automated tests also exercise nested validation and preservation of existing data.

The browser screenshot was also captured at a 390px viewport. Measured document width: 390px. This is a layout smoke check, not a complete accessibility or device audit.

## Reproduce

From this project root, install its declared dependencies:

```powershell
npm install
npm run dev
```

Open the local Vite URL. This app stores its data in the browser, so no API process or PostgreSQL service is required. Keep using the same origin: changing the hostname or port selects a different browser storage area.

```powershell
npm test
npm run build
```

The existing Vitest suite runs alongside the new import regressions. Use synthetic records and a separate browser profile for practice resets. The test fixtures use fresh simulated storage. A browser check separately verifies the built app in Chromium. Export a copy of learning progress before experimenting with restore behavior.

This app uses Dexie/IndexedDB. validateImport checks the whole payload before importData opens a transaction across progress tables. The tests exercise the actual Dexie methods using fake-indexeddb.

Reading the diff: the files Astra touched were re-saved with CRLF line endings and Prettier formatting, so a plain `diff` shows whole files as changed. Compare with `git diff -w`, or `diff -r --strip-trailing-cr -w <backup> <project>` against the pre-change backup, to see only the real edits.

## Limits

The test uses fake-indexeddb to exercise the actual Dexie methods and compares stored state/settings/meta after rejected imports. Chromium is a separate check of actual browser startup and interaction. The existing content QA tests also protect the learning experience: a 15-line nested-conditional example was shortened to fit the existing 12-line rule while retaining the same four input outcomes. This app is a browser persistence study case; it does not contain a server CRUD API.

These are focused learning improvements, not a production-readiness certification. Existing integrations and all optional exercises are outside the checked boundary unless named above.

Delivery hashes and local course links are checked after applying the files. Logs, screenshots, diffs and backups are in AstraOrganized2/astrafinalplan/implementation/batch04. The combined report is AstraOrganized2/astrdocs/ALL_75_PROJECTS_REPORT.md.
