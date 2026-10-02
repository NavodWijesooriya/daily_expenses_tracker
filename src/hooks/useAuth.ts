import { useState, useEffect } from 'react';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  metadata?: {
    creationTime?: string;
  };
}

const LOCAL_USER_STORAGE_KEY = 'daily_expenses_active_user';

/**
 * useAuth Hook
 *
 * Firebase Auth functions are prepared for your custom implementation.
 * Local session state manages the active user session.
 */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // TODO: Build your Firebase onAuthStateChanged listener here
  useEffect(() => {
    // Example:
    // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    //   setUser(currentUser);
    //   setLoading(false);
    // });
    // return () => unsubscribe();
  }, []);

  // Sign out user
  const signOutUser = async () => {
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Sign in with email and password
  const signInUser = async (email: string, password?: string) => {
    if (!email.trim() || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // TODO: Build your Firebase signInWithEmailAndPassword(auth, email, password) here
    const loggedUser: AuthUser = {
      uid: 'usr_' + btoa(email.trim()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12),
      email: email.trim(),
      displayName: email.trim().split('@')[0],
      metadata: { creationTime: new Date().toISOString() },
    };

    setUser(loggedUser);
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(loggedUser));
  };

  return {
    user,
    loading,
    signOutUser,
    signInUser,
  };
}
