import type { Card } from '../types';

const T = 1751328000000;
const D = 'js-async';

export const jsAsyncCards: Card[] = [
  // ---- Predict the output ----
  {
    id: 'async-order-001',
    deckId: D,
    type: 'predict-output',
    tags: ['event-loop', 'microtasks'],
    createdAt: T,
    language: 'js',
    code: "console.log('a');\nsetTimeout(() => console.log('b'));\nPromise.resolve().then(() => console.log('c'));\nconsole.log('d');",
    answer: 'a\nd\nc\nb',
    explanation:
      'Synchronous code runs first (a, d). Then the microtask queue (promise callbacks: c) runs BEFORE the macrotask queue (setTimeout: b).',
  },
  {
    id: 'async-await-split-002',
    deckId: D,
    type: 'predict-output',
    tags: ['async-await', 'event-loop'],
    createdAt: T,
    language: 'js',
    code: "async function main() {\n  console.log('one');\n  await null;\n  console.log('three');\n}\nmain();\nconsole.log('two');",
    answer: 'one\ntwo\nthree',
    explanation:
      'An async function runs synchronously UNTIL the first `await`, then yields back to the caller. Everything after the await resumes as a microtask.',
  },
  {
    id: 'async-timeout-zero-003',
    deckId: D,
    type: 'predict-output',
    tags: ['event-loop', 'settimeout'],
    createdAt: T,
    language: 'js',
    code: "console.log('a');\nsetTimeout(() => console.log('b'), 0);\nconsole.log('c');",
    answer: 'a\nc\nb',
    explanation:
      'A 0ms timeout does not run immediately — the callback goes to the task queue and waits until the current synchronous code finishes.',
  },
  {
    id: 'async-chain-004',
    deckId: D,
    type: 'predict-output',
    tags: ['promises', 'chaining'],
    createdAt: T,
    language: 'js',
    code: 'Promise.resolve(2)\n  .then(n => n * 3)\n  .then(n => console.log(n));',
    answer: '6',
    explanation:
      'Each `.then` receives what the previous one RETURNED. 2 goes in, 6 comes out of the first then and flows to the second.',
  },
  {
    id: 'async-all-005',
    deckId: D,
    type: 'predict-output',
    tags: ['promises', 'promise-all'],
    createdAt: T,
    language: 'js',
    code: 'Promise.all([Promise.resolve(1), Promise.resolve(2)])\n  .then(values => console.log(values));',
    answer: '[1, 2]',
    explanation:
      '`Promise.all` waits for every promise and resolves with an ARRAY of results in the same order you passed them in — regardless of which finished first.',
  },
  {
    id: 'async-catch-006',
    deckId: D,
    type: 'predict-output',
    tags: ['promises', 'error-handling'],
    createdAt: T,
    language: 'js',
    code: "Promise.reject(new Error('boom'))\n  .catch(err => console.log(err.message));",
    answer: 'boom',
    explanation:
      '`.catch` handles a rejected promise the way try/catch handles a thrown error. Without it, you get an "unhandled rejection" warning.',
  },
  {
    id: 'async-return-007',
    deckId: D,
    type: 'predict-output',
    tags: ['async-await', 'promises'],
    createdAt: T,
    language: 'js',
    code: 'async function f() {\n  return 5;\n}\nf().then(v => console.log(v));',
    answer: '5',
    explanation:
      'An async function ALWAYS returns a promise. `return 5` becomes a promise that resolves with 5, so you unwrap it with `.then` or `await`.',
  },

  // ---- Fill in the blank ----
  {
    id: 'async-fetch-cloze-008',
    deckId: D,
    type: 'cloze',
    tags: ['fetch', 'async-await'],
    createdAt: T,
    language: 'js',
    code: "const res = {{c1::await}} fetch('/api/users');\nconst users = await res.{{c2::json}}();",
    explanation:
      'fetch is a two-step await: first for the Response headers, then `res.json()` (also a promise) to read and parse the body.',
  },
  {
    id: 'async-keyword-cloze-009',
    deckId: D,
    type: 'cloze',
    tags: ['async-await'],
    createdAt: T,
    language: 'js',
    code: '{{c1::async}} function loadUser() {\n  const user = await fetchUser();\n  return user;\n}',
    explanation:
      'You can only use `await` inside a function marked `async` (or at the top level of a module).',
  },
  {
    id: 'async-trycatch-cloze-010',
    deckId: D,
    type: 'cloze',
    tags: ['error-handling', 'async-await'],
    createdAt: T,
    language: 'js',
    code: '{{c1::try}} {\n  const data = await load();\n  render(data);\n} {{c2::catch}} (err) {\n  showError(err);\n}',
    explanation:
      'With async/await, a rejected promise becomes a THROWN error, so plain try/catch handles it — no `.catch()` chaining needed.',
  },
  {
    id: 'async-all-cloze-011',
    deckId: D,
    type: 'cloze',
    tags: ['promises', 'promise-all'],
    createdAt: T,
    language: 'js',
    code: '// Run both requests at the same time:\nconst [user, posts] = await Promise.{{c1::all}}([\n  fetchUser(),\n  fetchPosts(),\n]);',
    explanation:
      'Awaiting one-by-one runs requests SEQUENTIALLY. `Promise.all` starts them together and waits for both — usually twice as fast for two independent calls.',
  },

  // ---- Q&A ----
  {
    id: 'async-eventloop-012',
    deckId: D,
    type: 'qa',
    tags: ['event-loop'],
    createdAt: T,
    question: 'In simple terms, what is the event loop?',
    answer:
      'JavaScript runs one thing at a time. Async work (timers, network) is handed off to the browser; when it finishes, its callback waits in a queue. The event loop constantly checks: "is the current code done? OK, run the next queued callback." That is how JS stays responsive with a single thread.',
  },
  {
    id: 'async-await-what-013',
    deckId: D,
    type: 'qa',
    tags: ['async-await'],
    createdAt: T,
    question: 'What does `await` actually do?',
    answer:
      'It pauses THIS async function until the promise settles, then gives you the resolved value (or throws the rejection). Crucially, it does NOT block the rest of the program — other code keeps running while the function is paused.',
  },
  {
    id: 'async-cb-vs-promise-014',
    deckId: D,
    type: 'qa',
    tags: ['promises', 'callbacks'],
    createdAt: T,
    question: 'Why did promises largely replace callbacks?',
    answer:
      'Nested callbacks ("callback hell") made sequential async steps deeply indented and error handling repetitive. Promises flatten steps into `.then` chains with a single `.catch`, and async/await makes it read like synchronous code.',
  },
  {
    id: 'async-unhandled-015',
    deckId: D,
    type: 'qa',
    tags: ['error-handling', 'promises'],
    createdAt: T,
    question: 'What happens if a promise rejects and nothing handles it?',
    answer:
      'You get an "unhandled promise rejection" — an error logged to the console (and in Node it can crash the process). Every promise chain should end in a `.catch`, or be awaited inside a try/catch.',
  },

  // ---- Multiple choice ----
  {
    id: 'async-fetch-mcq-016',
    deckId: D,
    type: 'mcq',
    tags: ['fetch'],
    createdAt: T,
    question: 'What does `await fetch(url)` give you?',
    choices: [
      'The parsed JSON data',
      'A Response object — you still need res.json()',
      'A string of the response body',
      'An XMLHttpRequest',
    ],
    correctIndex: 1,
    explanation:
      'fetch resolves as soon as HEADERS arrive, with a Response object. Reading and parsing the body is a second async step: `await res.json()`.',
  },
  {
    id: 'async-micro-mcq-017',
    deckId: D,
    type: 'mcq',
    tags: ['event-loop', 'microtasks'],
    createdAt: T,
    question: 'Both are queued at the same moment. Which callback runs first?',
    code: "setTimeout(() => console.log('timeout'));\nPromise.resolve().then(() => console.log('promise'));",
    language: 'js',
    choices: ['timeout', 'promise', 'Order is random', 'They run simultaneously'],
    correctIndex: 1,
    explanation:
      'Promise callbacks go to the MICROTASK queue, which is fully drained before the next macrotask (like setTimeout) gets a turn.',
  },
  {
    id: 'async-returns-mcq-018',
    deckId: D,
    type: 'mcq',
    tags: ['async-await'],
    createdAt: T,
    question: 'An `async` function always returns…',
    choices: ['Whatever you return', 'undefined', 'A Promise', 'A callback'],
    correctIndex: 2,
    explanation:
      'The `async` keyword wraps the return value in a promise automatically. Even `return 42` becomes `Promise.resolve(42)` from the caller\'s perspective.',
  },

  // ---- Worked examples ----
  {
    id: 'async-we-fetch-019',
    deckId: D,
    type: 'worked-example',
    tags: ['fetch', 'error-handling'],
    createdAt: T,
    language: 'js',
    title: 'Fetch data with proper error handling',
    prompt: 'Load `/api/todos` safely. What can go wrong, and where do we handle each failure?',
    steps: [
      {
        code: "const res = await fetch('/api/todos');",
        text: 'Step 1: request the URL. This await only rejects on NETWORK failure (offline, DNS) — a 404 or 500 still resolves successfully!',
      },
      {
        code: 'if (!res.ok) {\n  throw new Error(`HTTP ${res.status}`);\n}',
        text: 'Step 2: check `res.ok` (status 200–299) yourself. This is the classic fetch gotcha — HTTP errors are not exceptions unless you make them one.',
      },
      {
        code: 'const todos = await res.json();',
        text: 'Step 3: parse the body. This can also throw if the body is not valid JSON.',
      },
      {
        code: 'try {\n  const todos = await loadTodos();\n} catch (err) {\n  showError(err);\n}',
        text: 'Step 4: wrap the whole thing in try/catch at the call site. Network failure, bad status, and bad JSON all funnel into one handler.',
      },
    ],
  },
  {
    id: 'async-we-order-020',
    deckId: D,
    type: 'worked-example',
    tags: ['event-loop', 'microtasks'],
    createdAt: T,
    language: 'js',
    title: 'Trace an event-loop puzzle',
    prompt: 'Walk through the queues to predict the order:',
    steps: [
      {
        code: "console.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);",
        text: 'First pass: run all synchronous code top to bottom. 1 prints, the timeout callback is queued as a MACROtask, the then-callback as a MICROtask, 4 prints.',
      },
      {
        text: 'Synchronous code is done. Before taking the next macrotask, the event loop drains ALL microtasks: 3 prints.',
      },
      {
        text: 'Microtask queue empty. Now the macrotask runs: 2 prints. Final order: 1, 4, 3, 2. Rule of thumb: sync → all microtasks → one macrotask → repeat.',
      },
    ],
  },

  // ---- Upskilling expansion ----
  {
    id: 'async-multi-then-021',
    deckId: D,
    type: 'predict-output',
    tags: ['promises'],
    createdAt: T,
    language: 'js',
    code: 'const p = Promise.resolve(1);\np.then(v => console.log(v + 1));\np.then(v => console.log(v + 2));',
    answer: '2\n3',
    explanation:
      'A promise can have MANY subscribers; each .then gets the same resolved value (1) independently, running in registration order. A settled promise never changes its value.',
  },
  {
    id: 'async-allsettled-022',
    deckId: D,
    type: 'qa',
    tags: ['promises', 'promise-all'],
    createdAt: T,
    question: 'Promise.all vs Promise.allSettled — when does each fit?',
    answer:
      '`all` is all-or-nothing: one rejection rejects the whole thing immediately. `allSettled` always waits for every promise and gives you `{status, value|reason}` per item. Use `all` when the results only make sense together; `allSettled` when partial success is useful (e.g. sending 10 independent notifications).',
  },
  {
    id: 'async-race-condition-023',
    deckId: D,
    type: 'qa',
    tags: ['race-conditions'],
    createdAt: T,
    question: 'What is a race condition in async code? Give the classic UI example.',
    answer:
      'When correctness depends on which of two async operations finishes first. Classic: a user types "ab" then "abc" in a search box — two fetches fire, but the "ab" response arrives LAST and overwrites the fresher "abc" results. Fixes: ignore stale responses (request id/flag) or cancel the previous request with AbortController.',
  },
  {
    id: 'async-foreach-mcq-024',
    deckId: D,
    type: 'mcq',
    tags: ['async-await', 'gotchas'],
    createdAt: T,
    question: 'What is wrong with this?',
    code: 'items.forEach(async item => {\n  await save(item);\n});\nconsole.log(\'all saved!\');',
    language: 'js',
    choices: [
      'Nothing — it saves each item in order',
      "forEach doesn't await its callback: the log fires before any save finishes",
      'You cannot use async inside forEach at all',
      'It throws a SyntaxError',
    ],
    correctIndex: 1,
    explanation:
      'forEach ignores the promises your callback returns, so all saves race off unawaited and "all saved!" lies. Use `for (const item of items) await save(item)` for sequential, or `await Promise.all(items.map(save))` for parallel.',
  },
  {
    id: 'async-we-parallel-025',
    deckId: D,
    type: 'worked-example',
    tags: ['async-await', 'promise-all', 'performance'],
    createdAt: T,
    language: 'js',
    title: 'Sequential vs parallel awaits',
    prompt: 'Each request takes ~1 second. How long does each version take, and why?',
    steps: [
      {
        code: 'const user = await fetchUser();   // ~1s\nconst posts = await fetchPosts(); // ~1s\n// total: ~2s',
        text: 'Sequential: the second fetch does not even START until the first finishes, because await pauses the function. Fine when the second call NEEDS the first\'s result.',
      },
      {
        code: 'const userP = fetchUser();   // starts now\nconst postsP = fetchPosts(); // starts now too\nconst user = await userP;\nconst posts = await postsP;\n// total: ~1s',
        text: 'Calling both functions first fires both requests immediately; the awaits then just wait for the already-running work. Both run concurrently.',
      },
      {
        code: 'const [user, posts] = await Promise.all([\n  fetchUser(),\n  fetchPosts(),\n]);',
        text: 'The idiomatic form of the same thing — plus if either rejects, you find out immediately. Habit to build: when awaits do not depend on each other, run them together.',
      },
    ],
  },
];
