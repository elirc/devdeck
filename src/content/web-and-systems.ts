import type { Card } from '../types';

const T = 1751328000000;
const D = 'web-and-systems';

export const webAndSystemsCards: Card[] = [
  // ---- Q&A ----
  {
    id: 'web-get-post-001',
    deckId: D,
    type: 'qa',
    tags: ['http', 'methods'],
    createdAt: T,
    question: 'What is the difference between GET and POST?',
    answer:
      'GET retrieves data: parameters go in the URL, responses can be cached, and it should never change server state. POST sends data in the request BODY to create or change something — not cached, not safely repeatable. Rule of thumb: reading = GET, writing = POST.',
  },
  {
    id: 'web-put-patch-002',
    deckId: D,
    type: 'qa',
    tags: ['http', 'methods'],
    createdAt: T,
    question: 'PUT vs PATCH — when do you use each?',
    answer:
      'PUT replaces the ENTIRE resource with what you send. PATCH applies a partial update — only the fields included change. Updating just a user\'s email: PATCH with `{ "email": ... }`; replacing the whole profile: PUT.',
  },
  {
    id: 'web-rest-003',
    deckId: D,
    type: 'qa',
    tags: ['rest', 'api-design'],
    createdAt: T,
    question: 'What makes an API "RESTful"?',
    answer:
      'It models everything as RESOURCES addressed by URLs (`/users/42`), uses HTTP methods for actions (GET reads, POST creates, PUT/PATCH updates, DELETE removes), returns status codes for outcomes, and keeps requests stateless — each request carries everything the server needs.',
  },
  {
    id: 'web-json-004',
    deckId: D,
    type: 'qa',
    tags: ['json'],
    createdAt: T,
    question: 'What is JSON and why is it everywhere?',
    answer:
      'JavaScript Object Notation — a text format for structured data: objects, arrays, strings, numbers, booleans, null. It is human-readable, maps directly to data structures in every language, and became the default body format for web APIs.',
  },
  {
    id: 'web-dns-005',
    deckId: D,
    type: 'qa',
    tags: ['dns', 'networking'],
    createdAt: T,
    question: 'What does DNS do?',
    answer:
      'It is the internet\'s phone book: it translates a human-friendly domain (`example.com`) into the IP address (`93.184.216.34`) your computer actually connects to. Your browser asks a DNS resolver, which walks a hierarchy of name servers and caches the answer.',
  },
  {
    id: 'web-url-journey-006',
    deckId: D,
    type: 'qa',
    tags: ['http', 'networking'],
    createdAt: T,
    question: 'Roughly what happens when you type a URL and hit Enter?',
    answer:
      'DNS resolves the domain to an IP → the browser opens a TCP connection (plus a TLS handshake for https) → it sends an HTTP GET request → the server responds with HTML → the browser parses it, fetches linked CSS/JS/images, and renders the page.',
  },
  {
    id: 'web-cookies-tokens-007',
    deckId: D,
    type: 'qa',
    tags: ['auth', 'cookies'],
    createdAt: T,
    question: 'How do cookie sessions differ from token auth?',
    answer:
      'Cookies: the server sets a session id that the browser attaches to every request AUTOMATICALLY; session data lives server-side. Tokens (e.g. JWT): the client stores a signed token and sends it manually in an `Authorization: Bearer ...` header; the server verifies the signature instead of storing sessions. Cookies suit classic web apps; tokens suit APIs and mobile clients.',
  },
  {
    id: 'web-cache-008',
    deckId: D,
    type: 'qa',
    tags: ['caching'],
    createdAt: T,
    question: 'What is a cache, and why is cache invalidation considered hard?',
    answer:
      'A cache stores a copy of expensive-to-fetch data somewhere faster (memory, browser, CDN) so repeat requests are cheap. The hard part: knowing when the copy is STALE. Invalidate too eagerly and you lose the speed; too lazily and users see outdated data. Common strategy: expiry times (TTL) plus explicit invalidation on writes.',
  },
  {
    id: 'web-primary-key-009',
    deckId: D,
    type: 'qa',
    tags: ['sql', 'databases'],
    createdAt: T,
    question: 'What is a primary key?',
    answer:
      'A column (or set of columns) that uniquely identifies each row in a table — often an auto-incrementing `id`. No two rows can share it, and it cannot be null. Other tables reference it via FOREIGN KEYS, which is how relational data links together.',
  },
  {
    id: 'web-index-010',
    deckId: D,
    type: 'qa',
    tags: ['sql', 'databases', 'performance'],
    createdAt: T,
    question: 'What is a database index and what is the trade-off?',
    answer:
      'A lookup structure (usually a B-tree) that lets the database find rows by a column WITHOUT scanning the whole table — like a book index. Trade-off: reads on that column get much faster, but every INSERT/UPDATE must also update the index, and it consumes storage. Index the columns you filter and join on.',
  },
  {
    id: 'web-client-server-011',
    deckId: D,
    type: 'qa',
    tags: ['architecture'],
    createdAt: T,
    question: 'What belongs on the client vs the server?',
    answer:
      'Client (browser): rendering the UI, immediate interaction feedback, input convenience. Server: the source of truth — data storage, business rules, and ALL security checks. Key principle: never trust the client; client-side validation is a courtesy, server-side validation is the guarantee.',
  },
  {
    id: 'web-api-012',
    deckId: D,
    type: 'qa',
    tags: ['api'],
    createdAt: T,
    question: 'What is an API?',
    answer:
      'An Application Programming Interface: a defined contract for how one piece of software talks to another. In web dev it usually means an HTTP API — a set of URLs a server exposes, with agreed request/response formats, so any client (browser app, mobile app, another server) can use the same functionality.',
  },

  // ---- Multiple choice ----
  {
    id: 'web-404-mcq-013',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'status-codes'],
    createdAt: T,
    question: 'Your API returns 404. What does that tell the client?',
    choices: [
      'The server crashed while handling the request',
      "The requested resource doesn't exist at that URL",
      "The client isn't authorized to see the resource",
      'The request took too long',
    ],
    correctIndex: 1,
    explanation:
      '4xx = client-side problem. 404 specifically means "nothing lives at this URL". A crash is 500, auth problems are 401/403, timeouts are 408/504.',
  },
  {
    id: 'web-500-mcq-014',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'status-codes'],
    createdAt: T,
    question: 'What does a 500 status code mean?',
    choices: [
      'The request was malformed',
      'The resource moved permanently',
      'Something failed ON THE SERVER while handling a valid request',
      'Rate limit exceeded',
    ],
    correctIndex: 2,
    explanation:
      '5xx codes mean the fault is server-side — an unhandled exception, a down database. Malformed requests are 400, moved is 301, rate limiting is 429.',
  },
  {
    id: 'web-401-403-mcq-015',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'status-codes', 'auth'],
    createdAt: T,
    question: '401 vs 403 — which is which?',
    choices: [
      '401 = not logged in; 403 = logged in but not allowed',
      '403 = not logged in; 401 = logged in but not allowed',
      'They are interchangeable',
      '401 is for APIs, 403 for websites',
    ],
    correctIndex: 0,
    explanation:
      '401 Unauthorized really means UNAUTHENTICATED — who are you? 403 Forbidden means: I know who you are, and the answer is no.',
  },
  {
    id: 'web-201-mcq-016',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'status-codes'],
    createdAt: T,
    question: 'A POST successfully creates a new record. The most precise status code is:',
    choices: ['200 OK', '201 Created', '204 No Content', '302 Found'],
    correctIndex: 1,
    explanation:
      '201 signals "created", often with a Location header pointing at the new resource. 200 is generic success; 204 is success with no body (common for DELETE).',
  },
  {
    id: 'web-json-valid-mcq-017',
    deckId: D,
    type: 'mcq',
    tags: ['json'],
    createdAt: T,
    question: 'Which of these is valid JSON?',
    choices: [
      "{ name: 'Ada' }",
      '{ "name": "Ada", }',
      '{ "name": "Ada" }',
      "{ 'name': 'Ada' }",
    ],
    correctIndex: 2,
    explanation:
      'JSON is stricter than JS: keys and strings must use DOUBLE quotes, and trailing commas are forbidden. This trips up hand-written JSON constantly.',
  },
  {
    id: 'web-content-type-mcq-018',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'headers'],
    createdAt: T,
    question: 'Which header tells the server you are sending JSON in the body?',
    choices: [
      'Accept: application/json',
      'Content-Type: application/json',
      'Body-Format: json',
      'X-JSON: true',
    ],
    correctIndex: 1,
    explanation:
      '`Content-Type` describes what YOU are sending; `Accept` describes what you want BACK. Forgetting Content-Type is a classic cause of servers ignoring your body.',
  },
  {
    id: 'web-leftjoin-mcq-019',
    deckId: D,
    type: 'mcq',
    tags: ['sql', 'joins'],
    createdAt: T,
    question: 'Which JOIN returns ALL users, even those with zero orders?',
    code: 'SELECT u.name, o.id\nFROM users u\n??? orders o ON o.user_id = u.id;',
    language: 'sql',
    choices: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
    correctIndex: 1,
    explanation:
      'LEFT JOIN keeps every row from the left table (users), filling missing order columns with NULL. INNER JOIN would drop users who never ordered.',
  },
  {
    id: 'web-idempotent-mcq-020',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'methods'],
    createdAt: T,
    question: '"Idempotent" means repeating the request has the same effect as doing it once. Which method is NOT idempotent?',
    choices: ['GET', 'PUT', 'DELETE', 'POST'],
    correctIndex: 3,
    explanation:
      'POST typically creates a NEW resource each time — submit twice, get two records. GET reads, PUT replaces with the same state, DELETE removes (already gone the second time).',
  },
  {
    id: 'web-bigo-index-mcq-021',
    deckId: D,
    type: 'mcq',
    tags: ['big-o'],
    createdAt: T,
    question: 'Accessing `arr[500]` in a 1-million-element array is:',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    correctIndex: 0,
    explanation:
      'Array indexing is constant time — the position is computed directly from the index, no searching involved. Size of the array is irrelevant.',
  },
  {
    id: 'web-bigo-linear-mcq-022',
    deckId: D,
    type: 'mcq',
    tags: ['big-o'],
    createdAt: T,
    question: 'Finding a value in an UNSORTED array (checking each element) is:',
    choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctIndex: 2,
    explanation:
      'Worst case you check every element — work grows linearly with size. Sorting first would enable O(log n) binary search, at the cost of the sort.',
  },

  // ---- SQL fill in the blank ----
  {
    id: 'web-sql-where-023',
    deckId: D,
    type: 'cloze',
    tags: ['sql'],
    createdAt: T,
    language: 'sql',
    code: '-- Only adults:\nSELECT name FROM users {{c1::WHERE}} age >= 18;',
    explanation:
      'WHERE filters ROWS before they are returned. Without it, you get the whole table.',
  },
  {
    id: 'web-sql-orderby-024',
    deckId: D,
    type: 'cloze',
    tags: ['sql'],
    createdAt: T,
    language: 'sql',
    code: '-- Newest first:\nSELECT * FROM orders {{c1::ORDER BY}} created_at DESC;',
    explanation:
      'ORDER BY sorts the result set; DESC = descending (newest/largest first), ASC is the default.',
  },
  {
    id: 'web-sql-join-025',
    deckId: D,
    type: 'cloze',
    tags: ['sql', 'joins'],
    createdAt: T,
    language: 'sql',
    code: '-- Each order with its customer name:\nSELECT o.id, u.name\nFROM orders o\n{{c1::JOIN}} users u ON o.user_id = u.id;',
    explanation:
      'JOIN combines rows from two tables where the ON condition matches — here linking each order to its user via the foreign key.',
  },
  {
    id: 'web-sql-groupby-026',
    deckId: D,
    type: 'cloze',
    tags: ['sql', 'aggregation'],
    createdAt: T,
    language: 'sql',
    code: '-- Users per country:\nSELECT country, COUNT(*)\nFROM users\n{{c1::GROUP BY}} country;',
    explanation:
      'GROUP BY collapses rows sharing a value into one row per group, so aggregates like COUNT, SUM, and AVG apply per group.',
  },
  {
    id: 'web-sql-insert-027',
    deckId: D,
    type: 'cloze',
    tags: ['sql'],
    createdAt: T,
    language: 'sql',
    code: "{{c1::INSERT INTO}} users (name, email)\nVALUES ('Ada', 'ada@example.com');",
    explanation:
      'INSERT INTO adds a row; columns you skip get their default (or NULL). The other write verbs: UPDATE ... SET changes rows, DELETE FROM removes them.',
  },

  // ---- Worked examples ----
  {
    id: 'web-we-request-028',
    deckId: D,
    type: 'worked-example',
    tags: ['http', 'rest'],
    createdAt: T,
    language: 'bash',
    title: 'Anatomy of one API request',
    prompt: 'A todo app marks item 7 done. Walk through the full round trip.',
    steps: [
      {
        code: 'PATCH /api/todos/7 HTTP/1.1\nContent-Type: application/json\nAuthorization: Bearer eyJhbG...\n\n{"done": true}',
        text: 'The client sends: a METHOD (PATCH = partial update), a PATH identifying the resource, HEADERS (body format + who I am), and a JSON body with just the changed field.',
      },
      {
        text: 'The server: verifies the token → finds todo 7 → checks it belongs to this user → validates the body → runs `UPDATE todos SET done = true WHERE id = 7`.',
      },
      {
        code: 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"id": 7, "title": "Ship it", "done": true}',
        text: 'The response: a STATUS CODE for the outcome and the updated resource as the body. The client updates its UI from this. Every REST interaction follows this same shape.',
      },
    ],
  },
  {
    id: 'web-we-binary-search-029',
    deckId: D,
    type: 'worked-example',
    tags: ['big-o', 'algorithms'],
    createdAt: T,
    language: 'js',
    title: 'Why binary search is O(log n)',
    prompt: 'Find 23 in the sorted array [4, 9, 15, 23, 38, 51, 72]. How many looks does it take?',
    steps: [
      {
        text: 'Look at the MIDDLE element: 23 vs middle 23... let us make it interesting — searching for 51. Middle is 23; 51 > 23, so the answer must be in the right half. HALF the array is eliminated in one comparison.',
      },
      {
        text: 'Right half is [38, 51, 72]. Middle is 51 — found in 2 comparisons. Linear search would have taken 6.',
      },
      {
        text: 'Each comparison halves the search space: 1,000,000 items need only ~20 comparisons (2^20 ≈ 1M). "Halving each step" is exactly what O(log n) means — and why sorted data and indexes are so powerful.',
      },
    ],
  },
  {
    id: 'web-we-endpoint-030',
    deckId: D,
    type: 'worked-example',
    tags: ['rest', 'api-design'],
    createdAt: T,
    language: 'js',
    title: 'Design a REST endpoint',
    prompt: 'You need "get one user by id" for a JSON API. Design the route, success case, and failure case.',
    steps: [
      {
        code: 'GET /api/users/:id',
        text: 'Resource-oriented URL: the noun `users` plus an identifier. The method GET says "read". Not `/api/getUser?id=42` — the method already expresses the verb.',
      },
      {
        code: "app.get('/api/users/:id', async (req, res) => {\n  const user = await db.findUser(req.params.id);",
        text: 'The handler extracts the id from the path and queries storage.',
      },
      {
        code: "  if (!user) {\n    return res.status(404).json({ error: 'User not found' });\n  }\n  res.json(user);\n});",
        text: 'Missing → 404 with a JSON error body (consistent with the success format). Found → 200 (the default) with the user. Predictable statuses + consistent shapes = an API clients can trust.',
      },
    ],
  },

  // ---- Upskilling expansion ----
  {
    id: 'web-redirect-mcq-031',
    deckId: D,
    type: 'mcq',
    tags: ['http', 'status-codes'],
    createdAt: T,
    question: '301 vs 302 — which do you use for a page that moved FOREVER?',
    choices: [
      '302 — it is the default redirect',
      '301 — permanent; browsers and search engines update to the new URL',
      'Either, they are identical',
      '307',
    ],
    correctIndex: 1,
    explanation:
      '301 = moved permanently (cached, SEO juice transfers). 302 = temporary detour (keep using the old URL later). Choosing wrong bites you because 301s get cached aggressively.',
  },
  {
    id: 'web-cdn-032',
    deckId: D,
    type: 'qa',
    tags: ['cdn', 'caching', 'performance'],
    createdAt: T,
    question: 'What is a CDN and why does every serious site use one?',
    answer:
      'A Content Delivery Network: servers scattered worldwide that cache copies of your static assets (images, JS, CSS). Users download from the nearest node instead of your origin server — lower latency everywhere, and your origin survives traffic spikes because the CDN absorbs most requests.',
  },
  {
    id: 'web-sql-update-033',
    deckId: D,
    type: 'cloze',
    tags: ['sql'],
    createdAt: T,
    language: 'sql',
    code: "{{c1::UPDATE}} users\n{{c2::SET}} email = 'new@example.com'\nWHERE id = 7;",
    explanation:
      'UPDATE ... SET changes matching rows. Burn this in: an UPDATE (or DELETE) without a WHERE hits EVERY row in the table — the classic career-flashback mistake.',
  },
  {
    id: 'web-rate-limit-034',
    deckId: D,
    type: 'qa',
    tags: ['http', 'api-design'],
    createdAt: T,
    question: 'What is rate limiting, and how does a well-behaved client respond to it?',
    answer:
      'The server caps requests per client per window (say 100/min) to protect itself from abuse and accidental flood loops, answering excess requests with 429 Too Many Requests. A good client backs off — waiting the `Retry-After` header or retrying with exponential backoff plus jitter — instead of hammering harder.',
  },
];
