-- 008_personality_tree.sql
-- Adds personality tree progress tracking to user profiles.
-- tree_frame: 0-98 (maps to image files 002.png–100.png)
-- tasks_completed: cumulative count of all wellness tasks done

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tree_frame      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tasks_completed INTEGER NOT NULL DEFAULT 0;

-- Ensure frame never goes below 0 or above 98
ALTER TABLE profiles
  ADD CONSTRAINT tree_frame_range CHECK (tree_frame >= 0 AND tree_frame <= 98);
