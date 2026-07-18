import type { Card, Deck } from '../types';
import { jsFundamentalsCards } from './js-fundamentals';
import { jsAsyncCards } from './js-async';
import { tsEssentialsCards } from './ts-essentials';
import { webAndSystemsCards } from './web-and-systems';
import { reactCards } from './react-mental-model';
import { toolingCards } from './tooling';
import { debuggingCards } from './debugging-and-errors';
import { codeQualityCards } from './code-quality';
import { dsaCards } from './dsa-patterns';
import { securityCards } from './security-basics';
import { cssCards } from './css-fundamentals';

export const allDecks: Deck[] = [
  {
    id: 'js-fundamentals',
    name: 'JS Fundamentals',
    description: 'Values, arrays, objects, scope, closures, and the classic gotchas.',
    order: 1,
  },
  {
    id: 'js-async',
    name: 'Async JavaScript',
    description: 'The event loop, promises, async/await, and fetch.',
    order: 2,
  },
  {
    id: 'ts-essentials',
    name: 'TypeScript Essentials',
    description: 'Annotations, unions, narrowing, and the type-system mental model.',
    order: 3,
  },
  {
    id: 'web-and-systems',
    name: 'Web & Systems',
    description: 'HTTP, REST, SQL, caching, and Big-O intuition.',
    order: 4,
  },
  {
    id: 'react-mental-model',
    name: 'React Mental Model',
    description: 'Components, props vs state, rendering, and hooks.',
    order: 5,
  },
  {
    id: 'tooling',
    name: 'Git, npm & Tooling',
    description: 'Daily git, package.json, semver, and the Node ecosystem.',
    order: 6,
  },
  {
    id: 'debugging-and-errors',
    name: 'Debugging & Errors',
    description: 'Reading stack traces, error types, and systematic bug hunting.',
    order: 7,
  },
  {
    id: 'code-quality',
    name: 'Code Quality',
    description: 'Naming, small functions, refactoring, commits, and code review.',
    order: 8,
  },
  {
    id: 'dsa-patterns',
    name: 'DSA Patterns',
    description: 'Hash maps, sets, recursion, binary search, and Big-O in practice.',
    order: 9,
  },
  {
    id: 'security-basics',
    name: 'Security Basics',
    description: 'XSS, SQL injection, passwords, secrets, CORS, and safe defaults.',
    order: 10,
  },
  {
    id: 'css-fundamentals',
    name: 'CSS Fundamentals',
    description: 'Box model, flexbox, grid, specificity, and responsive layout.',
    order: 11,
  },
];

export const allCards: Card[] = [
  ...jsFundamentalsCards,
  ...jsAsyncCards,
  ...tsEssentialsCards,
  ...webAndSystemsCards,
  ...reactCards,
  ...toolingCards,
  ...debuggingCards,
  ...codeQualityCards,
  ...dsaCards,
  ...securityCards,
  ...cssCards,
];
