import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verify if live credentials are provided and not placeholders
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key-here')
);

// Real Supabase client instance (or null if unconfigured)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Local storage keys for local persistent fallback mode
export const STORAGE_KEYS = {
  USER: 'careerpilot_auth_user',
  PROFILE: 'careerpilot_profile',
  RESUMES: 'careerpilot_resumes',
  JOBS: 'careerpilot_jobs',
  SAVED_JOBS: 'careerpilot_saved_jobs',
  APPLICATIONS: 'careerpilot_applications',
  APP_HISTORY: 'careerpilot_app_history',
  ANALYSES: 'careerpilot_analyses',
  INTERVIEWS: 'careerpilot_interviews',
  ROADMAPS: 'careerpilot_roadmaps',
  NOTIFICATIONS: 'careerpilot_notifications',
  AUDIT_LOGS: 'careerpilot_audit_logs',
  THEME: 'careerpilot_theme',
};

// Safe localStorage helper
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn(`Error reading localStorage key "${key}":`, e);
      return defaultValue;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`Error setting localStorage key "${key}":`, e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Error removing localStorage key "${key}":`, e);
    }
  },
};
