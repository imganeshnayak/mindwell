-- =====================================================
-- Migration 003: biometrics
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.biometrics (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date          date NOT NULL DEFAULT CURRENT_DATE,
  steps         integer DEFAULT 0,
  step_goal     integer DEFAULT 10000,
  sleep_hours   integer DEFAULT 0,
  sleep_minutes integer DEFAULT 0,
  vitality_score integer DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own biometrics"
  ON public.biometrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own biometrics"
  ON public.biometrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own biometrics"
  ON public.biometrics FOR UPDATE
  USING (auth.uid() = user_id);
