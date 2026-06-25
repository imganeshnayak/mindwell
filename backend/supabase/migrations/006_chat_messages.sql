-- =====================================================
-- Migration 006: chat_messages
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date  date NOT NULL DEFAULT CURRENT_DATE,
  role          text NOT NULL, -- 'user' | 'assistant' | 'system'
  content       text NOT NULL,
  action_type   text,          -- 'BREATHING' | 'STRETCH' | null
  created_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own chat_messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat_messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for fast retrieval of history
CREATE INDEX IF NOT EXISTS chat_messages_user_date_idx 
  ON public.chat_messages(user_id, session_date DESC);
