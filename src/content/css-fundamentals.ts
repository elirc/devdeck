import type { Card } from '../types';

const T = 1751328000000;
const D = 'css-fundamentals';

export const cssCards: Card[] = [
  // ---- Fill in the blank ----
  {
    id: 'css-center-001',
    deckId: D,
    type: 'cloze',
    tags: ['flexbox', 'centering'],
    createdAt: T,
    language: 'css',
    code: '/* THE centering recipe — perfectly center a child: */\n.parent {\n  display: {{c1::flex}};\n  justify-content: {{c2::center}};\n  align-items: {{c3::center}};\n}',
    explanation:
      'justify-content centers along the main axis (horizontal by default), align-items along the cross axis. This trio answers "how do I center a div", the most-asked question in CSS history.',
  },
  {
    id: 'css-border-box-002',
    deckId: D,
    type: 'cloze',
    tags: ['box-model', 'box-sizing'],
    createdAt: T,
    language: 'css',
    code: '/* Make width mean the VISIBLE width, padding included: */\n* {\n  box-sizing: {{c1::border-box}};\n}',
    explanation:
      'With the default `content-box`, padding and border are ADDED to your width, so `width: 200px` renders wider than 200px. Nearly every codebase starts with this reset.',
  },
  {
    id: 'css-grid-cols-003',
    deckId: D,
    type: 'cloze',
    tags: ['grid'],
    createdAt: T,
    language: 'css',
    code: '/* Three equal columns: */\n.cards {\n  display: {{c1::grid}};\n  grid-template-columns: {{c2::repeat(3, 1fr)}};\n  gap: 16px;\n}',
    explanation:
      '`1fr` is one share of the free space — three of them make equal thirds. `repeat(3, 1fr)` is shorthand for `1fr 1fr 1fr`.',
  },
  {
    id: 'css-media-004',
    deckId: D,
    type: 'cloze',
    tags: ['responsive', 'media-queries'],
    createdAt: T,
    language: 'css',
    code: '/* Apply only on screens 600px or narrower: */\n@media ({{c1::max-width}}: 600px) {\n  .sidebar {\n    display: none;\n  }\n}',
    explanation:
      '`max-width: 600px` = "600px and below" (phone styles); `min-width` = "and above". Mobile-first codebases set base styles for phones and layer `min-width` queries on top.',
  },
  {
    id: 'css-gap-005',
    deckId: D,
    type: 'cloze',
    tags: ['flexbox', 'spacing'],
    createdAt: T,
    language: 'css',
    code: '/* Even spacing BETWEEN items, none at the edges: */\n.row {\n  display: flex;\n  {{c1::gap}}: 12px;\n}',
    explanation:
      '`gap` replaces the old margin-on-every-child-except-the-last dance. It works in both flexbox and grid.',
  },
  {
    id: 'css-abs-rel-006',
    deckId: D,
    type: 'cloze',
    tags: ['positioning'],
    createdAt: T,
    language: 'css',
    code: '/* Pin a badge to the card corner: */\n.card {\n  position: {{c1::relative}}; /* anchor */\n}\n.badge {\n  position: {{c2::absolute}};\n  top: 8px;\n  right: 8px;\n}',
    explanation:
      'An absolute element positions itself against its nearest POSITIONED ancestor. Forgetting `position: relative` on the parent — so the badge flies to the page corner instead — is the classic mistake.',
  },
  {
    id: 'css-var-007',
    deckId: D,
    type: 'cloze',
    tags: ['custom-properties'],
    createdAt: T,
    language: 'css',
    code: ':root {\n  {{c1::--accent}}: #2dd4bf;\n}\n.btn {\n  background: {{c2::var}}(--accent);\n}',
    explanation:
      'Custom properties (must start with `--`) cascade like any other property and can be swapped at runtime — themes, dark mode, and design tokens all build on this.',
  },

  // ---- Q&A ----
  {
    id: 'css-box-model-008',
    deckId: D,
    type: 'qa',
    tags: ['box-model'],
    createdAt: T,
    question: 'Describe the CSS box model, from the inside out.',
    answer:
      'Every element is four nested boxes: CONTENT (text/images) → PADDING (space inside the border, shares the background) → BORDER → MARGIN (transparent space pushing neighbors away). Mnemonic: padding is inside the fence, margin is outside it.',
  },
  {
    id: 'css-display-009',
    deckId: D,
    type: 'qa',
    tags: ['display', 'layout'],
    createdAt: T,
    question: 'block vs inline vs inline-block — how do they behave?',
    answer:
      'block: takes the full line, respects width/height (div, p, h1). inline: flows within text, IGNORES width/height and vertical margins (span, a). inline-block: flows inline but respects box dimensions — the fix when you need to size a span or button.',
  },
  {
    id: 'css-specificity-010',
    deckId: D,
    type: 'qa',
    tags: ['specificity', 'cascade'],
    createdAt: T,
    question: 'How is specificity calculated when two rules target the same element?',
    answer:
      'Count as a three-part score (ids, classes, elements): `#nav` = 1-0-0 beats `.menu .item` = 0-2-0 beats `ul li` = 0-0-2. Inline style attributes beat all selectors; `!important` beats even that (use it never-ish). Higher score wins regardless of file order.',
  },
  {
    id: 'css-cascade-011',
    deckId: D,
    type: 'qa',
    tags: ['cascade'],
    createdAt: T,
    question: 'Two rules have EQUAL specificity. Which one applies?',
    answer:
      'The one declared LATER wins — later in the stylesheet, or in a later-loaded stylesheet. That is the "cascading" part of CSS, and why import order of CSS files matters.',
  },
  {
    id: 'css-axes-012',
    deckId: D,
    type: 'qa',
    tags: ['flexbox'],
    createdAt: T,
    question: 'In flexbox, what are the main and cross axes, and which property aligns along each?',
    answer:
      'The main axis follows `flex-direction` (default: horizontal/row); the cross axis is perpendicular. `justify-content` aligns along the MAIN axis, `align-items` along the CROSS axis. Set `flex-direction: column` and they swap meaning — the top source of flexbox confusion.',
  },
  {
    id: 'css-grid-vs-flex-013',
    deckId: D,
    type: 'qa',
    tags: ['grid', 'flexbox', 'layout'],
    createdAt: T,
    question: 'When do you reach for grid vs flexbox?',
    answer:
      'Flexbox is one-dimensional: a row OR a column of items sizing themselves (navbars, button groups, centering). Grid is two-dimensional: rows AND columns you define, with items placed into the structure (page layouts, card galleries, dashboards). Rule of thumb: content-out → flex; layout-in → grid.',
  },
  {
    id: 'css-units-014',
    deckId: D,
    type: 'qa',
    tags: ['units'],
    createdAt: T,
    question: 'px vs rem vs em — what does each scale with?',
    answer:
      'px is fixed. rem scales with the ROOT font size — the accessibility choice, since it respects the user\'s browser font setting; use it for font sizes and most spacing. em scales with the CURRENT element\'s font size — handy for padding that should grow with a button\'s text, compounding trap in nested elements.',
  },
  {
    id: 'css-margin-collapse-015',
    deckId: D,
    type: 'qa',
    tags: ['box-model', 'margins'],
    createdAt: T,
    question: 'What is margin collapsing?',
    answer:
      'Vertical margins of adjacent block elements MERGE into one margin equal to the larger of the two — 24px bottom meeting 16px top yields 24px, not 40px. It also happens between parent and first/last child. Flex and grid children never collapse, one more reason modern layouts feel saner.',
  },
  {
    id: 'css-pseudo-016',
    deckId: D,
    type: 'qa',
    tags: ['selectors', 'pseudo-classes'],
    createdAt: T,
    question: 'What are pseudo-classes? Name the ones you use daily.',
    answer:
      'Selectors for element STATES rather than structure: `:hover` (pointer over), `:focus` / `:focus-visible` (keyboard focus — never remove outlines without a replacement), `:active` (being clicked), `:disabled`, and structural ones like `:first-child` and `:nth-child(2n)`.',
  },

  // ---- Multiple choice ----
  {
    id: 'css-spec-mcq-017',
    deckId: D,
    type: 'mcq',
    tags: ['specificity'],
    createdAt: T,
    question: 'Which selector wins?',
    code: 'ul li a      { color: blue; }\n.nav-link    { color: green; }\n#home-link   { color: red; }',
    language: 'css',
    choices: [
      'blue — three elements beat one id',
      'green — classes beat elements',
      'red — one id outranks any number of classes or elements',
      'Whichever is last in the file',
    ],
    correctIndex: 2,
    explanation:
      'Scores: 0-0-3 vs 0-1-0 vs 1-0-0. An id (1-0-0) beats ANY count of classes or elements — specificity tiers do not add across levels. File order only breaks exact ties.',
  },
  {
    id: 'css-width-mcq-018',
    deckId: D,
    type: 'mcq',
    tags: ['box-model', 'box-sizing'],
    createdAt: T,
    question: 'With the DEFAULT box-sizing (content-box), how wide does this render?',
    code: '.card {\n  width: 200px;\n  padding: 20px;\n  border: 2px solid;\n}',
    language: 'css',
    choices: ['200px', '220px', '240px', '244px'],
    correctIndex: 3,
    explanation:
      '200 content + 20px padding on each side (40) + 2px border on each side (4) = 244px. With `box-sizing: border-box`, the same rule renders exactly 200px — which is why everyone sets it.',
  },
  {
    id: 'css-text-center-mcq-019',
    deckId: D,
    type: 'mcq',
    tags: ['centering', 'text'],
    createdAt: T,
    question: 'Center the TEXT inside a heading, horizontally?',
    choices: [
      'margin: auto',
      'text-align: center',
      'align-items: center',
      'justify-self: center',
    ],
    correctIndex: 1,
    explanation:
      '`text-align: center` centers inline content (text, spans) within a block. `margin: auto` centers the BLOCK itself; align-items needs a flex/grid container.',
  },
  {
    id: 'css-hide-mcq-020',
    deckId: D,
    type: 'mcq',
    tags: ['display', 'visibility'],
    createdAt: T,
    question: 'Hide an element but keep its space reserved in the layout?',
    choices: [
      'display: none',
      'visibility: hidden',
      'opacity: 0',
      'Both visibility: hidden and opacity: 0',
    ],
    correctIndex: 3,
    explanation:
      'Both keep the box in the layout flow (opacity: 0 stays clickable though!). `display: none` removes the element from layout entirely — the rest of the page reflows as if it never existed.',
  },
  {
    id: 'css-zindex-mcq-021',
    deckId: D,
    type: 'mcq',
    tags: ['positioning', 'z-index'],
    createdAt: T,
    question: 'z-index: 999 is having no effect. Most likely cause?',
    choices: [
      'The value needs to be even higher',
      'The element has no position set (z-index needs a positioned element)',
      'z-index only works on images',
      'The parent must also have z-index: 999',
    ],
    correctIndex: 1,
    explanation:
      'z-index applies only to POSITIONED elements (relative/absolute/fixed/sticky) or flex/grid children. On a default static element it is silently ignored — the #1 z-index head-scratcher.',
  },
  {
    id: 'css-flexgrow-mcq-022',
    deckId: D,
    type: 'mcq',
    tags: ['flexbox'],
    createdAt: T,
    question: 'Inside a flex row, what does `flex-grow: 1` on one child do?',
    choices: [
      'Makes it 1px wider',
      'Makes it grow to absorb the remaining free space',
      'Doubles its font size',
      'Makes it the first item',
    ],
    correctIndex: 1,
    explanation:
      'flex-grow distributes LEFTOVER space proportionally. One child with `flex-grow: 1` soaks up all the slack — the classic search-bar-fills-the-navbar trick. Two children with 1 each split it evenly.',
  },

  // ---- Worked examples ----
  {
    id: 'css-we-navbar-023',
    deckId: D,
    type: 'worked-example',
    tags: ['flexbox', 'layout'],
    createdAt: T,
    language: 'css',
    title: 'Build a navbar with flexbox',
    prompt: 'Logo on the left, nav links on the right, everything vertically centered. Predict each property.',
    steps: [
      {
        code: '.navbar {\n  display: flex;\n}',
        text: 'display: flex puts the children (logo, links) side by side in a row. But they are jammed together on the left.',
      },
      {
        code: '.navbar {\n  display: flex;\n  justify-content: space-between;\n}',
        text: 'space-between pushes the first child to one end and the last to the other — logo left, links right, no margins or floats needed.',
      },
      {
        code: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 12px 20px;\n}\n.nav-links {\n  display: flex;\n  gap: 24px;\n}',
        text: 'align-items: center fixes vertical alignment regardless of logo vs text height. The links themselves become a nested flex row with gap for even spacing. This two-level flex pattern builds 90% of headers you have ever seen.',
      },
    ],
  },
  {
    id: 'css-we-margin-bug-024',
    deckId: D,
    type: 'worked-example',
    tags: ['display', 'box-model', 'debugging'],
    createdAt: T,
    language: 'css',
    title: 'Debug: "my width and margin do nothing"',
    prompt: 'A `<span class="tag">` refuses to respect width and vertical margin. Diagnose it.',
    steps: [
      {
        code: '.tag {\n  width: 80px;      /* ignored?! */\n  margin: 12px 0;   /* ignored?! */\n  background: teal;\n}',
        text: 'The properties are valid, so the bug is not a typo. Ask the layout question first: what is this element\'s display type? A span is `display: inline`.',
      },
      {
        text: 'Inline elements flow like words in a sentence: they size to their content and ignore width, height, and VERTICAL margins by design. (Horizontal padding/margin do apply — which makes the bug extra confusing.)',
      },
      {
        code: '.tag {\n  display: inline-block; /* the fix */\n  width: 80px;\n  margin: 12px 0;\n}',
        text: 'inline-block keeps it flowing in the text line but gives it a real box that respects dimensions. Lesson: when sizing "does nothing", check display FIRST — DevTools shows it under Computed.',
      },
    ],
  },
  {
    id: 'css-we-responsive-grid-025',
    deckId: D,
    type: 'worked-example',
    tags: ['grid', 'responsive'],
    createdAt: T,
    language: 'css',
    title: 'A responsive card grid in one line',
    prompt: 'Cards should fill the row, at least 220px each, wrapping as the screen shrinks — WITHOUT media queries.',
    steps: [
      {
        code: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 16px;\n}',
        text: 'Fixed version: always three columns. Great on desktop, cramped on a phone — you would need media queries to change the count.',
      },
      {
        code: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 16px;\n}',
        text: 'The magic line. minmax(220px, 1fr) says each column is at least 220px, growing to share leftovers; auto-fit says "create as many columns as fit".',
      },
      {
        text: 'On a 1200px screen you get 5 columns; at 700px, 3; on a phone, 1 — all from one rule, no breakpoints. The browser does the math on every resize. This is the modern answer to "responsive card layout".',
      },
    ],
  },
];
