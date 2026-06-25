// frontend/lib/nutrition/nutritionApi.ts
import { supabase } from '@/lib/supabase';

export interface MealData {
  id: string;
  user_id: string;
  date: string;
  meal_type: string;
  description: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export async function fetchTodayMeals(userId: string, date?: string): Promise<MealData[]> {
  const targetDate = date || getTodayString();
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', targetDate)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[nutritionApi] fetch meals error:', error.message);
    return [];
  }
  return data as MealData[];
}

export async function upsertMeal(meal: Partial<MealData> & { user_id: string; date: string; meal_type: string }): Promise<{ error: string | null; data: MealData | null }> {
  const { data, error } = await supabase
    .from('meals')
    .upsert(meal)
    .select()
    .single();

  if (error) {
    console.error('[nutritionApi] upsert meal error:', error.message);
    return { error: error.message, data: null };
  }
  return { error: null, data: data as MealData };
}

export async function fetchTodayHydration(userId: string, date?: string): Promise<number> {
  const targetDate = date || getTodayString();
  const { data, error } = await supabase
    .from('hydration')
    .select('glasses')
    .eq('user_id', userId)
    .eq('date', targetDate)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[nutritionApi] fetch hydration error:', error.message);
    return 0;
  }
  return data?.glasses || 0;
}

export async function updateHydration(userId: string, glasses: number, date?: string): Promise<{ error: string | null }> {
  const targetDate = date || getTodayString();
  const { error } = await supabase
    .from('hydration')
    .upsert({ user_id: userId, date: targetDate, glasses }, { onConflict: 'user_id,date' });

  if (error) {
    console.error('[nutritionApi] update hydration error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}
