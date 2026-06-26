import { supabase } from '@/lib/supabase';
import type { Interpretation } from './types';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function generateInterpretation(
  cardName: string,
  isReversed: boolean,
  keywords: string[]
): Promise<Interpretation> {
  try {
    return await fetchAIInterpretation(cardName, isReversed, keywords);
  } catch {
    return generateFallbackInterpretation(cardName, keywords);
  }
}

async function fetchAIInterpretation(
  cardName: string,
  isReversed: boolean,
  keywords: string[]
): Promise<Interpretation> {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;

  const orientation = isReversed ? 'reversed' : 'upright';
  const seed = Math.floor(Math.random() * 1000);

  const systemPrompt = `You write thoughtful daily reflections for someone based on a card. Your writing feels like a caring mentor or a very wise friend journaling directly to them. Never mention tarot, cards, or symbolism.

Write exactly 6 fields in JSON. The total should be 250–400 words.

{
  "todayMessage": "2-3 paragraphs offering a warm, relatable reflection that connects to everyday life.",
  "relationships": "A thoughtful paragraph about connection, communication, or the people in their life.",
  "workStudies": "Warm guidance about work, learning, creativity, or daily responsibilities.",
  "personalGrowth": "An encouraging paragraph about self-awareness, confidence, or resilience.",
  "reflectionQuestion": "One thoughtful question to sit with.",
  "affirmation": "A single uplifting affirmation sentence."
}

Card name: ${cardName}
Position: ${orientation}
Keywords: ${keywords.join(', ')}
Style: ${seed}

Rules:
- Write like a warm mentor journaling directly to them. Rich, real, kind.
- Use everyday language. No mystical or spiritual jargon.
- Never start sentences with "This card represents..." or "The universe..."
- Do not explain card symbolism at all. Instead, talk about life.
- Include relatable examples: stress, decisions, relationships, confidence, habits, rest, growth.
- todayMessage should be 2-3 paragraphs with real-life examples, 105–170 words.
- relationships should be 50–80 words about people and connection.
- workStudies should be 50–80 words about work, school, or responsibilities.
- personalGrowth should be 50–80 words about inner development.
- reflectionQuestion should be one meaningful question, 10–20 words.
- affirmation should be one uplifting sentence, 10–20 words.
- NEVER predict bad events, illness, loss, or disaster.
- Never say something will definitely happen. Keep it as gentle guidance.
- If reversed: keep the same warm tone but offer a slightly different perspective.
- Make every reading feel unique and personal without pretending to know their life.`;

  const response = await fetch(`${BACKEND_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [{ role: 'system', content: systemPrompt }],
    }),
  });

  if (!response.ok) throw new Error('AI request failed');

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const cleaned = text.replace(/```json|```/gi, '').trim();

  const parsed = JSON.parse(cleaned);
  return {
    todayMessage: parsed.todayMessage || '',
    relationships: parsed.relationships || '',
    workStudies: parsed.workStudies || '',
    personalGrowth: parsed.personalGrowth || '',
    reflectionQuestion: parsed.reflectionQuestion || '',
    affirmation: parsed.affirmation || '',
  };
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const MESSAGE_TEMPLATES = [
  (n: string, k: string) =>
    `There are days when everything feels clear, and then there are days like today — where you might sense something shifting beneath the surface. The energy of ${k} is gently making its way into your awareness, asking you to pause and take notice. It does not require a big reaction or a major decision. It simply invites you to be present with where you are right now.

Think about the small moments in your daily routine. Maybe it is the way you handle a quiet morning before the world wakes up, or how you respond when something does not go as planned. ${k} shows up in these ordinary spaces more than you might expect. It is not about grand gestures. It is about noticing what is already there and giving it a little more space to breathe.

Let yourself sit with that today. You do not need to figure everything out. Just let ${k} be a quiet companion as you move through your day, and see what small insights emerge.`,
  (n: string, k: string) =>
    `It is easy to get caught up in the rush of responsibilities and forget to check in with yourself. Today, there is a gentle nudge toward ${k}. This is not about adding another task to your list. It is about slowing down just enough to notice what your heart and mind are actually feeling.

Picture the moments in your day where you usually rush through — making breakfast, walking between classes, waiting for a meeting to start. These are the moments where ${k} can quietly enter. Instead of reaching for your phone or mentally rehearsing your to-do list, try taking one slow breath and asking yourself what you need right now. The answer might surprise you.

Growth often happens in the in-between moments. By welcoming ${k} into your day, you are giving yourself permission to be human — to feel, to rest, to simply be. That is more than enough.`,
  (n: string, k: string) =>
    `Right now, life may feel like it is asking a lot of you. Between responsibilities, relationships, and the constant buzz of expectations, it can be hard to find a moment of peace. This is where ${k} becomes important. Not as a solution to every problem, but as a gentle anchor you can return to whenever things feel overwhelming.

Think about a recent moment when you felt a little lost or unsure. What helped you ground yourself? Maybe it was a conversation with someone who listened, a few minutes of quiet, or simply deciding to let go of something that was weighing on you. ${k} works the same way. It does not shout for attention. It waits patiently for you to remember it is there.

You have everything you need to navigate this season of your life. Trust that. And when in doubt, come back to ${k} — it will be waiting.`,
  (n: string, k: string) =>
    `There is something quietly powerful about the way ${k} is showing up for you right now. It may not arrive with fireworks or dramatic revelations. Instead, it slips into your awareness during the quiet moments — when you are washing dishes, staring out a window, or lying in bed before sleep.

Consider how ${k} has already appeared in your life recently. Perhaps it was in a kind word someone said, a moment of unexpected patience, or the decision to choose rest over productivity. These small instances matter more than you realize. They are the threads that weave a meaningful life.

Today, stay open to noticing ${k} in the ordinary. The way sunlight falls across your desk, the sound of a friend's laughter, the feeling of completing a task you have been putting off. These are not coincidences. They are reminders that you are moving through life with intention, even when it does not feel that way.`,
];

const RELATIONSHIP_TEMPLATES = [
  (k: string) =>
    `The people around you matter more than you sometimes give yourself credit for. ${k} can show up in how you listen to a friend today, or in the patience you offer a family member who is having a hard time. You do not need to fix anything or have the perfect words. Sometimes just being present, setting aside your phone, and really hearing someone is the most meaningful thing you can do. Let the connections in your life be simple today.`,
  (k: string) =>
    `Relationships grow in the small, unplanned moments. A shared laugh over something silly. A text that says "thinking of you." The courage to say "I need a little help today." ${k} invites you to lower your guard just a little and let the people who care about you see the real you. You do not have to be strong all the time. Let someone in today, even if it is just a small crack.`,
  (k: string) =>
    `There is someone in your life who would benefit from the energy of ${k} right now. Maybe they need encouragement, or simply to know they are not alone. You do not have to solve their problems. A short check-in, a genuine compliment, or even just sitting with them in silence can speak volumes. Connection is not about grand gestures. It is about showing up, again and again, in the small ways that say "I see you."`,
  (k: string) =>
    `Sometimes the most important relationship is the one you have with yourself. ${k} asks you to consider how you speak to yourself when no one else is around. Are you kind? Do you give yourself the same grace you offer others? Today, try treating yourself with the same warmth and understanding you would give a close friend. You deserve that much.`,
];

const WORK_TEMPLATES = [
  (k: string) =>
    `Your work and studies are not just about getting things done — they are a reflection of your dedication and growth. ${k} encourages you to approach your tasks with a sense of purpose rather than pressure. If something feels overwhelming, break it into smaller pieces. If you are stuck, step away for a few minutes and come back with fresh eyes. Progress is still progress, even when it is slow. Trust the process and keep moving forward at your own pace.`,
  (k: string) =>
    `There is a difference between working hard and working with intention. ${k} reminds you that your energy is precious, and where you place it matters. Instead of pushing through fatigue or rushing to meet every expectation, ask yourself: what is the most meaningful thing I can do today? Let that be your guide. The rest can wait. You will accomplish more by focusing on what truly matters than by trying to do everything at once.`,
  (k: string) =>
    `Learning and creating take time, and it is easy to be hard on yourself when results do not come quickly. ${k} asks you to be patient with your own progress. Every skill you are building, every concept you are trying to understand, every challenge you are facing — it is all part of a longer journey. You are not behind. You are exactly where you need to be. Keep showing up, stay curious, and let the process unfold naturally.`,
  (k: string) =>
    `Success is not just about the outcome. It is also about how you treat yourself along the way. ${k} invites you to find moments of joy in your daily tasks — the satisfaction of checking something off your list, the thrill of learning something new, the quiet pride in doing your best. Celebrate those small victories. They are the building blocks of something larger. And remember: rest is not a reward for finishing. It is part of the work itself.`,
];

const GROWTH_TEMPLATES = [
  (k: string) =>
    `Personal growth is rarely a straight line. It is more like a winding path with unexpected turns, and ${k} is a helpful companion on that journey. Today, give yourself permission to be a work in progress. You do not need to have everything figured out. What matters is that you are willing to learn, to adjust, and to keep going even when it feels uncomfortable. Growth happens exactly at the edge of your comfort zone.`,
  (k: string) =>
    `You are more resilient than you realize. Think back to a challenge you faced in the past — one that felt impossible at the time. You made it through. ${k} reminds you of that inner strength. It is still there, ready to support you through whatever comes next. You do not need to be fearless. You just need to take the next small step, and trust that you will figure the rest out as you go.`,
  (k: string) =>
    `There is a version of you that is slowly emerging — someone who is more patient, more self-aware, more at peace with imperfection. ${k} is helping that version come to life. You might not see the changes day to day, but they are happening. Every time you choose kindness over criticism, rest over burnout, honesty over pretending, you are growing. Trust the process. You are becoming who you are meant to be.`,
  (k: string) =>
    `One of the bravest things you can do is to sit with yourself and truly listen. ${k} invites you to check in honestly: How are you really feeling? What do you need right now that you have been ignoring? These quiet conversations with yourself are where real growth begins. You do not need to have answers. Just the willingness to ask the questions is enough.`,
];

const REFLECTION_TEMPLATES = [
  (k: string) =>
    `Where in your life right now could you use a little more ${k}, and what is one small way you could invite it in?`,
  (k: string) =>
    `If you stopped trying to control everything and simply trusted ${k}, what might change?`,
  (k: string) =>
    `What would it feel like to let ${k} guide one decision today, even a very small one?`,
  (k: string) =>
    `When was the last time you felt truly connected to ${k}, and how can you create space for that feeling again today?`,
];

const AFFIRMATION_TEMPLATES = [
  (k: string) =>
    `I welcome ${k} into my day with an open heart, trusting that I already have everything I need within me.`,
  (k: string) =>
    `I am learning to embrace ${k} gently, knowing that growth unfolds in its own time.`,
  (k: string) =>
    `I give myself permission to rest in the energy of ${k} and let it guide me with quiet wisdom.`,
  (k: string) =>
    `I trust myself to navigate today with courage and grace, letting ${k} be my quiet companion.`,
];

function generateFallbackInterpretation(
  cardName: string,
  keywords: string[]
): Interpretation {
  const key = pick(keywords);

  return {
    todayMessage: pick(MESSAGE_TEMPLATES)(cardName, key),
    relationships: pick(RELATIONSHIP_TEMPLATES)(key),
    workStudies: pick(WORK_TEMPLATES)(key),
    personalGrowth: pick(GROWTH_TEMPLATES)(key),
    reflectionQuestion: pick(REFLECTION_TEMPLATES)(key),
    affirmation: pick(AFFIRMATION_TEMPLATES)(key),
  };
}
