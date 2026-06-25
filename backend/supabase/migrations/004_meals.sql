-- =====================================================
-- Migration 004: meals
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.meals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  meal_type   text NOT NULL, -- 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks'
  description text,
  calories    integer DEFAULT 0,
  protein_g   integer DEFAULT 0,
  carbs_g     integer DEFAULT 0,
  fats_g      integer DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- Hydration tracker (stored daily)
CREATE TABLE IF NOT EXISTS public.hydration (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  glasses     integer DEFAULT 0,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration ENABLE ROW LEVEL SECURITY;

-- Policies for meals
CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meals" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meals" ON public.meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own meals" ON public.meals FOR DELETE USING (auth.uid() = user_id);

-- Policies for hydration
CREATE POLICY "Users can view own hydration" ON public.hydration FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hydration" ON public.hydration FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hydration" ON public.hydration FOR UPDATE USING (auth.uid() = user_id);
