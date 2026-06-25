-- =====================================================
-- Migration 005: steps_leaderboard
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.steps_leaderboard (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start  date NOT NULL,
  total_steps bigint DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- Note: We do not store display_name/avatar_url here anymore.
-- Instead, we will JOIN with public.profiles on user_id to get the latest name and avatar.

-- Enable Row Level Security
ALTER TABLE public.steps_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can view the leaderboard (or you can restrict to authenticated users)
CREATE POLICY "Anyone can view steps_leaderboard"
  ON public.steps_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own steps"
  ON public.steps_leaderboard FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own steps"
  ON public.steps_leaderboard FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER leaderboard_updated_at
  BEFORE UPDATE ON public.steps_leaderboard
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add view to easily query the leaderboard with profile data
CREATE OR REPLACE VIEW public.leaderboard_with_profiles AS
SELECT 
  l.id,
  l.user_id,
  l.week_start,
  l.total_steps,
  p.user_name as display_name,
  p.avatar_url
FROM public.steps_leaderboard l
JOIN public.profiles p ON l.user_id = p.id;
