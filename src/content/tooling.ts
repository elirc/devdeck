import type { Card } from '../types';

const T = 1751328000000;
const D = 'tooling';

export const toolingCards: Card[] = [
  // ---- Fill in the blank ----
  {
    id: 'tool-git-commit-001',
    deckId: D,
    type: 'cloze',
    tags: ['git'],
    createdAt: T,
    language: 'bash',
    code: '# Stage everything, then commit:\ngit {{c1::add}} .\ngit {{c2::commit}} -m "Add login form"',
    explanation:
      'Committing is two steps: `add` stages the changes you want included; `commit` snapshots the staged changes with a message.',
  },
  {
    id: 'tool-git-branch-002',
    deckId: D,
    type: 'cloze',
    tags: ['git', 'branches'],
    createdAt: T,
    language: 'bash',
    code: '# Create AND switch to a new branch:\ngit {{c1::checkout -b}} new-feature',
    explanation:
      '`checkout -b` creates the branch and moves you onto it in one step. The modern equivalent is `git switch -c new-feature`.',
  },
  {
    id: 'tool-npm-install-003',
    deckId: D,
    type: 'cloze',
    tags: ['npm'],
    createdAt: T,
    language: 'bash',
    code: '# Add a library to the project:\nnpm {{c1::install}} zod',
    explanation:
      'Installs the package into node_modules AND records it under "dependencies" in package.json, so teammates get it from a plain `npm install`.',
  },
  {
    id: 'tool-git-status-004',
    deckId: D,
    type: 'cloze',
    tags: ['git'],
    createdAt: T,
    language: 'bash',
    code: '# What changed? What is staged?\ngit {{c1::status}}',
    explanation:
      '`git status` shows modified, staged, and untracked files. Run it constantly — before and after almost every git command.',
  },

  // ---- Q&A ----
  {
    id: 'tool-branch-what-005',
    deckId: D,
    type: 'qa',
    tags: ['git', 'branches'],
    createdAt: T,
    question: 'What is a git branch?',
    answer:
      'A movable pointer to a chain of commits — effectively a parallel line of work. You branch off main, commit freely without touching anyone else\'s work, then merge back when ready. Branches are cheap; make one per feature or fix.',
  },
  {
    id: 'tool-gitignore-006',
    deckId: D,
    type: 'qa',
    tags: ['git'],
    createdAt: T,
    question: 'What is `.gitignore`, and why is `node_modules` always in it?',
    answer:
      'A file listing paths git should never track — build output, secrets, local config. node_modules is huge, machine-generated, and fully reproducible from package.json with `npm install`, so committing it adds thousands of junk files for zero benefit.',
  },
  {
    id: 'tool-deps-007',
    deckId: D,
    type: 'qa',
    tags: ['npm', 'package-json'],
    createdAt: T,
    question: '`dependencies` vs `devDependencies` — what goes where?',
    answer:
      '`dependencies`: what the app needs to RUN (react, dexie). `devDependencies` (installed with `npm install -D`): tools only needed while developing — TypeScript, vite, test runners, linters. Production installs can skip devDependencies entirely.',
  },
  {
    id: 'tool-lockfile-008',
    deckId: D,
    type: 'qa',
    tags: ['npm', 'package-json'],
    createdAt: T,
    question: 'What is package-lock.json for, and should you commit it?',
    answer:
      'package.json allows version RANGES (^4.2.0); the lock file records the EXACT versions actually installed, for the whole dependency tree. Committing it means every machine and CI run installs identical versions — yes, always commit it.',
  },
  {
    id: 'tool-node-browser-009',
    deckId: D,
    type: 'qa',
    tags: ['node'],
    createdAt: T,
    question: 'How does Node.js differ from browser JavaScript?',
    answer:
      'Same language, different environment. Node runs on servers/your machine: it has file system access, network servers, and `process`, but NO `document`, `window`, or DOM. The browser has the DOM and fetch but no direct file access. Libraries often target one or the other.',
  },
  {
    id: 'tool-npx-010',
    deckId: D,
    type: 'qa',
    tags: ['npm'],
    createdAt: T,
    question: 'What does `npx` do?',
    answer:
      'Runs a package\'s command WITHOUT permanently installing it globally — `npx create-vite my-app` downloads (if needed) and executes the tool in one shot. Great for scaffolding tools you use once, and for running locally-installed binaries.',
  },

  // ---- Multiple choice ----
  {
    id: 'tool-pull-mcq-011',
    deckId: D,
    type: 'mcq',
    tags: ['git'],
    createdAt: T,
    question: '`git pull` is equivalent to…',
    choices: [
      'git fetch + git merge',
      'git clone + git checkout',
      'git add + git commit',
      'git push in reverse',
    ],
    correctIndex: 0,
    explanation:
      'pull = fetch (download remote commits) + merge (combine them into your branch). Knowing this helps when a pull hits conflicts — the merge half is what needs resolving.',
  },
  {
    id: 'tool-semver-mcq-012',
    deckId: D,
    type: 'mcq',
    tags: ['npm', 'semver'],
    createdAt: T,
    question: 'In package.json, what can `"^4.2.0"` install?',
    choices: [
      'Exactly 4.2.0',
      'Any 4.x.x that is 4.2.0 or newer (e.g. 4.9.1), but not 5.0.0',
      'Anything newer, including 5.0.0',
      'Only patch updates like 4.2.7',
    ],
    correctIndex: 1,
    explanation:
      'The caret allows minor and patch updates within the same MAJOR version. Semver promise: majors may break your code, minors add features, patches fix bugs.',
  },
  {
    id: 'tool-scripts-mcq-013',
    deckId: D,
    type: 'mcq',
    tags: ['npm', 'package-json'],
    createdAt: T,
    question: 'Where is `npm run dev` defined?',
    choices: [
      'In npm itself',
      'In the "scripts" section of package.json',
      'In node_modules/.bin/dev',
      'In vite.config.ts',
    ],
    correctIndex: 1,
    explanation:
      'The scripts object maps names to shell commands (`"dev": "vite"`). `npm run <name>` executes them with node_modules/.bin on the PATH, so local tools work without global installs.',
  },
  {
    id: 'tool-merge-mcq-014',
    deckId: D,
    type: 'mcq',
    tags: ['git', 'branches'],
    createdAt: T,
    question: 'What does merging a feature branch into main do?',
    choices: [
      'Deletes the feature branch',
      'Combines its commits into main, creating a merge commit if histories diverged',
      'Overwrites main with the feature branch',
      'Renames the branch to main',
    ],
    correctIndex: 1,
    explanation:
      'Merge brings the branch\'s changes into main and preserves both histories. The branch itself lives on until you delete it. Overwriting is what people FEAR merge does — it does not.',
  },

  // ---- Worked example ----
  {
    id: 'tool-we-first-push-015',
    deckId: D,
    type: 'worked-example',
    tags: ['git', 'workflow'],
    createdAt: T,
    language: 'bash',
    title: 'Your daily git loop',
    prompt: 'You fixed a bug in `app.ts` on a fresh branch. Get it committed and pushed. Predict each command.',
    steps: [
      {
        code: 'git checkout -b fix-login-bug',
        text: 'Branch first, commit second: keep main clean and give the change a descriptive home.',
      },
      {
        code: 'git status\ngit diff',
        text: 'Sanity-check what you are about to commit: status lists changed files, diff shows the exact lines.',
      },
      {
        code: 'git add app.ts\ngit commit -m "Fix null crash on empty login form"',
        text: 'Stage the specific file (not a blind `add .`), then commit with a message describing WHY, not just what.',
      },
      {
        code: 'git push -u origin fix-login-bug',
        text: '`-u` links your local branch to the remote one, so future pushes are just `git push`. From here you would open a pull request. This loop — branch, edit, status/diff, add, commit, push — is 90% of daily git.',
      },
    ],
  },

  // ---- Upskilling expansion ----
  {
    id: 'tool-stash-016',
    deckId: D,
    type: 'qa',
    tags: ['git'],
    createdAt: T,
    question: 'What does `git stash` do, and when is it the right tool?',
    answer:
      'It shelves your uncommitted changes and gives you a clean working tree; `git stash pop` brings them back. Perfect for "I am mid-change but need to switch branches / pull / hotfix RIGHT NOW". For work you want to keep long-term, a WIP commit on a branch is safer — stashes are easy to forget.',
  },
  {
    id: 'tool-undo-commit-mcq-017',
    deckId: D,
    type: 'mcq',
    tags: ['git'],
    createdAt: T,
    question: 'You committed too early (not pushed). Undo the commit but KEEP the changes?',
    choices: [
      'git reset --hard HEAD~1',
      'git reset --soft HEAD~1',
      'git revert HEAD',
      'git checkout HEAD~1',
    ],
    correctIndex: 1,
    explanation:
      '`--soft` moves the branch back one commit, leaving your changes staged. `--hard` DESTROYS the changes; `revert` adds a new inverse commit (right choice only after pushing).',
  },
  {
    id: 'tool-diff-staged-018',
    deckId: D,
    type: 'cloze',
    tags: ['git'],
    createdAt: T,
    language: 'bash',
    code: '# Review exactly what the next commit will contain:\ngit diff {{c1::--staged}}',
    explanation:
      'Plain `git diff` shows UNstaged changes; `--staged` shows what `git add` has queued up. Reading it before every commit is the cheapest code review you will ever get.',
  },
];
