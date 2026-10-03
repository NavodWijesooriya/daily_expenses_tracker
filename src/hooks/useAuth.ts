import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthContext } from '../../context/AuthContext.tsx';

export function useAuth() {
  const { user, loading } = useAuthContext();

  const signOutUser = async () => {
    await signOut(auth);
  };

  const signInUser = async (email: string, password: string) => {
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

    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  return {
    user,
    loading,
    signOutUser,
    signInUser,
  };
}
