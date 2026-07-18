// DevDeck — Session Queue Builder
// Pure functions for building the review queue

import type { ReviewState, Card, Settings } from './types';

export interface QueuedCard {
  cardId: string;
  priority: 'learning' | 'review' | 'new';
}

export interface DueCounts {
  due: number;
  new: number;
  learning: number;
}

function getEndOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Build the session queue from review states.
 * 
 * Priority:
 * 1. Learning/relearning cards due now — highest priority
 * 2. Review cards due today (due ≤ end of local day), ordered by due date
 * 3. New cards, up to newCardsPerDay cap, interleaved ~1 new per 4 reviews
 * 
 * Filtered by enabledDeckIds and enabledCardTypes.
 */
export function buildQueue(
  reviewStates: ReviewState[],
  cards: Card[],
  settings: Settings,
  now: number,
  newCardsIntroducedToday: number
): QueuedCard[] {
  const endOfDay = getEndOfDay(now);
  
  // Build card lookup for filtering
  const cardMap = new Map(cards.map(c => [c.id, c]));
  
  // Filter states by enabled decks and card types
  const filtered = reviewStates.filter(rs => {
    const card = cardMap.get(rs.cardId);
    if (!card) return false;
    if (!settings.enabledDeckIds.includes(card.deckId)) return false;
    if (!settings.enabledCardTypes.includes(card.type)) return false;
    return true;
  });

  // Bucket into categories
  const learning: QueuedCard[] = [];
  const reviews: { state: ReviewState; queued: QueuedCard }[] = [];
  const newCards: QueuedCard[] = [];

  for (const rs of filtered) {
    if (rs.status === 'learning' || rs.status === 'relearning') {
      if (rs.due <= now) {
        learning.push({ cardId: rs.cardId, priority: 'learning' });
      }
    } else if (rs.status === 'review') {
      if (rs.due <= endOfDay) {
        reviews.push({
          state: rs,
          queued: { cardId: rs.cardId, priority: 'review' },
        });
      }
    } else if (rs.status === 'new') {
      newCards.push({ cardId: rs.cardId, priority: 'new' });
    }
  }

  // Sort reviews by due date (most overdue first)
  reviews.sort((a, b) => a.state.due - b.state.due);

  // Cap new cards
  const newCardCap = Math.max(0, settings.newCardsPerDay - newCardsIntroducedToday);
  const cappedNew = newCards.slice(0, newCardCap);

  // Interleave new cards: ~1 new per 4 reviews
  const reviewQueue = reviews.map(r => r.queued).slice(0, settings.maxReviewsPerDay);
  const result: QueuedCard[] = [...learning];

  if (cappedNew.length === 0) {
    result.push(...reviewQueue);
  } else {
    let newIndex = 0;
    let reviewCount = 0;
    const interleaved: QueuedCard[] = [];

    for (const review of reviewQueue) {
      interleaved.push(review);
      reviewCount++;
      if (reviewCount % 4 === 0 && newIndex < cappedNew.length) {
        interleaved.push(cappedNew[newIndex]);
        newIndex++;
      }
    }

    // Add remaining new cards
    while (newIndex < cappedNew.length) {
      interleaved.push(cappedNew[newIndex]);
      newIndex++;
    }

    result.push(...interleaved);
  }

  return result;
}

/**
 * Get due counts for display on the home screen.
 */
export function getDueCounts(
  reviewStates: ReviewState[],
  cards: Card[],
  settings: Settings,
  now: number,
  newCardsIntroducedToday: number
): DueCounts {
  const endOfDay = getEndOfDay(now);
  const cardMap = new Map(cards.map(c => [c.id, c]));

  let due = 0;
  let newCount = 0;
  let learning = 0;

  for (const rs of reviewStates) {
    const card = cardMap.get(rs.cardId);
    if (!card) continue;
    if (!settings.enabledDeckIds.includes(card.deckId)) continue;
    if (!settings.enabledCardTypes.includes(card.type)) continue;

    if (rs.status === 'learning' || rs.status === 'relearning') {
      if (rs.due <= now) {
        learning++;
        due++;
      }
    } else if (rs.status === 'review') {
      if (rs.due <= endOfDay) {
        due++;
      }
    } else if (rs.status === 'new') {
      newCount++;
    }
  }

  // Cap new card count to what's allowed today
  const newCardCap = Math.max(0, settings.newCardsPerDay - newCardsIntroducedToday);
  newCount = Math.min(newCount, newCardCap);

  return { due, new: newCount, learning };
}

/**
 * Get per-deck due counts.
 */
export function getPerDeckCounts(
  reviewStates: ReviewState[],
  cards: Card[],
  settings: Settings,
  now: number,
  newCardsIntroducedToday: number
): Map<string, DueCounts> {
  const cardMap = new Map(cards.map(c => [c.id, c]));
  const endOfDay = getEndOfDay(now);
  const deckCounts = new Map<string, DueCounts>();

  // Initialize deck counts
  for (const deckId of settings.enabledDeckIds) {
    deckCounts.set(deckId, { due: 0, new: 0, learning: 0 });
  }

  for (const rs of reviewStates) {
    const card = cardMap.get(rs.cardId);
    if (!card) continue;
    if (!settings.enabledDeckIds.includes(card.deckId)) continue;
    if (!settings.enabledCardTypes.includes(card.type)) continue;

    const counts = deckCounts.get(card.deckId);
    if (!counts) continue;

    if (rs.status === 'learning' || rs.status === 'relearning') {
      if (rs.due <= now) {
        counts.learning++;
        counts.due++;
      }
    } else if (rs.status === 'review') {
      if (rs.due <= endOfDay) {
        counts.due++;
      }
    } else if (rs.status === 'new') {
      counts.new++;
    }
  }

  // Cap new cards globally
  const newCardCap = Math.max(0, settings.newCardsPerDay - newCardsIntroducedToday);
  let remainingNew = newCardCap;
  for (const [, counts] of deckCounts) {
    const allowed = Math.min(counts.new, remainingNew);
    counts.new = allowed;
    remainingNew -= allowed;
  }

  return deckCounts;
}
