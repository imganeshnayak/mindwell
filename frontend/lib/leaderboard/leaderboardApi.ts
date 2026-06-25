// frontend/lib/leaderboard/leaderboardApi.ts
import { supabase } from '@/lib/supabase';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  week_start: string;
  total_steps: number;
  display_name: string | null;
  avatar_url: string | null;
}

// Get the Monday of the current week
const getCurrentWeekStart = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function fetchWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
  const weekStart = getCurrentWeekStart();
  try {
    const sessionRes = await supabase.auth.getSession();
    const token = sessionRes.data.session?.access_token;
    if (!token) {
      console.warn('[leaderboardApi] No active session token found');
      return [];
    }

    const response = await fetch(`${BACKEND_URL}/api/leaderboard?week_start=${weekStart}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[leaderboardApi] fetch error status:', response.status, errText);
      return [];
    }

    const data = await response.json();
    return data as LeaderboardEntry[];
  } catch (error: any) {
    console.error('[leaderboardApi] fetch error:', error.message || error);
    return [];
  }
}

export async function upsertUserSteps(userId: string, stepsToAdd: number): Promise<{ error: string | null }> {
  const weekStart = getCurrentWeekStart();
  
  // First fetch current weekly steps
  const { data: current } = await supabase
    .from('steps_leaderboard')
    .select('total_steps')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .single();

  const totalSteps = (current?.total_steps || 0) + stepsToAdd;

  const { error } = await supabase
    .from('steps_leaderboard')
    .upsert({
      user_id: userId,
      week_start: weekStart,
      total_steps: totalSteps
    }, { onConflict: 'user_id,week_start' });

  if (error) {
    console.error('[leaderboardApi] upsert error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

export async function syncWeeklySteps(userId: string): Promise<{ error: string | null }> {
  const weekStart = getCurrentWeekStart();

  // 1. Get sum of steps for this week from biometrics table
  const { data, error } = await supabase
    .from('biometrics')
    .select('steps')
    .eq('user_id', userId)
    .gte('date', weekStart);

  if (error) {
    console.error('[leaderboardApi] syncWeeklySteps fetch error:', error.message);
    return { error: error.message };
  }

  const sumSteps = (data || []).reduce((sum, row) => sum + (row.steps || 0), 0);

  // 2. Upsert to steps_leaderboard
  const { error: upsertError } = await supabase
    .from('steps_leaderboard')
    .upsert({
      user_id: userId,
      week_start: weekStart,
      total_steps: sumSteps
    }, { onConflict: 'user_id,week_start' });

  if (upsertError) {
    console.error('[leaderboardApi] syncWeeklySteps upsert error:', upsertError.message);
    return { error: upsertError.message };
  }

  return { error: null };
}
