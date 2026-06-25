-- =====================================================
-- Migration 002: guide_settings
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.guide_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  guide_name      text DEFAULT 'Sanctuary AI',
  voice           text DEFAULT 'Gentle & Nurturing',
  personality     text DEFAULT 'Empathetic',
  frequency       text DEFAULT 'Balanced',
  focus           text[] DEFAULT '{}',
  gender          text DEFAULT 'Neutral',
  role            text DEFAULT 'Guide',
  avatar_url      text,
  onboarding_done boolean DEFAULT false,
  updated_at      timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.guide_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own guide settings"
  ON public.guide_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own guide settings"
  ON public.guide_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own guide settings"
  ON public.guide_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER guide_settings_updated_at
  BEFORE UPDATE ON public.guide_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- IMPORTANT: You must also create a Storage Bucket named "avatars"
-- and set it to Public!
