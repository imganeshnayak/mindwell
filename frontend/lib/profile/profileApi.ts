// lib/profile/profileApi.ts
// CRUD operations for the public.profiles table.

import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  user_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch the profile for the given user id.
 * Returns null if no profile exists yet.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    // PGRST116 = row not found — not a real error for us
    if (error.code !== 'PGRST116') {
      console.error('[profileApi] fetchProfile error:', error.message);
    }
    return null;
  }
  return data as Profile;
}

/**
 * Upsert (create or update) the profile for the given user id.
 */
export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' });

  if (error) {
    console.error('[profileApi] upsertProfile error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}
