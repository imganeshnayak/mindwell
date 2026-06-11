// utils/moodDetector.ts
// Lightweight client-side mood detector based on keyword matching.
// Runs on every user message before sending to the AI.

export type Mood = 'positive' | 'stressed' | 'tired' | 'distressed' | 'neutral';

const moodKeywords: Record<Mood, string[]> = {
  positive: [
    'happy', 'great', 'amazing', 'excited', 'good', 'energized', 'fantastic',
    'wonderful', 'blessed', 'grateful', 'awesome', 'joyful', 'cheerful', 'love',
    'motivated', 'ready', 'pumped', 'refreshed', 'alive', 'productive',
  ],
  stressed: [
    'stressed', 'anxious', 'overwhelmed', 'worried', 'nervous', 'panic',
    'pressure', 'tense', 'restless', 'uneasy', 'on edge', 'freaking out',
    'can\'t focus', 'too much', 'everything is', 'spiraling',
  ],
  tired: [
    'tired', 'exhausted', 'sleepy', 'fatigue', 'drained', 'burnt out',
    'low energy', 'no energy', 'sluggish', 'worn out', 'weary', 'groggy',
    'lethargic', 'can\'t get up', 'so sleepy', 'need sleep', 'not rested',
  ],
  distressed: [
    'sad', 'depressed', 'hopeless', 'crying', 'terrible', 'awful', 'lonely',
    'lost', 'empty', 'numb', 'broken', 'hurt', 'miserable', 'worthless',
    'don\'t care', 'give up', 'can\'t do this', 'falling apart',
  ],
  neutral: [],
};

export const MOOD_ICONS: Record<Mood, string> = {
  positive: '✨',
  stressed: '🌧️',
  tired: '😴',
  distressed: '💙',
  neutral: '🌿',
};

export const MOOD_LABELS: Record<Mood, string> = {
  positive: 'Positive',
  stressed: 'Stressed',
  tired: 'Tired',
  distressed: 'Distressed',
  neutral: 'Calm',
};

/**
 * Detects the mood of a given text string using keyword matching.
 * Priority order: distressed > stressed > tired > positive > neutral
 */
export function detectMood(text: string): Mood {
  const lowerText = text.toLowerCase();

  // Check in priority order — distressed first so serious signals aren't missed
  const priorityOrder: Mood[] = ['distressed', 'stressed', 'tired', 'positive'];

  for (const mood of priorityOrder) {
    const keywords = moodKeywords[mood];
    if (keywords.some((kw) => lowerText.includes(kw))) {
      return mood;
    }
  }

  return 'neutral';
}

/**
 * Returns a human-readable mood signal string for injection into the system prompt.
 */
export function getMoodSignal(mood: Mood): string {
  if (mood === 'neutral') return '';
  return `Current mood signal: ${mood}`;
}
