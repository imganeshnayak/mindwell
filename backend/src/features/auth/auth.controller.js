// backend/src/features/auth/auth.controller.js
// Handles registration and login using Supabase Auth admin SDK.

const { supabase } = require('../../lib/supabase');

/**
 * POST /api/auth/register
 * Body: { email, password, userName }
 */
async function register(req, res, next) {
  try {
    const { email, password, userName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      user_metadata: { user_name: userName?.trim() || 'Avery' },
      email_confirm: true, // auto-confirm for development
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      userId: data.user.id,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Note: Prefer signing in directly from the frontend via Supabase anon client.
 * This endpoint is provided for server-side validation/testing purposes.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      message: 'Login successful',
      accessToken: data.session.access_token,
      userId: data.user.id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
