# DevDeck — Handoff to Next Model

> **Status note (2026-10-06): this handoff is historical.** Every item under "NOT DONE" below has since been completed: `src/components/CardView.tsx`, all five screens in `src/screens/`, `App.tsx`, `main.tsx` (with `registerSW`), a hand-written `index.css` with `.theme-light` overrides, the content library and the README all exist, and the verify step's commands (`npm test`, `npm run typecheck`, `npm run build`) are the project's normal checks. The content grew beyond the plan in item 10: 265 cards across **11** decks (debugging, code quality, DSA patterns, security and CSS were added), enforced by the `ships 265 cards across 11 decks` test. Since this file was written, backup import also gained full validation (`src/importValidation.ts`). The `devdeck-spec.md` mentioned below is not in the repository, and "Desktop/devdeck" refers to the original author's machine; use the repository root. Read the rest as a record of how the build was planned, not as a to-do list. For the current state, see [README.md](README.md), [TESTING.md](TESTING.md) and the [course](astraupskill/README.md).

Read `devdeck-spec.md`-style requirements below, then finish the build. The project lives in this folder (`Desktop/devdeck`). Full product spec: see **§Spec summary** at the bottom; original detailed spec was delivered in chat but this file is self-sufficient.

## Current status

**DONE (do not rewrite, build on top):**

| File | State |
|---|---|
| `package.json` | Vite 8 + React 19 + TS 6 template, deps installed (`node_modules` present): dexie, zustand, prismjs, vite-plugin-pwa, vitest, oxlint. Scripts added: `test`, `test:watch`, `typecheck`. |
| `vite.config.ts` | Done — react plugin + VitePWA (autoUpdate, SVG icons, manifest) + vitest `test` block. Uses `defineConfig` from `'vitest/config'`. |
| `index.html` | Done — PWA meta, `/icon.svg`, title DevDeck. |
| `tsconfig.app.json` | Done — added `"vite-plugin-pwa/client"` to types. NOTE: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters` are ON. Use `import type` for all type-only imports; no enums; no unused anything. |
| `public/icon.svg` | Done. |
| `src/types.ts` | Done — all card/deck/review types, `Meta` (with `newIntroDay`/`newIntroCount`), `SessionSummary`, `SCHEMA_VERSION`, `ALL_CARD_TYPES`, `CARD_TYPE_LABELS`. Language type is named `Language`. |
| `src/scheduler.ts` | Done — pure SM-2: learning steps [1m,10m], relearn [10m], ease floor 1.3, 365d cap, ±5% fuzz (optional `fuzzSeed` param; 0.5 = no fuzz), `getIntervalPreviews`, `createNewReviewState`. |
| `src/queue.ts` | Done — `buildQueue` (learning → reviews by due → new interleaved 1-per-4, `newCardsPerDay` and `maxReviewsPerDay` caps), `getDueCounts`, `getPerDeckCounts`. |
| `src/scheduler.test.ts`, `src/queue.test.ts` | Done — comprehensive vitest suites. Not yet run. |
| `src/db.ts` | Done — Dexie tables (cards, decks, reviewStates, reviewLogs, settings, meta), `seedAndLoad` (idempotent seed + merge new bundle cards), `saveReview`, `putMeta`, `putSettings`, `getAllLogs`, `buildExport`, `importData`, `resetProgress`, `defaultSettings`, `defaultMeta`. Imports `{ allCards, allDecks }` from `./content` — **that module does not exist yet**. |
| `src/store.ts` | Done — Zustand store: `init`, routes (`home|session|summary|stats|settings`), `startSession(budgetMs|null)`, `gradeCurrent(grade, endAfterCurrent)` (persists review+log, streak & daily-new accounting, re-queues learning cards via `delayed[]`, soft finish), `abandonSession`, `updateSettings`, `exportBackup` (JSON download), `importBackup(file)`, `wipeProgress`, `setUpdateApp`, helpers `localDayStr`, `newIntroducedToday`. |
| `src/components/CodeBlock.tsx` | Done — Prism highlight (js/ts/tsx/sql/bash), `Prism.manual = true`, no theme CSS import (token colors go in `index.css`). |
| `src/components/RichText.tsx` | Done — renders `` `inline code` `` spans in plain text. |
| `src/components/GradeBar.tsx` | Done — 4 buttons with interval previews, optional `suggested` grade, haptic vibrate. |

**NOT DONE — remaining work in order:**

1. **`src/components/CardView.tsx`** — dispatcher + per-type views. Props pattern: Session screen owns `revealed: boolean`, `stepIdx: number`, `mcqChoice: number | null` (reset on card change) and passes them down.
   - `predict-output`: CodeBlock → on reveal show answer block (mono, accent border) + explanation.
   - `cloze`: markers `{{cN::answer}}`. Hidden: replace each with `___` before highlighting. Revealed: substitute answers + list answers below in accent. Helpers (fresh regex per call, `/\{\{c\d+::([\s\S]*?)\}\}/g`): `clozeHidden`, `clozeRevealed`, `clozeAnswers`.
   - `worked-example`: prompt, then steps `0..stepIdx` (each optional code + text); "Next step" button until last step, then GradeBar (self-assessed).
   - `qa`: question (RichText) → reveal → answer.
   - `mcq`: tappable choices; on select show right/wrong + explanation; suggested grade = correct ? 2 : 0 (user can override).
2. **`src/screens/Home.tsx`** — streak chip, "X due · Y new" (use `getDueCounts` with `newIntroducedToday(meta, now)`), big 5/10/15-min buttons (+ "Until done" when total < 10; disable when 0 due), per-deck rows with due/new counts + enable toggles (write `settings.enabledDeckIds`).
3. **`src/screens/Session.tsx`** — thin time progress bar (skip if `budgetMs === null`), reviewed counter, exit (confirm → `abandonSession`). Footer: Reveal button / Next step / GradeBar per card type. When elapsed ≥ budget, set `endAfterCurrent = true` and pass to `gradeCurrent` (soft cutoff). 1s interval tick.
4. **`src/screens/Summary.tsx`** — `lastSummary` stats (reviewed, accuracy = correct/reviewed, new, duration, streak) + "Keep going" (`startSession(lastBudgetMs)`) + "Done".
5. **`src/screens/Stats.tsx`** — streak/best from meta; load logs via `getAllLogs()` in useEffect; 30-day reviews/day bar chart with plain divs; retention % (grade ≥ 2, last 30d); per-deck new/learning/young(<21d)/mature(≥21d) counts from states.
6. **`src/screens/Settings.tsx`** — newCardsPerDay stepper (1–50), card-type toggles, deck toggles, theme toggle, Export/Import (file input → `importBackup`, show returned message), Reset (double confirm → `wipeProgress`), version.
7. **`src/App.tsx`** (overwrite template) — `init()` on mount, loading state, render screen by `route`, bottom nav (Home/Stats/Settings; hidden during session), theme class from settings, update-toast when `updateApp` set ("Updated — reload" → call it).
8. **`src/main.tsx`** (overwrite) — keep StrictMode; add `registerSW` from `'virtual:pwa-register'`, `onNeedRefresh` → `useStore.getState().setUpdateApp(() => void updateSW(true))`.
9. **`src/index.css`** (overwrite template CSS entirely) — hand-written dark theme (NO Tailwind even though it's installed): vars `--bg:#0f1117 --surface:#171a24 --surface2:#1e2230 --border:#2a2f42 --text:#e8eaf2 --muted:#8a91a8 --accent:#2dd4bf` + red/orange/green/blue for grades. Mobile-first 390px, max-width 480px centered on desktop, code blocks 14px mono with horizontal scroll (never wrap), grade buttons ≥48px fixed bottom, Prism token colors (`.token.keyword` etc.), light-theme overrides under a `.theme-light` class. Stop importing `App.css`.
10. **`src/content/`** — the big one. `index.ts` exporting `allDecks: Deck[]` and `allCards: Card[]` assembled from 6 per-deck TS files (typed `Card[]`, so tsc validates them). Target ~145–200 cards:
    - `js-fundamentals` (40): types/coercion, arrays & methods, objects, scope, closures, `this`, destructuring, spread, equality, truthiness
    - `js-async` (20): event loop order, promises, async/await, fetch, error handling
    - `ts-essentials` (20): annotations, interface vs type, unions, narrowing, generics intro, unknown vs any
    - `web-and-systems` (30): HTTP methods/status/headers, REST, JSON, cookies vs tokens, SQL SELECT/WHERE/JOIN, caching, Big-O intuition
    - `react-mental-model` (20): components, props vs state, JSX, useState, useEffect, re-renders, keys
    - `tooling` (15): git basics, npm, package.json, semver, node vs browser
    Mix ≈35% predict-output, 25% cloze, 25% qa/mcq, 15% worked-example. Rules: one concept per card; snippets ≤12 lines; explanations 1–4 sentences addressing the misconception; ids like `js-closures-001`; `createdAt` = one shared constant; **mentally verify every predict-output answer — classic pitfalls only, no ambiguous output**.
