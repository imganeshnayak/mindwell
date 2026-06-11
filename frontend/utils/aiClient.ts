// utils/aiClient.ts
// AI client that builds a rich, context-aware system prompt and fetches responses
// from the FreeLLMAPI proxy.

import { Mood, getMoodSignal } from './moodDetector';

const PROXY_URL = 'http://192.168.1.101:3001/v1/chat/completions';
// Using local IP address so physical devices and emulators can connect

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export interface BiometricContext {
  steps: number;
  stepGoal: number;
  sleepHours: number;
  sleepMinutes: number;
  calories: number;
  calorieGoal: number;
  vitalityScore: number;
}

export interface SystemPromptOptions {
  guideName: string;
  userName: string;
  personality: 'Empathetic' | 'Analytical' | 'Playful';
  voice: string;
  frequency: 'Low' | 'Balanced' | 'Proactive';
  focus: string[];
  gender: 'Male' | 'Female' | 'Non-binary' | 'Neutral';
  role: 'Guide' | 'Mom' | 'Dad' | 'Friend' | 'Bestie';
  mood?: Mood;
  biometrics?: BiometricContext;
  /** Optional override prompt — used for proactive check-in messages */
  overridePrompt?: string;
}

function getPersonalityInstructions(personality: string, voice: string): string {
  const personalityMap: Record<string, string> = {
    Empathetic:
      'Respond with deep compassion, warmth, and emotional validation. Acknowledge feelings first before offering advice. Use phrases like "I hear you", "that makes sense", "you\'re doing great".',
    Analytical:
      'Be direct, clear, and data-driven. Focus on patterns and actionable insights. Acknowledge feelings briefly then move to practical solutions.',
    Playful:
      'Be lighthearted, upbeat, and encouraging. Use gentle humor and positive energy. Keep things breezy and fun without trivializing real concerns.',
  };

  const voiceMap: Record<string, string> = {
    'Gentle & Nurturing': 'Soft, patient, warm tones. Speak slowly and reassuringly.',
    'Focused & Calm': 'Steady, grounded, clear presence. No fluff — just supportive clarity.',
    'Bright & Motivating': 'Uplifting, optimistic, and energizing. Inspire action gently.',
  };

  return [
    personalityMap[personality] || personalityMap['Empathetic'],
    voiceMap[voice] || voiceMap['Gentle & Nurturing'],
  ].join(' ');
}

function getTimeContext(): string {
  const now = new Date();
  const hour = now.getHours();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = days[now.getDay()];
  let period = 'morning';
  if (hour >= 12 && hour < 17) period = 'afternoon';
  else if (hour >= 17 && hour < 21) period = 'evening';
  else if (hour >= 21 || hour < 5) period = 'late night';
  return `${day} ${period}`;
}

function getBiometricContext(bio?: BiometricContext): string {
  if (!bio) {
    // Use the static values from the biometrics screen as defaults
    return [
      'BIOMETRICS (today):',
      '- Steps: 1,200 / 10,000 (low activity — below goal)',
      '- Sleep: 6h 30m (slightly below recommended 7-8h)',
      '- Calories: 1,850 / 2,200 kcal',
      '- Vitality score: 84% (Optimal)',
    ].join('\n');
  }

  const stepStatus = bio.steps < bio.stepGoal * 0.3 ? 'very low' :
    bio.steps < bio.stepGoal * 0.6 ? 'below goal' : 'on track';
  const sleepStatus = (bio.sleepHours < 7) ? 'below recommended' : 'good';

  return [
    'BIOMETRICS (today):',
    `- Steps: ${bio.steps.toLocaleString()} / ${bio.stepGoal.toLocaleString()} (${stepStatus})`,
    `- Sleep: ${bio.sleepHours}h ${bio.sleepMinutes}m (${sleepStatus})`,
    `- Calories: ${bio.calories} / ${bio.calorieGoal} kcal`,
    `- Vitality score: ${bio.vitalityScore}%`,
  ].join('\n');
}

/**
 * Builds the full rich system prompt for the AI.
 */
export function buildSystemPrompt(options: SystemPromptOptions): string {
  const {
    guideName, userName, personality, voice,
    frequency, focus, mood, biometrics, gender, role, overridePrompt,
  } = options;

  if (overridePrompt) return overridePrompt;

  const moodSignal = mood ? getMoodSignal(mood) : '';
  const personalityInstructions = getPersonalityInstructions(personality, voice);
  const timeContext = getTimeContext();
  const biometricContext = getBiometricContext(biometrics);
  const focusText = focus.length > 0 ? focus.join(', ') : 'general wellness';

  let genderInstruction = '';
  if (gender !== 'Neutral') {
    genderInstruction = `\nGENDER & TONE ADJUSTMENT:\nYou identify as ${gender}. Subtly adjust your conversational tone, expressions, and word choices to align naturally with a ${gender.toLowerCase()} persona, while remaining a deeply caring wellness guide.`;
  }

  let roleInstruction = '';
  if (role && role !== 'Guide') {
    roleInstruction = `\nROLE & RELATIONSHIP:\nYou are acting in the role of a ${role}. Interact with ${userName} as a ${role} would—using appropriate familiarity, warmth, and typical ${role}-like expressions, while still providing helpful wellness support.`;
  }

  return `You are "${guideName}", a warm and caring mental wellness companion for ${userName}.
${roleInstruction}

PERSONALITY & VOICE:
${personalityInstructions}${genderInstruction}

FOCUS AREAS: ${focusText} — weave these naturally into responses when relevant.

${biometricContext}

TIME CONTEXT: ${timeContext}
${moodSignal ? `MOOD SIGNAL: ${moodSignal}` : ''}

MULTI-BUBBLE FORMAT (CRITICAL — always follow this):
- Split your response into 2–3 short separate messages using the delimiter: |||
- Each part must be 1 short sentence max — casual, like a real friend texting
- Never write one long paragraph in a single bubble
- Example format: "Aw, I hear you 💙 ||| Rest is so important. ||| Want to try a quick breathing exercise together?"

COACHING ACTION RULES (only when highly relevant to what the user just said):
- If the user is clearly tired or exhausted → end your last bubble with: [ACTION:BREATHING]
- If the user is stressed, anxious, or overwhelmed → end your last bubble with: [ACTION:BREATHING]
- If the user mentions needing movement or a stretch → end your last bubble with: [ACTION:STRETCH]
- Include at most ONE action tag per response, at the very end after |||
- Only trigger an action when the user's message clearly calls for it

FREQUENCY RULES:
${frequency === 'Low' ? '- Only respond to what is directly asked. Do not offer unsolicited advice.' : ''}
${frequency === 'Proactive' ? '- Proactively offer tips, check-ins, and encouragement throughout the conversation.' : ''}
${frequency === 'Balanced' ? '- Balance responding to questions with gentle proactive suggestions.' : ''}

GUARDRAILS:
- Never diagnose, prescribe, or give clinical mental health advice.
- For serious distress signals, always gently suggest professional support.
- No asterisks, markdown, bullet points, or formatting — plain conversational text only.
- Do not use the user's name in every message — only occasionally for warmth.`;
}

export async function fetchAIResponse(
  messages: Message[],
  apiKey: string,
  systemPrompt: string,
): Promise<string> {
  const payload = {
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  };

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', response.status, errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Fetch AI Response failed:', error);
    return "Sorry, I'm having a little trouble connecting right now! ||| Make sure the proxy is running. ||| I'll be right back with you 💙";
  }
}
