# Concepts explained from first principles

[Course index](README.md)

## The central idea: validating persisted state and atomic IndexedDB replacement

A backup is not trusted merely because it has the right version. A negative due time, impossible grade or duplicate card state can corrupt scheduling even if IndexedDB accepts the value. validateImport checks the full structure before importData opens its write transaction. The transaction then clears old progress and inserts the validated replacement, so an insertion failure rolls back the clear.

Content evolves independently of progress. The chosen policy ignores states and logs for card IDs no longer bundled, and creates new states for known cards absent from the backup. This preserves useful progress while avoiding orphan logs. The returned count means known states restored, not total cards after missing-state recreation.

The test uses fake-indexeddb to exercise the actual Dexie methods and compares stored state/settings/meta after rejected imports. Chromium is a separate check of actual browser startup and interaction. The existing content QA tests also protect the learning experience: a 15-line nested-conditional example was shortened to fit the existing 12-line rule while retaining the same four input outcomes. This app is a browser persistence study case; it does not contain a server CRUD API.

## Invariants: a precise way to describe correctness

An invariant is a rule that must remain true before and after an operation. “The app works” is too broad to test. “A failed import writes no records” or “editing preserves the record id” gives you something observable. For this project, derive your invariants from this behavior:

> A complete import validator runs before the replacement transaction. It checks state/log/settings/meta values and unique card IDs; unknown-card states and logs are omitted consistently, missing known states are recreated, and rejected imports preserve progress. The long worked snippet was shortened without changing its behavior.

Turn each sentence into a small state table. The columns are initial state, input, expected final state and expected feedback. Include one rejected input and one retry/repeated action where relevant. A useful invariant should be meaningful even if the implementation changes from an array to a database or from one UI component to another.

## Validation versus normalization

Validation rejects values the operation cannot accept. Normalization converts acceptable values to the representation the rest of the program expects. Trimming a comparison string is normalization; rejecting an empty required field is validation. Neither operation should silently invent facts. If a quantity is free-form text, do not guess a numerical interpretation. If an imported record is malformed, do not quietly save only the convenient subset unless that is the explicit product policy.

Apply this distinction to the data model:

Bundled cards and decks provide learning content. ReviewState tracks cardId, ease, intervalDays, due, status, learningStepIndex, lapses and reps. ReviewLog records a grade/time. Settings and Meta hold study limits and streaks. Dexie wraps IndexedDB transactions.

Which fields can be omitted? Which can be empty? Which have a bounded vocabulary? Which have stable identity? Write those answers down before adding another conditional. A schema is simply an explicit description of that expected shape and meaning.

## State transitions and failure boundaries

Every change has an ordering. If memory changes first and persistence fails, the UI can show data that will disappear after reload. If persistence succeeds first and rendering fails, the stored data may be correct while the screen is stale. There is no universal answer for every feature, but the choice must be deliberate and observable. The worked change makes one specific promise; the tests check that promise.

A promise represents an operation that completes later. `await` does not make it infallible or atomic; it gives the caller a place to handle success and rejection. Similarly, calling several functions inside one `try` block does not create a database transaction. Atomicity must come from a storage operation or transaction boundary that actually provides it.

## Identity, representation and derived values

Keep a stable id when updating an existing record. Compute display-only values from authoritative data when feasible, so there are fewer independently mutable facts to keep synchronized. Be careful when converting between strings and numbers: `Number('')` is zero, JSON cannot faithfully represent Infinity, and a date string can have different semantics from a timestamp. The specific conversions in this lesson are visible in the worked source, so step through them with a concrete value.

## Small design decisions deserve explanations

Before extracting a new abstraction, explain what repeated responsibility it would own. A helper that merely renames one expression may add little. A pure validator or one transaction boundary can make an important guarantee easier to test. Prefer an explanation tied to this project’s behavior over a rule such as “all code must use a particular pattern.”

Write a short decision note: “We chose X because it preserves Y under Z. It does not yet solve W.” Use the limitations in the worked example to fill in those letters. This is the beginning of engineering judgment: choosing a bounded solution and accurately describing its limits.

## What this maps to on a server

Everything in this course happens in the browser, but each idea has a one-to-one server equivalent that you will meet in the Express and .NET courses:

| here (DevDeck) | on a server |
|---|---|
| `validateImport` returning a message before any write | Zod (`validateBody`) or `parseItem` at the Express boundary, answering 400 before the handler |
| `db.transaction("rw", [...tables], fn)` in `src/db.ts` | `BEGIN ... COMMIT` / `ROLLBACK` around several statements (`withTransaction`, Knex `db.transaction`) |
| clearing progress then re-inserting inside one transaction | `DELETE` + `INSERT` in one transaction so a failure leaves the old rows |
| reading `states` after the import to render | re-fetching after a mutation instead of trusting the response |
| the missing piece: nobody else can write while you import | `SELECT ... FOR UPDATE` or a row lock, which IndexedDB gives you implicitly per transaction |

Treat this course as *runtime validation + client-side transactions*; the exercises transfer directly, the storage API does not.