11. **README.md** (overwrite template) — what it is, `npm install && npm run dev`, `npm test`, `npm run build`, PWA install steps (needs https hosting, e.g. GitHub Pages/Netlify), export/import backup note, note that Tailwind/oxlint template leftovers (`src/assets/`, `App.css`, `public/favicon.svg`, `icons.svg`) can be deleted.
12. **Verify** — `npm test`, `npm run typecheck`, `npm run build` all clean; fix fallout. CAUTION: a sandbox/shell was unavailable this session due to low disk space on the user's machine — if your shell also fails, deliver code and give the user the commands to run.

## Gotchas discovered

- The folder already contained a fresh Vite template **plus** earlier spec-based implementations of `types.ts`/`scheduler.ts`/`queue.ts` (kept; unused imports/params that violate this strict tsconfig were already fixed).
- TS 6 + `verbatimModuleSyntax`: every type-only import must be `import type`.
- `noUnusedLocals`/`noUnusedParameters` are on — template code style uses semicolons + single quotes.
- Grade type is `0|1|2|3` = Again|Hard|Good|Easy. Meta lives in table `meta` with `id: 'meta'`; settings row is `{ id: 'settings', ...Settings }`.
- Store's `gradeCurrent` already handles session end, streaks, and learning-card re-entry — screens should stay thin.

## Spec summary (product intent)

Anki-style spaced-repetition PWA ("DevDeck") for a beginner learning JS/TS, web/systems concepts, React, and tooling in 5–15 min offline sessions on a phone. Time-budget sessions with soft cutoff and summary; SM-2 scheduling; four code-native card types; light stats (streak, retention, per-deck progress); all data on-device (IndexedDB) with JSON export/import; no accounts, no code execution, no card editor in v1.
