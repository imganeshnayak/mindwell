const express = require('express');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { supabase } = require('../../lib/supabase');

const router = express.Router();

router.use(authMiddleware);

// Get the Monday of the current week
function getCurrentWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

router.get('/', async (req, res) => {
  const weekStart = req.query.week_start || getCurrentWeekStart();
  try {
    const { data, error } = await supabase
      .from('leaderboard_with_profiles')
      .select('*')
      .eq('week_start', weekStart)
      .order('total_steps', { ascending: false });

    if (error) {
      console.error('[leaderboard backend] fetch error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    let results = data || [];

    // If there are fewer than 5 entries, append mock competitors for a rich experience
    if (results.length < 5) {
      const userEntry = results.find(entry => entry.user_id === req.user.id);
      const userSteps = userEntry ? Number(userEntry.total_steps) : 0;

      const mockCompetitors = [
        {
          id: 'mock-1',
          user_id: 'mock-user-1',
          week_start: weekStart,
          total_steps: Math.max(userSteps + 15000, 25000),
          display_name: 'Elena Gilbert',
          avatar_url: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: 'mock-2',
          user_id: 'mock-user-2',
          week_start: weekStart,
          total_steps: Math.max(userSteps + 6000, 18000),
          display_name: 'Marcus Thorne',
          avatar_url: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: 'mock-3',
          user_id: 'mock-user-3',
          week_start: weekStart,
          total_steps: Math.max(userSteps - 2000, 8000),
          display_name: 'Sasha Lee',
          avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100'
        },
        {
          id: 'mock-4',
          user_id: 'mock-user-4',
          week_start: weekStart,
          total_steps: Math.max(userSteps - 5000, 3000),
          display_name: 'David Beckham',
          avatar_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100'
        }
      ];

      // If user isn't in DB yet, insert a temporary zero-step entry
      if (!userEntry) {
        // Fetch display name from profiles if exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_name, avatar_url')
          .eq('id', req.user.id)
          .single();

        results.push({
          id: `temp-${req.user.id}`,
          user_id: req.user.id,
          week_start: weekStart,
          total_steps: 0,
          display_name: profile?.user_name || req.user.user_metadata?.user_name || 'You',
          avatar_url: profile?.avatar_url || req.user.user_metadata?.avatar_url || null
        });
      }

      mockCompetitors.forEach(mock => {
        if (!results.some(r => r.user_id === mock.user_id)) {
          results.push(mock);
        }
      });

      // Sort by total steps descending
      results.sort((a, b) => b.total_steps - a.total_steps);
    }

    res.json(results);
  } catch (err) {
    console.error('[leaderboard backend] catch error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
