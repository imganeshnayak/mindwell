// backend/src/middleware/auth.middleware.js
// Validates the Supabase JWT passed in the Authorization header.
// Attaches the authenticated user to req.user for downstream controllers.

const { supabase } = require('../lib/supabase');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT with Supabase — returns user if token is valid
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[authMiddleware] error:', err.message);
    return res.status(500).json({ error: 'Auth verification failed' });
  }
}

module.exports = { authMiddleware };
