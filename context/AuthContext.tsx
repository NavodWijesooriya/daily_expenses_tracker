'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  displayName: string;
  setDisplayName: (name: string) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export async function syncUserProfile(currentUser: User) {
  const userDocRef = doc(db, 'users', currentUser.uid);
  const snapshot = await getDoc(userDocRef);
  const profileName =
    currentUser.displayName?.trim() ||
    (snapshot.exists() ? snapshot.data().name?.trim() : '') ||
    currentUser.email?.split('@')[0]?.trim() ||
    'User';
  const profileEmail = currentUser.email?.trim() || '';

  if (snapshot.exists()) {
    await setDoc(
      userDocRef,
      {
        name: profileName,
        email: profileEmail,
      },
      { merge: true },
    );
    return;
  }

  await setDoc(userDocRef, {
    name: profileName,
    email: profileEmail,
    createdAt: serverTimestamp(),
  });
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setDisplayName(currentUser?.displayName?.trim() || '');

      if (currentUser) {
        try {
          await syncUserProfile(currentUser);
        } catch (error) {
          console.error('Failed to sync user profile to Firestore:', error);
        }
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, displayName, setDisplayName }}>
      {loading ? <div>Loading Auth...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider.');
  }

  return context;
};