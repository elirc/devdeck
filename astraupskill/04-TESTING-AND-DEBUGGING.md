# Testing and debugging

[Course index](README.md)

## Run the checks

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

```text
npm test
npm run build
```
This app uses Dexie/IndexedDB. validateImport checks the whole payload before importData opens a transaction across progress tables. The tests exercise the actual Dexie methods using fake-indexeddb.
## What the test suite proves

Read [src/importValidation.test.ts](../src/importValidation.test.ts). The suite targets **validating persisted state and atomic IndexedDB replacement** and uses the worked fixture:

Export fresh progress, set one card reps to 7 and restore only that state: the card keeps 7 reps and missing cards receive new states. Include one unknown-card log: it is omitted. A negative due value, duplicate state ID, invalid study limit or impossible metadata date rejects before any stored progress changes.

The expectation should not be copied from the function being tested. Hand-calculate counts, amounts, identities or elapsed time first. Otherwise the same mistake can appear in both implementation and expected result. Tests that exercise only a mocked dependency prove a narrower contract than tests against the real dependency; read the helper to understand which kind you are running.

This project uses Vitest with fake-indexeddb so the tests drive the actual Dexie methods. Browser checks exercise the built client separately. Read the project verification page for the exact observed checks and limits.

## Debugging workflow

1. Reproduce the smallest failing case with the exact input saved in your notes.
2. Inspect the relevant event/request. Confirm the intended handler actually ran.
3. Pause at `importData` and inspect input types as well as values.
4. Follow validation branches, noting whether any state or persistence changed before rejection.
5. Inspect the write result and the subsequent render/response. Separate storage correctness from display correctness.
6. Add a regression reproducing the failure, make the smallest justified fix, then run the focused suite and relevant broader checks.

Avoid changing several layers at once when you do not yet know where the failure starts. A correct backend with a stale UI needs a different fix from a malformed query or an invalid saved document.

## Failure experiments

- Reuse the invalid fixture from the tests and verify no unintended records or fields change.
- Reload or restart after a successful operation to distinguish persistence from temporary screen state.
- Repeat the operation and explain whether it should be idempotent, rejected or intentionally create another record.
- Simulate the relevant timing or storage failure only in a disposable fixture. Restore normal behavior after the experiment.

## Reading an assertion failure

“Expected 3, received 4” is evidence about one observation, not a complete diagnosis. Ask whether the fixture created an extra record, the operation ran twice, an old record survived, or the assertion looked at an unfiltered collection. Start from the state table and trace the first point where the actual value diverges. A stack trace identifies where the program noticed a problem, which may be later than the code that caused it.

## Verification record

The companion [VERIFICATION.md](VERIFICATION.md) records checks actually run for this implementation. Record your own command, date, result and any environmental prerequisite when practicing. A passing test does not imply every route, browser, dependency version or production deployment has been exercised.
