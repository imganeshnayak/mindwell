// lib/tree/treeApi.ts
// Supabase API for reading and updating the user's personality tree progress.
// tree_frame: 0–98 (maps to image files 002.png–100.png)
// tasks_completed: cumulative count of all wellness tasks done

import { supabase } from '@/lib/supabase';

export interface TreeProgress {
  frame: number;        // 0–98
  tasksCompleted: number;
}

/** Fetch the current tree progress for a user. Returns defaults if not yet set. */
export async function fetchTreeProgress(userId: string): Promise<TreeProgress> {
  const { data, error } = await supabase
    .from('profiles')
    .select('tree_frame, tasks_completed')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.warn('[treeApi] fetchTreeProgress error:', error?.message);
    return { frame: 0, tasksCompleted: 0 };
  }

  return {
    frame: data.tree_frame ?? 0,
    tasksCompleted: data.tasks_completed ?? 0,
  };
}

/**
 * Record a completed task, advancing the tree by one frame.
 * Frame is clamped to max 98 (the fully grown fruit tree).
 * Returns the new tree state after the update.
 */
export async function completeTask(userId: string): Promise<TreeProgress> {
  // First, read the current values
  const current = await fetchTreeProgress(userId);
  const newTasks = current.tasksCompleted + 1;
  const newFrame = Math.min(current.frame + 1, 98); // clamp at 98

  const { data, error } = await supabase
    .from('profiles')
    .update({
      tree_frame: newFrame,
      tasks_completed: newTasks,
    })
    .eq('id', userId)
    .select('tree_frame, tasks_completed')
    .single();

  if (error || !data) {
    console.warn('[treeApi] completeTask error:', error?.message);
    // Return the optimistic value even on error (UI stays responsive)
    return { frame: newFrame, tasksCompleted: newTasks };
  }

  return {
    frame: data.tree_frame,
    tasksCompleted: data.tasks_completed,
  };
}
