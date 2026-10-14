import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';

const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 'usr-demo-001',
  email: 'alex.rivera@example.com',
  user_metadata: {
    full_name: 'Alex Rivera',
  },
};

const DEFAULT_DEMO_PROFILE = {
  id: 'usr-demo-001',
  email: 'alex.rivera@example.com',
  full_name: 'Alex Rivera',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  education: 'B.S. in Computer Science, California State University',
  graduation_year: '2026',
  experience_level: 'Fresher / Entry Level',
  skills: ['JavaScript', 'React', 'Python', 'PostgreSQL', 'HTML5 & CSS3', 'Git', 'REST APIs'],
  preferred_roles: ['Frontend Developer', 'Full Stack Developer', 'Software Engineer Intern'],
  preferred_locations: ['San Francisco, CA', 'Austin, TX', 'Remote'],
  remote_preference: 'Remote',
  career_interests: 'Building responsive SaaS web applications, AI-assisted development tools, and performant cloud architectures.',
  portfolio_url: 'https://alexrivera.dev',
  github_url: 'https://github.com/alexrivera-dev',
  linkedin_url: 'https://linkedin.com/in/alexrivera-dev',
  role: 'user', // default user; can be toggled in demo or verified in DB
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Auth state
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          // Live Supabase Auth
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (mounted && currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchSupabaseProfile(currentSession.user.id);
          } else if (mounted) {
            setUser(null);
            setProfile(null);
          }

          // Listen for auth state changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user || null);
            if (newSession?.user) {
              await fetchSupabaseProfile(newSession.user.id);
            } else {
              setProfile(null);
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Local storage session fallback
          const cachedUser = storage.get(STORAGE_KEYS.USER, DEFAULT_DEMO_USER);
          const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, DEFAULT_DEMO_PROFILE);
          if (mounted) {
            setUser(cachedUser);
            setProfile(cachedProfile);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Fetch user profile from Supabase profiles table
  const fetchSupabaseProfile = async (userId) => {
    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        // If profile doesn't exist yet, insert a default one
        const fallbackProfile = {
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || 'Career Explorer',
          experience_level: 'Fresher / Entry Level',
          skills: [],
          preferred_roles: [],
          preferred_locations: [],
          remote_preference: 'Any',
          role: 'user',
        };
        await supabase.from('profiles').insert(fallbackProfile);
        setProfile(fallbackProfile);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
  };

  // Sign Up
  const signUp = async (email, password, fullName) => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (signUpErr) throw signUpErr;
        return { data, error: null };
      } else {
        // Local mode registration
        const newUser = {
          id: 'usr-' + Date.now(),
          email,
          user_metadata: { full_name: fullName },
        };
        const newProfile = {
          ...DEFAULT_DEMO_PROFILE,
          id: newUser.id,
          email,
          full_name: fullName,
          skills: [],
          preferred_roles: [],
        };
        storage.set(STORAGE_KEYS.USER, newUser);
        storage.set(STORAGE_KEYS.PROFILE, newProfile);
        setUser(newUser);
        setProfile(newProfile);
        return { data: { user: newUser }, error: null };
      }
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign In
  const signIn = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInErr) throw signInErr;
        return { data, error: null };
      } else {
        // Local mode sign in
        const existingProfile = storage.get(STORAGE_KEYS.PROFILE, DEFAULT_DEMO_PROFILE);
        const loggedInUser = {
          id: existingProfile.id || 'usr-demo-001',
          email,
          user_metadata: { full_name: existingProfile.full_name || email.split('@')[0] },
        };
        storage.set(STORAGE_KEYS.USER, loggedInUser);
        setUser(loggedInUser);
        setProfile({ ...existingProfile, email });
        return { data: { user: loggedInUser }, error: null };
      }
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const signOut = async () => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      } else {
        storage.remove(STORAGE_KEYS.USER);
      }
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (email) => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (resetErr) throw resetErr;
        return { success: true };
      } else {
        return { success: true, message: 'Password reset link sent (demo simulation).' };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Update Profile
  const updateProfile = async (updates) => {
    setError(null);
    try {
      if (isSupabaseConfigured && supabase && user) {
        const { data, error: updateErr } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();

        if (updateErr) throw updateErr;
        setProfile(data);
        return { success: true, profile: data };
      } else {
        const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
        storage.set(STORAGE_KEYS.PROFILE, updated);
        setProfile(updated);
        return { success: true, profile: updated };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        isAdmin,
        isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
