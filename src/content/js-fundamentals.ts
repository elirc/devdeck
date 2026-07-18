import type { Card } from '../types';

const T = 1751328000000;
const D = 'js-fundamentals';

export const jsFundamentalsCards: Card[] = [
  // ---- Predict the output ----
  {
    id: 'js-var-loop-001',
    deckId: D,
    type: 'predict-output',
    tags: ['closures', 'loops', 'var-vs-let'],
    createdAt: T,
    language: 'js',
    code: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}',
    answer: '3\n3\n3',
    explanation:
      '`var` is function-scoped, so all three callbacks share ONE `i`. By the time the timeouts run, the loop has finished and `i` is 3.',
  },
  {
    id: 'js-let-loop-002',
    deckId: D,
    type: 'predict-output',
    tags: ['loops', 'var-vs-let'],
    createdAt: T,
    language: 'js',
    code: 'for (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i));\n}',
    answer: '0\n1\n2',
    explanation:
      '`let` is block-scoped: each loop iteration gets its OWN `i`, so each callback remembers a different value.',
  },
  {
    id: 'js-typeof-003',
    deckId: D,
    type: 'predict-output',
    tags: ['types', 'typeof'],
    createdAt: T,
    language: 'js',
    code: "console.log(typeof null);\nconsole.log(typeof []);\nconsole.log(Array.isArray([]));",
    answer: 'object\nobject\ntrue',
    explanation:
      '`typeof null` being "object" is a famous historical bug kept for compatibility. Arrays are also objects — use `Array.isArray()` to detect them.',
  },
  {
    id: 'js-coercion-004',
    deckId: D,
    type: 'predict-output',
    tags: ['coercion', 'operators'],
    createdAt: T,
    language: 'js',
    code: "console.log('5' + 3);\nconsole.log('5' - 3);",
    answer: '53\n2',
    explanation:
      '`+` with a string concatenates (3 becomes "3"), but `-` only works on numbers, so "5" is converted to 5. Asymmetric and worth memorizing.',
  },
  {
    id: 'js-float-005',
    deckId: D,
    type: 'predict-output',
    tags: ['numbers', 'floating-point'],
    createdAt: T,
    language: 'js',
    code: 'console.log(0.1 + 0.2 === 0.3);',
    answer: 'false',
    explanation:
      'Binary floating point cannot represent 0.1 or 0.2 exactly; the sum is 0.30000000000000004. Compare with a tolerance instead of `===` for decimals.',
  },
  {
    id: 'js-map-006',
    deckId: D,
    type: 'predict-output',
    tags: ['arrays', 'map'],
    createdAt: T,
    language: 'js',
    code: 'const nums = [1, 2, 3];\nconsole.log(nums.map(n => n * 2));\nconsole.log(nums);',
    answer: '[2, 4, 6]\n[1, 2, 3]',
    explanation:
      '`map` returns a NEW array with the callback applied to each element. The original array is untouched.',
  },
  {
    id: 'js-reference-007',
    deckId: D,
    type: 'predict-output',
    tags: ['objects', 'references'],
    createdAt: T,
    language: 'js',
    code: 'const a = [1, 2];\nconst b = a;\nb.push(3);\nconsole.log(a);',
    answer: '[1, 2, 3]',
    explanation:
      'Arrays and objects are assigned by reference: `a` and `b` point to the SAME array, so mutating through `b` is visible through `a`.',
  },
  {
    id: 'js-nan-008',
    deckId: D,
    type: 'predict-output',
    tags: ['numbers', 'nan'],
    createdAt: T,
    language: 'js',
    code: 'console.log(NaN === NaN);\nconsole.log(Number.isNaN(NaN));',
    answer: 'false\ntrue',
    explanation:
      'NaN is the only value in JS not equal to itself — that is by IEEE-754 spec. Use `Number.isNaN()` to check for it.',
  },
  {
    id: 'js-boolean-009',
    deckId: D,
    type: 'predict-output',
    tags: ['truthiness', 'coercion'],
    createdAt: T,
    language: 'js',
    code: "console.log(Boolean(''));\nconsole.log(Boolean('false'));",
    answer: 'false\ntrue',
    explanation:
      'An empty string is falsy, but ANY non-empty string is truthy — including the string "false". Truthiness is about the value type, not its meaning.',
  },
  {
    id: 'js-nullish-010',
    deckId: D,
    type: 'predict-output',
    tags: ['operators', 'nullish-coalescing'],
    createdAt: T,
    language: 'js',
    code: "console.log(0 || 'fallback');\nconsole.log(0 ?? 'fallback');",
    answer: 'fallback\n0',
    explanation:
      '`||` falls back on ANY falsy value (0, "", false). `??` only falls back on `null` or `undefined` — use it when 0 or "" are legitimate values.',
  },
  {
    id: 'js-hoisting-011',
    deckId: D,
    type: 'predict-output',
    tags: ['hoisting', 'var-vs-let'],
    createdAt: T,
    language: 'js',
    code: 'console.log(x);\nvar x = 5;',
    answer: 'undefined',
    explanation:
      '`var` declarations are hoisted to the top of the function but the ASSIGNMENT stays in place, so `x` exists but is undefined. With `let` this would throw a ReferenceError.',
  },
  {
    id: 'js-push-return-012',
    deckId: D,
    type: 'predict-output',
    tags: ['arrays', 'push'],
    createdAt: T,
    language: 'js',
    code: 'const arr = [1, 2];\nconsole.log(arr.push(3));',
    answer: '3',
    explanation:
      '`push` returns the array\'s NEW LENGTH, not the array. A common bug is `arr = arr.push(x)`, which replaces your array with a number.',
  },
  {
    id: 'js-sort-013',
    deckId: D,
    type: 'predict-output',
    tags: ['arrays', 'sort'],
    createdAt: T,
    language: 'js',
    code: 'console.log([10, 1, 3].sort());',
    answer: '[1, 10, 3]',
    explanation:
      'Default `sort` converts elements to STRINGS and compares alphabetically: "1" < "10" < "3". For numbers, pass a comparator: `.sort((a, b) => a - b)`.',
  },
  {
    id: 'js-string-immutable-014',
    deckId: D,
    type: 'predict-output',
    tags: ['strings', 'immutability'],
    createdAt: T,
    language: 'js',
    code: "let s = 'cat';\ns[0] = 'b';\nconsole.log(s);",
    answer: 'cat',
    explanation:
      'Strings are immutable in JS — index assignment silently does nothing (or throws in strict mode). Build a new string instead.',
  },
  {
    id: 'js-slice-015',
    deckId: D,
    type: 'predict-output',
    tags: ['arrays', 'slice'],
    createdAt: T,
    language: 'js',
    code: 'const arr = [1, 2, 3];\nconsole.log(arr.slice(1));\nconsole.log(arr);',
    answer: '[2, 3]\n[1, 2, 3]',
    explanation:
      '`slice` copies a portion into a new array without touching the original. Its lookalike `splice` MUTATES the array — a classic mix-up.',
  },
  {
    id: 'js-equality-016',
    deckId: D,
    type: 'predict-output',
    tags: ['equality', 'coercion'],
    createdAt: T,
    language: 'js',
    code: "console.log('1' == 1);\nconsole.log('1' === 1);",
    answer: 'true\nfalse',
    explanation:
      '`==` coerces types before comparing (string "1" becomes number 1). `===` compares type AND value, so a string never equals a number. Default to `===`.',
  },
  {
    id: 'js-spread-merge-017',
    deckId: D,
    type: 'predict-output',
    tags: ['objects', 'spread'],
    createdAt: T,
    language: 'js',
    code: 'const a = { x: 1, y: 2 };\nconst b = { y: 3 };\nconsole.log({ ...a, ...b });',
    answer: '{ x: 1, y: 3 }',
    explanation:
      'Spread copies properties left to right, so later objects overwrite earlier keys. `b.y` wins over `a.y`.',
  },

  // ---- Fill in the blank ----
  {
    id: 'js-reduce-cloze-018',
    deckId: D,
    type: 'cloze',
    tags: ['arrays', 'reduce'],
    createdAt: T,
    language: 'js',
    code: '// Sum all numbers:\nconst sum = nums.reduce((acc, n) => {{c1::acc + n}}, 0);',
    explanation:
      'The callback returns the next accumulator value. Starting at 0, each element is added onto the running total.',
  },
  {
    id: 'js-optional-chain-019',
    deckId: D,
    type: 'cloze',
    tags: ['objects', 'optional-chaining'],
    createdAt: T,
    language: 'js',
    code: '// Safely read a nested value that may not exist:\nconst city = user{{c1::?.}}address{{c2::?.}}city;',
    explanation:
      '`?.` stops and returns `undefined` if the left side is null/undefined, instead of throwing "Cannot read properties of undefined".',
  },
  {
    id: 'js-object-keys-020',
    deckId: D,
    type: 'cloze',
    tags: ['objects'],
    createdAt: T,
    language: 'js',
    code: "const user = { name: 'Ada', age: 36 };\n// ['name', 'age']\nconst props = Object.{{c1::keys}}(user);",
    explanation:
      '`Object.keys` gives property names; `Object.values` gives values; `Object.entries` gives [key, value] pairs.',
  },
  {
    id: 'js-includes-021',
    deckId: D,
    type: 'cloze',
    tags: ['arrays'],
    createdAt: T,
    language: 'js',
    code: "if (tags.{{c1::includes}}('urgent')) {\n  notify();\n}",
    explanation:
      '`includes` returns a boolean. The older pattern `indexOf(x) !== -1` does the same thing less readably.',
  },
  {
    id: 'js-arrow-022',
    deckId: D,
    type: 'cloze',
    tags: ['functions', 'arrow-functions'],
    createdAt: T,
    language: 'js',
    code: 'const double = n {{c1::=>}} n * 2;',
    explanation:
      'Arrow functions use `=>`. With a single expression body, the value is returned implicitly — no braces or `return` needed.',
  },
  {
    id: 'js-strict-eq-023',
    deckId: D,
    type: 'cloze',
    tags: ['equality'],
    createdAt: T,
    language: 'js',
    code: '// Compare value AND type, no coercion:\nif (input {{c1::===}} expected) {\n  submit();\n}',
    explanation:
      'Triple equals never converts types. It should be your default; reach for `==` only when you deliberately want coercion (rare).',
  },
  {
    id: 'js-spread-copy-024',
    deckId: D,
    type: 'cloze',
    tags: ['arrays', 'spread'],
    createdAt: T,
    language: 'js',
    code: '// Shallow copy, not a shared reference:\nconst copy = [{{c1::...}}original];',
    explanation:
      'Spread unpacks elements into a new array. Note it is SHALLOW: nested objects inside are still shared references.',
  },
  {
    id: 'js-json-cloze-025',
    deckId: D,
    type: 'cloze',
    tags: ['json'],
    createdAt: T,
    language: 'js',
    code: 'const obj = JSON.{{c1::parse}}(text);\nconst text2 = JSON.{{c2::stringify}}(obj);',
    explanation:
      'parse: string in, object out. stringify: object in, string out. Mnemonic: you stringify TO a string.',
  },

  // ---- Q&A ----
  {
    id: 'js-let-const-var-026',
    deckId: D,
    type: 'qa',
    tags: ['variables', 'var-vs-let'],
    createdAt: T,
    question: 'What is the difference between `let`, `const`, and `var`?',
    answer:
      '`let` and `const` are block-scoped; `var` is function-scoped and hoisted (avoid it). `const` prevents REASSIGNMENT of the binding — the object it points to can still be mutated. Default to `const`, use `let` when you need to reassign.',
  },
  {
    id: 'js-closure-027',
    deckId: D,
    type: 'qa',
    tags: ['closures', 'functions'],
    createdAt: T,
    question: 'What is a closure?',
    answer:
      'A function that "remembers" the variables from the scope where it was created, even after that scope has finished running. Example: a counter function returned from another function keeps access to its private `count` variable.',
  },
  {
    id: 'js-eq-explain-028',
    deckId: D,
    type: 'qa',
    tags: ['equality', 'coercion'],
    createdAt: T,
    question: 'Explain `==` vs `===`. Which should you use?',
    answer:
      '`==` coerces both sides to a common type before comparing (`"1" == 1` is true). `===` compares without coercion, so type mismatches are simply false. Use `===` by default — coercion rules are full of surprises.',
  },
  {
    id: 'js-map-foreach-029',
    deckId: D,
    type: 'qa',
    tags: ['arrays', 'map'],
    createdAt: T,
    question: 'What is the difference between `map` and `forEach`?',
    answer:
      '`map` transforms each element and RETURNS a new array. `forEach` just runs a side effect per element and returns undefined. If you are building a value, use `map`; if you are only doing something (like logging), use `forEach`.',
  },
  {
    id: 'js-falsy-030',
    deckId: D,
    type: 'qa',
    tags: ['truthiness'],
    createdAt: T,
    question: 'List all the falsy values in JavaScript.',
    answer:
      '`false`, `0` (and `-0`), `""` (empty string), `null`, `undefined`, `NaN`, and `0n` (BigInt zero). Everything else is truthy — including `"0"`, `[]`, and `{}`.',
  },
  {
    id: 'js-destructuring-031',
    deckId: D,
    type: 'qa',
    tags: ['destructuring'],
    createdAt: T,
    question: 'What does destructuring do? Give an object and an array example.',
    answer:
      'It unpacks values into variables in one step. Object: `const { name, age } = user;` pulls properties by NAME. Array: `const [first, second] = items;` pulls by POSITION. You can add defaults: `const { role = "guest" } = user;`',
  },

  // ---- Multiple choice ----
  {
    id: 'js-pop-mcq-032',
    deckId: D,
    type: 'mcq',
    tags: ['arrays'],
    createdAt: T,
    question: 'Which method removes the LAST element and returns it?',
    choices: ['shift()', 'pop()', 'slice(-1)', 'splice(0, 1)'],
    correctIndex: 1,
    explanation:
      '`pop` removes and returns the last element (mutates). `shift` does the same at the front. `slice(-1)` copies without removing; `splice(0, 1)` removes the first.',
  },
  {
    id: 'js-arrow-this-033',
    deckId: D,
    type: 'mcq',
    tags: ['this', 'arrow-functions'],
    createdAt: T,
    question: 'What is `this` inside an arrow function?',
    choices: [
      'The object the function is called on',
      'Always undefined',
      'Whatever `this` is in the enclosing scope',
      'The global object',
    ],
    correctIndex: 2,
    explanation:
      'Arrow functions have NO own `this` — they capture it lexically from where they were written. That is why they are great for callbacks inside methods.',
  },
  {
    id: 'js-new-array-034',
    deckId: D,
    type: 'mcq',
    tags: ['arrays', 'immutability'],
    createdAt: T,
    question: 'Which of these returns a NEW array instead of mutating?',
    choices: ['push', 'sort', 'map', 'splice'],
    correctIndex: 2,
    explanation:
      '`map` (like `filter`, `slice`, `concat`) returns a fresh array. `push`, `sort`, and `splice` all change the original in place — `sort` surprises many people.',
  },
  {
    id: 'js-truthy-mcq-035',
    deckId: D,
    type: 'mcq',
    tags: ['truthiness'],
    createdAt: T,
    question: 'Which value is truthy?',
    choices: ['0', "''", "'0'", 'null'],
    correctIndex: 2,
    explanation:
      'The STRING "0" is non-empty, so it is truthy. The number 0, empty string, and null are all falsy.',
  },
  {
    id: 'js-const-mutate-036',
    deckId: D,
    type: 'mcq',
    tags: ['variables', 'objects'],
    createdAt: T,
    question: 'Is this valid?',
    code: "const user = { name: 'Ada' };\nuser.name = 'Grace';",
    language: 'js',
    choices: [
      'No — const makes the object immutable',
      'Yes — const only prevents reassigning the variable',
      'No — it throws at runtime',
      'Only in strict mode',
    ],
    correctIndex: 1,
    explanation:
      '`const` locks the BINDING, not the value. You cannot write `user = otherObject`, but mutating properties is fine. Use `Object.freeze` for real immutability.',
  },

  // ---- Worked examples ----
  {
    id: 'js-we-reduce-037',
    deckId: D,
    type: 'worked-example',
    tags: ['arrays', 'reduce'],
    createdAt: T,
    language: 'js',
    title: 'Sum an array with reduce',
    prompt:
      'Given `const nums = [3, 1, 4]`, compute the sum using `reduce`. Predict each step before revealing.',
    steps: [
      {
        text: 'reduce takes a callback `(accumulator, current) => ...` and an initial value. We start the accumulator at 0.',
        code: 'nums.reduce((acc, n) => acc + n, 0)',
      },
      { text: 'Step 1: acc = 0, n = 3 → returns 3.' },
      { text: 'Step 2: acc = 3, n = 1 → returns 4.' },
      {
        text: 'Step 3: acc = 4, n = 4 → returns 8. reduce returns the final accumulator: 8.',
      },
    ],
  },
  {
    id: 'js-we-closure-038',
    deckId: D,
    type: 'worked-example',
    tags: ['closures', 'functions'],
    createdAt: T,
    language: 'js',
    title: 'A counter built from a closure',
    prompt: 'What does this print, and why does `count` survive between calls?',
    steps: [
      {
        code: 'function makeCounter() {\n  let count = 0;\n  return () => {\n    count++;\n    return count;\n  };\n}',
        text: 'makeCounter creates a local `count`, then returns an arrow function that uses it. The returned function CLOSES OVER count.',
      },
      {
        code: 'const counter = makeCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2',
        text: 'Even though makeCounter has finished running, its `count` stays alive because the returned function still references it. Each call increments the same variable.',
      },
      {
        code: 'const other = makeCounter();\nconsole.log(other()); // 1',
        text: 'Calling makeCounter again creates a FRESH scope with its own count. Closures give you private, persistent state without classes.',
      },
    ],
  },
  {
    id: 'js-we-chain-039',
    deckId: D,
    type: 'worked-example',
    tags: ['arrays', 'filter', 'map'],
    createdAt: T,
    language: 'js',
    title: 'Chaining filter and map',
    prompt:
      'Get the names of users 18 or older from `const users = [{ name: "Ana", age: 17 }, { name: "Bo", age: 22 }, { name: "Cy", age: 30 }]`.',
    steps: [
      {
        code: 'users.filter(u => u.age >= 18)',
        text: 'filter keeps elements where the callback is true. Result: the Bo and Cy objects (Ana is dropped).',
      },
      {
        code: 'users.filter(u => u.age >= 18).map(u => u.name)',
        text: 'map then transforms each remaining object into just its name.',
      },
      {
        text: 'Final result: ["Bo", "Cy"]. Chaining works because filter returns a new array, which map is called on. Each step is small and testable.',
      },
    ],
  },
  {
    id: 'js-we-reverse-040',
    deckId: D,
    type: 'worked-example',
    tags: ['strings', 'arrays'],
    createdAt: T,
    language: 'js',
    title: 'Reverse a string',
    prompt: 'Reverse "dev" using array methods. Strings have no .reverse() — how do we get around that?',
    steps: [
      {
        code: "'dev'.split('')",
        text: 'split("") turns the string into an array of characters: ["d", "e", "v"]. Now array methods are available.',
      },
      {
        code: "'dev'.split('').reverse()",
        text: 'reverse flips the array in place: ["v", "e", "d"].',
      },
      {
        code: "'dev'.split('').reverse().join('')",
        text: 'join("") glues the characters back into a string: "ved". split → transform → join is a reusable pattern for string manipulation.',
      },
    ],
  },

  // ---- Upskilling expansion ----
  {
    id: 'js-chained-compare-041',
    deckId: D,
    type: 'predict-output',
    tags: ['operators', 'coercion'],
    createdAt: T,
    language: 'js',
    code: 'console.log(1 < 2 < 3);\nconsole.log(3 > 2 > 1);',
    answer: 'true\nfalse',
    explanation:
      'Comparisons chain left to right: `1 < 2` is true, then `true < 3` coerces to `1 < 3` → true. But `3 > 2` is true, and `true > 1` is `1 > 1` → false. Never chain comparisons in JS.',
  },
  {
    id: 'js-map-parseint-042',
    deckId: D,
    type: 'predict-output',
    tags: ['arrays', 'map', 'gotchas'],
    createdAt: T,
    language: 'js',
    code: "console.log(['1', '2', '3'].map(parseInt));",
    answer: '[1, NaN, NaN]',
    explanation:
      'map calls its callback with (value, INDEX, array) — and parseInt\'s second parameter is the radix. So it runs parseInt("2", 1) and parseInt("3", 2), both NaN. Fix: `.map(n => parseInt(n))` or `.map(Number)`.',
  },
  {
    id: 'js-destructure-skip-043',
    deckId: D,
    type: 'predict-output',
    tags: ['destructuring'],
    createdAt: T,
    language: 'js',
    code: 'const [a, , c] = [1, 2, 3];\nconsole.log(a, c);',
    answer: '1 3',
    explanation:
      'An empty slot in array destructuring skips that position — here the 2 is simply not bound to anything.',
  },
  {
    id: 'js-spread-string-044',
    deckId: D,
    type: 'predict-output',
    tags: ['strings', 'spread'],
    createdAt: T,
    language: 'js',
    code: "console.log([...'hi']);",
    answer: "['h', 'i']",
    explanation:
      'Strings are iterable, so spread splits them into characters — a tidy alternative to `.split("")`.',
  },
  {
    id: 'js-default-param-045',
    deckId: D,
    type: 'cloze',
    tags: ['functions', 'defaults'],
    createdAt: T,
    language: 'js',
    code: "// Used when the argument is undefined:\nfunction greet(name {{c1::= 'friend'}}) {\n  return 'Hi ' + name;\n}",
    explanation:
      'Default parameters kick in only for `undefined` (missing argument) — passing `null` or `""` does NOT trigger the default.',
  },
  {
    id: 'js-shallow-deep-046',
    deckId: D,
    type: 'qa',
    tags: ['objects', 'references'],
    createdAt: T,
    question: 'Shallow copy vs deep copy — what is the difference?',
    answer:
      'A shallow copy (`{ ...obj }`, `arr.slice()`) duplicates the top level only — nested objects are still SHARED references, so mutating them affects both copies. A deep copy duplicates everything: `structuredClone(obj)` is the modern built-in way.',
  },
  {
    id: 'js-typeof-fn-047',
    deckId: D,
    type: 'mcq',
    tags: ['typeof', 'functions'],
    createdAt: T,
    question: 'What does `typeof function() {}` return?',
    choices: ["'object'", "'function'", "'callable'", "'undefined'"],
    correctIndex: 1,
    explanation:
      'Functions get their own typeof result — the useful exception. Arrays and null both report "object", but functions report "function", making callability easy to check.',
  },
  {
    id: 'js-short-circuit-048',
    deckId: D,
    type: 'qa',
    tags: ['operators', 'short-circuit'],
    createdAt: T,
    question: 'What is short-circuit evaluation?',
    answer:
      '`&&` and `||` stop as soon as the answer is known and return the deciding OPERAND, not a boolean. `a && b` skips b if a is falsy; `a || b` skips b if a is truthy. This powers idioms like `user && user.save()` and `name || "anonymous"` — and means the skipped side never even runs.',
  },
];
