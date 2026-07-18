import type { Card } from '../types';

const T = 1751328000000;
const D = 'react-mental-model';

export const reactCards: Card[] = [
  // ---- Fill in the blank ----
  {
    id: 'react-usestate-001',
    deckId: D,
    type: 'cloze',
    tags: ['hooks', 'usestate'],
    createdAt: T,
    language: 'tsx',
    code: 'const [count, {{c1::setCount}}] = {{c2::useState}}(0);',
    explanation:
      'useState returns a PAIR: the current value and a setter. Calling the setter updates the value and re-renders the component.',
  },
  {
    id: 'react-useeffect-deps-002',
    deckId: D,
    type: 'cloze',
    tags: ['hooks', 'useeffect'],
    createdAt: T,
    language: 'tsx',
    code: "// Run once, after the first render:\nuseEffect(() => {\n  document.title = 'Dashboard';\n}, {{c1::[]}});",
    explanation:
      'The empty dependency array means "no values to watch", so the effect runs only after the initial mount. Omit the array entirely and it runs after EVERY render.',
  },
  {
    id: 'react-key-003',
    deckId: D,
    type: 'cloze',
    tags: ['lists', 'keys'],
    createdAt: T,
    language: 'tsx',
    code: '{items.map(item => (\n  <li {{c1::key}}={item.id}>{item.name}</li>\n))}',
    explanation:
      'Keys let React match list items across renders so it can update instead of rebuilding. Use a stable id — array index breaks when items reorder.',
  },
  {
    id: 'react-fn-update-004',
    deckId: D,
    type: 'cloze',
    tags: ['usestate', 'updates'],
    createdAt: T,
    language: 'tsx',
    code: '// Safely increment based on the previous value:\nsetCount({{c1::c => c + 1}});',
    explanation:
      'Passing a FUNCTION guarantees you get the latest value, even if several updates are queued in one event. `setCount(count + 1)` twice only adds one.',
  },
  {
    id: 'react-conditional-005',
    deckId: D,
    type: 'cloze',
    tags: ['jsx', 'conditional-rendering'],
    createdAt: T,
    language: 'tsx',
    code: '// Render Profile only when logged in:\n{isLoggedIn {{c1::&&}} <Profile />}',
    explanation:
      'In JSX, `cond && <X />` renders X only when cond is truthy. For either/or, use a ternary: `cond ? <A /> : <B />`.',
  },

  // ---- Q&A ----
  {
    id: 'react-props-state-006',
    deckId: D,
    type: 'qa',
    tags: ['props', 'state'],
    createdAt: T,
    question: 'Props vs state — what is the difference?',
    answer:
      'Props are inputs passed FROM the parent — read-only, like function arguments. State is data the component OWNS and can change over time with its setter. If a component does not need to change it, it should probably be a prop.',
  },
  {
    id: 'react-keys-why-007',
    deckId: D,
    type: 'qa',
    tags: ['lists', 'keys'],
    createdAt: T,
    question: 'Why does React need a `key` on list items?',
    answer:
      'When the list changes, React compares the new render to the old one. Keys tell it WHICH item is which, so it can move or update items instead of destroying and recreating them. Wrong keys (like array index) cause lost input state and subtle bugs when items reorder or get deleted.',
  },
  {
    id: 'react-jsx-008',
    deckId: D,
    type: 'qa',
    tags: ['jsx'],
    createdAt: T,
    question: 'What is JSX, really?',
    answer:
      'Syntax sugar that compiles to function calls: `<Button color="red" />` becomes `createElement(Button, { color: "red" })`. It produces lightweight DESCRIPTIONS of UI (elements), not actual DOM nodes — React turns those descriptions into real DOM updates.',
  },
  {
    id: 'react-controlled-009',
    deckId: D,
    type: 'qa',
    tags: ['forms', 'controlled-inputs'],
    createdAt: T,
    question: 'What is a controlled input?',
    answer:
      'An input whose value is driven by React state: `<input value={text} onChange={e => setText(e.target.value)} />`. The state is the single source of truth — the input shows exactly what state holds, and every keystroke flows through your code, so validation and formatting are trivial.',
  },
  {
    id: 'react-no-mutate-010',
    deckId: D,
    type: 'qa',
    tags: ['state', 'immutability'],
    createdAt: T,
    question: 'Why is `items.push(newItem)` wrong for React state?',
    answer:
      'React decides whether to re-render by comparing references. Mutating the existing array keeps the SAME reference, so React sees no change and skips the update. Create a new array instead: `setItems([...items, newItem])`.',
  },
  {
    id: 'react-rerender-011',
    deckId: D,
    type: 'qa',
    tags: ['rendering'],
    createdAt: T,
    question: 'What causes a component to re-render?',
    answer:
      'Three things: its state changed (via a setter), its parent re-rendered (children re-render by default), or a context it subscribes to changed. Note that "re-render" means the function runs again to produce a new description — React then updates only the DOM bits that actually differ.',
  },
  {
    id: 'react-dataflow-012',
    deckId: D,
    type: 'qa',
    tags: ['data-flow', 'architecture'],
    createdAt: T,
    question: 'What does "one-way data flow" mean in React?',
    answer:
      'Data flows DOWN via props; changes flow UP via callback props (`onDelete={...}`). A child never modifies its props — it asks the owner of the state to change it. This makes it easy to trace where any piece of data comes from and who can change it.',
  },

  // ---- Multiple choice ----
  {
    id: 'react-classname-mcq-013',
    deckId: D,
    type: 'mcq',
    tags: ['jsx'],
    createdAt: T,
    question: 'How do you set a CSS class in JSX?',
    choices: ['class="btn"', 'className="btn"', 'css="btn"', 'style="btn"'],
    correctIndex: 1,
    explanation:
      'JSX uses `className` because `class` is a reserved word in JavaScript. Same story for `htmlFor` instead of `for` on labels.',
  },
  {
    id: 'react-stale-mcq-014',
    deckId: D,
    type: 'mcq',
    tags: ['usestate', 'updates'],
    createdAt: T,
    question: 'count starts at 0. After one click, what is count on the next render?',
    code: 'function handleClick() {\n  setCount(count + 1);\n  setCount(count + 1);\n}',
    language: 'tsx',
    choices: ['2', '1', '0', 'It throws'],
    correctIndex: 1,
    explanation:
      'Both calls read the SAME `count` (0) from this render, so both queue "set to 1". State is a snapshot per render — use `setCount(c => c + 1)` to stack updates.',
  },
  {
    id: 'react-effects-mcq-015',
    deckId: D,
    type: 'mcq',
    tags: ['useeffect', 'side-effects'],
    createdAt: T,
    question: 'Where should a data fetch on mount go?',
    choices: [
      'Directly in the component body',
      'Inside useEffect',
      'In the JSX',
      'In a constructor',
    ],
    correctIndex: 1,
    explanation:
      'The component body runs on EVERY render and must stay a pure calculation. Side effects — fetching, subscriptions, timers — belong in useEffect, which runs after render.',
  },
  {
    id: 'react-fragment-mcq-016',
    deckId: D,
    type: 'mcq',
    tags: ['jsx'],
    createdAt: T,
    question: 'What is `<>...</>` for?',
    choices: [
      'A placeholder for loading states',
      'Grouping siblings without adding a wrapper DOM node',
      'Marking HTML as safe',
      'A comment in JSX',
    ],
    correctIndex: 1,
    explanation:
      'A component must return ONE root element. A Fragment groups children without polluting the DOM with an extra `<div>`.',
  },
  {
    id: 'react-parent-mcq-017',
    deckId: D,
    type: 'mcq',
    tags: ['rendering'],
    createdAt: T,
    question: 'A parent component re-renders. What happens to its children by default?',
    choices: [
      'Nothing — children only re-render on their own state changes',
      'They re-render too',
      'Only children with props re-render',
      'They unmount and remount',
    ],
    correctIndex: 1,
    explanation:
      'By default React re-runs the whole subtree. That is usually fine (renders are cheap); `React.memo` can skip children whose props are unchanged when it matters.',
  },
  {
    id: 'react-prev-mcq-018',
    deckId: D,
    type: 'mcq',
    tags: ['usestate', 'updates'],
    createdAt: T,
    question: 'Which is the reliable way to increment state?',
    choices: [
      'count++',
      'setCount(count + 1)',
      'setCount(c => c + 1)',
      'count = count + 1',
    ],
    correctIndex: 2,
    explanation:
      'The functional form always receives the latest value. Direct mutation (options 1 and 4) never triggers a render; `setCount(count + 1)` can act on a stale snapshot.',
  },

  // ---- Worked examples ----
  {
    id: 'react-we-counter-019',
    deckId: D,
    type: 'worked-example',
    tags: ['usestate', 'components'],
    createdAt: T,
    language: 'tsx',
    title: 'Build a counter component',
    prompt: 'Assemble a click counter from scratch. Predict what each piece contributes.',
    steps: [
      {
        code: 'function Counter() {\n  return <button>Clicked 0 times</button>;\n}',
        text: 'Start static: a component is just a function returning JSX. But the 0 is hard-coded — we need memory between renders.',
      },
      {
        code: 'function Counter() {\n  const [count, setCount] = useState(0);\n  return <button>Clicked {count} times</button>;\n}',
        text: 'useState(0) gives the component state that SURVIVES re-renders. `{count}` embeds the live value in the JSX.',
      },
      {
        code: '  <button onClick={() => setCount(c => c + 1)}>\n    Clicked {count} times\n  </button>',
        text: 'The click handler calls the setter → React re-runs Counter with the new value → the button text updates. That loop — event → setState → re-render — is the core React cycle.',
      },
    ],
  },
  {
    id: 'react-we-lift-020',
    deckId: D,
    type: 'worked-example',
    tags: ['state', 'lifting-state'],
    createdAt: T,
    language: 'tsx',
    title: 'Lifting state up',
    prompt: 'A SearchBox and a ResultsList both need the query text. Where should that state live?',
    steps: [
      {
        text: 'If SearchBox owns the query in its own useState, ResultsList cannot see it — siblings cannot read each other\'s state. The fix: move the state UP to their closest common parent.',
      },
      {
        code: 'function SearchPage() {\n  const [query, setQuery] = useState(\'\');\n  return (\n    <>\n      <SearchBox value={query} onChange={setQuery} />\n      <ResultsList query={query} />\n    </>\n  );\n}',
        text: 'The parent owns the state and shares it: SearchBox gets the value plus a callback to change it; ResultsList just reads it.',
      },
      {
        text: 'Typing flows: SearchBox calls onChange → parent state updates → parent re-renders → BOTH children receive the fresh query. "Lift state to the closest common ancestor that needs it" solves most where-does-state-go questions.',
      },
    ],
  },

  // ---- Upskilling expansion ----
  {
    id: 'react-cleanup-021',
    deckId: D,
    type: 'cloze',
    tags: ['useeffect', 'cleanup'],
    createdAt: T,
    language: 'tsx',
    code: 'useEffect(() => {\n  const id = setInterval(tick, 1000);\n  return () => {{c1::clearInterval(id)}};\n}, []);',
    explanation:
      'The function returned from an effect is its CLEANUP — React runs it on unmount (and before re-running the effect). Skipping cleanup leaks timers, listeners, and subscriptions.',
  },
  {
    id: 'react-prop-drilling-022',
    deckId: D,
    type: 'qa',
    tags: ['props', 'architecture'],
    createdAt: T,
    question: 'What is prop drilling, and what are the remedies?',
    answer:
      'Passing a prop down through components that do not use it, just so a deep descendant can — three layers of `user={user}` relay. Remedies: component composition (pass the rendered child down instead), React Context for truly app-wide values (theme, current user), or a store. Mild drilling is fine; reach for Context when the relay chain hurts.',
  },
  {
    id: 'react-derived-mcq-023',
    deckId: D,
    type: 'mcq',
    tags: ['state', 'derived-state'],
    createdAt: T,
    question: 'You have firstName and lastName in state and need fullName. Where does it go?',
    choices: [
      'A third useState, updated whenever either changes',
      'Just compute it during render: const fullName = `${first} ${last}`',
      'A useEffect that sets fullName state',
      'localStorage',
    ],
    correctIndex: 1,
    explanation:
      'If it can be CALCULATED from existing state, it is not state — deriving during render can never go stale. Mirroring it into extra state (options 1 and 3) creates sync bugs for zero benefit.',
  },
  {
    id: 'react-memo-when-024',
    deckId: D,
    type: 'qa',
    tags: ['performance', 'usememo'],
    createdAt: T,
    question: 'When should you reach for useMemo/useCallback?',
    answer:
      'Later than you think. Renders are cheap; memoization adds complexity and its own cost. Legit triggers: a provably expensive calculation re-running per keystroke, or a stable reference needed so a memoized child or an effect dependency stops churning. Measure first with the Profiler — sprinkling useMemo everywhere is cargo-culting.',
  },
  {
    id: 'react-we-fetch-025',
    deckId: D,
    type: 'worked-example',
    tags: ['useeffect', 'fetch', 'race-conditions'],
    createdAt: T,
    language: 'tsx',
    title: 'Fetch data in useEffect — properly',
    prompt: 'Load a user profile when userId changes, without the classic stale-response bug.',
    steps: [
      {
        code: "useEffect(() => {\n  fetch(`/api/users/${userId}`)\n    .then(r => r.json())\n    .then(setUser);\n}, [userId]);",
        text: 'The naive version. It works — until userId changes quickly: if the request for the OLD id resolves last, it overwrites the new profile. A race condition.',
      },
      {
        code: 'useEffect(() => {\n  let cancelled = false;\n  fetch(`/api/users/${userId}`)\n    .then(r => r.json())\n    .then(data => {\n      if (!cancelled) setUser(data);\n    });',
        text: 'Add a flag scoped to THIS run of the effect. Each userId change creates a fresh effect with its own `cancelled = false`.',
      },
      {
        code: '  return () => {\n    cancelled = true;\n  };\n}, [userId]);',
        text: 'The cleanup runs before the next effect (and on unmount), flipping the PREVIOUS run\'s flag — so a late response from an outdated request gets ignored. This ignore-stale-responses pattern is the standard fix; libraries like React Query do it (and caching) for you.',
      },
    ],
  },
];
