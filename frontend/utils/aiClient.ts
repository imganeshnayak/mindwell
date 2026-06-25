import { supabase } from '@/lib/supabase';
import { Mood, getMoodSignal } from './moodDetector';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';

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

COACHING ACTION RULES (CRITICAL: DO NOT over-trigger these):
- ONLY trigger [ACTION:BREATHING] if the user EXPLICITLY states in their chat message that they are stressed, anxious, overwhelmed, tired, or ask for a breathing exercise. DO NOT infer this from biometrics alone.
- ONLY trigger [ACTION:STRETCH] if the user EXPLICITLY mentions in their chat message needing movement, feeling stiff, or asks for a stretch.
- Include at most ONE action tag per response, at the very end after |||.
- If the user just says "hi", "hello", or is making casual conversation, DO NOT include any ACTION tags.

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
  systemPrompt: string,
): Promise<string> {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;

  const payload = {
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

export interface EstimatedNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export async function estimateNutritionFromText(description: string): Promise<EstimatedNutrition | null> {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;

  const systemPrompt = `You are a professional nutritionist database assistant.
Analyze the food item or meal description: "${description}".
Provide a realistic estimate of the total calories (kcal), protein (g), carbs (g), and fats (g).

Respond ONLY with a JSON object in this exact format, with no markdown, backticks or code block fences:
{"calories": number, "protein": number, "carbs": number, "fats": number}
`;

  const payload = {
    messages: [
      { role: 'system', content: systemPrompt },
    ],
  };

  try {
    const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error status ${response.status}`);
    }

    const data = await response.json();
    const textContent = data.choices[0].message.content.trim();
    const cleanJSON = textContent.replace(/```json|```/g, '').trim();
    const nutrition = JSON.parse(cleanJSON);
    return {
      calories: Number(nutrition.calories) || 0,
      protein: Number(nutrition.protein) || 0,
      carbs: Number(nutrition.carbs) || 0,
      fats: Number(nutrition.fats) || 0,
    };
  } catch (error) {
    console.error('Failed to estimate nutrition from AI:', error);
    return null;
  }
}
