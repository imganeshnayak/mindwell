// lib/supabase.ts
// Supabase client singleton — used across the entire frontend.
// Anon key is safe to expose in client; RLS protects all data.

import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import * as FileSystem from 'expo-file-system/legacy';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to frontend/.env'
  );
}

// Custom storage adapter using Expo FileSystem to avoid AsyncStorage native module issues
const supabaseStorage = {
  getItem: async (key: string): Promise<string | null> => {
    const path = `${FileSystem.documentDirectory}${key}.json`;
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        return await FileSystem.readAsStringAsync(path);
      }
    } catch (err) {
      console.warn('[supabaseStorage] Error reading session:', err);
    }
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    const path = `${FileSystem.documentDirectory}${key}.json`;
    try {
      await FileSystem.writeAsStringAsync(path, value);
    } catch (err) {
      console.warn('[supabaseStorage] Error saving session:', err);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    const path = `${FileSystem.documentDirectory}${key}.json`;
    try {
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path);
      }
    } catch (err) {
      console.warn('[supabaseStorage] Error removing session:', err);
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
