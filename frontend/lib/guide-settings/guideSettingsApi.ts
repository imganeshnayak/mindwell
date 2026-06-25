// frontend/lib/guide-settings/guideSettingsApi.ts
import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

export interface GuideSettingsData {
  user_id: string;
  guide_name: string;
  voice: string;
  personality: string;
  frequency: string;
  focus: string[];
  gender: string;
  role: string;
  avatar_url: string | null;
  onboarding_done: boolean;
}

export async function fetchGuideSettings(userId: string): Promise<GuideSettingsData | null> {
  const { data, error } = await supabase
    .from('guide_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('[guideSettingsApi] fetchGuideSettings error:', error.message);
    }
    return null;
  }
  return data as GuideSettingsData;
}

export async function upsertGuideSettings(userId: string, settings: Partial<GuideSettingsData>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('guide_settings')
    .upsert({ user_id: userId, ...settings }, { onConflict: 'user_id' });

  if (error) {
    console.error('[guideSettingsApi] upsertGuideSettings error:', error.message);
    return { error: error.message };
  }
  return { error: null };
}

export async function uploadAvatar(userId: string, fileUri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
    const filePath = `${userId}/${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, decode(base64), { contentType: 'image/jpeg', upsert: true });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('[guideSettingsApi] uploadAvatar error:', err);
    return null;
  }
}
