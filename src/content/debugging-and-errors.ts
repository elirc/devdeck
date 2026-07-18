import type { Card } from '../types';

const T = 1751328000000;
const D = 'debugging-and-errors';

export const debuggingCards: Card[] = [
  // ---- Predict the output ----
  {
    id: 'dbg-undefined-read-001',
    deckId: D,
    type: 'predict-output',
    tags: ['errors', 'typeerror'],
    createdAt: T,
    language: 'js',
    code: 'const user = undefined;\nconsole.log(user.name);',
    answer: "TypeError: Cannot read properties of undefined (reading 'name')",
    explanation:
      'The single most common JS error. The message tells you exactly what was undefined (`user`) and what you tried to read (`name`) — trace back to WHY user was undefined.',
  },
  {
    id: 'dbg-reference-002',
    deckId: D,
    type: 'predict-output',
    tags: ['errors', 'referenceerror'],
    createdAt: T,
    language: 'js',
    code: 'const price = 10;\nconsole.log(totl * price);',
    answer: 'ReferenceError: totl is not defined',
    explanation:
      'ReferenceError means the NAME does not exist at all — usually a typo or a variable declared in another scope. Compare: TypeError means the name exists but holds the wrong kind of value.',
  },
  {
    id: 'dbg-json-parse-003',
    deckId: D,
    type: 'predict-output',
    tags: ['errors', 'json'],
    createdAt: T,
    language: 'js',
    code: "const data = JSON.parse(\"{name: 'Ada'}\");",
    answer: 'A SyntaxError is thrown (invalid JSON)',
    explanation:
      'JSON requires DOUBLE quotes around keys and strings. Unquoted keys and single quotes are valid JS but invalid JSON — a top cause of parse crashes on API responses.',
  },

  // ---- Q&A ----
  {
    id: 'dbg-stack-trace-004',
    deckId: D,
    type: 'qa',
    tags: ['stack-traces'],
    createdAt: T,
    question: 'How do you read a stack trace?',
    answer:
      'Top line: the error type and message. First stack frame: the exact file/line where it THREW. Frames below: the call path that got there, newest to oldest. Skip frames from node_modules — the first frame in YOUR code is usually where to look.',
  },
  {
    id: 'dbg-error-types-005',
    deckId: D,
    type: 'qa',
    tags: ['errors'],
    createdAt: T,
    question: 'TypeError vs ReferenceError vs SyntaxError — what does each signal?',
    answer:
      'SyntaxError: the code could not even be parsed (typo in the structure) — nothing ran. ReferenceError: you used a name that does not exist (typo, wrong scope). TypeError: the name exists but the value is the wrong kind — calling a non-function, reading properties of undefined.',
  },
  {
    id: 'dbg-reproduce-006',
    deckId: D,
    type: 'qa',
    tags: ['strategy'],
    createdAt: T,
    question: 'Why is "reproduce it first" the golden rule of debugging?',
    answer:
      'If you cannot trigger the bug on demand, you cannot verify a fix — you can only hope. A reliable reproduction turns debugging into science: change one thing, re-run, observe. Shrinking the reproduction (smaller input, fewer steps) usually reveals the cause by itself.',
  },
  {
    id: 'dbg-binary-search-007',
    deckId: D,
    type: 'qa',
    tags: ['strategy'],
    createdAt: T,
    question: 'What is binary-search debugging?',
    answer:
      'When a bug is "somewhere in this flow", cut the search space in half: add a check (log or breakpoint) at the midpoint. Data correct there? The bug is downstream. Wrong? Upstream. Repeat. Ten checks can isolate one broken line among a thousand.',
  },
  {
    id: 'dbg-rubber-duck-008',
    deckId: D,
    type: 'qa',
    tags: ['strategy'],
    createdAt: T,
    question: 'What is rubber-duck debugging and why does it work?',
    answer:
      'Explain the code line by line, out loud, to anyone or anything (classically a rubber duck). Explaining forces you to state your ASSUMPTIONS explicitly — and the bug is almost always in an assumption you had not noticed you were making.',
  },

  // ---- Multiple choice ----
  {
    id: 'dbg-notafunction-mcq-009',
    deckId: D,
    type: 'mcq',
    tags: ['errors', 'typeerror'],
    createdAt: T,
    question: 'What does "x is not a function" usually mean?',
    choices: [
      'The function has a syntax error inside',
      'x exists but holds something other than a function (undefined, a value, a typo of a method name)',
      'The function is async and was not awaited',
      'x is in another file',
    ],
    correctIndex: 1,
    explanation:
      'You CALLED something that is not callable. Common causes: misspelled method (`arr.puhs`), a variable shadowed by a value, or an import that came back undefined.',
  },
  {
    id: 'dbg-first-step-mcq-010',
    deckId: D,
    type: 'mcq',
    tags: ['strategy'],
    createdAt: T,
    question: 'A user reports "the page breaks sometimes". Your FIRST move?',
    choices: [
      'Read through the whole codebase for suspicious code',
      'Try to reproduce it reliably',
      'Add try/catch everywhere so it stops breaking',
      'Rewrite the feature',
    ],
    correctIndex: 1,
    explanation:
      'Reproduce → isolate → fix → verify, in that order. Swallowing errors with blanket try/catch hides bugs; reading everything is haystack-searching without a magnet.',
  },
  {
    id: 'dbg-console-mcq-011',
    deckId: D,
    type: 'mcq',
    tags: ['console'],
    createdAt: T,
    question: 'Which prints an array of objects as a readable table in the console?',
    choices: ['console.log', 'console.table', 'console.dir', 'console.group'],
    correctIndex: 1,
    explanation:
      '`console.table(users)` renders rows and columns — far easier to scan than nested object logs. Also worth knowing: `console.error` (red + stack), `console.time/timeEnd` (quick timing).',
  },

  // ---- Fill in the blank ----
  {
    id: 'dbg-finally-cloze-012',
    deckId: D,
    type: 'cloze',
    tags: ['errors', 'try-catch'],
    createdAt: T,
    language: 'js',
    code: 'try {\n  await save();\n} catch (err) {\n  showError(err);\n} {{c1::finally}} {\n  setLoading(false);\n}',
    explanation:
      '`finally` runs whether the try succeeded OR threw — perfect for cleanup like hiding spinners, closing connections, releasing locks.',
  },
  {
    id: 'dbg-debugger-cloze-013',
    deckId: D,
    type: 'cloze',
    tags: ['breakpoints'],
    createdAt: T,
    language: 'js',
    code: 'function applyDiscount(cart) {\n  {{c1::debugger}}; // pause here with DevTools open\n  return cart.total * 0.9;\n}',
    explanation:
      'The `debugger` statement pauses execution like a breakpoint, letting you inspect every variable at that moment — often faster than sprinkling ten console.logs.',
  },
  {
    id: 'dbg-rethrow-cloze-014',
    deckId: D,
    type: 'cloze',
    tags: ['errors', 'try-catch'],
    createdAt: T,
    language: 'js',
    code: "catch (err) {\n  if (err.code === 'NOT_FOUND') return null;\n  {{c1::throw}} err; // not ours to handle — pass it on\n}",
    explanation:
      'Only handle the errors you can actually do something about; RE-THROW the rest. Catching everything and continuing silently is how systems end up corrupt with no trace.',
  },

  // ---- Worked example ----
  {
    id: 'dbg-we-systematic-015',
    deckId: D,
    type: 'worked-example',
    tags: ['strategy'],
    createdAt: T,
    language: 'js',
    title: 'Debug a real bug, systematically',
    prompt:
      'Bug report: "cart total shows NaN sometimes". Walk the systematic route instead of guessing.',
    steps: [
      {
        text: 'REPRODUCE: click around until it breaks — it happens when a discount code is applied. Now it is on demand: add item, apply code SAVE10, total = NaN.',
      },
      {
        code: "console.log({ price, discount });\n// { price: 25, discount: undefined }",
        text: 'ISOLATE: log the inputs at the calculation. `discount` is undefined — the bug is UPSTREAM of the math, in wherever discount comes from.',
      },
      {
        code: "// found it:\nconst discount = DISCOUNTS[code.toLowerCase()];\n// but DISCOUNTS keys are 'SAVE10', 'SAVE20' — uppercase",
        text: 'Trace upstream: the lookup lowercases the code but the table keys are uppercase → lookup misses → undefined → 25 * undefined = NaN.',
      },
      {
        code: 'const discount = DISCOUNTS[code.toUpperCase()] ?? 0;',
        text: 'FIX both layers: normalize the key correctly AND default to 0 so a missing code can never poison the math again. VERIFY: rerun the reproduction — total is correct. That is the whole loop: reproduce, isolate, trace, fix, verify.',
      },
    ],
  },
];
