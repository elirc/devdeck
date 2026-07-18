import type { Card } from '../types';

const T = 1751328000000;
const D = 'code-quality';

export const codeQualityCards: Card[] = [
  // ---- Q&A ----
  {
    id: 'cq-naming-001',
    deckId: D,
    type: 'qa',
    tags: ['naming'],
    createdAt: T,
    question: 'What makes a variable or function name good?',
    answer:
      'It says WHAT the thing is or does, at the right level of detail, without needing a comment: `daysUntilExpiry` not `d`, `sendWelcomeEmail()` not `handle()`. Booleans read as questions (`isExpired`, `hasAccess`). If naming something is hard, the code usually does too many things.',
  },
  {
    id: 'cq-function-size-002',
    deckId: D,
    type: 'qa',
    tags: ['functions'],
    createdAt: T,
    question: 'How big should a function be?',
    answer:
      'Small enough to do ONE nameable thing. Line count is a symptom, not the rule — the real test is whether you can describe it without "and". If a function validates AND saves AND emails, extract three functions and let the original just orchestrate them.',
  },
  {
    id: 'cq-dry-003',
    deckId: D,
    type: 'qa',
    tags: ['dry', 'abstraction'],
    createdAt: T,
    question: 'What is DRY, and when is repeating yourself actually fine?',
    answer:
      "Don't Repeat Yourself: one authoritative home per piece of KNOWLEDGE, so a change happens in one place. But two snippets that look alike while meaning different things should stay separate — merging them couples unrelated features. Rule of three: tolerate a second copy; abstract on the third, when the true pattern is visible.",
  },
  {
    id: 'cq-magic-numbers-004',
    deckId: D,
    type: 'qa',
    tags: ['constants', 'readability'],
    createdAt: T,
    question: 'Why are magic numbers bad, and what is the fix?',
    answer:
      'A bare `86400000` or `if (status === 3)` forces every reader to reverse-engineer the meaning, and duplicates silently drift apart. Name them: `const DAY_MS = 86_400_000`, `STATUS.SHIPPED`. The name documents intent and gives the value a single home.',
  },
  {
    id: 'cq-commits-005',
    deckId: D,
    type: 'qa',
    tags: ['git', 'commits'],
    createdAt: T,
    question: 'What makes a good commit?',
    answer:
      'One logical change (not "fix bug + reformat + rename"), with a message whose subject says what it does — "Fix crash when cart is empty" — and a body explaining WHY when it is not obvious. Small focused commits make review, revert, and git-blame archaeology all possible.',
  },
  {
    id: 'cq-review-006',
    deckId: D,
    type: 'qa',
    tags: ['code-review'],
    createdAt: T,
    question: 'What should you look for when reviewing code (or self-reviewing a PR)?',
    answer:
      'In rough priority: correctness (edge cases, error paths), clarity (could a tired teammate follow it?), tests for the new behavior, and consistency with the codebase. Style nits last — linters should own those. Reviewing your own diff line-by-line before requesting review catches half the issues.',
  },
  {
    id: 'cq-comments-007',
    deckId: D,
    type: 'qa',
    tags: ['comments', 'readability'],
    createdAt: T,
    question: 'What should comments explain — and what should they not?',
    answer:
      'Comments earn their keep explaining WHY: the constraint, the workaround, the link to the weird bug. They rot when they narrate WHAT the code already says (`i++ // increment i`). If you need a comment to explain what code does, first try renaming and extracting until you do not.',
  },

  // ---- Multiple choice ----
  {
    id: 'cq-name-mcq-008',
    deckId: D,
    type: 'mcq',
    tags: ['naming'],
    createdAt: T,
    question: 'Best name for a function that checks whether a coupon can still be used?',
    choices: ['check()', 'couponHelper()', 'isCouponValid()', 'processCouponValidationLogic()'],
    correctIndex: 2,
    explanation:
      'Boolean-returning functions should read as yes/no questions at the call site: `if (isCouponValid(c))`. `check` says nothing; the last one is noise words pretending to be precision.',
  },
  {
    id: 'cq-guard-mcq-009',
    deckId: D,
    type: 'mcq',
    tags: ['readability', 'guard-clauses'],
    createdAt: T,
    question: 'Which structure is generally easiest to read?',
    choices: [
      'Nest each condition deeper: if (a) { if (b) { if (c) { ... } } }',
      'Return early on failures, keep the happy path at the bottom, unindented',
      'One giant boolean: if (a && b && c && d && e)',
      'switch on everything',
    ],
    correctIndex: 1,
    explanation:
      'Guard clauses (`if (!user) return;`) peel off failure cases one by one, so the main logic sits at one indent level. Deep nesting makes readers hold every branch in their head at once.',
  },
  {
    id: 'cq-comment-mcq-010',
    deckId: D,
    type: 'mcq',
    tags: ['comments'],
    createdAt: T,
    question: 'Which comment is worth keeping?',
    choices: [
      '// loop over users',
      '// increment counter',
      "// Stripe rounds to cents server-side, so we must round BEFORE comparing (see bug #482)",
      '// TODO: fix later',
    ],
    correctIndex: 2,
    explanation:
      'It records a non-obvious constraint and links the history — exactly what code cannot say about itself. The others restate the code or gesture vaguely at nothing.',
  },
  {
    id: 'cq-boyscout-mcq-011',
    deckId: D,
    type: 'mcq',
    tags: ['refactoring'],
    createdAt: T,
    question: 'You are fixing a bug and notice the surrounding code is messy. Best practice?',
    choices: [
      'Rewrite the whole file while you are in there',
      'Fix the bug; make small safe cleanups nearby; leave big refactors for their own PR',
      'Never touch anything beyond the bug',
      'Add a TODO and move on, always',
    ],
    correctIndex: 1,
    explanation:
      'The boy-scout rule: leave code a LITTLE better than you found it — a rename, an extracted constant. Mixing a rewrite into a bugfix makes the diff unreviewable and the bugfix un-revertable.',
  },

  // ---- Fill in the blank ----
  {
    id: 'cq-guard-cloze-012',
    deckId: D,
    type: 'cloze',
    tags: ['guard-clauses'],
    createdAt: T,
    language: 'js',
    code: 'function ship(order) {\n  if (!order.isPaid) {{c1::return}};\n  if (order.items.length === 0) return;\n  // happy path, un-nested\n  sendToWarehouse(order);\n}',
    explanation:
      'Guard clauses exit early on invalid cases, so the core logic never gets buried inside nested ifs.',
  },
  {
    id: 'cq-constant-cloze-013',
    deckId: D,
    type: 'cloze',
    tags: ['constants'],
    createdAt: T,
    language: 'js',
    code: '{{c1::const MAX_RETRIES = 3}};\n\nfor (let i = 0; i < MAX_RETRIES; i++) {\n  if (await tryFetch()) break;\n}',
    explanation:
      'Extracting the magic number into a named constant documents intent and creates one place to change the policy.',
  },
  {
    id: 'cq-default-cloze-014',
    deckId: D,
    type: 'cloze',
    tags: ['defaults', 'readability'],
    createdAt: T,
    language: 'js',
    code: '// Default that still allows 0 as a real value:\nconst retries = config.retries {{c1::??}} 3;',
    explanation:
      'For config defaults, `??` beats `||`: with `||`, an explicit `retries: 0` would be overridden by the default — a subtle bug that `??` avoids.',
  },

  // ---- Worked example ----
  {
    id: 'cq-we-refactor-015',
    deckId: D,
    type: 'worked-example',
    tags: ['refactoring', 'guard-clauses'],
    createdAt: T,
    language: 'js',
    title: 'Refactor nested conditionals into guard clauses',
    prompt: 'Untangle this arrow of doom. Predict each transformation.',
    steps: [
      {
        code: 'function discount(user) {\n  if (user) {\n    if (user.isActive) {\n      if (user.orders > 10) {\n        return 0.2;\n      } else {\n        return 0.05;\n      }\n    } else {\n      return 0;\n    }\n  } else {\n    return 0;\n  }\n}',
        text: 'Three levels of nesting to express four outcomes. Readers must track every open branch to know what returns where.',
      },
      {
        code: 'function discount(user) {\n  if (!user) return 0;\n  if (!user.isActive) return 0;\n  ...\n}',
        text: 'Invert the failure conditions into guard clauses at the top. Each line disposes of one case for good — no else needed.',
      },
      {
        code: 'function discount(user) {\n  if (!user) return 0;\n  if (!user.isActive) return 0;\n  return user.orders > 10 ? 0.2 : 0.05;\n}',
        text: 'The happy path collapses to one expressive line. Same behavior, a third of the code, zero nesting — and each rule is now independently readable and deletable.',
      },
    ],
  },
];
