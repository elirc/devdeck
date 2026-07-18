import type { Card } from '../types';

const T = 1751328000000;
const D = 'ts-essentials';

export const tsEssentialsCards: Card[] = [
  // ---- Fill in the blank ----
  {
    id: 'ts-union-001',
    deckId: D,
    type: 'cloze',
    tags: ['types', 'unions'],
    createdAt: T,
    language: 'ts',
    code: "// A value that can be a string OR a number:\nlet id: {{c1::string | number}};\nid = 'abc'; // ok\nid = 42;    // ok",
    explanation:
      'The `|` creates a union type. `id` accepts either member, but you can only use operations valid for BOTH until you narrow it.',
  },
  {
    id: 'ts-fn-types-002',
    deckId: D,
    type: 'cloze',
    tags: ['functions', 'annotations'],
    createdAt: T,
    language: 'ts',
    code: "function greet(name: {{c1::string}}): {{c2::string}} {\n  return 'Hi ' + name;\n}",
    explanation:
      'Parameter types go after each parameter name; the return type goes after the parentheses. The return type is usually inferred, but writing it documents intent.',
  },
  {
    id: 'ts-optional-003',
    deckId: D,
    type: 'cloze',
    tags: ['interfaces', 'optional'],
    createdAt: T,
    language: 'ts',
    code: 'interface User {\n  name: string;\n  nickname{{c1::?}}: string; // may be missing\n}',
    explanation:
      'The `?` marks a property as optional — its type becomes `string | undefined`, and the compiler forces you to handle the missing case.',
  },
  {
    id: 'ts-generic-004',
    deckId: D,
    type: 'cloze',
    tags: ['generics'],
    createdAt: T,
    language: 'ts',
    code: 'function first<{{c1::T}}>(items: T[]): T | undefined {\n  return items[0];\n}',
    explanation:
      '`<T>` declares a type parameter — a placeholder filled in per call. `first([1, 2])` makes T = number, so the result is typed `number | undefined`.',
  },
  {
    id: 'ts-type-alias-005',
    deckId: D,
    type: 'cloze',
    tags: ['types'],
    createdAt: T,
    language: 'ts',
    code: '{{c1::type}} Point = { x: number; y: number };',
    explanation:
      '`type` creates a reusable name for any type. For object shapes, `interface Point { ... }` works too — the differences are minor at this level.',
  },
  {
    id: 'ts-narrow-006',
    deckId: D,
    type: 'cloze',
    tags: ['narrowing', 'unions'],
    createdAt: T,
    language: 'ts',
    code: "function format(value: string | number) {\n  if ({{c1::typeof}} value === 'string') {\n    return value.toUpperCase(); // value is string here\n  }\n  return value.toFixed(2); // value is number here\n}",
    explanation:
      'A `typeof` check NARROWS the union: inside the if, TS knows `value` is a string, so string methods are allowed. This is called a type guard.',
  },
  {
    id: 'ts-array-type-007',
    deckId: D,
    type: 'cloze',
    tags: ['types', 'arrays'],
    createdAt: T,
    language: 'ts',
    code: 'const scores: {{c1::number[]}} = [90, 85, 72];',
    explanation:
      '`number[]` means "array of numbers". The equivalent generic form is `Array<number>` — both are common.',
  },

  // ---- Q&A ----
  {
    id: 'ts-interface-type-008',
    deckId: D,
    type: 'qa',
    tags: ['interfaces', 'types'],
    createdAt: T,
    question: 'Interface vs `type` — what is the practical difference?',
    answer:
      'For object shapes they are nearly interchangeable. `interface` can be extended and merged (declaration merging); `type` can also name unions, primitives, and tuples, which interfaces cannot. Common convention: interfaces for object shapes, type aliases for everything else. Pick one style and be consistent.',
  },
  {
    id: 'ts-any-unknown-009',
    deckId: D,
    type: 'qa',
    tags: ['any', 'unknown'],
    createdAt: T,
    question: 'What is the difference between `any` and `unknown`?',
    answer:
      'Both accept any value, but `any` DISABLES type checking on everything you do with it — bugs pass silently. `unknown` is the safe version: you must narrow it (typeof checks, etc.) before using it. Rule: reach for `unknown` when you genuinely do not know the type; treat `any` as an escape hatch of last resort.',
  },
  {
    id: 'ts-erasure-010',
    deckId: D,
    type: 'qa',
    tags: ['compilation'],
    createdAt: T,
    question: 'What happens to TypeScript types at runtime?',
    answer:
      'They are ERASED. The compiler strips all annotations and emits plain JavaScript — types exist only at compile time. That is why you cannot do `if (x instanceof MyInterface)`: interfaces have no runtime existence. Runtime validation needs actual code (or a library like Zod).',
  },
  {
    id: 'ts-union-what-011',
    deckId: D,
    type: 'qa',
    tags: ['unions'],
    createdAt: T,
    question: 'What is a union type and when would you use one?',
    answer:
      'A type that can be one of several options: `string | number`, or `"pending" | "done" | "failed"`. Unions of string literals are a lightweight, type-safe alternative to enums for modeling states — the compiler catches typos and unhandled cases.',
  },
  {
    id: 'ts-inference-012',
    deckId: D,
    type: 'qa',
    tags: ['inference'],
    createdAt: T,
    question: 'Do you need to annotate every variable in TypeScript?',
    answer:
      'No — TS INFERS most types. `const n = 5` is already `number`. Annotate where inference cannot help: function parameters, empty arrays (`const items: Task[] = []`), and public API boundaries. Over-annotating adds noise without safety.',
  },
  {
    id: 'ts-null-checks-013',
    deckId: D,
    type: 'qa',
    tags: ['null', 'strict'],
    createdAt: T,
    question: 'What does `strictNullChecks` do, and why keep it on?',
    answer:
      'With it on, `null` and `undefined` are NOT assignable to other types — a `string` is always a real string. Anything nullable must say so (`string | null`) and be checked before use. It turns the classic "cannot read properties of undefined" runtime crash into a compile-time error.',
  },

  // ---- Multiple choice ----
  {
    id: 'ts-tuple-mcq-014',
    deckId: D,
    type: 'mcq',
    tags: ['types', 'tuples'],
    createdAt: T,
    question: 'What is the difference between `string[]` and `[string, number]`?',
    choices: [
      'They are the same thing',
      'The first is an array of strings; the second is a fixed pair: string then number',
      'The second is invalid syntax',
      'The first is mutable, the second is readonly',
    ],
    correctIndex: 1,
    explanation:
      '`[string, number]` is a TUPLE: exactly two elements with those types in that order — like the return of `useState`. `string[]` is any length, all strings.',
  },
  {
    id: 'ts-error-line-mcq-015',
    deckId: D,
    type: 'mcq',
    tags: ['annotations'],
    createdAt: T,
    question: 'Which line fails to compile?',
    code: "function shout(msg: string) {\n  return msg.toUpperCase();\n}\nshout('hey');   // A\nshout(42);      // B\nshout(String(42)); // C",
    language: 'ts',
    choices: ['Line A', 'Line B', 'Line C', 'They all compile'],
    correctIndex: 1,
    explanation:
      '`shout(42)` passes a number where a string is required — a compile error. Line C works because `String(42)` converts explicitly.',
  },
  {
    id: 'ts-as-mcq-016',
    deckId: D,
    type: 'mcq',
    tags: ['assertions'],
    createdAt: T,
    question: 'What does `value as User` do?',
    choices: [
      'Converts the value to a User at runtime',
      'Validates the value matches User and throws otherwise',
      'Tells the compiler to TRUST you that it is a User — no runtime effect',
      'Creates a copy typed as User',
    ],
    correctIndex: 2,
    explanation:
      'A type assertion is a compile-time override with zero runtime behavior. If you are wrong, you get no error — just wrong types downstream. Prefer narrowing or validation.',
  },
  {
    id: 'ts-readonly-mcq-017',
    deckId: D,
    type: 'mcq',
    tags: ['readonly'],
    createdAt: T,
    question: 'With `readonly id: number` on an interface, what is prevented?',
    choices: [
      'Reading the property',
      'Assigning to the property after creation (compile-time)',
      'The object being garbage collected',
      'Runtime mutation from any code',
    ],
    correctIndex: 1,
    explanation:
      '`readonly` is compile-time only: TS rejects `obj.id = 5` after creation. Compiled JS has no protection — it is a contract, not a lock.',
  },
  {
    id: 'ts-primitive-mcq-018',
    deckId: D,
    type: 'mcq',
    tags: ['types'],
    createdAt: T,
    question: 'Which of these is NOT a TypeScript type?',
    choices: ['number', 'boolean', 'float', 'string'],
    correctIndex: 2,
    explanation:
      'JS (and therefore TS) has a single `number` type covering integers and decimals — there is no separate `float` or `int`.',
  },

  // ---- Worked examples ----
  {
    id: 'ts-we-typing-fn-019',
    deckId: D,
    type: 'worked-example',
    tags: ['annotations', 'functions'],
    createdAt: T,
    language: 'ts',
    title: 'Type a function from scratch',
    prompt: 'Take untyped JS and add types: a function that formats a price with an optional currency.',
    steps: [
      {
        code: 'function formatPrice(amount, currency) {\n  return (currency ?? "$") + amount.toFixed(2);\n}',
        text: 'The untyped version. What is amount? What is currency allowed to be? The code hints: amount uses toFixed (number), currency may be missing.',
      },
      {
        code: 'function formatPrice(amount: number, currency?: string) {',
        text: 'Annotate parameters: `amount: number`, and `currency?: string` — the `?` makes it optional, typed as `string | undefined`.',
      },
      {
        code: 'function formatPrice(amount: number, currency?: string): string {\n  return (currency ?? "$") + amount.toFixed(2);\n}',
        text: 'The return type `string` is inferred, but writing it locks the contract. Now `formatPrice("9")` is a compile error instead of a runtime crash.',
      },
    ],
  },
  {
    id: 'ts-we-narrowing-020',
    deckId: D,
    type: 'worked-example',
    tags: ['narrowing', 'unions'],
    createdAt: T,
    language: 'ts',
    title: 'Narrow a union step by step',
    prompt: 'Handle `string | string[] | null` safely in one function.',
    steps: [
      {
        code: 'function firstTag(tags: string | string[] | null): string | undefined {',
        text: 'The input has three possible shapes. TS will not let us call string OR array methods until we rule options out.',
      },
      {
        code: '  if (tags === null) return undefined;',
        text: 'Eliminate null first. Below this line, the type has narrowed to `string | string[]`.',
      },
      {
        code: '  if (typeof tags === "string") return tags;',
        text: 'A typeof guard handles the single-string case. After this line only `string[]` remains.',
      },
      {
        code: '  return tags[0];\n}',
        text: 'TS now knows tags is an array, so indexing is safe. Each check removed one union member — this flow-based narrowing is the heart of everyday TS.',
      },
    ],
  },

  // ---- Upskilling expansion ----
  {
    id: 'ts-literal-union-021',
    deckId: D,
    type: 'cloze',
    tags: ['unions', 'literals'],
    createdAt: T,
    language: 'ts',
    code: "// Only these three strings are allowed:\ntype Status = {{c1::'pending' | 'done' | 'failed'}};\n\nlet s: Status = 'done';   // ok\ns = 'finished';           // compile error",
    explanation:
      'A union of string LITERALS makes invalid states unrepresentable — typos become compile errors. This is the lightweight TS answer to enums.',
  },
  {
    id: 'ts-why-not-any-022',
    deckId: D,
    type: 'qa',
    tags: ['any'],
    createdAt: T,
    question: 'What is the real cost of sprinkling `any` through a codebase?',
    answer:
      '`any` is contagious: everything derived from an `any` value becomes `any` too, silently switching off checking for whole call chains. You keep TypeScript\'s syntax but lose its guarantees — refactors stop being safe and autocomplete goes blind. Each `any` is a hole other bugs crawl through later.',
  },
  {
    id: 'ts-optional-type-mcq-023',
    deckId: D,
    type: 'mcq',
    tags: ['optional-chaining', 'narrowing'],
    createdAt: T,
    question: 'Given `user: User | undefined`, what is the type of `user?.name` (name: string)?',
    choices: ['string', 'string | undefined', 'string | null', 'unknown'],
    correctIndex: 1,
    explanation:
      'If user is undefined, the whole expression short-circuits to undefined — so the result type honestly includes it, and TS makes you handle that before treating it as a string.',
  },
  {
    id: 'ts-record-cloze-024',
    deckId: D,
    type: 'cloze',
    tags: ['generics', 'utility-types'],
    createdAt: T,
    language: 'ts',
    code: '// Map of player name -> score:\nconst scores: {{c1::Record}}<string, number> = {\n  alice: 12,\n  bo: 9,\n};',
    explanation:
      '`Record<K, V>` types an object used as a dictionary. Its cousins worth knowing: `Partial<T>` (all optional), `Pick<T, K>`, and `Omit<T, K>`.',
  },
  {
    id: 'ts-generics-why-025',
    deckId: D,
    type: 'qa',
    tags: ['generics'],
    createdAt: T,
    question: 'What problem do generics solve?',
    answer:
      'Writing code that works for ANY type without giving up type safety. `first(items: unknown[])` loses the element type; `first<T>(items: T[]): T` preserves it — call it with numbers, get a number back. Generics let containers and helpers (arrays, promises, caches) stay reusable AND precisely typed.',
  },
];
