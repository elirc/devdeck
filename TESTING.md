# DevDeck — Testing Guide

How the project is tested, what each suite covers, and the manual QA checklist for
the things automation can't reach (PWA install, offline, visuals).

## Running the automated tests

```bash
npm install        # one-time: pulls fake-indexeddb (new devDependency)
npm test           # run everything once
npm run test:watch # watch mode while developing
npm run typecheck  # the type system is a test suite too — content is type-checked
npm run build      # full production build (runs tsc first)
```

No browser or emulator needed: database tests run against `fake-indexeddb`.

## Test files

| File | Kind | Covers |
|---|---|---|
| `src/scheduler.test.ts` | Unit | SM-2 math: learning steps, graduation, lapses/relearning, ease floor (1.3), interval formulas per grade, 365-day cap, fuzz, interval previews, immutability |
| `src/queue.test.ts` | Unit | Session queue: learning-first ordering, due-date sort, 1-new-per-4-reviews interleaving, daily new-card cap, `maxReviewsPerDay`, deck/type filters, end-of-day boundary |
| `src/app.integration.test.ts` | Integration + content QA | Everything below |

### What `app.integration.test.ts` covers

**Content QA (automated).** Every one of the 265 bundled cards is validated on every
test run: unique ids, valid deck references, tag format, snippets ≤ 12 lines (phone-sized),
non-empty answers/explanations, well-formed cloze markers with no stray braces, MCQ
answer indexes in range, worked examples with real steps. Adding a broken card fails CI.

**Scheduler + queue integration.** A card's full life simulated end to end: new →
learning → graduated out of today's queue → due again tomorrow; a lapsed mature card
relearning and re-graduating at half interval; plus a 500-iteration seeded-random
stress test asserting the scheduler can never produce an invalid state (ease < 1.3,
interval > 365 d, due in the past).

**Database (Dexie).** First-launch seeding; re-seeding on later launches never
clobbering progress; review persistence; the full backup cycle
(export → reset → import restores states, logs, streaks exactly); imports dropping
unknown card ids gracefully; schema-version rejection.

**Store (session flows).** A complete first session through the real Zustand store:
10 new cards, learning re-entry mid-session, exactly 20 reviews, correct summary,
streak = 1, daily cap consumed (a second session offers no new cards); soft time
cutoff; abandoning with/without progress; settings persistence; full progress wipe.

**Date helpers.** Local-day formatting and day-boundary resets that drive streaks
and the daily new-card cap.

## Manual QA checklist

Run before "shipping" a build to your phone. Automation can't cover these.

**Session mechanics**
- [ ] Home shows correct due/new counts; 5/10/15 buttons disabled when nothing is due
- [ ] Each card type behaves: predict-output and cloze reveal on tap, worked example
      steps reveal one at a time, MCQ locks after a choice and pre-highlights a grade
- [ ] Grade buttons show interval previews (e.g. "10m / 1d / 4d") and feel tappable
      one-handed with a thumb
- [ ] A card graded Again comes back within the same session
- [ ] Let the timer expire mid-card: you can finish that card, then the summary appears
- [ ] "End" exits with a confirmation; graded cards stay graded after exit

**Data safety**
- [ ] Grade one card, force-close the tab, reopen: nothing lost
- [ ] Settings → Export downloads a JSON; Reset progress (double-confirm) wipes;
      Import restores the exact due counts and streak
- [ ] Streak increments once per day, not once per session

**PWA / offline** (needs `npm run build` + hosting or `npm run preview`)
- [ ] Lighthouse says installable; Add to Home Screen works on the phone
- [ ] Airplane mode after one visit: app opens and a full session works offline
- [ ] After deploying a new version: "A new version is ready" toast appears; Reload updates

**Visual**
- [ ] No horizontal page scroll at 390 px width; long code lines scroll inside their block
- [ ] Light theme readable everywhere (Settings → Theme)
- [ ] Stats: 30-day bar chart, retention %, per-deck maturity bars all render sanely

## Conventions for new tests

Put pure-logic tests next to the module (`foo.test.ts`). Anything touching Dexie or
the store belongs in `app.integration.test.ts` — import `'fake-indexeddb/auto'` FIRST,
and reset in `beforeEach` (`await db.delete(); await db.open();` plus
`useStore.setState(...)` defaults). Store writes are fire-and-forget, so assert
persistence with `vi.waitFor`. New content rules (e.g. "explanations under 400 chars")
belong in the Content QA describe block, where they'll police every future card.
