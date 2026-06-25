// backend/src/features/chat/chat.controller.js
const { supabase } = require('../../lib/supabase');

async function getChatHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { date } = req.query; // YYYY-MM-DD
    const sessionDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .eq('session_date', sessionDate)
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ history: data });
  } catch (err) {
    next(err);
  }
}

async function saveMessage(req, res, next) {
  try {
    const userId = req.user.id;
    const { role, content, action_type } = req.body;
    const sessionDate = req.body.session_date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        session_date: sessionDate,
        role,
        content,
        action_type: action_type || null
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Message saved', data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getChatHistory, saveMessage };
