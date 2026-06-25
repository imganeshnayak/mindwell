// backend/src/features/guide-settings/guideSettings.controller.js
const { supabase } = require('../../lib/supabase');

async function getSettings(req, res, next) {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('guide_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    return res.json({ settings: data });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const { data, error } = await supabase
      .from('guide_settings')
      .upsert({ user_id: userId, ...updates }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Settings updated', settings: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getSettings, updateSettings };
