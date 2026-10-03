import { signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { syncUserProfile, useAuthContext } from '../../context/AuthContext.tsx';

export function useAuth() {
  const { user, loading, displayName, setDisplayName } = useAuthContext();

  const signOutUser = async () => {
    await signOut(auth);
  };

  const signInUser = async (name: string, email: string, password: string) => {
    if (!name.trim() || !email.trim() || !password) {
      throw new Error('Please enter your name, email address, and password.');
    }

    if (name.trim().length > 60) {
      throw new Error('Your name must be 60 characters or fewer.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const normalizedName = name.trim();
    await updateProfile(credential.user, { displayName: normalizedName });
    setDisplayName(normalizedName);

    try {
      await syncUserProfile(credential.user);
    } catch (error) {
      console.error('Failed to sync user profile to Firestore:', error);
    }
  };

  return {
    user,
    loading,
    displayName,
    signOutUser,
    signInUser,
  };
}
