// DevDeck — Core Type Definitions

export type CardType = 'predict-output' | 'cloze' | 'worked-example' | 'qa' | 'mcq';

export type Language = 'js' | 'ts' | 'tsx' | 'sql' | 'bash' | 'css' | 'html';

export type Grade = 0 | 1 | 2 | 3; // Again | Hard | Good | Easy

export interface CardBase {
  id: string;
  deckId: string;
  type: CardType;
  tags: string[];
  createdAt: number;
}

export interface PredictOutputCard extends CardBase {
  type: 'predict-output';
  language: Language;
  code: string;
  answer: string;
  explanation: string;
}

export interface ClozeCard extends CardBase {
  type: 'cloze';
  language: Language;
  code: string;
  explanation: string;
}

export interface WorkedExampleCard extends CardBase {
  type: 'worked-example';
  title: string;
  prompt: string;
  steps: Array<{
    code?: string;
    text: string;
  }>;
  language: Language;
}

export interface QACard extends CardBase {
  type: 'qa';
  question: string;
  answer: string;
}

export interface MCQCard extends CardBase {
  type: 'mcq';
  question: string;
  code?: string;
  language?: Language;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

export type Card = PredictOutputCard | ClozeCard | WorkedExampleCard | QACard | MCQCard;

export interface Deck {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface ReviewState {
  cardId: string;
  ease: number;
  intervalDays: number;
  due: number;
  status: 'new' | 'learning' | 'review' | 'relearning';
  learningStepIndex: number;
  lapses: number;
  reps: number;
}

export interface ReviewLog {
  id?: number; // auto-increment (Dexie)
  cardId: string;
  reviewedAt: number;
  grade: Grade;
  msTaken: number;
  statusBefore: ReviewState['status'];
}

export interface Settings {
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  enabledCardTypes: CardType[];
  enabledDeckIds: string[];
  theme: 'dark' | 'light';
}

export interface Meta {
  id: string;
  /** YYYY-MM-DD in local time; null if never reviewed */
  lastReviewDay: string | null;
  streak: number;
  bestStreak: number;
  schemaVersion: number;
  /** Local day the newIntroCount counter refers to */
  newIntroDay: string | null;
  /** New cards introduced on newIntroDay */
  newIntroCount: number;
}

export interface SessionSummary {
  reviewed: number;
  /** Graded Good or Easy */
  correct: number;
  newIntroduced: number;
  durationMs: number;
}

export interface ExportData {
  schemaVersion: number;
  exportedAt: number;
  reviewStates: ReviewState[];
  reviewLogs: ReviewLog[];
  settings: Settings;
  meta: Meta;
}

export const SCHEMA_VERSION = 1;

export const ALL_CARD_TYPES: CardType[] = [
  'predict-output',
  'cloze',
  'worked-example',
  'qa',
  'mcq',
];

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  'predict-output': 'Predict the output',
  cloze: 'Fill in the blank',
  'worked-example': 'Worked examples',
  qa: 'Q&A',
  mcq: 'Multiple choice',
};

export interface SessionConfig {
  timeBudgetMs: number | null; // null = "until done"
}

export interface SessionState {
  active: boolean;
  config: SessionConfig | null;
  queue: string[]; // card IDs
  currentCardId: string | null;
  cardsReviewed: number;
  gradesDistribution: Record<Grade, number>;
  newCardsIntroduced: number;
  startedAt: number | null;
  timeRemainingMs: number | null;
}
