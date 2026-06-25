// lib/auth/authApi.ts
// All Supabase Auth operations. Keeps auth logic out of components.

import { supabase } from '@/lib/supabase';

export interface AuthError {
  message: string;
}

/**
 * Register a new user with email + password.
 * Passes user_name in metadata so the DB trigger auto-creates the profile row.
 */
export async function signUp(
  email: string,
  password: string,
  userName: string
): Promise<{ userId: string | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { user_name: userName.trim() || 'Avery' },
    },
  });

  if (error) return { userId: null, error: { message: error.message } };
  return { userId: data.user?.id ?? null, error: null };
}

/**
 * Sign in an existing user with email + password.
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ userId: string | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) return { userId: null, error: { message: error.message } };
  return { userId: data.user?.id ?? null, error: null };
}

/**
 * Sign out the current user and clear the session.
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/**
 * Get the current active session (null if logged out).
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the currently logged in user (null if logged out).
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
