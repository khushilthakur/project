import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage, generateUUID, isValidUUID } from '../lib/supabaseClient';

const AuthContext = createContext(null);

import {
  ADMIN_USER,
  ADMIN_PROFILE,
  DEMO_STUDENT_ACCOUNT,
  DEMO_STUDENT_USER,
  DEMO_STUDENT_PROFILE,
} from './authConstants';

const getRegisteredAccounts = () => {
  return storage.get(STORAGE_KEYS.ACCOUNTS, []);
};

const saveRegisteredAccount = (account) => {
  const accounts = getRegisteredAccounts();
  const exists = accounts.some((a) => a.email.toLowerCase() === account.email.toLowerCase());
  if (!exists) {
    accounts.push(account);
    storage.set(STORAGE_KEYS.ACCOUNTS, accounts);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile from Supabase profiles table
  const fetchSupabaseProfile = useCallback(async (userId, fallbackUser = null) => {
    if (!userId || !isSupabaseConfigured || !supabase) return;
    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr) {
        const u = fallbackUser;
        const isAdminEmail = u?.email?.toLowerCase() === 'khushilthakur28@gmail.com';
        const fallbackProfile = {
          id: userId,
          email: u?.email || '',
          full_name: u?.user_metadata?.full_name || (isAdminEmail ? 'Khushil Thakur' : 'Candidate'),
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
  }, []);

  // Initialize Auth state
  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;

          if (mounted && currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchSupabaseProfile(currentSession.user.id, currentSession.user);
          } else {
            // Check local fallback session
            const cachedUser = storage.get(STORAGE_KEYS.USER, null);
            const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
            if (mounted) {
              setUser(cachedUser);
              setProfile(cachedProfile);
            }
          }

          const { data } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
            if (!mounted) return;
            setSession(newSession);
            setUser(newSession?.user || null);
            if (newSession?.user) {
              await fetchSupabaseProfile(newSession.user.id, newSession.user);
            } else {
              const cachedUser = storage.get(STORAGE_KEYS.USER, null);
              const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
              setUser(cachedUser);
              setProfile(cachedProfile);
            }
          });
          authSubscription = data?.subscription;
        } else {
          // Local storage session fallback: DO NOT default to admin automatically!
          // Unauthenticated visitors must start as null until they explicitly sign in
          const cachedUser = storage.get(STORAGE_KEYS.USER, null);
          const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
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
      if (authSubscription?.unsubscribe) {
        authSubscription.unsubscribe();
      }
    };
  }, [fetchSupabaseProfile]);

  // Sign Up for new candidates
  const signUp = async (email, password, fullName) => {
    setError(null);
    setLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const cleanName = (fullName || '').trim() || cleanEmail.split('@')[0];

    try {
      if (!cleanEmail || !cleanPass) {
        throw new Error('Please provide both email and password.');
      }

      if (cleanEmail === 'khushilthakur28@gmail.com') {
        throw new Error(
          'khushilthakur28@gmail.com is the reserved Administrator account. Please use Sign In with password 280106.'
        );
      }

      // Check if already registered locally
      const accounts = getRegisteredAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
        throw new Error('An account with this email already exists. Please sign in instead.');
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error: signUpErr } = await supabase.auth.signUp({
            email: cleanEmail,
            password: cleanPass,
            options: {
              data: { full_name: cleanName },
            },
          });
          if (signUpErr) throw signUpErr;

          // Also save in local registry for seamless resilience
          const newAccount = {
            id: data?.user?.id || generateUUID(),
            email: cleanEmail,
            password: cleanPass,
            fullName: cleanName,
            createdAt: new Date().toISOString(),
          };
          saveRegisteredAccount(newAccount);

          return { data, error: null };
        } catch (sbErr) {
          // If Supabase fails (e.g. rate limit or unconfirmed email), fallback to local registration
          console.warn('Supabase signUp error, continuing with local registration:', sbErr.message);
        }
      }

      // Local mode student registration with clean initial records
      const newAccount = {
        id: generateUUID(),
        email: cleanEmail,
        password: cleanPass,
        fullName: cleanName,
        createdAt: new Date().toISOString(),
      };
      saveRegisteredAccount(newAccount);

      const newUser = {
        id: newAccount.id,
        email: cleanEmail,
        user_metadata: { full_name: cleanName },
      };
      const newProfile = {
        id: newUser.id,
        email: cleanEmail,
        full_name: cleanName,
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
        role: 'user',
        created_at: new Date().toISOString(),
      };

      storage.set(STORAGE_KEYS.USER, newUser);
      storage.set(STORAGE_KEYS.PROFILE, newProfile);
      setUser(newUser);
      setProfile(newProfile);
      return { data: { user: newUser }, error: null };
    } catch (err) {
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  // Sign In with strict credential verification
  const signIn = async (email, password) => {
    setError(null);
    setLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    try {
      if (!cleanEmail || !cleanPass) {
        throw new Error('Please enter both email and password.');
      }

      // 1. Strict Administrator Credential Verification
      if (cleanEmail === 'khushilthakur28@gmail.com') {
        if (cleanPass !== '280106') {
          throw new Error('Incorrect password for administrator khushilthakur28@gmail.com.');
        }

        // Try Supabase sign in if configured, but always guarantee Admin access
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPass,
            });
          } catch (sbErr) {
            console.info('Supabase admin login fallback (email unconfirmed or offline):', sbErr.message);
          }
        }

        storage.set(STORAGE_KEYS.USER, ADMIN_USER);
        storage.set(STORAGE_KEYS.PROFILE, ADMIN_PROFILE);
        setUser(ADMIN_USER);
        setProfile(ADMIN_PROFILE);
        return { data: { user: ADMIN_USER }, error: null };
      }

      // 2. Sample Pre-registered Candidate Account
      if (cleanEmail === DEMO_STUDENT_ACCOUNT.email.toLowerCase()) {
        if (cleanPass !== DEMO_STUDENT_ACCOUNT.password) {
          throw new Error(`Incorrect password for demo candidate (${DEMO_STUDENT_ACCOUNT.email}).`);
        }
        storage.set(STORAGE_KEYS.USER, DEMO_STUDENT_USER);
        storage.set(STORAGE_KEYS.PROFILE, DEMO_STUDENT_PROFILE);
        setUser(DEMO_STUDENT_USER);
        setProfile(DEMO_STUDENT_PROFILE);
        return { data: { user: DEMO_STUDENT_USER }, error: null };
      }

      // 3. Supabase Sign In if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass,
          });
          if (!signInErr && data?.user) {
            setUser(data.user);
            await fetchSupabaseProfile(data.user.id, data.user);
            return { data, error: null };
          }
        } catch (sbErr) {
          console.warn('Supabase sign-in attempt:', sbErr.message);
        }
      }

      // 4. Local Registered Candidate Accounts Verification
      const accounts = getRegisteredAccounts();
      const matchedAccount = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

      if (!matchedAccount) {
        throw new Error(
          `No account found for "${cleanEmail}". Please check your email or click "Create one free" to register.`
        );
      }

      if (matchedAccount.password !== cleanPass) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      // Successfully verified registered user
      const existingProfile = storage.get(STORAGE_KEYS.PROFILE);
      const studentUser = {
        id: matchedAccount.id,
        email: cleanEmail,
        user_metadata: {
          full_name: matchedAccount.fullName,
        },
      };

      const studentProfile =
        existingProfile && existingProfile.email?.toLowerCase() === cleanEmail
          ? existingProfile
          : {
              id: studentUser.id,
              email: cleanEmail,
              full_name: matchedAccount.fullName,
              avatar_url: '',
              education: '',
              graduation_year: '',
              experience_level: 'Fresher / Entry Level',
              skills: [],
              preferred_roles: [],
              preferred_locations: [],
              remote_preference: 'Any',
              career_interests: '',
              role: 'user',
              created_at: matchedAccount.createdAt || new Date().toISOString(),
            };

      storage.set(STORAGE_KEYS.USER, studentUser);
      storage.set(STORAGE_KEYS.PROFILE, studentProfile);
      setUser(studentUser);
      setProfile(studentProfile);
      return { data: { user: studentUser }, error: null };
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
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase sign out error:', e);
        }
      }
      storage.remove(STORAGE_KEYS.USER);
      storage.remove(STORAGE_KEYS.PROFILE);
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
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };

    // Always update local storage and context state immediately so UI responds without delay
    storage.set(STORAGE_KEYS.PROFILE, updated);
    setProfile(updated);

    if (isSupabaseConfigured && supabase && user && isValidUUID(user.id)) {
      try {
        const { data, error: updateErr } = await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();

        if (!updateErr && data) {
          storage.set(STORAGE_KEYS.PROFILE, data);
          setProfile(data);
          return { success: true, profile: data };
        }
      } catch (err) {
        console.warn('Supabase profile update fallback to local profile:', err);
      }
    }

    return { success: true, profile: updated };
  };

  // Admin status: STRICTLY requires logged-in user with khushilthakur28@gmail.com or admin role
  const isAdmin = Boolean(
    user &&
    (profile?.role === 'admin' || user?.email?.toLowerCase() === 'khushilthakur28@gmail.com')
  );

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
