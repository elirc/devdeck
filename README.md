# DevDeck

A spaced-repetition flashcard PWA for learning software development in 5–15 minute
sessions — on the bus, waiting for a delivery, wherever. Like Anki, but code-native.

- **265 starter cards** across 11 decks: JS Fundamentals, Async JavaScript, TypeScript
  Essentials, Web & Systems, React Mental Model, Git/npm/Tooling, Debugging & Errors,
  Code Quality, DSA Patterns, Security Basics, and CSS Fundamentals
- **Four card types**: predict-the-output, fill-in-the-blank code, worked examples
  (step-by-step reveal), and Q&A / multiple choice
- **Real SM-2 scheduling** (Anki-style): Again / Hard / Good / Easy with growing intervals
- **Time-budget sessions**: tap 5 / 10 / 15 min; the session soft-stops when time is up
- **Fully offline** after first load (installable PWA); all progress stays on-device
  (IndexedDB) with JSON export/import backup
- Light stats: daily streak, 30-day review chart, retention %, per-deck maturity

## Run it

```bash
npm install
npm run dev        # dev server at http://localhost:5173
```

Other commands:

```bash
npm test           # unit tests for the SM-2 scheduler and session queue
npm run typecheck  # tsc
npm run build      # production build in dist/ (includes the service worker)
npm run preview    # serve the production build locally
```

## Install on your phone

PWAs need **https** (or localhost). Easiest path:

1. `npm run build`
2. Host `dist/` anywhere static: GitHub Pages, Netlify Drop (drag the folder onto
   app.netlify.com/drop), or Cloudflare Pages — all free.
3. Open the URL on your phone → browser menu → **Add to Home Screen**.
4. After the first load it works fully offline (airplane-mode friendly).

## Back up your progress

Progress lives in your browser's IndexedDB. Before clearing browser data or switching
devices: **Settings → Export backup** (downloads a JSON file), then **Import backup**
on the new device. Card content ships with the app and is not part of the backup.

## Project notes

- Vite + React 19 + TypeScript (strict), Zustand for state, Dexie for IndexedDB,
  Prism for syntax highlighting, vite-plugin-pwa for offline/installability.
- The scheduler (`src/scheduler.ts`) and queue builder (`src/queue.ts`) are pure,
  unit-tested modules — the UI stays thin.
- Add or edit cards in `src/content/*.ts`; they are type-checked against the card
  schema. New card ids are merged into your progress on next launch without
  touching existing review history.
- Template leftovers that are safe to delete: `src/App.css`, `src/assets/`,
  `public/favicon.svg`, `public/icons.svg`. Tailwind is installed but unused
  (styling is plain CSS in `src/index.css`).

## Junior SWE learning course

[Start the detailed Astra upskilling course](astraupskill/README.md): validating persisted state and atomic IndexedDB replacement, with a codebase map, worked implementation, executable examples, debugging labs, exercises and solution discussions.
