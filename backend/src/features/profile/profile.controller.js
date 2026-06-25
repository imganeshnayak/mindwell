// backend/src/features/profile/profile.controller.js
// CRUD operations for the public.profiles table.
// All routes are protected — req.user is set by authMiddleware.

const { supabase } = require('../../lib/supabase');

/**
 * GET /api/profile
 * Returns the authenticated user's profile.
 */
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ profile: data });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/profile
 * Body: { user_name?, avatar_url? }
 * Updates (or creates) the authenticated user's profile.
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { user_name, avatar_url } = req.body;

    const updates = {};
    if (user_name !== undefined) updates.user_name = user_name.trim();
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: 'Profile updated', profile: data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
