import type { Card } from '../types';

const T = 1751328000000;
const D = 'dsa-patterns';

export const dsaCards: Card[] = [
  // ---- Predict the output ----
  {
    id: 'dsa-set-dedupe-001',
    deckId: D,
    type: 'predict-output',
    tags: ['sets'],
    createdAt: T,
    language: 'js',
    code: 'console.log([...new Set([1, 2, 2, 3, 1])]);',
    answer: '[1, 2, 3]',
    explanation:
      'A Set keeps only unique values (first occurrence wins for order). Set-then-spread is THE one-liner for deduping an array.',
  },
  {
    id: 'dsa-freq-count-002',
    deckId: D,
    type: 'predict-output',
    tags: ['hash-maps', 'counting'],
    createdAt: T,
    language: 'js',
    code: "const counts = {};\nfor (const ch of 'aba') {\n  counts[ch] = (counts[ch] ?? 0) + 1;\n}\nconsole.log(counts);",
    answer: '{ a: 2, b: 1 }',
    explanation:
      'The frequency-counter pattern: an object (or Map) tallies occurrences in one O(n) pass. `?? 0` handles the first sighting of each key.',
  },
  {
    id: 'dsa-factorial-003',
    deckId: D,
    type: 'predict-output',
    tags: ['recursion'],
    createdAt: T,
    language: 'js',
    code: 'function fact(n) {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}\nconsole.log(fact(4));',
    answer: '24',
    explanation:
      'fact(4) = 4 × fact(3) = 4 × 3 × fact(2) = 4 × 3 × 2 × fact(1) = 4 × 3 × 2 × 1 = 24. The base case (n <= 1) stops the descent.',
  },
  {
    id: 'dsa-map-keys-004',
    deckId: D,
    type: 'predict-output',
    tags: ['maps'],
    createdAt: T,
    language: 'js',
    code: "const m = new Map();\nm.set('a', 1);\nm.set('a', 2);\nconsole.log(m.size, m.get('a'));",
    answer: '1 2',
    explanation:
      'Map keys are unique — setting an existing key OVERWRITES its value. So one entry, holding the latest value 2.',
  },

  // ---- Q&A ----
  {
    id: 'dsa-map-vs-scan-005',
    deckId: D,
    type: 'qa',
    tags: ['hash-maps', 'big-o'],
    createdAt: T,
    question: 'When should you replace an array `.find()` with a Map/object lookup?',
    answer:
      'When you look things up REPEATEDLY. `.find()` scans the whole array each time — O(n) per lookup. Building a Map keyed by id costs one O(n) pass, then every lookup is O(1). Doing n lookups drops from O(n²) to O(n) — the single most common real-world optimization.',
  },
  {
    id: 'dsa-set-when-006',
    deckId: D,
    type: 'qa',
    tags: ['sets'],
    createdAt: T,
    question: 'What is a Set good for?',
    answer:
      'Fast membership: "have I seen this before?" in O(1) via `seen.has(x)` / `seen.add(x)`. Core uses: deduping, detecting duplicates, tracking visited items in a traversal. If you never need values attached to keys, prefer Set over Map.',
  },
  {
    id: 'dsa-recursion-needs-007',
    deckId: D,
    type: 'qa',
    tags: ['recursion'],
    createdAt: T,
    question: 'What two things must every recursive function have?',
    answer:
      'A BASE CASE that returns without recursing (or you overflow the stack), and progress TOWARD it — each call must shrink the problem (n-1, half the array, the node\'s children). Check: "does every input eventually reach the base case?"',
  },
  {
    id: 'dsa-stack-queue-008',
    deckId: D,
    type: 'qa',
    tags: ['stacks', 'queues'],
    createdAt: T,
    question: 'Stack vs queue — difference and one real use of each?',
    answer:
      'Stack = LIFO (last in, first out): undo history, the call stack, matching brackets. Queue = FIFO (first in, first out): task/job processing, breadth-first search. In JS: stack via push/pop; queue via push/shift.',
  },
  {
    id: 'dsa-sorted-power-009',
    deckId: D,
    type: 'qa',
    tags: ['sorting', 'two-pointers'],
    createdAt: T,
    question: 'Why does sorting data first unlock faster algorithms?',
    answer:
      'Sorted order adds information you can exploit: binary search (O(log n) lookups), two-pointer scans from both ends, and neighbors-are-similar tricks like duplicate detection in one pass. Paying O(n log n) once to sort often converts an O(n²) problem to O(n log n) total.',
  },

  // ---- Multiple choice ----
  {
    id: 'dsa-hash-bigo-mcq-010',
    deckId: D,
    type: 'mcq',
    tags: ['hash-maps', 'big-o'],
    createdAt: T,
    question: '`map.get(key)` on a Map with a million entries is roughly:',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 0,
    explanation:
      'Hash-based structures jump straight to the bucket for a key — constant time on average, regardless of size. This is why "throw a hash map at it" solves so many problems.',
  },
  {
    id: 'dsa-nested-mcq-011',
    deckId: D,
    type: 'mcq',
    tags: ['big-o'],
    createdAt: T,
    question: 'What is the complexity?',
    code: 'for (const a of items) {\n  for (const b of items) {\n    compare(a, b);\n  }\n}',
    language: 'js',
    choices: ['O(n)', 'O(2n)', 'O(n²)', 'O(log n)'],
    correctIndex: 2,
    explanation:
      'n items × n items = n² comparisons. Nested loops over the same collection are the classic quadratic tell — 10,000 items already means 100 million operations.',
  },
  {
    id: 'dsa-seen-mcq-012',
    deckId: D,
    type: 'mcq',
    tags: ['sets'],
    createdAt: T,
    question: 'Best structure for "skip items we already processed"?',
    choices: [
      'An array + includes()',
      'A Set + has()',
      'A sorted array + binary search',
      'A string of ids',
    ],
    correctIndex: 1,
    explanation:
      '`Set.has` is O(1); `array.includes` is O(n) per check, so a loop of checks goes quadratic. The Set version stays linear overall.',
  },
  {
    id: 'dsa-fifo-mcq-013',
    deckId: D,
    type: 'mcq',
    tags: ['queues'],
    createdAt: T,
    question: 'Print jobs should run in the order submitted. Which structure?',
    choices: ['Stack', 'Queue', 'Set', 'Binary tree'],
    correctIndex: 1,
    explanation:
      'First submitted, first printed = FIFO = queue. A stack would print the NEWEST job first and starve the oldest.',
  },

  // ---- Fill in the blank ----
  {
    id: 'dsa-seen-cloze-014',
    deckId: D,
    type: 'cloze',
    tags: ['sets'],
    createdAt: T,
    language: 'js',
    code: 'const seen = new {{c1::Set}}();\nfor (const id of ids) {\n  if (seen.has(id)) continue;\n  seen.{{c2::add}}(id);\n  process(id);\n}',
    explanation:
      'The visited-set pattern: check membership, add, proceed. Both operations are O(1), keeping the loop linear.',
  },
  {
    id: 'dsa-tally-cloze-015',
    deckId: D,
    type: 'cloze',
    tags: ['hash-maps', 'counting'],
    createdAt: T,
    language: 'js',
    code: 'for (const word of words) {\n  counts[word] = (counts[word] {{c1::?? 0}}) + 1;\n}',
    explanation:
      'On the first occurrence, `counts[word]` is undefined — `?? 0` seeds the tally so `undefined + 1` (NaN) never happens.',
  },
  {
    id: 'dsa-base-cloze-016',
    deckId: D,
    type: 'cloze',
    tags: ['recursion'],
    createdAt: T,
    language: 'js',
    code: 'function countdown(n) {\n  {{c1::if (n <= 0) return}}; // base case\n  console.log(n);\n  countdown(n - 1);\n}',
    explanation:
      'Without the base case, the recursion never stops: "Maximum call stack size exceeded". Write the base case FIRST when authoring recursion.',
  },

  // ---- Worked examples ----
  {
    id: 'dsa-we-twosum-017',
    deckId: D,
    type: 'worked-example',
    tags: ['hash-maps', 'big-o'],
    createdAt: T,
    language: 'js',
    title: 'Two Sum: from O(n²) to O(n)',
    prompt:
      'Find two numbers in [3, 8, 5, 2] that add to 10. First the slow way, then the hash-map way.',
    steps: [
      {
        code: 'for (let i = 0; i < nums.length; i++)\n  for (let j = i + 1; j < nums.length; j++)\n    if (nums[i] + nums[j] === 10) return [i, j];',
        text: 'Brute force: try every pair — nested loops, O(n²). Correct, but 10,000 numbers means ~50 million checks.',
      },
      {
        text: 'Key insight: while scanning, for each number x you already KNOW what its partner must be: 10 - x. So instead of searching for the partner, remember every number you have seen and ask "is the partner already in my memory?"',
      },
      {
        code: 'const seen = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const need = 10 - nums[i];\n  if (seen.has(need)) return [seen.get(need), i];\n  seen.set(nums[i], i);\n}',
        text: 'Walk it: 3 → need 7, not seen, remember 3. 8 → need 2, not seen, remember 8. 5 → need 5, not seen, remember 5. 2 → need 8 — SEEN! Return [1, 3]. One pass, O(1) lookups: O(n) total. "Trade memory for speed via a hash map" is the most reusable trick in interviews and production alike.',
      },
    ],
  },
  {
    id: 'dsa-we-binary-018',
    deckId: D,
    type: 'worked-example',
    tags: ['binary-search', 'big-o'],
    createdAt: T,
    language: 'js',
    title: 'Implement binary search',
    prompt: 'Find the index of 23 in sorted [4, 9, 15, 23, 38, 51]. Predict each probe.',
    steps: [
      {
        code: 'let lo = 0, hi = arr.length - 1;\nwhile (lo <= hi) {\n  const mid = Math.floor((lo + hi) / 2);',
        text: 'Two pointers bracket the live search range; each loop probes the middle. Start: lo=0, hi=5, mid=2 → arr[2]=15.',
      },
      {
        code: '  if (arr[mid] === 23) return mid;\n  if (arr[mid] < 23) lo = mid + 1;\n  else hi = mid - 1;\n}',
        text: '15 < 23, so the target must be right of mid: lo becomes 3. Range is now [3..5], mid=4 → arr[4]=38. 38 > 23 → hi becomes 3.',
      },
      {
        text: 'Range [3..3], mid=3 → arr[3]=23 — found at index 3 in three probes. Each probe halves the range, hence O(log n). Classic off-by-one traps: `lo <= hi` (not <) and moving PAST mid (`mid ± 1`), or you loop forever.',
      },
    ],
  },
  {
    id: 'dsa-we-anagram-019',
    deckId: D,
    type: 'worked-example',
    tags: ['hash-maps', 'counting'],
    createdAt: T,
    language: 'js',
    title: 'Are two strings anagrams?',
    prompt: 'Check if "listen" and "silent" contain exactly the same letters, using the frequency-counter pattern.',
    steps: [
      {
        code: "if (a.length !== b.length) return false;",
        text: 'Cheap rejection first: different lengths can never be anagrams. Guard clauses apply to algorithms too.',
      },
      {
        code: "const counts = {};\nfor (const ch of a) counts[ch] = (counts[ch] ?? 0) + 1;",
        text: 'Pass 1: tally string a. For "listen": { l:1, i:1, s:1, t:1, e:1, n:1 }.',
      },
      {
        code: "for (const ch of b) {\n  if (!counts[ch]) return false;\n  counts[ch]--;\n}\nreturn true;",
        text: 'Pass 2: spend the tally with string b — a letter missing or over-used fails immediately. Two linear passes, O(n), versus sorting both strings at O(n log n). Count-then-consume solves a whole family of "same ingredients?" problems.',
      },
    ],
  },
  {
    id: 'dsa-we-recursion-tree-020',
    deckId: D,
    type: 'worked-example',
    tags: ['recursion'],
    createdAt: T,
    language: 'js',
    title: 'Trace a recursive call, frame by frame',
    prompt: 'What does sum([2, 5, 8]) return, and what does the call stack look like?',
    steps: [
      {
        code: 'function sum(arr) {\n  if (arr.length === 0) return 0; // base case\n  return arr[0] + sum(arr.slice(1));\n}',
        text: 'The recursive shape: answer = first element + answer for the REST. Each call shrinks the array, guaranteeing we hit the base case.',
      },
      {
        text: 'Going down, calls stack up:\nsum([2,5,8]) → 2 + sum([5,8])\nsum([5,8]) → 5 + sum([8])\nsum([8]) → 8 + sum([])\nsum([]) → 0 (base case!)',
      },
      {
        text: 'Coming back up, each frame completes: 8 + 0 = 8 → 5 + 8 = 13 → 2 + 13 = 15. Recursion is just deferred arithmetic: the descent breaks the problem down, the return trip assembles the answer.',
      },
    ],
  },
];
