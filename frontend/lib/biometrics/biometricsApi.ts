// frontend/lib/biometrics/biometricsApi.ts
import { supabase } from '@/lib/supabase';
import { syncWeeklySteps } from '@/lib/leaderboard/leaderboardApi';

export interface BiometricsData {
  id?: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  steps: number;
  step_goal: number;
  sleep_hours: number;
  sleep_minutes: number;
  vitality_score: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export async function fetchTodayBiometrics(userId: string): Promise<BiometricsData | null> {
  const today = getTodayString();
  const { data, error } = await supabase
    .from('biometrics')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[biometricsApi] fetch error:', error.message);
    return null;
  }
  return data as BiometricsData | null;
}

export async function upsertBiometrics(userId: string, biometrics: Partial<Omit<BiometricsData, 'id' | 'user_id' | 'date'>>): Promise<{ error: string | null }> {
  const today = getTodayString();
  
  // First try to see if today's row exists to do an update
  const current = await fetchTodayBiometrics(userId);
  
  const payload = {
    user_id: userId,
    date: today,
    ...(current || {
      steps: 0,
      step_goal: 10000,
      sleep_hours: 0,
      sleep_minutes: 0,
      vitality_score: 50,
    }),
    ...biometrics
  };

  const { error } = await supabase
    .from('biometrics')
    .upsert(payload, { onConflict: 'user_id,date' });

  if (error) {
    console.error('[biometricsApi] upsert error:', error.message);
    return { error: error.message };
  }

  // Synchronize to the weekly leaderboard
  if (biometrics.steps !== undefined) {
    await syncWeeklySteps(userId);
  }

  return { error: null };
}
