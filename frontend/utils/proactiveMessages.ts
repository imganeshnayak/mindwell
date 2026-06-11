// utils/proactiveMessages.ts
// Topic-aware prompt templates for proactive AI check-in messages.
// Used when the AI reaches out to the user after a period of inactivity.

export type FocusArea = 'Better Sleep' | 'Daily Movement' | 'Stress Relief' | 'Mindful Breathing';

/**
 * Returns idle timeout in milliseconds based on the frequency setting.
 * 'Low' returns null — no proactive messages.
 */
export function getIdleTimeout(frequency: 'Low' | 'Balanced' | 'Proactive'): number | null {
  switch (frequency) {
    case 'Low': return null;
    case 'Balanced': return 10 * 60 * 1000; // 10 minutes
    case 'Proactive': return 3 * 60 * 1000;  // 3 minutes
  }
}

/**
 * Returns a system prompt addition for proactive check-in,
 * personalized to focus areas and time of day.
 */
export function getProactivePrompt(
  userName: string,
  focusAreas: string[],
  guideName: string,
): string {
  const hour = new Date().getHours();
  const isMorning = hour >= 5 && hour < 12;
  const isAfternoon = hour >= 12 && hour < 17;
  const isEvening = hour >= 17 && hour < 21;
  const isNight = hour >= 21 || hour < 5;

  let timeHint = '';
  if (isMorning) timeHint = 'It\'s morning — a fresh start.';
  else if (isAfternoon) timeHint = 'It\'s the afternoon — a good time to check in.';
  else if (isEvening) timeHint = 'It\'s evening — time to wind down.';
  else if (isNight) timeHint = 'It\'s late — rest is important.';

  let focusHint = '';
  if (focusAreas.includes('Better Sleep') && (isEvening || isNight)) {
    focusHint = 'The user\'s focus is better sleep — gently remind them about winding down.';
  } else if (focusAreas.includes('Daily Movement') && isAfternoon) {
    focusHint = 'The user\'s focus is daily movement — nudge them to do a quick stretch or walk.';
  } else if (focusAreas.includes('Stress Relief')) {
    focusHint = 'The user\'s focus is stress relief — offer a calming thought or breathing tip.';
  } else if (focusAreas.includes('Mindful Breathing')) {
    focusHint = 'The user\'s focus is mindful breathing — invite them to take a mindful breath.';
  }

  return [
    `You are ${guideName}, checking in on ${userName} who has been quiet.`,
    timeHint,
    focusHint,
    'Send a warm, casual 1-sentence check-in. Split into 1-2 short bubbles using |||.',
    'Be like a caring friend — not a robot. No emojis overload. Keep it natural.',
  ].filter(Boolean).join(' ');
}
