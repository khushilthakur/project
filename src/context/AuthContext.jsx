import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const ADMIN_USER = {
  id: 'usr-admin-khushil',
  email: 'khushilthakur28@gmail.com',
  user_metadata: {
    full_name: 'Khushil Thakur',
  },
};

export const ADMIN_PROFILE = {
  id: 'usr-admin-khushil',
  email: 'khushilthakur28@gmail.com',
  full_name: 'Khushil Thakur',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  education: 'System Administrator & Technical Lead',
  graduation_year: '2026',
  experience_level: 'Senior (5+ yrs)',
  skills: ['System Administration', 'Database Security', 'Full Stack Development', 'React', 'PostgreSQL', 'AI Engineering'],
  preferred_roles: ['Platform Administrator', 'Technical Lead'],
  preferred_locations: ['Remote', 'HQ'],
  remote_preference: 'Remote',
  career_interests: 'Platform administration, security audits, and career technology automation.',
  portfolio_url: '',
  github_url: '',
  linkedin_url: '',
  role: 'admin',
  created_at: new Date().toISOString(),
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
          // Local storage session fallback: default to Admin Khushil Thakur
          const cachedUser = storage.get(STORAGE_KEYS.USER, ADMIN_USER);
          const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, ADMIN_PROFILE);
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
        const isAdminEmail = user?.email?.toLowerCase() === 'khushilthakur28@gmail.com';
        const fallbackProfile = {
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || (isAdminEmail ? 'Khushil Thakur' : 'Candidate'),
          experience_level: isAdminEmail ? 'Senior (5+ yrs)' : 'Fresher / Entry Level',
          skills: isAdminEmail ? ADMIN_PROFILE.skills : [],
          preferred_roles: isAdminEmail ? ADMIN_PROFILE.preferred_roles : [],
          preferred_locations: [],
          remote_preference: 'Any',
          role: isAdminEmail ? 'admin' : 'user',
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

  // Sign Up for new students
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
        // Local mode student registration with clean empty records
        const isTargetAdmin = email.toLowerCase() === 'khushilthakur28@gmail.com';
        const newUser = {
          id: isTargetAdmin ? ADMIN_USER.id : 'usr-' + Date.now(),
          email,
          user_metadata: { full_name: fullName },
        };
        const newProfile = {
          id: newUser.id,
          email,
          full_name: fullName,
          avatar_url: '',
          education: '',
          graduation_year: '',
          experience_level: 'Fresher / Entry Level',
          skills: [],
          preferred_roles: [],
          preferred_locations: [],
          remote_preference: 'Any',
          career_interests: '',
          portfolio_url: '',
          github_url: '',
          linkedin_url: '',
          role: isTargetAdmin ? 'admin' : 'user',
          created_at: new Date().toISOString(),
        };

        // Clear any old student records when creating a fresh student account
        if (!isTargetAdmin) {
          storage.remove(STORAGE_KEYS.APPLICATIONS);
          storage.remove(STORAGE_KEYS.RESUMES);
          storage.remove(STORAGE_KEYS.INTERVIEWS);
        }

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
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (signInErr) throw signInErr;
        return { data, error: null };
      } else {
        // Local mode login verification
        if (cleanEmail === 'khushilthakur28@gmail.com') {
          if (password !== '280106') {
            const err = new Error('Incorrect password for administrator khushilthakur28@gmail.com.');
            setError(err.message);
            return { data: null, error: err };
          }
          storage.set(STORAGE_KEYS.USER, ADMIN_USER);
          storage.set(STORAGE_KEYS.PROFILE, ADMIN_PROFILE);
          setUser(ADMIN_USER);
          setProfile(ADMIN_PROFILE);
          return { data: { user: ADMIN_USER }, error: null };
        } else {
          // Student login
          const existingUser = storage.get(STORAGE_KEYS.USER);
          const existingProfile = storage.get(STORAGE_KEYS.PROFILE);

          const studentUser = {
            id: existingUser?.email?.toLowerCase() === cleanEmail ? existingUser.id : 'usr-' + Date.now(),
            email: cleanEmail,
            user_metadata: {
              full_name: existingProfile?.email?.toLowerCase() === cleanEmail
                ? existingProfile.full_name
                : cleanEmail.split('@')[0],
            },
          };

          const studentProfile = (existingProfile && existingProfile.email?.toLowerCase() === cleanEmail)
            ? existingProfile
            : {
                id: studentUser.id,
                email: cleanEmail,
                full_name: cleanEmail.split('@')[0],
                education: '',
                graduation_year: '',
                experience_level: 'Fresher / Entry Level',
                skills: [],
                preferred_roles: [],
                preferred_locations: [],
                remote_preference: 'Any',
                career_interests: '',
                role: 'user',
                created_at: new Date().toISOString(),
              };

          storage.set(STORAGE_KEYS.USER, studentUser);
          storage.set(STORAGE_KEYS.PROFILE, studentProfile);
          setUser(studentUser);
          setProfile(studentProfile);
          return { data: { user: studentUser }, error: null };
        }
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

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase() === 'khushilthakur28@gmail.com';

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
