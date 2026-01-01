import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  SCHEDULE: 'schedules',
  TASK_DB: 'task_rules',
  ASSIGNMENTS: 'task_assignments',
  TEAM: 'team_members',
  SETTINGS: 'user_settings'
};
