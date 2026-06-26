import AsyncStorage from '@react-native-async-storage/async-storage';
import allCards from '@/data/tarot-cards.json';
import { supabase } from '@/lib/supabase';
import type { TarotCard, DailyCardResult } from './types';

type StoredData = {
  date: string;
  cardId: string;
  isReversed: boolean;
};

type HistoryEntry = {
  cardId: string;
  date: string;
};

type ShuffleBag = {
  order: string[];
  cursor: number;
};

function getDateStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function cryptoRandom(): number {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  } catch {
    return Math.random();
  }
}

function cryptoRandomInt(max: number): number {
  return Math.floor(cryptoRandom() * max);
}

function fisherYatesShuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = cryptoRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function getUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (uid) {
      console.log('[Tarot] userId:', uid);
      return uid;
    }
  } catch (e) {
    console.warn('[Tarot] Failed to get session:', e);
  }
  const fallback = 'anonymous';
  console.log('[Tarot] userId: using fallback', fallback);
  return fallback;
}

async function getStoredKey(): Promise<string> {
  const uid = await getUserId();
  return `mindwell_daily_tarot_${uid}`;
}

async function getHistoryKey(): Promise<string> {
  const uid = await getUserId();
  return `mindwell_tarot_history_${uid}`;
}

async function getBagKey(): Promise<string> {
  const uid = await getUserId();
  return `mindwell_tarot_bag_${uid}`;
}

async function getStored(): Promise<StoredData | null> {
  try {
    const key = await getStoredKey();
    console.log('[Tarot] getStored: reading key', key);
    const json = await AsyncStorage.getItem(key);
    if (json) {
      const parsed = JSON.parse(json);
      console.log('[Tarot] getStored: found', parsed);
      return parsed;
    }
    console.log('[Tarot] getStored: no stored data');
    return null;
  } catch (e) {
    console.warn('[Tarot] getStored: error', e);
    return null;
  }
}

async function saveStored(data: StoredData): Promise<void> {
  const key = await getStoredKey();
  console.log('[Tarot] saveStored: writing key', key, data);
  await AsyncStorage.setItem(key, JSON.stringify(data));
}

async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const key = await getHistoryKey();
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

async function addToHistory(entry: HistoryEntry): Promise<void> {
  const history = await getHistory();
  history.unshift(entry);
  const trimmed = history.slice(0, 200);
  const key = await getHistoryKey();
  await AsyncStorage.setItem(key, JSON.stringify(trimmed));
}

export async function getDailyCard(): Promise<DailyCardResult> {
  const today = getDateStr();
  const stored = await getStored();

  if (stored && stored.date === today) {
    const card = allCards.find((c) => c.id === stored.cardId);
    if (card) {
      console.log('[Tarot] getDailyCard: returning stored card for user', {
        date: today, cardId: card.id, cardName: card.name, isReversed: stored.isReversed,
      });
      return { card, isReversed: stored.isReversed, isNew: false };
    }
  }

  const history = await getHistory();

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const recentIds = new Set(
    history.filter((h) => h.date >= cutoffStr).map((h) => h.cardId)
  );

  let pool = allCards.filter((c) => !recentIds.has(c.id));

  if (pool.length < 26) {
    const seen = new Set(pool.map((c) => c.id));
    const oldestFirst = [...history].reverse();
    for (const h of oldestFirst) {
      if (pool.length >= 39) break;
      if (!seen.has(h.cardId)) {
        const card = allCards.find((c) => c.id === h.cardId);
        if (card) {
          pool.push(card);
          seen.add(h.cardId);
        }
      }
    }
  }

  if (pool.length === 0) {
    pool = [...allCards];
    console.warn('[Tarot] getDailyCard: pool was empty, fell back to full deck');
  }

  const randomIndex = cryptoRandomInt(pool.length);
  const card = pool[randomIndex];
  const isReversed = cryptoRandom() > 0.5;

  console.log('[Tarot] getDailyCard: selected new daily card', {
    poolSize: pool.length, randomIndex, cardId: card.id, cardName: card.name, isReversed,
  });

  await saveStored({ date: today, cardId: card.id, isReversed });
  await addToHistory({ cardId: card.id, date: today });

  console.log('[Tarot] getDailyCard: saved for today', {
    date: today, cardId: card.id, cardName: card.name,
  });

  return { card, isReversed, isNew: true };
}

export async function drawRandomCard(): Promise<DailyCardResult> {
  const bagKey = await getBagKey();

  let bag: ShuffleBag;
  try {
    const json = await AsyncStorage.getItem(bagKey);
    bag = json ? JSON.parse(json) : { order: [], cursor: 0 };
  } catch {
    bag = { order: [], cursor: 0 };
  }

  if (bag.cursor >= bag.order.length) {
    bag.order = fisherYatesShuffle(allCards.map((c) => c.id));
    bag.cursor = 0;
    console.log('[Tarot] drawRandomCard: reshuffled user bag', {
      firstFive: bag.order.slice(0, 5),
    });
  }

  const cardId = bag.order[bag.cursor];
  bag.cursor++;
  await AsyncStorage.setItem(bagKey, JSON.stringify(bag));

  let card = allCards.find((c) => c.id === cardId);
  if (!card) {
    card = allCards[cryptoRandomInt(allCards.length)];
    console.warn('[Tarot] drawRandomCard: cardId not found, fell back to random', { cardId, fallback: card.name });
  }
  const isReversed = cryptoRandom() > 0.5;

  console.log('[Tarot] drawRandomCard:', {
    cursor: bag.cursor - 1,
    remaining: bag.order.length - bag.cursor,
    cardId,
    cardName: card.name,
    isReversed,
  });

  return { card, isReversed, isNew: true };
}

export function getSuitColor(suit: string | null): string {
  switch (suit) {
    case 'wands': return '#D4892A';
    case 'cups': return '#4A9BD9';
    case 'swords': return '#9B7BB5';
    case 'pentacles': return '#5B9B6A';
    default: return '#7B4A9B';
  }
}

export function getSuitColorLight(suit: string | null): string {
  switch (suit) {
    case 'wands': return '#F5C542';
    case 'cups': return '#7BC4E8';
    case 'swords': return '#C4A4D4';
    case 'pentacles': return '#7BC48A';
    default: return '#C4A44A';
  }
}
