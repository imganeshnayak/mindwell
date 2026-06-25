// frontend/lib/chat/chatApi.ts
import { supabase } from '@/lib/supabase';

export interface ChatMessageData {
  id?: string;
  user_id: string;
  session_date: string; // YYYY-MM-DD
  role: 'user' | 'assistant' | 'system';
  content: string;
  action_type: string | null;
  created_at?: string;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export async function fetchTodayChatHistory(userId: string): Promise<ChatMessageData[]> {
  const today = getTodayString();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('session_date', today)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[chatApi] fetchTodayChatHistory error:', error.message);
    return [];
  }
  return (data || []) as ChatMessageData[];
}

export async function saveChatMessage(
  userId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  actionType?: string | null
): Promise<{ data: ChatMessageData | null; error: string | null }> {
  const today = getTodayString();
  const payload: Omit<ChatMessageData, 'id' | 'created_at'> = {
    user_id: userId,
    session_date: today,
    role,
    content,
    action_type: actionType || null,
  };

  const { data, error } = await supabase
    .from('chat_messages')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[chatApi] saveChatMessage error:', error.message);
    return { data: null, error: error.message };
  }

  return { data: data as ChatMessageData, error: null };
}
