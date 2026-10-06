# Concepts, explained through this code

[Course index](README.md)

## 1. A cast is not a check

`importBackup` does `const payload = JSON.parse(text) as ExportData;` (`src/store.ts:294`). TypeScript types are erased at compile time, so that line produces exactly the same JavaScript as `JSON.parse(text)`. Whatever is in the file is now typed as `ExportData`, and the compiler will happily let you read `payload.reviewStates[0].ease` from a file that has no `reviewStates`.

`validateImport` is the runtime version of the `ExportData` type. Its signature is worth reading closely (`src/importValidation.ts:3-5`):

```ts
export function validateImport(payload: unknown): asserts payload is ExportData
```

It takes `unknown`, so inside it every property must be checked before use. And it is an **assertion function**: it either throws or returns normally, and after a normal return TypeScript treats `payload` as `ExportData`. That is a stronger contract than returning `true`/`false`: a caller cannot forget to look at the result, because a bad payload never gets past the call.

## 2. Small predicates, one per shape

Lines 6-23 define the vocabulary the rest of the function uses:

| Helper | Accepts |
|---|---|
| `object` | non-null, non-array object |
| `text` | non-empty string, at most 200 characters (ids and deck ids) |
| `number(v, min, max)` | finite number in a range |
| `integer(v, min, max)` | `number` that is also a whole number |
| `day` | `null`, or a real calendar date `YYYY-MM-DD` |
| `fail(field)` | throws `Malformed backup: <field>` |

`day` does more than a regex. `Date.parse('2025-02-30')` is a valid timestamp in V8 (it rolls over into March), so the helper formats the parsed date back and requires it to equal the input (line 19). `2025-03-02` is not `2025-02-30`, so the value is rejected. This is exactly the case the first test feeds it.

## 3. What each block guarantees

| Lines | Block | Guarantees | Message |
|---|---|---|---|
| 24-25 | schema | payload is an object and `schemaVersion === SCHEMA_VERSION` (1) | `unsupported schema version` |
| 27-34 | arrays | `exportedAt` is a number; states and logs are arrays below size caps (100,000 / 1,000,000) | `review arrays` |
| 36-51 | states | each state is an object with a valid `cardId`, `ease` in 1-10, non-negative `intervalDays` and `due`, a known `status`, integer counters, and **no `cardId` appears twice** (the `ids` set, line 40) | `review state` |
| 52-61 | logs | each log has a `cardId`, a timestamp, an integer `grade` 0-3, non-negative `msTaken`, a known `statusBefore` | `review log` |
| 62-73 | settings | integer limits in range, theme `light`/`dark`, card types from `ALL_CARD_TYPES`, deck ids as strings | `settings` |
| 74-86 | meta | `id === 'meta'`, matching schema version, valid days, integer streaks with `bestStreak >= streak` | `progress metadata` |

Two design choices to notice. The function stops at the **first** problem and names only the block, not the record, so a user with 2,000 logs learns that one is bad but not which one. And the size caps are there to stop a huge file from freezing the tab, not because a real user has a million reviews.

## 4. Validate first, then transact

`importData` (`src/db.ts:166-201`) runs in two phases:

1. **Validate outside the transaction** (line 170). A malformed file is rejected before IndexedDB is touched at all. Nothing to roll back.
2. **Replace inside one transaction** (lines 174-199). The callback clears and refills four tables. Dexie runs it as one IndexedDB `readwrite` transaction over exactly those tables; if any operation fails, or the callback throws or returns a rejected promise, Dexie aborts it and IndexedDB restores all four tables to their state before the transaction.

Why both? Validation catches bad **data**. The transaction catches failures that have nothing to do with the data: a storage quota error, a bug in the callback, the tab being closed mid-write. Validation alone would leave you exposed to the second kind; the transaction alone would let well-formed garbage in.

Compare `saveReview` (`db.ts:118-126`): the same idea at a smaller scale. A graded review writes a new state and appends a log in one transaction, so stats can never show a review whose state change was lost.

## 5. Unknown cards: filter, don't fail

Cards are bundled with the app, and a later build might remove or rename one. A backup from an older build can therefore contain states and logs for card ids this build does not have. `importData` handles this by **filtering**, not rejecting (lines 171-172 for states, 187-188 for logs), and then creating fresh states for bundled cards the backup did not mention (181-184). The test `valid restore keeps progress, omits unknown-card logs, and recreates missing states` pins all three behaviours.

Note the asymmetry: unknown **card** ids are dropped, but unknown **deck** ids in `settings.enabledDeckIds` are kept as they are. The validator only checks that they are strings (line 71). Nothing breaks: `getPerDeckCounts` creates an empty counter for each enabled id (`src/queue.ts:174-176`), and no card matches it. Whether to drop them too is exercise 3.

## 6. Ranges: the validator and the app do not quite agree

A validator encodes beliefs about what the app produces. Here are places where those beliefs and the app's actual behaviour differ, each confirmed by running `validateImport` directly:

- `ease`: the validator allows 1-10. The scheduler never goes below 1.3 (`MIN_EASE`, `scheduler.ts:11`), so `ease: 1.0` is accepted although the app cannot produce it. In the other direction, "Easy" adds 0.15 with no upper clamp (`scheduler.ts:167`), so in principle a card graded Easy 51 times in a row would reach 10.15 and its backup would be rejected with `review state`. In practice it is unreachable: each Easy on a review card multiplies the interval, which is capped at 365 days, so that would take decades. It is still a good example of a validator rule that nobody derived from the producer.
- `newCardsPerDay`: the validator allows 0-10,000; the Settings stepper clamps to 1-50 (`Settings.tsx:15-18`).
- `enabledCardTypes: []` is accepted; the Settings screen refuses to disable the last type (`Settings.tsx:20-28`).
- `meta.streak: 5` with `lastReviewDay: null` is accepted, although the app only increments a streak on a review day.

None of these causes a crash. They are worth knowing because they show the difference between "the validator exists" and "the validator matches the domain". Exercise 2 pins two of them.

## 7. Schema versions

`SCHEMA_VERSION` is 1 (`types.ts:126`), and the validator rejects any other value, older or newer. There is no migration path yet, so this is the honest choice: a version-0 file has an unknown shape. When the format changes, the pattern is a `migrate(payload)` step that upgrades one version at a time and then calls the current validator. Note that this is separate from Dexie's own `this.version(1).stores(...)` (`db.ts:29`), which versions the IndexedDB schema, not the backup file.

## 8. Decision note

Practise writing the sentence engineers use in design reviews: "We chose X because it preserves Y under Z. It does not yet solve W." For this code: "We validate the whole backup before opening a transaction, and replace all four progress tables in one Dexie transaction, because that guarantees a bad file changes nothing and a failed write leaves the previous progress intact. It does not tell the user which record was wrong, and it does not check that settings refer to decks that exist."
