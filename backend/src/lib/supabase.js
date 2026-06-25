// backend/src/lib/supabase.js
// Supabase SERVICE-ROLE client — never expose this to the frontend.
// Used by controllers to bypass RLS when needed (admin operations).

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws'); // Required for Node.js < 22 (no native WebSocket)
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  realtime: {
    transport: ws, // Fix for Node.js 20 — no native WebSocket
  },
});

module.exports = { supabase };

